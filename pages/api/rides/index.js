import prisma from '../../../lib/prisma'

export default async function handler(req, res) {
  const { method } = req;

  switch (method) {
    case 'GET':
      try {
        const { userId, shiftId } = req.query;
        
        // Build the query
        const whereClause = {};
        
        if (userId) {
          whereClause.userId = userId;
        }
        
        if (shiftId) {
          whereClause.shiftId = shiftId;
        }
        
        const rides = await prisma.ride.findMany({
          where: whereClause,
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
              }
            }
          },
          orderBy: {
            date: 'desc'
          }
        });
        res.status(200).json(rides);
      } catch (error) {
        console.error('Error fetching rides:', error);
        res.status(500).json({ error: 'Failed to fetch rides' });
      }
      break;

    case 'POST':
      try {
        const { 
          pickupLocation, 
          dropoffLocation, 
          distance, 
          duration, 
          fare, 
          tips = 0, 
          vehicleType = "Tesla", 
          notes,
          userId,
          shiftId,
          rideSource = "WALK_IN",
          tollAmount = 0
        } = req.body;

        // Validate required fields
        if (!pickupLocation || !dropoffLocation || !distance || !fare || !userId) {
          return res.status(400).json({ error: 'Missing required ride details' });
        }

        // Calculate total earned
        const totalEarned = parseFloat(fare) + parseFloat(tips) + parseFloat(tollAmount);

        // If shiftId is provided, verify that it belongs to this user and is active
        if (shiftId) {
          const shift = await prisma.shift.findFirst({
            where: {
              id: shiftId,
              driverId: userId
            }
          });
          
          if (!shift) {
            return res.status(400).json({ error: 'Invalid shift selected' });
          }
        }

        // Create ride in database
        const newRide = await prisma.ride.create({
          data: {
            pickupLocation,
            dropoffLocation,
            distance: parseFloat(distance),
            duration: parseInt(duration || 0),
            fare: parseFloat(fare),
            tips: parseFloat(tips),
            tollAmount: parseFloat(tollAmount),
            totalEarned,
            vehicleType,
            notes,
            rideSource,
            userId,
            shiftId // This can be null if no shift is active
          },
          include: {
            shift: {
              select: {
                id: true,
                date: true,
                startTime: true
              }
            }
          }
        });

        // Update user's total earnings
        await prisma.user.update({
          where: { id: userId },
          data: {
            totalEarnings: {
              increment: totalEarned
            }
          }
        });

        res.status(201).json(newRide);
      } catch (error) {
        console.error('Error creating ride:', error);
        res.status(500).json({ error: 'Failed to create ride' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
} 