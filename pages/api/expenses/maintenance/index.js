import prisma from '../../../../lib/prisma';

export default async function handler(req, res) {
  const { method } = req;

  switch (method) {
    case 'GET':
      try {
        const { driverId, vehicleId, startDate, endDate } = req.query;
        
        // Build the query
        const whereClause = {};
        
        if (driverId) {
          whereClause.driverId = driverId;
        }
        
        if (vehicleId) {
          whereClause.vehicleId = vehicleId;
        }
        
        // Date filtering
        if (startDate || endDate) {
          whereClause.date = {};
          
          if (startDate) {
            whereClause.date.gte = new Date(startDate);
          }
          
          if (endDate) {
            whereClause.date.lte = new Date(endDate);
          }
        }
        
        // Get maintenance expenses
        const maintenanceExpenses = await prisma.maintenanceExpense.findMany({
          where: whereClause,
          include: {
            vehicle: {
              select: {
                id: true,
                make: true,
                model: true,
                licensePlate: true
              }
            }
          },
          orderBy: {
            date: 'desc'
          }
        });
        
        return res.status(200).json(maintenanceExpenses);
      } catch (error) {
        console.error('Error fetching maintenance expenses:', error);
        return res.status(500).json({ error: 'Failed to fetch maintenance expenses' });
      }

    case 'POST':
      try {
        const { 
          vehicleId,
          driverId,
          date = new Date(),
          amount,
          serviceType,
          odometerReading,
          notes
        } = req.body;

        // Validate required fields
        if (!vehicleId || !driverId || !amount || !serviceType) {
          return res.status(400).json({ error: 'Missing required expense details' });
        }

        // Check if vehicle belongs to driver
        const vehicle = await prisma.vehicle.findFirst({
          where: {
            id: vehicleId,
            driverId
          }
        });
        
        if (!vehicle) {
          return res.status(400).json({ error: 'Vehicle not found or does not belong to the driver' });
        }

        // Create maintenance expense
        const maintenanceExpense = await prisma.maintenanceExpense.create({
          data: {
            date: new Date(date),
            amount: parseFloat(amount),
            serviceType,
            odometerReading: odometerReading ? parseFloat(odometerReading) : null,
            vehicleId,
            driverId,
            notes
          },
          include: {
            vehicle: {
              select: {
                make: true,
                model: true,
                licensePlate: true
              }
            }
          }
        });

        return res.status(201).json(maintenanceExpense);
      } catch (error) {
        console.error('Error creating maintenance expense:', error);
        return res.status(500).json({ error: 'Failed to create maintenance expense' });
      }

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).end(`Method ${method} Not Allowed`);
  }
} 