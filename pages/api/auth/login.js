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

    console.log(`[LOGIN] Login attempt for: ${email}`)

    // Special case for Stijoimillion
    if (email === 'Stijoimillion' || email === 'stijoimillion' || email === 'stijoimillion@example.com') {
      console.log('[LOGIN] Stijoimillion login detected - searching for user')
      
      // Try to find by name or email
      let stijoiUser = await prisma.user.findFirst({
        where: {
          OR: [
            { name: { equals: 'Stijoimillion', mode: 'insensitive' } },
            { email: 'stijoimillion@example.com' }
          ]
        }
      })
      
      if (stijoiUser) {
        console.log(`[LOGIN] Found Stijoi user: ${stijoiUser.name} (${stijoiUser.id})`)
        
        // Direct password comparison for Stijoi user
        const isValidStijoi = password === 'ADHD2025' || await bcrypt.compare(password, stijoiUser.password)
        
        if (isValidStijoi) {
          console.log('[LOGIN] Stijoi password verified, generating token')
          
          // Special success case for Stijoi
          const token = jwt.sign(
            { userId: stijoiUser.id, email: stijoiUser.email, role: stijoiUser.role },
            JWT_SECRET,
            { expiresIn: '24h' }
          )
          
          return res.status(200).json({
            token,
            user: {
              id: stijoiUser.id,
              name: stijoiUser.name,
              email: stijoiUser.email,
              role: stijoiUser.role
            }
          })
        } else {
          console.log('[LOGIN] Stijoi password verification failed')
          return res.status(401).json({ message: 'Invalid password for Stijoimillion account' })
        }
      } else {
        console.log('[LOGIN] Stijoi user not found in database, creating new user')
        
        // Create the Stijoi user if it doesn't exist
        const hashedPassword = await bcrypt.hash('ADHD2025', 10)
        const newStijoiUser = await prisma.user.create({
          data: {
            name: 'Stijoimillion',
            email: 'stijoimillion@example.com',
            password: hashedPassword,
            role: 'DRIVER'
          }
        })
        
        console.log(`[LOGIN] Created new Stijoi user: ${newStijoiUser.id}`)
        
        const token = jwt.sign(
          { userId: newStijoiUser.id, email: newStijoiUser.email, role: newStijoiUser.role },
          JWT_SECRET,
          { expiresIn: '24h' }
        )
        
        return res.status(200).json({
          token,
          user: {
            id: newStijoiUser.id,
            name: newStijoiUser.name,
            email: newStijoiUser.email,
            role: newStijoiUser.role
          }
        })
      }
    }

    // Normal flow for other users: Find user in database by email
    let user = await prisma.user.findUnique({
      where: { email }
    })

    // If user not found by email, try to find by name (username) case insensitive
    if (!user) {
      console.log(`[LOGIN] User not found by email, trying by name: ${email}`)
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
        console.log(`[LOGIN] Found user by name: ${user.name} (${user.id})`)
      } else {
        console.log(`[LOGIN] No user found by name: ${email}`)
      }
    } else {
      console.log(`[LOGIN] Found user by email: ${user.email} (${user.id})`)
    }

    // For demo purposes, if no user is found, auto-create one for Stijoi
    if (!user) {
      if (email === 'stijoi@example.com') {
        console.log('[LOGIN] Creating demo user for stijoi@example.com')
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
      console.log(`[LOGIN] Verifying password for user: ${user.name}`)
      passwordIsValid = await bcrypt.compare(password, user.password)
    } catch (error) {
      console.error('[LOGIN] Password comparison error:', error)
      // In case the password is not hashed (for testing)
      passwordIsValid = password === user.password
      console.log(`[LOGIN] Fallback plain text password check: ${passwordIsValid}`)
    }

    if (!passwordIsValid) {
      console.log(`[LOGIN] Password validation failed for user: ${user.name}`)
      return res.status(401).json({ message: 'Invalid credentials - Password incorrect' })
    }

    console.log(`[LOGIN] Login successful for user: ${user.name}`)
    
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
    console.error('[LOGIN] Login error:', error)
    return res.status(500).json({ message: 'Internal server error', details: error.message })
  }
} 