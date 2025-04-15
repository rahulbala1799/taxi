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

    // Mock registration - in a real app, this would save to the database
    const mockUser = {
      id: 'new-user-' + Date.now(),
      name,
      email,
      role: role || 'DRIVER'
    }

    // Return user without password
    return res.status(201).json(mockUser)
  } catch (error) {
    console.error('Registration error:', error)
    return res.status(500).json({ message: 'Internal server error', details: error.message })
  }
} 