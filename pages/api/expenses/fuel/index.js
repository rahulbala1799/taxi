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
        const { vehicleId, driverId, amount, gallons, pricePerGallon, odometer, date, notes, fuelType } = req.body;
        
        // Validate required fields
        if (!vehicleId || !driverId || !amount || !date) {
          return res.status(400).json({ error: 'Missing required fields: vehicleId, driverId, amount, and date are required' });
        }
        
        // Check if vehicle belongs to driver
        const vehicle = await prisma.vehicle.findFirst({
          where: {
            id: vehicleId,
            driverId: driverId
          }
        });
        
        if (!vehicle) {
          return res.status(400).json({ error: 'Vehicle does not belong to this driver' });
        }
        
        // Calculate gallons or pricePerGallon if one is provided but not the other
        let calculatedGallons = gallons;
        let calculatedPricePerGallon = pricePerGallon;
        
        if (gallons && !pricePerGallon && amount) {
          calculatedPricePerGallon = parseFloat(amount) / parseFloat(gallons);
        } else if (!gallons && pricePerGallon && amount) {
          calculatedGallons = parseFloat(amount) / parseFloat(pricePerGallon);
        }
        
        // Create fuel expense
        const fuelExpense = await prisma.fuelExpense.create({
          data: {
            vehicleId,
            driverId,
            amount: parseFloat(amount),
            gallons: calculatedGallons ? parseFloat(calculatedGallons) : null,
            pricePerGallon: calculatedPricePerGallon ? parseFloat(calculatedPricePerGallon) : null,
            odometer: odometer ? parseInt(odometer) : null,
            date: new Date(date),
            notes: notes || null,
            fuelType: fuelType || vehicle.fuelType || 'GASOLINE'
          }
        });
        
        return res.status(201).json(fuelExpense);
      } catch (error) {
        console.error('Error creating fuel expense:', error);
        return res.status(500).json({ error: 'Failed to create fuel expense' });
      }
      
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).end(`Method ${method} Not Allowed`);
  }
} 