import jwt from 'jsonwebtoken'

// Hardcoded secret for demo purposes only
// In production, this should be set as an environment variable
const JWT_SECRET = 'stijoi-stephen-taxi-demo-secret-key-123456789'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }

    // For demo purposes, accept any credentials
    // In a real app, you would validate against a database
    const mockUser = {
      id: 'mock-user-id-123',
      email: email,
      name: 'Stephen Driver',
      role: 'DRIVER'
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: mockUser.id, email: mockUser.email, role: mockUser.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    )

    return res.status(200).json({
      token,
      user: mockUser
    })
  } catch (error) {
    console.error('Login error:', error)
    return res.status(500).json({ message: 'Internal server error', details: error.message })
  }
} 