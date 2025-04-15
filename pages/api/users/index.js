import prisma from '../../../lib/prisma'
import bcrypt from 'bcryptjs'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      // Get users from database
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
      
      // Validate required fields
      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' })
      }

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      })

      if (existingUser) {
        return res.status(400).json({ message: 'User already exists with this email' })
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10)

      // Create user in database
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          phone,
          role: role || 'DRIVER',
          totalEarnings: 0, // Initialize earnings to 0
          goalAmount: 0 // Initialize goal to 0
        },
      })
      
      return res.status(201).json({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt
      })
    } catch (error) {
      console.error('Request error', error)
      res.status(500).json({ error: 'Error creating user', details: error.message })
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
} 