import prisma from '../../../lib/prisma'
import bcrypt from 'bcryptjs'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

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

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        role: role || 'USER'
      },
    })

    // Return user without password
    return res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    })
  } catch (error) {
    console.error('Registration error:', error)
    return res.status(500).json({ message: 'Internal server error', details: error.message })
  }
} 