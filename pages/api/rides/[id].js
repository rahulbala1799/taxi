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
          notes
        } = req.body;

        // Calculate total earned if fare or tips were updated
        let updateData = {};
        
        if (pickupLocation) updateData.pickupLocation = pickupLocation;
        if (dropoffLocation) updateData.dropoffLocation = dropoffLocation;
        if (distance) updateData.distance = parseFloat(distance);
        if (duration) updateData.duration = parseInt(duration);
        
        if (fare !== undefined || tips !== undefined) {
          // Get current ride data to calculate earnings difference
          const currentRide = await prisma.ride.findUnique({
            where: { id },
            select: { fare: true, tips: true, userId: true }
          });
          
          if (!currentRide) {
            return res.status(404).json({ error: 'Ride not found' });
          }

          const newFare = fare !== undefined ? parseFloat(fare) : currentRide.fare;
          const newTips = tips !== undefined ? parseFloat(tips) : currentRide.tips;
          
          updateData.fare = newFare;
          updateData.tips = newTips;
          updateData.totalEarned = newFare + newTips;
          
          // Calculate difference for user's total earnings update
          const earningsDifference = 
            (newFare + newTips) - (currentRide.fare + currentRide.tips);
          
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
        
        if (vehicleType) updateData.vehicleType = vehicleType;
        if (notes !== undefined) updateData.notes = notes;

        const updatedRide = await prisma.ride.update({
          where: { id },
          data: updateData
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