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
          notes,
          date,
          startTime
        } = req.body;

        console.log('PUT /api/shifts/[id] - Request body:', req.body);
        console.log('Shift ID:', id);
        console.log('Shift ID type:', typeof id);
        
        // Ensure we have a valid ID - this is likely causing the issue
        if (!id) {
          console.error('Invalid shift ID provided');
          return res.status(400).json({ error: 'Invalid shift ID' });
        }

        try {
          // Get the current shift - this may fail if ID is invalid
          const currentShift = await prisma.shift.findUnique({
            where: { id },
            include: {
              vehicle: true
            }
          });
          
          if (!currentShift) {
            console.error('Shift not found with ID:', id);
            return res.status(404).json({ error: 'Shift not found' });
          }

          // Log complete shift info for debugging
          console.log('Current shift found:', JSON.stringify(currentShift, null, 2));
          
          // Validate the shift belongs to the user making the request if there's a driverId in the body
          if (req.body.driverId && currentShift.driverId !== req.body.driverId) {
            console.error('Unauthorized: Shift belongs to a different driver');
            return res.status(403).json({ error: 'Unauthorized access to this shift' });
          }

          console.log('Current shift found:', {
            id: currentShift.id,
            vehicleId: currentShift.vehicleId,
            driverId: currentShift.driverId,
            status: currentShift.status,
            date: currentShift.date
          });

          // If ending a shift (completing it)
          if (status === 'COMPLETED') {
            // Check if end time is provided
            if (!endTime) {
              console.error('Missing endTime for COMPLETED status');
              return res.status(400).json({ error: 'End time is required to complete a shift' });
            }
            
            // For electric vehicles, end range is required
            if (currentShift.vehicle.fuelType === 'Electric' && !endRange && endRange !== 0) {
              console.error('Missing endRange for Electric vehicle');
              return res.status(400).json({ error: 'Ending range is required for electric vehicles' });
            }
          }

          // Prepare update data
          const updateData = {};
          
          // Handle date field
          if (date) {
            try {
              updateData.date = new Date(date);
              if (isNaN(updateData.date.getTime())) {
                throw new Error('Invalid date format');
              }
            } catch (err) {
              console.error('Error parsing date:', date, err);
              return res.status(400).json({ error: 'Invalid date format' });
            }
          }
          
          // Handle start time field
          if (startTime) {
            try {
              if (typeof startTime === 'string' && startTime.includes(':')) {
                // It's a time string like "14:30"
                const [hours, minutes] = startTime.split(':').map(Number);
                const dateToUse = date ? new Date(date) : new Date(currentShift.date);
                const parsedStartTime = new Date(dateToUse);
                parsedStartTime.setHours(hours, minutes, 0, 0);
                updateData.startTime = parsedStartTime;
              } else if (startTime instanceof Date || (typeof startTime === 'string' && !isNaN(new Date(startTime).getTime()))) {
                // It's already a date object or date string
                updateData.startTime = new Date(startTime);
              }
              
              if (isNaN(updateData.startTime.getTime())) {
                throw new Error('Invalid start time format');
              }
            } catch (err) {
              console.error('Error parsing start time:', startTime, err);
              return res.status(400).json({ error: 'Invalid start time format' });
            }
          }
          
          if (endTime) {
            try {
              if (typeof endTime === 'string' && endTime.includes(':')) {
                // It's a time string like "14:30"
                const [hours, minutes] = endTime.split(':').map(Number);
                const dateToUse = date ? new Date(date) : new Date(currentShift.date);
                const parsedEndTime = new Date(dateToUse);
                parsedEndTime.setHours(hours, minutes, 0, 0);
                
                // If end time is before start time, adjust to the next day
                const startTimeToUse = updateData.startTime || currentShift.startTime;
                if (parsedEndTime < startTimeToUse) {
                  parsedEndTime.setDate(parsedEndTime.getDate() + 1);
                }
                
                updateData.endTime = parsedEndTime;
              } else if (endTime instanceof Date || (typeof endTime === 'string' && !isNaN(new Date(endTime).getTime()))) {
                // It's already a date object or date string
                updateData.endTime = new Date(endTime);
              }
              
              if (isNaN(updateData.endTime.getTime())) {
                throw new Error('Invalid end time format');
              }
            } catch (err) {
              console.error('Error parsing end time:', endTime, err);
              return res.status(400).json({ error: 'Invalid end time format' });
            }
          }
          
          if (endRange !== undefined) {
            try {
              updateData.endRange = parseFloat(endRange);
              if (isNaN(updateData.endRange)) {
                throw new Error('Invalid end range value');
              }
            } catch (err) {
              console.error('Error parsing end range:', endRange, err);
              return res.status(400).json({ error: 'Invalid end range value' });
            }
          }
          
          if (status) {
            updateData.status = status;
          }
          
          if (notes !== undefined) {
            updateData.notes = notes;
          }

          console.log('Updating shift with data:', JSON.stringify(updateData, null, 2));

          // Update the shift
          try {
            // Make sure the ID is properly structured for Prisma
            const updatedShift = await prisma.shift.update({
              where: { 
                id: id // Explicitly pass the id as is
              },
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
                },
                rides: {
                  select: {
                    id: true,
                    fare: true,
                    tips: true,
                    totalEarned: true,
                    date: true
                  }
                }
              }
            });
            
            console.log('Shift updated successfully:', updatedShift.id);
            
            // If date was updated, update all associated rides to have the same date
            if (date && updatedShift.rides && updatedShift.rides.length > 0) {
              console.log(`Updating dates for ${updatedShift.rides.length} rides to match shift date`);
              
              // Update all associated rides to have the new date
              await Promise.all(updatedShift.rides.map(ride => 
                prisma.ride.update({
                  where: { id: ride.id },
                  data: { date: new Date(date) }
                })
              ));
              
              // Refresh the shift data to include updated rides
              const refreshedShift = await prisma.shift.findUnique({
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
                      totalEarned: true,
                      date: true
                    }
                  }
                }
              });
              
              if (refreshedShift) {
                // Calculate total earnings for the shift
                const totalEarnings = refreshedShift.rides.reduce((sum, ride) => {
                  return sum + (parseFloat(ride.totalEarned) || 0);
                }, 0);
                
                // Add total earnings to the response
                const refreshedShiftWithEarnings = {
                  ...refreshedShift,
                  totalEarnings
                };
                
                console.log('Returning refreshed shift with updated ride dates');
                return res.status(200).json(refreshedShiftWithEarnings);
              }
            }
            
            // Calculate total earnings for the shift
            const totalEarnings = updatedShift.rides.reduce((sum, ride) => {
              return sum + (parseFloat(ride.totalEarned) || 0);
            }, 0);

            // Add total earnings to the response
            const updatedShiftWithEarnings = {
              ...updatedShift,
              totalEarnings
            };

            console.log('Returning updated shift');
            return res.status(200).json(updatedShiftWithEarnings);
          } catch (prismaError) {
            console.error('Prisma error updating shift:', prismaError);
            console.error('Error details:', JSON.stringify({
              code: prismaError.code,
              meta: prismaError.meta,
              message: prismaError.message
            }, null, 2));
            
            return res.status(500).json({ 
              error: 'Database error updating shift',
              details: prismaError.message,
              code: prismaError.code,
              meta: prismaError.meta
            });
          }
        } catch (findError) {
          console.error('Error finding shift:', findError);
          return res.status(500).json({
            error: 'Error retrieving shift',
            details: findError.message
          });
        }
      } catch (error) {
        console.error('Error updating shift:', error);
        return res.status(500).json({ 
          error: 'Failed to update shift',
          details: error.message,
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
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