import prisma from '../../../lib/prisma'

export default async function handler(req, res) {
  try {
    // Get prisma client version and connection status
    const info = {
      clientVersion: prisma._clientVersion,
      connectionEstablished: true
    };

    // Test introspection of the schema
    try {
      const vehicleInfo = {
        exists: false,
        fields: []
      };

      // Check if Vehicle model is accessible
      if (prisma.vehicle) {
        vehicleInfo.exists = true;
        
        // Try to get model fields
        if (prisma._baseDmmf && prisma._baseDmmf.modelMap && prisma._baseDmmf.modelMap.Vehicle) {
          vehicleInfo.fields = Object.keys(prisma._baseDmmf.modelMap.Vehicle.fields);
        }
      }
      
      info.vehicleModel = vehicleInfo;
    } catch (schemaError) {
      info.schemaError = {
        message: schemaError.message,
        stack: schemaError.stack
      };
    }

    // Check database connectivity with simple query
    try {
      await prisma.$queryRaw`SELECT 1 AS "connectionTest"`;
      info.databaseConnected = true;
    } catch (dbError) {
      info.databaseConnected = false;
      info.databaseError = {
        message: dbError.message,
        stack: dbError.stack
      };
    }

    // Try a minimal vehicle creation with only required fields
    const testData = {
      make: 'Test',
      model: 'Model',
      year: 2023,
      licensePlate: `TEST-${Date.now()}`,
      driverId: 'test-driver-id' // This will fail but shows where the error occurs
    };
    
    try {
      info.createTest = { 
        attempted: true,
        data: testData
      };
      
      // We expect this to fail but want to see the exact error
      await prisma.vehicle.create({ data: testData });
    } catch (createError) {
      info.createTest.error = {
        message: createError.message,
        code: createError.code,
        meta: createError.meta
      };
    }

    return res.status(200).json(info);
  } catch (error) {
    return res.status(500).json({
      message: 'Test endpoint failed',
      error: {
        message: error.message,
        stack: error.stack
      }
    });
  }
} 