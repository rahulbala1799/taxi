import prisma from '../../../lib/prisma'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      // Return mock rides
      const mockRides = []
      
      return res.status(200).json(mockRides)
    } catch (error) {
      console.error('Request error', error)
      res.status(500).json({ error: 'Error fetching rides', details: error.message })
    }
  } else if (req.method === 'POST') {
    try {
      const { pickupLocation, dropoffLocation, pickupTime, userId, fare, distance, duration } = req.body
      
      // Return a mock response
      const mockRide = {
        id: 'ride-' + Date.now(),
        pickupLocation,
        dropoffLocation,
        date: new Date().toISOString(),
        distance: distance || 0,
        duration: duration || 0,
        fare: fare ? parseFloat(fare) : 0,
        tips: 0,
        totalEarned: fare ? parseFloat(fare) : 0,
        vehicleType: 'Tesla',
        userId: userId || 'mock-user-id',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      return res.status(201).json(mockRide)
    } catch (error) {
      console.error('Request error', error)
      res.status(500).json({ error: 'Error creating ride', details: error.message })
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
} 