import prisma from '../../../lib/prisma'

export default async function handler(req, res) {
  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { registrationNumber, userId } = req.body

    // Basic validation
    if (!registrationNumber) {
      return res.status(400).json({ 
        message: 'Registration number is required',
        received: { registrationNumber, userId }
      })
    }

    let driverId = userId
    
    // If no user ID was provided or it's invalid, try to find a valid user
    if (!driverId || driverId === 'test-driver-id') {
      try {
        // First try to find the Stijoimillion user
        const stijoi = await prisma.user.findFirst({
          where: { name: { equals: 'Stijoimillion', mode: 'insensitive' } },
          select: { id: true }
        })
        
        if (stijoi) {
          driverId = stijoi.id
          console.log(`Using Stijoimillion user ID: ${driverId}`)
        } else {
          // Fallback to any user in the database
          const anyUser = await prisma.user.findFirst({
            select: { id: true }
          })
          
          if (anyUser) {
            driverId = anyUser.id
            console.log(`Using fallback user ID: ${driverId}`)
          } else {
            return res.status(400).json({
              message: 'No valid user found in the database. Cannot create vehicle.',
            })
          }
        }
      } catch (userErr) {
        return res.status(500).json({
          message: 'Error finding a valid user',
          error: userErr.message
        })
      }
    }

    // Create with minimal fields
    const vehicle = await prisma.vehicle.create({
      data: {
        make: "Unknown",
        model: "Model",
        year: 2023,
        licensePlate: registrationNumber,
        driverId
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