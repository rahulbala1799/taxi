import jwt from 'jsonwebtoken'
import prisma from './prisma'

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' })
    }

    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key')
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, role: true }
    })

    if (!user) {
      return res.status(401).json({ message: 'User not found' })
    }

    req.user = user
    return next()
  } catch (error) {
    console.error('Authentication error:', error)
    return res.status(401).json({ message: 'Invalid token' })
  }
}

export const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' })
    }

    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Not authorized for this action' })
    }

    return next()
  }
} 