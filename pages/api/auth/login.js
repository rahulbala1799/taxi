import jwt from 'jsonwebtoken'
import prisma from '../../../lib/prisma'
import bcrypt from 'bcryptjs'

// Hardcoded secret for demo purposes only
// In production, this should be set as an environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'stijoi-stephen-taxi-demo-secret-key-123456789'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }

    // Find user in database
    const user = await prisma.user.findUnique({
      where: { email }
    })

    // For demo purposes, if no user is found, auto-create one for Stijoi
    if (!user) {
      if (email === 'stijoi@example.com') {
        // Create a demo user for Stijoi
        const hashedPassword = await bcrypt.hash(password, 10)
        const newUser = await prisma.user.create({
          data: {
            email,
            name: 'Stijoi Stephen',
            password: hashedPassword,
            role: 'DRIVER'
          }
        })

        const token = jwt.sign(
          { userId: newUser.id, email: newUser.email, role: newUser.role },
          JWT_SECRET,
          { expiresIn: '24h' }
        )

        return res.status(200).json({
          token,
          user: {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role
          }
        })
      } else {
        return res.status(401).json({ message: 'Invalid credentials' })
      }
    }

    // Verify password
    let passwordIsValid
    try {
      passwordIsValid = await bcrypt.compare(password, user.password)
    } catch (error) {
      // In case the password is not hashed (for testing)
      passwordIsValid = password === user.password
    }

    if (!passwordIsValid) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
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