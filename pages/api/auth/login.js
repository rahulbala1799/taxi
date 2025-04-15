import prisma from '../../../lib/prisma'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }

    // Find the user
    const user = await prisma.user.findUnique({ where: { email } })
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    // In a real application, you would hash passwords during registration
    // and compare hashed passwords here
    // For now, we're comparing plain text passwords
    const passwordIsValid = await bcrypt.compare(password, user.password)
    
    if (!passwordIsValid) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    )

    return res.status(200).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    return res.status(500).json({ message: 'Internal server error', details: error.message })
  }
} 