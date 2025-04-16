import jwt from 'jsonwebtoken'
import { createContext, useContext, useState, useEffect } from 'react'

// Hardcoded secret for demo purposes only
// In production, this should be set as an environment variable
const JWT_SECRET = 'stijoi-stephen-taxi-demo-secret-key-123456789'

// Create Auth Context
const AuthContext = createContext(null)

// Auth Provider component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user')
    const token = localStorage.getItem('token')

    if (userData && token) {
      try {
        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)
      } catch (err) {
        console.error('Error parsing user data', err)
        // Clear invalid data
        localStorage.removeItem('user')
        localStorage.removeItem('token')
      }
    }
    
    setLoading(false)
  }, [])

  const login = (userData, token) => {
    localStorage.setItem('user', JSON.stringify(userData))
    localStorage.setItem('token', token)
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook to use auth context
export const useAuth = () => {
  return useContext(AuthContext)
}

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