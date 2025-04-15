import prisma from '../../../lib/prisma'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          createdAt: true
        }
      })
      
      return res.status(200).json(users)
    } catch (error) {
      console.error('Request error', error)
      res.status(500).json({ error: 'Error fetching users', details: error.message })
    }
  } else if (req.method === 'POST') {
    try {
      const { name, email, password, phone, role } = req.body
      
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password, // In a real app, you should hash this password
          phone,
          role: role || 'USER'
        }
      })
      
      return res.status(201).json(user)
    } catch (error) {
      console.error('Request error', error)
      res.status(500).json({ error: 'Error creating user', details: error.message })
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
} 