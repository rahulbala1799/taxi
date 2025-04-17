const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkRidesByPeriod() {
  try {
    // User ID from the debug output
    const userId = '320a3b2e-639a-4855-9a7c-1b3edea0e696';
    
    console.log('Checking rides for user by time period:', userId);

    // Define all the periods to check
    const periods = ['day', 'week', 'month', 'year', 'all'];
    
    for (const period of periods) {
      // Get date range based on the period
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      let startDate, endDate;
      
      if (period === 'all') {
        startDate = new Date(0); // Beginning of time
        endDate = new Date();
        endDate.setFullYear(endDate.getFullYear() + 100); // Far in the future
      } else {
        startDate = new Date(today);
        endDate = new Date(today);
        endDate.setHours(23, 59, 59, 999);
  
        switch (period) {
          case 'day':
            // Already set to today
            break;
          case 'week':
            // Start of current week (Sunday)
            startDate.setDate(today.getDate() - today.getDay());
            // End of current week (Saturday)
            endDate.setDate(startDate.getDate() + 6);
            endDate.setHours(23, 59, 59, 999);
            break;
          case 'month':
            // Start of current month
            startDate.setDate(1);
            // End of current month
            endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            endDate.setHours(23, 59, 59, 999);
            break;
          case 'year':
            // Start of current year
            startDate.setMonth(0, 1);
            // End of current year
            endDate = new Date(today.getFullYear(), 11, 31);
            endDate.setHours(23, 59, 59, 999);
            break;
        }
      }

      // Get rides within the time period
      const rides = await prisma.ride.findMany({
        where: {
          userId,
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
      });
      
      console.log(`\n[${period.toUpperCase()}] Period: ${startDate.toDateString()} to ${endDate.toDateString()}`);
      console.log(`Found ${rides.length} rides`);
      
      if (rides.length > 0) {
        let totalEarnings = 0;
        
        rides.forEach((ride, index) => {
          const earnings = parseFloat(ride.fare || 0) + parseFloat(ride.tips || 0);
          totalEarnings += earnings;
          
          if (index < 3) { // Show details of first 3 rides only
            console.log(`  Ride on ${new Date(ride.date).toLocaleDateString()}: $${earnings.toFixed(2)}`);
          }
        });
        
        console.log(`  Total earnings: $${totalEarnings.toFixed(2)}`);
      }
      
      // Also check shifts
      const shifts = await prisma.shift.findMany({
        where: {
          driverId: userId,
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
      });
      
      console.log(`  Found ${shifts.length} shifts`);
    }
  } catch (error) {
    console.error('Error checking rides by period:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkRidesByPeriod()
  .then(() => console.log('Check completed'))
  .catch(console.error); 