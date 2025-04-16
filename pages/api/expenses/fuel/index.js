import prisma from '../../../../lib/prisma';

export default async function handler(req, res) {
  const { method } = req;

  switch (method) {
    case 'GET':
      try {
        const { driverId, vehicleId, startDate, endDate } = req.query;
        
        // Build where clause based on query parameters
        const whereClause = {};
        
        if (driverId) {
          whereClause.driverId = driverId;
        }
        
        if (vehicleId) {
          whereClause.vehicleId = vehicleId;
        }
        
        // Add date range filtering if provided
        if (startDate || endDate) {
          whereClause.date = {};
          
          if (startDate) {
            whereClause.date.gte = new Date(startDate);
          }
          
          if (endDate) {
            whereClause.date.lte = new Date(endDate);
          }
        }
        
        const fuelExpenses = await prisma.fuelExpense.findMany({
          where: whereClause,
          include: {
            vehicle: {
              select: {
                make: true,
                model: true,
                licensePlate: true,
                fuelType: true
              }
            }
          },
          orderBy: {
            date: 'desc'
          }
        });
        
        return res.status(200).json(fuelExpenses);
      } catch (error) {
        console.error('Error fetching fuel expenses:', error);
        return res.status(500).json({ error: 'Failed to fetch fuel expenses' });
      }
      
    case 'POST':
      try {
        const { 
          vehicleId, 
          driverId, 
          date, 
          amount, 
          quantity, 
          fuelType, 
          odometerReading, 
          fullTank,
          notes 
        } = req.body;
        
        console.log('Fuel expense request body:', req.body);
        
        // Validate required fields
        if (!vehicleId || !driverId || !amount) {
          return res.status(400).json({ 
            error: 'Missing required fields: vehicleId, driverId, and amount are required',
            received: req.body 
          });
        }
        
        // Check if vehicle exists and belongs to driver
        const vehicle = await prisma.vehicle.findFirst({
          where: {
            id: vehicleId,
            driverId: driverId
          }
        });
        
        if (!vehicle) {
          return res.status(400).json({ error: 'Vehicle does not belong to this driver' });
        }
        
        // Parse values properly, ensuring we handle nulls correctly
        const parseDate = date ? new Date(date) : new Date();
        const parseAmount = parseFloat(amount);
        const parseQuantity = quantity ? parseFloat(quantity) : null;
        const parseOdometerReading = odometerReading ? parseFloat(odometerReading) : null;
        
        console.log('Creating fuel expense with:', {
          vehicleId,
          driverId,
          date: parseDate,
          amount: parseAmount,
          quantity: parseQuantity,
          fuelType: fuelType || vehicle.fuelType,
          odometerReading: parseOdometerReading,
          fullTank: fullTank === undefined ? true : fullTank,
          notes
        });
        
        // Create fuel expense
        const fuelExpense = await prisma.fuelExpense.create({
          data: {
            vehicleId,
            driverId,
            date: parseDate,
            amount: parseAmount,
            quantity: parseQuantity,
            fuelType: fuelType || vehicle.fuelType,
            odometerReading: parseOdometerReading,
            fullTank: fullTank === undefined ? true : fullTank,
            notes: notes || null
          },
          include: {
            vehicle: {
              select: {
                make: true,
                model: true,
                licensePlate: true,
                fuelType: true
              }
            }
          }
        });
        
        console.log('Fuel expense created:', fuelExpense.id);
        return res.status(201).json(fuelExpense);
      } catch (error) {
        console.error('Error creating fuel expense:', error);
        return res.status(500).json({ 
          error: 'Failed to create fuel expense',
          details: error.message,
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
      }
      
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).end(`Method ${method} Not Allowed`);
  }
} 