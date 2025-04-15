import prisma from '../../../lib/prisma'

export default async function handler(req, res) {
  const { method } = req;

  switch (method) {
    case 'GET':
      try {
        const rides = await prisma.ride.findMany({
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
          userId 
        } = req.body;

        // Validate required fields
        if (!pickupLocation || !dropoffLocation || !distance || !duration || !fare || !userId) {
          return res.status(400).json({ error: 'Missing required ride details' });
        }

        // Calculate total earned
        const totalEarned = parseFloat(fare) + parseFloat(tips);

        // Create ride in database
        const newRide = await prisma.ride.create({
          data: {
            pickupLocation,
            dropoffLocation,
            distance: parseFloat(distance),
            duration: parseInt(duration),
            fare: parseFloat(fare),
            tips: parseFloat(tips),
            totalEarned,
            vehicleType,
            notes,
            userId,
          },
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