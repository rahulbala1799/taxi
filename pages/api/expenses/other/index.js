import prisma from '../../../../lib/prisma';

export default async function handler(req, res) {
  const { method } = req;

  switch (method) {
    case 'GET':
      try {
        const { driverId, vehicleId, startDate, endDate, category } = req.query;
        
        // Build the query
        const whereClause = {};
        
        if (driverId) {
          whereClause.driverId = driverId;
        }
        
        if (vehicleId) {
          whereClause.vehicleId = vehicleId;
        }
        
        if (category) {
          whereClause.category = category;
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
        
        // Get other expenses
        const otherExpenses = await prisma.otherExpense.findMany({
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
        
        return res.status(200).json(otherExpenses);
      } catch (error) {
        console.error('Error fetching other expenses:', error);
        return res.status(500).json({ error: 'Failed to fetch other expenses' });
      }

    case 'POST':
      try {
        const { 
          vehicleId,
          driverId,
          date = new Date(),
          amount,
          category,
          notes
        } = req.body;

        // Validate required fields
        if (!driverId || !amount || !category) {
          return res.status(400).json({ error: 'Missing required expense details' });
        }

        // Check if vehicle belongs to driver (if vehicleId is provided)
        if (vehicleId) {
          const vehicle = await prisma.vehicle.findFirst({
            where: {
              id: vehicleId,
              driverId
            }
          });
          
          if (!vehicle) {
            return res.status(400).json({ error: 'Vehicle not found or does not belong to the driver' });
          }
        }

        // Create other expense
        const otherExpense = await prisma.otherExpense.create({
          data: {
            date: new Date(date),
            amount: parseFloat(amount),
            category,
            vehicleId: vehicleId || null,
            driverId,
            notes
          },
          include: {
            vehicle: vehicleId ? {
              select: {
                make: true,
                model: true,
                licensePlate: true
              }
            } : undefined
          }
        });

        return res.status(201).json(otherExpense);
      } catch (error) {
        console.error('Error creating other expense:', error);
        return res.status(500).json({ error: 'Failed to create other expense' });
      }

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).end(`Method ${method} Not Allowed`);
  }
} 