import prisma from '../../../../lib/prisma';

export default async function handler(req, res) {
  const { id } = req.query;
  const { method } = req;

  switch (method) {
    case 'GET':
      try {
        const insuranceExpense = await prisma.insuranceExpense.findUnique({
          where: { id },
          include: {
            vehicle: {
              select: {
                id: true,
                make: true,
                model: true,
                licensePlate: true
              }
            }
          }
        });

        if (!insuranceExpense) {
          return res.status(404).json({ error: 'Insurance expense not found' });
        }

        return res.status(200).json(insuranceExpense);
      } catch (error) {
        console.error('Error fetching insurance expense:', error);
        return res.status(500).json({ error: 'Failed to fetch insurance expense' });
      }

    case 'PUT':
      try {
        const { 
          provider,
          amount,
          startDate,
          endDate,
          paymentCycle,
          policyNumber,
          notes
        } = req.body;

        // Check if insurance expense exists
        const existingExpense = await prisma.insuranceExpense.findUnique({
          where: { id },
          select: { 
            driverId: true, 
            vehicleId: true, 
            startDate: true,
            paymentCycle: true
          }
        });

        if (!existingExpense) {
          return res.status(404).json({ error: 'Insurance expense not found' });
        }

        // Create update data object
        const updateData = {};
        
        if (provider) updateData.provider = provider;
        if (policyNumber !== undefined) updateData.policyNumber = policyNumber;
        if (notes !== undefined) updateData.notes = notes;
        
        // Handle date and amount changes
        const needsRecalculation = (
          amount !== undefined || 
          startDate !== undefined || 
          endDate !== undefined || 
          paymentCycle !== undefined
        );
        
        if (needsRecalculation) {
          const newAmount = amount !== undefined ? parseFloat(amount) : existingExpense.amount;
          const newStartDate = startDate ? new Date(startDate) : existingExpense.startDate;
          const newEndDate = endDate ? new Date(endDate) : existingExpense.endDate;
          const newPaymentCycle = paymentCycle || existingExpense.paymentCycle;
          
          updateData.amount = newAmount;
          if (startDate) updateData.startDate = newStartDate;
          if (endDate) updateData.endDate = newEndDate;
          if (paymentCycle) updateData.paymentCycle = newPaymentCycle;
          
          // Recalculate monthly amount
          let monthlyAmount = newAmount;
          
          // Calculate total months between start and end dates
          const totalMonths = (newEndDate.getFullYear() - newStartDate.getFullYear()) * 12 + 
                            (newEndDate.getMonth() - newStartDate.getMonth());
          
          if (newPaymentCycle === 'ANNUALLY') {
            monthlyAmount = newAmount / 12;
          } else if (newPaymentCycle === 'QUARTERLY') {
            monthlyAmount = newAmount / 3;
          } else if (totalMonths > 0) {
            // If payment cycle is MONTHLY but covers multiple months
            monthlyAmount = newAmount / totalMonths;
          }
          
          updateData.monthlyAmount = monthlyAmount;
        }

        // Update insurance expense
        const updatedInsuranceExpense = await prisma.insuranceExpense.update({
          where: { id },
          data: updateData,
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

        return res.status(200).json(updatedInsuranceExpense);
      } catch (error) {
        console.error('Error updating insurance expense:', error);
        return res.status(500).json({ error: 'Failed to update insurance expense' });
      }

    case 'DELETE':
      try {
        // Check if insurance expense exists
        const existingExpense = await prisma.insuranceExpense.findUnique({
          where: { id }
        });

        if (!existingExpense) {
          return res.status(404).json({ error: 'Insurance expense not found' });
        }

        // Delete insurance expense
        await prisma.insuranceExpense.delete({
          where: { id }
        });

        return res.status(200).json({ message: 'Insurance expense deleted successfully' });
      } catch (error) {
        console.error('Error deleting insurance expense:', error);
        return res.status(500).json({ error: 'Failed to delete insurance expense' });
      }

    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      return res.status(405).end(`Method ${method} Not Allowed`);
  }
} 