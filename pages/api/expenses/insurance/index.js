import prisma from '../../../../lib/prisma';

export default async function handler(req, res) {
  const { method } = req;

  switch (method) {
    case 'GET':
      try {
        const { driverId, vehicleId, active } = req.query;
        
        // Build the query
        const whereClause = {};
        
        if (driverId) {
          whereClause.driverId = driverId;
        }
        
        if (vehicleId) {
          whereClause.vehicleId = vehicleId;
        }
        
        // Filter for active policies
        if (active === 'true') {
          const today = new Date();
          whereClause.endDate = {
            gte: today
          };
        }
        
        // Get insurance expenses
        const insuranceExpenses = await prisma.insuranceExpense.findMany({
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
            startDate: 'desc'
          }
        });
        
        return res.status(200).json(insuranceExpenses);
      } catch (error) {
        console.error('Error fetching insurance expenses:', error);
        return res.status(500).json({ error: 'Failed to fetch insurance expenses' });
      }

    case 'POST':
      try {
        const { 
          vehicleId,
          driverId,
          provider,
          amount,
          startDate = new Date(),
          endDate,
          paymentCycle = 'MONTHLY',
          policyNumber,
          notes
        } = req.body;

        // Validate required fields
        if (!vehicleId || !driverId || !amount || !provider || !endDate) {
          return res.status(400).json({ error: 'Missing required insurance details' });
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

        // Calculate monthly amount based on payment cycle and total amount
        const totalAmount = parseFloat(amount);
        let monthlyAmount = totalAmount;
        
        const startDateObj = new Date(startDate);
        const endDateObj = new Date(endDate);
        
        // Calculate total months between start and end dates
        const totalMonths = (endDateObj.getFullYear() - startDateObj.getFullYear()) * 12 + 
                          (endDateObj.getMonth() - startDateObj.getMonth());
        
        if (paymentCycle === 'ANNUALLY') {
          monthlyAmount = totalAmount / 12;
        } else if (paymentCycle === 'QUARTERLY') {
          monthlyAmount = totalAmount / 3;
        } else if (totalMonths > 0) {
          // If payment cycle is MONTHLY but covers multiple months
          monthlyAmount = totalAmount / totalMonths;
        }

        // Create insurance expense
        const insuranceExpense = await prisma.insuranceExpense.create({
          data: {
            startDate: startDateObj,
            endDate: endDateObj,
            amount: totalAmount,
            monthlyAmount,
            paymentCycle,
            provider,
            policyNumber,
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

        return res.status(201).json(insuranceExpense);
      } catch (error) {
        console.error('Error creating insurance expense:', error);
        return res.status(500).json({ error: 'Failed to create insurance expense' });
      }

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).end(`Method ${method} Not Allowed`);
  }
} 