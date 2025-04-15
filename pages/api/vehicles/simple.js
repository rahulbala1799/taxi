import prisma from '../../../lib/prisma'

export default async function handler(req, res) {
  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { registrationNumber, userId } = req.body

    // Basic validation
    if (!registrationNumber || !userId) {
      return res.status(400).json({ 
        message: 'Registration number and user ID are required',
        received: { registrationNumber, userId }
      })
    }

    // Create with minimal fields
    const vehicle = await prisma.vehicle.create({
      data: {
        make: "Unknown",
        model: "Model",
        year: 2023,
        licensePlate: registrationNumber,
        driverId: userId
      }
    })

    return res.status(201).json({
      success: true,
      vehicle
    })
  } catch (error) {
    console.error('Simple vehicle creation error:', error)
    
    return res.status(500).json({
      success: false,
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