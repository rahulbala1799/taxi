import prisma from '../../../lib/prisma'

export default async function handler(req, res) {
  switch (req.method) {
    case 'GET':
      return getVehicles(req, res)
    case 'POST':
      return createVehicle(req, res)
    default:
      return res.status(405).json({ message: 'Method not allowed' })
  }
}

// Get vehicles belonging to a user
async function getVehicles(req, res) {
  const { userId } = req.query

  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' })
  }

  try {
    const vehicles = await prisma.vehicle.findMany({
      where: { 
        driverId: userId 
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return res.status(200).json(vehicles)
  } catch (error) {
    console.error('Error fetching vehicles:', error)
    return res.status(500).json({ message: 'Error fetching vehicles', details: error.message })
  }
}

// Create a new vehicle
async function createVehicle(req, res) {
  const { name, registrationNumber, fuelType, userId } = req.body

  if (!registrationNumber) {
    return res.status(400).json({ message: 'Registration number is required' })
  }

  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' })
  }

  try {
    // Logging for debugging
    console.log('Creating vehicle with:', {
      name,
      registrationNumber,
      fuelType,
      userId
    })

    // Check if vehicle with this registration already exists
    const existingVehicle = await prisma.vehicle.findFirst({
      where: { licensePlate: registrationNumber }
    })

    if (existingVehicle) {
      return res.status(400).json({ message: 'A vehicle with this registration number already exists' })
    }

    // Prepare data object, handling fuelType field properly
    const data = {
      make: name ? name.split(' ')[0] || 'Unknown' : 'Unknown',
      model: name ? name.split(' ').slice(1).join(' ') || 'Model' : 'Model',
      year: new Date().getFullYear(),
      licensePlate: registrationNumber,
      driverId: userId
    }
    
    // Only add fuelType if it exists in the schema
    if (fuelType) {
      data.fuelType = fuelType
    }

    // Create vehicle with safer approach
    const vehicle = await prisma.vehicle.create({ data })

    return res.status(201).json(vehicle)
  } catch (error) {
    console.error('Error creating vehicle:', error)
    return res.status(500).json({ 
      message: 'Error creating vehicle', 
      details: error.message,
      stack: error.stack
    })
  }
} 