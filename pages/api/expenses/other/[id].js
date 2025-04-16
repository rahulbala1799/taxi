import prisma from '../../../../lib/prisma';

export default async function handler(req, res) {
  const { id } = req.query;
  const { method } = req;

  switch (method) {
    case 'GET':
      try {
        const otherExpense = await prisma.otherExpense.findUnique({
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

        if (!otherExpense) {
          return res.status(404).json({ error: 'Other expense not found' });
        }

        return res.status(200).json(otherExpense);
      } catch (error) {
        console.error('Error fetching other expense:', error);
        return res.status(500).json({ error: 'Failed to fetch other expense' });
      }

    case 'PUT':
      try {
        const { 
          vehicleId,
          date,
          amount,
          category,
          notes
        } = req.body;

        // Check if other expense exists
        const existingExpense = await prisma.otherExpense.findUnique({
          where: { id },
          select: { driverId: true, vehicleId: true }
        });

        if (!existingExpense) {
          return res.status(404).json({ error: 'Other expense not found' });
        }

        // Create update data object
        const updateData = {};
        
        if (date) updateData.date = new Date(date);
        if (amount !== undefined) updateData.amount = parseFloat(amount);
        if (category) updateData.category = category;
        if (vehicleId !== undefined) updateData.vehicleId = vehicleId || null;
        if (notes !== undefined) updateData.notes = notes;

        // If vehicleId is provided, check if it belongs to the driver
        if (vehicleId) {
          const vehicle = await prisma.vehicle.findFirst({
            where: {
              id: vehicleId,
              driverId: existingExpense.driverId
            }
          });
          
          if (!vehicle) {
            return res.status(400).json({ error: 'Vehicle not found or does not belong to the driver' });
          }
        }

        // Update other expense
        const updatedOtherExpense = await prisma.otherExpense.update({
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

        return res.status(200).json(updatedOtherExpense);
      } catch (error) {
        console.error('Error updating other expense:', error);
        return res.status(500).json({ error: 'Failed to update other expense' });
      }

    case 'DELETE':
      try {
        // Check if other expense exists
        const existingExpense = await prisma.otherExpense.findUnique({
          where: { id }
        });

        if (!existingExpense) {
          return res.status(404).json({ error: 'Other expense not found' });
        }

        // Delete other expense
        await prisma.otherExpense.delete({
          where: { id }
        });

        return res.status(200).json({ message: 'Other expense deleted successfully' });
      } catch (error) {
        console.error('Error deleting other expense:', error);
        return res.status(500).json({ error: 'Failed to delete other expense' });
      }

    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      return res.status(405).end(`Method ${method} Not Allowed`);
  }
} 