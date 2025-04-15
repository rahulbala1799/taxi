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
      return res.status(400).json({ message: 'Username/Email and password are required' })
    }

    console.log(`Login attempt for: ${email}`)

    // First try: Find user in database by email
    let user = await prisma.user.findUnique({
      where: { email }
    })

    // Second try: If user not found by email, try to find by name (username) case insensitive
    if (!user) {
      console.log(`User not found by email, trying by name: ${email}`)
      // Using a more flexible search for name to accommodate case sensitivity issues
      const usersByName = await prisma.user.findMany({
        where: {
          name: {
            mode: 'insensitive',
            equals: email
          }
        }
      })
      
      if (usersByName.length > 0) {
        user = usersByName[0] // Use the first user if multiple users have the same name
        console.log(`Found user by name: ${user.name} (${user.id})`)
      } else {
        console.log(`No user found by name: ${email}`)
      }
    } else {
      console.log(`Found user by email: ${user.email} (${user.id})`)
    }

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
        return res.status(401).json({ message: 'Invalid credentials - User not found' })
      }
    }

    // Verify password
    let passwordIsValid
    try {
      console.log(`Verifying password for user: ${user.name}`)
      passwordIsValid = await bcrypt.compare(password, user.password)
    } catch (error) {
      console.error('Password comparison error:', error)
      // In case the password is not hashed (for testing)
      passwordIsValid = password === user.password
      console.log(`Fallback plain text password check: ${passwordIsValid}`)
    }

    if (!passwordIsValid) {
      console.log(`Password validation failed for user: ${user.name}`)
      return res.status(401).json({ message: 'Invalid credentials - Password incorrect' })
    }

    console.log(`Login successful for user: ${user.name}`)
    
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