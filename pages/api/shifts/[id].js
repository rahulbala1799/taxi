import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
  const { id } = req.query;
  const { method } = req;

  switch (method) {
    case 'GET':
      try {
        const shift = await prisma.shift.findUnique({
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
            },
            rides: {
              select: {
                id: true,
                fare: true,
                tips: true,
                totalEarned: true
              }
            }
          }
        });

        if (!shift) {
          return res.status(404).json({ error: 'Shift not found' });
        }

        // Calculate total earnings for the shift
        const totalEarnings = shift.rides.reduce((sum, ride) => {
          return sum + (parseFloat(ride.totalEarned) || 0);
        }, 0);

        // Add total earnings to the response
        const shiftWithEarnings = {
          ...shift,
          totalEarnings
        };

        return res.status(200).json(shiftWithEarnings);
      } catch (error) {
        console.error('Error fetching shift:', error);
        return res.status(500).json({ error: 'Failed to fetch shift' });
      }

    case 'PUT':
      try {
        const { 
          endTime,
          endRange,
          status,
          notes
        } = req.body;

        // Get the current shift
        const currentShift = await prisma.shift.findUnique({
          where: { id },
          include: {
            vehicle: true
          }
        });
        
        if (!currentShift) {
          return res.status(404).json({ error: 'Shift not found' });
        }

        // If ending a shift (completing it)
        if (status === 'COMPLETED') {
          // Check if end time is provided
          if (!endTime) {
            return res.status(400).json({ error: 'End time is required to complete a shift' });
          }
          
          // For electric vehicles, end range is required
          if (currentShift.vehicle.fuelType === 'Electric' && !endRange && endRange !== 0) {
            return res.status(400).json({ error: 'Ending range is required for electric vehicles' });
          }
        }

        // Prepare update data
        const updateData = {};
        
        if (endTime) {
          // Parse end time
          const now = new Date();
          const [hours, minutes] = endTime.split(':').map(Number);
          const parsedEndTime = new Date(now);
          parsedEndTime.setHours(hours, minutes, 0, 0);
          
          // If end time is before start time, adjust to the next day
          if (parsedEndTime < currentShift.startTime) {
            parsedEndTime.setDate(parsedEndTime.getDate() + 1);
          }
          
          updateData.endTime = parsedEndTime;
        }
        
        if (endRange !== undefined) {
          updateData.endRange = parseFloat(endRange);
        }
        
        if (status) {
          updateData.status = status;
        }
        
        if (notes !== undefined) {
          updateData.notes = notes;
        }

        // Update the shift
        const updatedShift = await prisma.shift.update({
          where: { id },
          data: updateData,
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

        return res.status(200).json(updatedShift);
      } catch (error) {
        console.error('Error updating shift:', error);
        return res.status(500).json({ error: 'Failed to update shift' });
      }

    case 'DELETE':
      try {
        await prisma.shift.delete({
          where: { id }
        });

        return res.status(200).json({ message: 'Shift deleted successfully' });
      } catch (error) {
        console.error('Error deleting shift:', error);
        return res.status(500).json({ error: 'Failed to delete shift' });
      }

    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      return res.status(405).end(`Method ${method} Not Allowed`);
  }
} 