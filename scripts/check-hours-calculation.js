const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkHoursCalculation() {
  try {
    // User ID from the debug output
    const userId = '320a3b2e-639a-4855-9a7c-1b3edea0e696';
    
    console.log('Checking hours calculation for user:', userId);
    
    // Set date range for 'week' period - similar to what the metrics API uses
    const today = new Date('2025-04-17T00:00:00Z'); // Using the overridden date from the metrics API
    today.setHours(0, 0, 0, 0);
    
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
    
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6); // End of week (Saturday)
    endDate.setHours(23, 59, 59, 999);
    
    console.log('Date range:', { 
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    });
    
    // Get all shifts within this date range
    const shifts = await prisma.shift.findMany({
      where: {
        driverId: userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        vehicle: true
      }
    });
    
    console.log(`Found ${shifts.length} shifts in the date range.`);
    
    // Detail each shift's duration
    let totalMinutes = 0;
    let totalHours = 0;
    
    shifts.forEach((shift, index) => {
      console.log(`\nShift #${index + 1}:`);
      console.log(`  ID: ${shift.id}`);
      console.log(`  Date: ${shift.date}`);
      console.log(`  Start Time: ${shift.startTime}`);
      console.log(`  End Time: ${shift.endTime || 'Not ended'}`);
      console.log(`  Vehicle: ${shift.vehicle?.model || 'Unknown'} (${shift.vehicle?.licensePlate || 'Unknown'})`);
      console.log(`  Status: ${shift.status}`);
      
      if (shift.startTime && shift.endTime) {
        const startTime = new Date(shift.startTime);
        const endTime = new Date(shift.endTime);
        
        console.log(`  Start Time (parsed): ${startTime.toISOString()}`);
        console.log(`  End Time (parsed): ${endTime.toISOString()}`);
        
        const diffMs = endTime - startTime;
        const diffMins = diffMs / (1000 * 60);
        const diffHrs = diffMs / (1000 * 60 * 60);
        
        console.log(`  Duration: ${diffMins.toFixed(2)} minutes or ${diffHrs.toFixed(2)} hours`);
        
        totalMinutes += diffMins;
        totalHours += diffHrs;
      } else {
        console.log('  Cannot calculate duration - missing end time');
      }
    });
    
    console.log('\nTotal duration:');
    console.log(`  Minutes: ${totalMinutes.toFixed(2)}`);
    console.log(`  Hours: ${totalHours.toFixed(2)}`);
    
    // Now get the rides to calculate earnings
    const rides = await prisma.ride.findMany({
      where: {
        userId: userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });
    
    console.log(`\nFound ${rides.length} rides in the date range.`);
    
    // Calculate total earnings
    let totalEarnings = 0;
    
    rides.forEach((ride, index) => {
      const fare = parseFloat(ride.fare || 0);
      const tips = parseFloat(ride.tips || 0);
      const earned = fare + tips;
      
      totalEarnings += earned;
      
      console.log(`Ride #${index + 1}: Fare: €${fare.toFixed(2)}, Tips: €${tips.toFixed(2)}, Total: €${earned.toFixed(2)}`);
    });
    
    console.log(`\nTotal Earnings: €${totalEarnings.toFixed(2)}`);
    
    // Calculate average earnings per hour
    if (totalHours > 0) {
      const avgPerHour = totalEarnings / totalHours;
      console.log(`\nAverage Earnings per Hour: €${avgPerHour.toFixed(2)}`);
    } else {
      console.log('\nCannot calculate average earnings per hour - no hours recorded');
    }

  } catch (error) {
    console.error('Error checking hours calculation:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkHoursCalculation()
  .then(() => console.log('Check completed'))
  .catch(console.error); 