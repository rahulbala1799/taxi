import prisma from '../../../../lib/prisma';

export default async function handler(req, res) {
  const { id } = req.query;
  const { method } = req;

  switch (method) {
    case 'GET':
      try {
        const maintenanceExpense = await prisma.maintenanceExpense.findUnique({
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

        if (!maintenanceExpense) {
          return res.status(404).json({ error: 'Maintenance expense not found' });
        }

        return res.status(200).json(maintenanceExpense);
      } catch (error) {
        console.error('Error fetching maintenance expense:', error);
        return res.status(500).json({ error: 'Failed to fetch maintenance expense' });
      }

    case 'PUT':
      try {
        const { 
          date,
          amount,
          serviceType,
          odometerReading,
          notes
        } = req.body;

        // Check if maintenance expense exists
        const existingExpense = await prisma.maintenanceExpense.findUnique({
          where: { id },
          select: { driverId: true, vehicleId: true }
        });

        if (!existingExpense) {
          return res.status(404).json({ error: 'Maintenance expense not found' });
        }

        // Create update data object
        const updateData = {};
        
        if (date) updateData.date = new Date(date);
        if (amount !== undefined) updateData.amount = parseFloat(amount);
        if (serviceType) updateData.serviceType = serviceType;
        if (odometerReading !== undefined) {
          updateData.odometerReading = odometerReading === '' || odometerReading === null ? null : parseFloat(odometerReading);
        }
        if (notes !== undefined) updateData.notes = notes;

        // Update maintenance expense
        const updatedMaintenanceExpense = await prisma.maintenanceExpense.update({
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

        return res.status(200).json(updatedMaintenanceExpense);
      } catch (error) {
        console.error('Error updating maintenance expense:', error);
        return res.status(500).json({ error: 'Failed to update maintenance expense' });
      }

    case 'DELETE':
      try {
        // Check if maintenance expense exists
        const existingExpense = await prisma.maintenanceExpense.findUnique({
          where: { id }
        });

        if (!existingExpense) {
          return res.status(404).json({ error: 'Maintenance expense not found' });
        }

        // Delete maintenance expense
        await prisma.maintenanceExpense.delete({
          where: { id }
        });

        return res.status(200).json({ message: 'Maintenance expense deleted successfully' });
      } catch (error) {
        console.error('Error deleting maintenance expense:', error);
        return res.status(500).json({ error: 'Failed to delete maintenance expense' });
      }

    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      return res.status(405).end(`Method ${method} Not Allowed`);
  }
} 