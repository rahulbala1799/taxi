const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkRides() {
  try {
    // User ID from the debug output
    const userId = '320a3b2e-639a-4855-9a7c-1b3edea0e696';
    
    console.log('Checking rides for user:', userId);
    
    // Get all rides for the user
    const allRides = await prisma.ride.findMany({
      where: {
        userId: userId,
      },
      take: 10, // Get up to 10 rides
      orderBy: {
        date: 'desc', // Most recent first
      },
    });
    
    console.log(`Found ${allRides.length} rides for this user`);
    
    if (allRides.length > 0) {
      console.log('\nMost recent rides:');
      
      allRides.forEach((ride, index) => {
        console.log(`\nRide #${index + 1}:`);
        console.log(`  ID: ${ride.id}`);
        console.log(`  Date: ${ride.date}`);
        console.log(`  From: ${ride.pickupLocation} To: ${ride.dropoffLocation}`);
        console.log(`  Distance: ${ride.distance} km, Duration: ${ride.duration} min`);
        console.log(`  Fare: $${ride.fare}, Tips: $${ride.tips}, Total: $${ride.totalEarned}`);
        console.log(`  Vehicle Type: ${ride.vehicleType}`);
        console.log(`  Ride Source: ${ride.rideSource}`);

        // Check if the ride has an endTime field
        if ('endTime' in ride) {
          console.log(`  End Time: ${ride.endTime || 'Not set'}`);
        } else {
          console.log('  NOTE: No endTime field found in this ride record');
        }

        // Check if ride has status field
        if ('status' in ride) {
          console.log(`  Status: ${ride.status}`);
        } else {
          console.log('  NOTE: No status field found in this ride record');
        }
      });
    }
    
    // Check the Ride schema fields
    const rideFields = Object.keys(prisma.ride.fields).join(', ');
    console.log('\nRide schema fields:', rideFields);
    
    // Check database for rides with current date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);
    
    const todayRides = await prisma.ride.findMany({
      where: {
        date: {
          gte: today,
          lte: endOfDay,
        },
      },
    });
    
    console.log(`\nFound ${todayRides.length} rides for today (${today.toDateString()})`);
    
    // Additional check for rides with 'status' and 'endTime' fields specified in the metrics query
    try {
      const completedRides = await prisma.ride.findMany({
        where: {
          userId: userId,
          status: 'COMPLETED',
        },
        take: 5,
      });
      
      console.log(`\nRides with status 'COMPLETED': ${completedRides.length}`);
    } catch (error) {
      console.log('\nError when querying for status: COMPLETED', error.message);
      console.log('This suggests the status field might not exist in the schema');
    }
    
    try {
      const ridesWithEndTime = await prisma.ride.findMany({
        where: {
          userId: userId,
          endTime: {
            not: null,
          },
        },
        take: 5,
      });
      
      console.log(`\nRides with endTime field: ${ridesWithEndTime.length}`);
    } catch (error) {
      console.log('\nError when querying for endTime', error.message);
      console.log('This suggests the endTime field might not exist in the schema');
    }

  } catch (error) {
    console.error('Error checking rides:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkRides()
  .then(() => console.log('Check completed'))
  .catch(console.error); 