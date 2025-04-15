import jwt from 'jsonwebtoken'

// Hardcoded secret for demo purposes only
// In production, this should be set as an environment variable
const JWT_SECRET = 'stijoi-stephen-taxi-demo-secret-key-123456789'

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' })
    }

    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, JWT_SECRET)
    
    // For demo, we'll just use the decoded user info without database validation
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role
    }
    
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