import prisma from '../../../lib/prisma'

export default async function handler(req, res) {
  try {
    switch (req.method) {
      case 'GET':
        return getVehicles(req, res)
      case 'POST':
        return createVehicle(req, res)
      default:
        return res.status(405).json({ message: 'Method not allowed' })
    }
  } catch (error) {
    console.error('Top level API error:', error)
    return res.status(500).json({ 
      message: 'Unexpected server error', 
      details: error.message,
      stack: error.stack
    })
  }
}

// Get vehicles belonging to a user
async function getVehicles(req, res) {
  const { userId, driverId } = req.query
  const userIdentifier = driverId || userId

  if (!userIdentifier) {
    return res.status(400).json({ message: 'User ID is required (use userId or driverId parameter)' })
  }

  try {
    console.log(`Fetching vehicles for user: ${userIdentifier}`)
    const vehicles = await prisma.vehicle.findMany({
      where: { 
        driverId: userIdentifier 
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log(`Found ${vehicles.length} vehicles for user ${userIdentifier}`)
    return res.status(200).json(vehicles)
  } catch (error) {
    console.error('Error fetching vehicles:', error)
    return res.status(500).json({ message: 'Error fetching vehicles', details: error.message })
  }
}

// Create a new vehicle
async function createVehicle(req, res) {
  console.log('Vehicle creation request received:', req.body)
  
  try {
    const { name, registrationNumber, fuelType, userId } = req.body

    if (!registrationNumber) {
      return res.status(400).json({ message: 'Registration number is required' })
    }

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' })
    }

    // Logging for debugging
    console.log('Creating vehicle with:', {
      name,
      registrationNumber,
      fuelType,
      userId
    })

    // Check if vehicle with this registration already exists
    try {
      const existingVehicle = await prisma.vehicle.findFirst({
        where: { licensePlate: registrationNumber }
      })

      if (existingVehicle) {
        return res.status(400).json({ message: 'A vehicle with this registration number already exists' })
      }
    } catch (lookupError) {
      console.error('Error checking for existing vehicle:', lookupError)
      // Continue with creation attempt even if lookup fails
    }

    // Simplified vehicle data - only use minimal required fields
    const vehicleData = {
      make: name ? name.split(' ')[0] || 'Unknown' : 'Unknown',
      model: name ? name.split(' ').slice(1).join(' ') || 'Model' : 'Model',
      year: new Date().getFullYear(),
      licensePlate: registrationNumber,
      driverId: userId
    }
    
    // The schema might have changed, so handle gracefully
    if (typeof fuelType === 'string' && fuelType.trim() !== '') {
      vehicleData.fuelType = fuelType
    }

    console.log('Final vehicle data:', vehicleData)

    // Create vehicle with safer approach
    const vehicle = await prisma.vehicle.create({ 
      data: vehicleData
    })

    console.log('Vehicle created successfully:', vehicle)

    return res.status(201).json(vehicle)
  } catch (error) {
    console.error('Error creating vehicle:', error)
    
    // Attempt schema introspection for debugging
    try {
      const dmmf = prisma._baseDmmf.modelMap.Vehicle
      console.log('Vehicle schema fields:', Object.keys(dmmf.fields))
    } catch (schemaError) {
      console.error('Could not introspect schema:', schemaError)
    }
    
    return res.status(500).json({ 
      message: 'Error creating vehicle', 
      details: error.message,
      stack: error.stack
    })
  }
} 