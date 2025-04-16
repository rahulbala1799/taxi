import prisma from '../../../../lib/prisma';

export default async function handler(req, res) {
  const { method } = req;
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Fuel expense ID is required' });
  }

  switch (method) {
    case 'GET':
      try {
        const fuelExpense = await prisma.fuelExpense.findUnique({
          where: { id },
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

        if (!fuelExpense) {
          return res.status(404).json({ error: 'Fuel expense not found' });
        }

        return res.status(200).json(fuelExpense);
      } catch (error) {
        console.error('Error fetching fuel expense:', error);
        return res.status(500).json({ error: 'Failed to fetch fuel expense' });
      }

    case 'PUT':
      try {
        // Check if the fuel expense exists
        const existingFuelExpense = await prisma.fuelExpense.findUnique({
          where: { id }
        });

        if (!existingFuelExpense) {
          return res.status(404).json({ error: 'Fuel expense not found' });
        }

        const { vehicleId, driverId, amount, gallons, pricePerGallon, odometer, date, notes, fuelType } = req.body;
        
        // Build the update data object
        const updateData = {};
        
        if (vehicleId) updateData.vehicleId = vehicleId;
        if (driverId) updateData.driverId = driverId;
        if (amount !== undefined) updateData.amount = parseFloat(amount);
        if (date) updateData.date = new Date(date);
        if (notes !== undefined) updateData.notes = notes;
        if (fuelType) updateData.fuelType = fuelType;
        if (odometer !== undefined) updateData.odometer = odometer ? parseInt(odometer) : null;
        
        // Calculate gallons or pricePerGallon if needed
        let calculatedGallons = gallons;
        let calculatedPricePerGallon = pricePerGallon;
        
        if (gallons && (!pricePerGallon || pricePerGallon === existingFuelExpense.pricePerGallon) && amount) {
          calculatedPricePerGallon = parseFloat(amount) / parseFloat(gallons);
        } else if ((!gallons || gallons === existingFuelExpense.gallons) && pricePerGallon && amount) {
          calculatedGallons = parseFloat(amount) / parseFloat(pricePerGallon);
        }
        
        if (gallons !== undefined) updateData.gallons = calculatedGallons ? parseFloat(calculatedGallons) : null;
        if (pricePerGallon !== undefined) updateData.pricePerGallon = calculatedPricePerGallon ? parseFloat(calculatedPricePerGallon) : null;
        
        // Update the fuel expense
        const updatedFuelExpense = await prisma.fuelExpense.update({
          where: { id },
          data: updateData,
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

        return res.status(200).json(updatedFuelExpense);
      } catch (error) {
        console.error('Error updating fuel expense:', error);
        return res.status(500).json({ error: 'Failed to update fuel expense' });
      }

    case 'DELETE':
      try {
        // Check if the fuel expense exists
        const existingFuelExpense = await prisma.fuelExpense.findUnique({
          where: { id }
        });

        if (!existingFuelExpense) {
          return res.status(404).json({ error: 'Fuel expense not found' });
        }

        // Delete the fuel expense
        await prisma.fuelExpense.delete({
          where: { id }
        });

        return res.status(200).json({ message: 'Fuel expense deleted successfully' });
      } catch (error) {
        console.error('Error deleting fuel expense:', error);
        return res.status(500).json({ error: 'Failed to delete fuel expense' });
      }

    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      return res.status(405).end(`Method ${method} Not Allowed`);
  }
} 