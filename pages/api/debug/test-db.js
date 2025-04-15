import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
  try {
    // Test database connection
    const result = await prisma.$queryRaw`SELECT 1 as connectivity_test`;
    
    // Test user table access
    let userCount = 0;
    let userCountError = null;
    try {
      userCount = await prisma.user.count();
    } catch (error) {
      userCountError = {
        message: error.message,
        code: error.code
      };
    }
    
    // Test ride table access
    let rideCount = 0;
    let rideCountError = null;
    try {
      rideCount = await prisma.ride.count();
    } catch (error) {
      rideCountError = {
        message: error.message,
        code: error.code
      };
    }
    
    // Test vehicle table access
    let vehicleCount = 0;
    let vehicleCountError = null;
    try {
      vehicleCount = await prisma.vehicle.count();
    } catch (error) {
      vehicleCountError = {
        message: error.message,
        code: error.code
      };
    }

    // Get schema version information
    const schemaInfo = {
      userModel: !!prisma.user,
      rideModel: !!prisma.ride,
      vehicleModel: !!prisma.vehicle,
      dailyStatsModel: !!prisma.dailyStats,
    };

    // Return all diagnostic information
    return res.status(200).json({
      success: true,
      databaseConnected: true,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      prismaVersion: prisma._clientVersion,
      schema: schemaInfo,
      counts: {
        users: userCount,
        rides: rideCount,
        vehicles: vehicleCount
      },
      errors: {
        userCount: userCountError,
        rideCount: rideCountError,
        vehicleCount: vehicleCountError
      }
    });
  } catch (error) {
    console.error('Database connectivity test failed:', error);
    return res.status(500).json({
      success: false,
      databaseConnected: false,
      error: {
        message: error.message,
        code: error.code,
        stack: error.stack
      },
      timestamp: new Date().toISOString()
    });
  }
} 