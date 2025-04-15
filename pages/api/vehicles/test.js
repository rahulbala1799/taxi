import prisma from '../../../lib/prisma'

export default async function handler(req, res) {
  // Only allow GET method
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    // Test database connection
    let clientVersion = ""
    let connectionEstablished = false
    
    try {
      clientVersion = prisma._clientVersion
      await prisma.$queryRaw`SELECT 1`
      connectionEstablished = true
    } catch (connErr) {
      return res.status(500).json({ 
        clientVersion,
        connectionEstablished: false,
        error: connErr.message
      })
    }

    // Check vehicle model
    const vehicleModel = {
      exists: true,
      fields: []
    }

    try {
      // Try to get at least one vehicle to verify model exists
      const vehicles = await prisma.vehicle.findMany({ take: 1 })
      // Get field names if available
      if (prisma._baseDmmf && prisma._baseDmmf.modelMap.Vehicle) {
        vehicleModel.fields = Object.keys(prisma._baseDmmf.modelMap.Vehicle.fields)
      }
    } catch (modelErr) {
      vehicleModel.exists = false
      vehicleModel.error = modelErr.message
    }

    // Try to find a valid user to use for the test
    let testUserId = null
    try {
      // First try to find the Stijoimillion user
      const stijoi = await prisma.user.findFirst({
        where: { name: { equals: 'Stijoimillion', mode: 'insensitive' } },
        select: { id: true }
      })
      
      if (stijoi) {
        testUserId = stijoi.id
      } else {
        // Fallback to any user in the database
        const anyUser = await prisma.user.findFirst({
          select: { id: true }
        })
        
        if (anyUser) {
          testUserId = anyUser.id
        }
      }
    } catch (userErr) {
      // Ignore errors here, we'll use a fallback ID if needed
    }

    // Create test
    let createTest = {
      attempted: true,
      data: {
        make: "Test",
        model: "Model",
        year: 2023,
        licensePlate: `TEST-${Date.now()}`,
        driverId: testUserId || "test-driver-id"
      },
      success: false
    }

    try {
      if (testUserId) {
        // Only attempt to create if we found a valid user ID
        const vehicle = await prisma.vehicle.create({
          data: createTest.data
        })
        
        createTest.success = true
        createTest.result = vehicle
      } else {
        createTest.error = {
          message: "Cannot create test vehicle - no valid user ID found in the database",
          code: "USER_NOT_FOUND"
        }
      }
    } catch (createErr) {
      createTest.error = {
        message: createErr.message,
        code: createErr.code,
        meta: createErr.meta
      }
    }

    return res.status(200).json({
      clientVersion,
      connectionEstablished,
      vehicleModel,
      databaseConnected: true,
      createTest
    })
  } catch (error) {
    console.error('Test endpoint error:', error)
    
    return res.status(500).json({
      databaseConnected: false,
      error: {
        message: error.message,
        code: error.code,
        meta: error.meta || {},
        name: error.name,
        stack: error.stack
      }
    })
  }
} 