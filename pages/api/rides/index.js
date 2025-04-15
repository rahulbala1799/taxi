import prisma from '../../../lib/prisma'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const rides = await prisma.ride.findMany({
        include: {
          passenger: {
            select: {
              id: true, 
              name: true,
              email: true,
              phone: true
            }
          },
          driver: {
            select: {
              id: true, 
              name: true,
              email: true,
              phone: true
            }
          }
        }
      })
      
      return res.status(200).json(rides)
    } catch (error) {
      console.error('Request error', error)
      res.status(500).json({ error: 'Error fetching rides', details: error.message })
    }
  } else if (req.method === 'POST') {
    try {
      const { pickupLocation, dropoffLocation, pickupTime, passengerId, fare } = req.body
      
      const ride = await prisma.ride.create({
        data: {
          pickupLocation,
          dropoffLocation,
          pickupTime: new Date(pickupTime),
          fare: fare ? parseFloat(fare) : null,
          passenger: {
            connect: { id: passengerId }
          }
        }
      })
      
      return res.status(201).json(ride)
    } catch (error) {
      console.error('Request error', error)
      res.status(500).json({ error: 'Error creating ride', details: error.message })
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
} 