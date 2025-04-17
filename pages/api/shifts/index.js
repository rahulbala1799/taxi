import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
  const { method } = req;

  switch (method) {
    case 'GET':
      try {
        const { driverId, status } = req.query;
        
        // Build the query
        const query = {};
        
        if (driverId) {
          query.driverId = driverId;
        }
        
        if (status) {
          query.status = status;
        }
        
        // Get shifts with related vehicle info and rides
        const shifts = await prisma.shift.findMany({
          where: query,
          include: {
            vehicle: {
              select: {
                id: true,
                make: true,
                model: true,
                licensePlate: true,
                fuelType: true
              }
            },
            rides: {
              select: {
                id: true,
                fare: true,
                tips: true,
                totalEarned: true
              }
            }
          },
          orderBy: {
            startTime: 'desc'
          }
        });
        
        // Calculate total earnings for each shift
        const shiftsWithEarnings = shifts.map(shift => {
          const totalEarnings = shift.rides.reduce((sum, ride) => {
            return sum + (parseFloat(ride.totalEarned) || 0);
          }, 0);
          
          return {
            ...shift,
            totalEarnings
          };
        });
        
        res.status(200).json(shiftsWithEarnings);
      } catch (error) {
        console.error('Error fetching shifts:', error);
        res.status(500).json({ error: 'Failed to fetch shifts' });
      }
      break;

    case 'POST':
      try {
        const { 
          driverId, 
          vehicleId, 
          startTime,
          date,
          startRange 
        } = req.body;

        // Validate required fields
        if (!driverId || !vehicleId) {
          return res.status(400).json({ error: 'Missing required shift details' });
        }

        // Check if driver has an active shift
        const activeShift = await prisma.shift.findFirst({
          where: {
            driverId,
            status: 'ACTIVE'
          }
        });

        if (activeShift) {
          return res.status(400).json({ 
            error: 'You already have an active shift',
            activeShift
          });
        }

        // Get vehicle details to check if it's electric
        const vehicle = await prisma.vehicle.findUnique({
          where: { id: vehicleId }
        });

        if (!vehicle) {
          return res.status(404).json({ error: 'Vehicle not found' });
        }

        // For electric vehicles, startRange is required
        if (vehicle.fuelType === 'Electric' && startRange === undefined) {
          return res.status(400).json({ error: 'Starting range is required for electric vehicles' });
        }

        // Create the shift
        const shiftDate = date ? new Date(date) : new Date();
        let shiftStartTime;
        
        if (startTime) {
          // If time is provided, combine with date
          const [hours, minutes] = startTime.split(':').map(Number);
          shiftStartTime = new Date(shiftDate);
          shiftStartTime.setHours(hours, minutes, 0, 0);
        } else {
          shiftStartTime = shiftDate;
        }

        const newShift = await prisma.shift.create({
          data: {
            driverId,
            vehicleId,
            date: shiftDate,
            startTime: shiftStartTime,
            startRange: startRange ? parseFloat(startRange) : null,
            status: 'ACTIVE'
          },
          include: {
            vehicle: {
              select: {
                id: true,
                make: true,
                model: true,
                licensePlate: true,
                fuelType: true
              }
            }
          }
        });

        res.status(201).json(newShift);
      } catch (error) {
        console.error('Error creating shift:', error);
        res.status(500).json({ error: 'Failed to create shift' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
} 