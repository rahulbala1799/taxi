import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
  const { id } = req.query;
  const { method } = req;

  switch (method) {
    case 'GET':
      try {
        const ride = await prisma.ride.findUnique({
          where: { id },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
            shift: {
              select: {
                id: true,
                date: true,
                startTime: true,
                endTime: true,
                status: true,
                vehicle: {
                  select: {
                    make: true,
                    model: true,
                    licensePlate: true
                  }
                }
              }
            }
          },
        });

        if (!ride) {
          return res.status(404).json({ error: 'Ride not found' });
        }

        return res.status(200).json(ride);
      } catch (error) {
        console.error('Error fetching ride:', error);
        return res.status(500).json({ error: 'Failed to fetch ride' });
      }

    case 'PUT':
      try {
        const { 
          pickupLocation, 
          dropoffLocation, 
          distance, 
          duration, 
          fare, 
          tips, 
          vehicleType,
          notes,
          rideSource,
          tollAmount,
          shiftId
        } = req.body;

        // Calculate total earned if fare, tips, or toll were updated
        let updateData = {};
        
        if (pickupLocation) updateData.pickupLocation = pickupLocation;
        if (dropoffLocation) updateData.dropoffLocation = dropoffLocation;
        if (distance) updateData.distance = parseFloat(distance);
        if (duration) updateData.duration = parseInt(duration);
        if (vehicleType) updateData.vehicleType = vehicleType;
        if (notes !== undefined) updateData.notes = notes;
        if (rideSource) updateData.rideSource = rideSource;
        
        // Get current ride data to calculate earnings difference
        const currentRide = await prisma.ride.findUnique({
          where: { id },
          select: { 
            fare: true, 
            tips: true, 
            tollAmount: true,
            userId: true,
            shiftId: true
          }
        });
        
        if (!currentRide) {
          return res.status(404).json({ error: 'Ride not found' });
        }

        const newFare = fare !== undefined ? parseFloat(fare) : currentRide.fare;
        const newTips = tips !== undefined ? parseFloat(tips) : currentRide.tips;
        const newTollAmount = tollAmount !== undefined ? parseFloat(tollAmount) : currentRide.tollAmount;
        
        if (fare !== undefined) updateData.fare = newFare;
        if (tips !== undefined) updateData.tips = newTips;
        if (tollAmount !== undefined) updateData.tollAmount = newTollAmount;
        
        // If any of the monetary values changed, update the total
        if (fare !== undefined || tips !== undefined || tollAmount !== undefined) {
          updateData.totalEarned = newFare + newTips + newTollAmount;
          
          // Calculate difference for user's total earnings update
          const earningsDifference = 
            (newFare + newTips + newTollAmount) - (currentRide.fare + currentRide.tips + currentRide.tollAmount);
          
          if (earningsDifference !== 0) {
            // Update user's total earnings
            await prisma.user.update({
              where: { id: currentRide.userId },
              data: {
                totalEarnings: {
                  increment: earningsDifference
                }
              }
            });
          }
        }
        
        // If assigning to a shift
        if (shiftId !== undefined) {
          // If shiftId is provided and not null, verify that it belongs to this user and exists
          if (shiftId) {
            const shift = await prisma.shift.findUnique({
              where: { id: shiftId },
              select: { driverId: true }
            });
            
            if (!shift) {
              return res.status(400).json({ error: 'Invalid shift selected' });
            }
            
            // Make sure the ride belongs to the same driver as the shift
            if (shift.driverId !== currentRide.userId) {
              return res.status(400).json({ error: 'Cannot assign ride to a shift belonging to a different driver' });
            }
          }
          
          updateData.shiftId = shiftId;
        }

        const updatedRide = await prisma.ride.update({
          where: { id },
          data: updateData,
          include: {
            shift: {
              select: {
                id: true,
                date: true,
                startTime: true,
                status: true
              }
            }
          }
        });

        return res.status(200).json(updatedRide);
      } catch (error) {
        console.error('Error updating ride:', error);
        return res.status(500).json({ error: 'Failed to update ride' });
      }

    case 'DELETE':
      try {
        // Get the ride before deletion to update user's earnings
        const ride = await prisma.ride.findUnique({
          where: { id },
          select: { totalEarned: true, userId: true }
        });

        if (!ride) {
          return res.status(404).json({ error: 'Ride not found' });
        }

        // Delete the ride
        await prisma.ride.delete({
          where: { id }
        });

        // Update user's total earnings
        await prisma.user.update({
          where: { id: ride.userId },
          data: {
            totalEarnings: {
              decrement: ride.totalEarned
            }
          }
        });

        return res.status(200).json({ message: 'Ride deleted successfully' });
      } catch (error) {
        console.error('Error deleting ride:', error);
        return res.status(500).json({ error: 'Failed to delete ride' });
      }

    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      return res.status(405).end(`Method ${method} Not Allowed`);
  }
} 