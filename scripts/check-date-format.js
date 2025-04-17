const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDateFormats() {
  try {
    // Get all rides without filtering by date
    const allRides = await prisma.ride.findMany({
      take: 10, // Get up to 10 rides
    });
    
    console.log(`Found ${allRides.length} rides in the database`);
    
    if (allRides.length > 0) {
      console.log('\nExamining date formats:');
      
      allRides.forEach((ride, index) => {
        console.log(`\nRide #${index + 1} (ID: ${ride.id}):`);
        console.log(`  Date string representation: ${ride.date}`);
        console.log(`  Date object type: ${typeof ride.date}`);
        console.log(`  Date raw value: ${ride.date instanceof Date ? ride.date.valueOf() : 'not a Date'}`);
        console.log(`  Date ISO string: ${ride.date instanceof Date ? ride.date.toISOString() : new Date(ride.date).toISOString()}`);
        
        // Convert to local date
        const localDate = new Date(ride.date);
        console.log(`  Local date representation: ${localDate.toString()}`);
        console.log(`  Date only: ${localDate.toDateString()}`);
        console.log(`  Year: ${localDate.getFullYear()}`);
        console.log(`  Month: ${localDate.getMonth() + 1}`); // +1 because months are 0-indexed
        console.log(`  Day: ${localDate.getDate()}`);
        
        // Show ride user information
        console.log(`  User ID: ${ride.userId}`);
      });
      
      // Check current date values for comparison
      const now = new Date();
      console.log('\nCurrent date information:');
      console.log(`  Current date: ${now.toString()}`);
      console.log(`  Date string: ${now.toDateString()}`);
      console.log(`  ISO string: ${now.toISOString()}`);
      console.log(`  Year: ${now.getFullYear()}`);
      console.log(`  Month: ${now.getMonth() + 1}`);
      console.log(`  Day: ${now.getDate()}`);
      
      // Get the system timezone
      console.log(`  System timezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}`);
      console.log(`  System timezone offset: ${now.getTimezoneOffset() / -60} hours`);
    }
    
    // Now check the Shift records too
    const allShifts = await prisma.shift.findMany({
      take: 5,
    });
    
    console.log(`\nFound ${allShifts.length} shifts in the database`);
    
    if (allShifts.length > 0) {
      console.log('\nExamining shift date formats:');
      
      allShifts.forEach((shift, index) => {
        console.log(`\nShift #${index + 1} (ID: ${shift.id}):`);
        console.log(`  Date string representation: ${shift.date}`);
        console.log(`  Start time: ${shift.startTime}`);
        console.log(`  End time: ${shift.endTime}`);
        console.log(`  Driver ID: ${shift.driverId}`);
      });
    }

  } catch (error) {
    console.error('Error checking date formats:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDateFormats()
  .then(() => console.log('Check completed'))
  .catch(console.error); 