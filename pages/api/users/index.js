export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      // Return mock users
      const mockUsers = [
        {
          id: 'mock-user-1',
          name: 'Stephen Driver',
          email: 'stephen@example.com',
          phone: '555-1234',
          role: 'DRIVER',
          createdAt: new Date().toISOString()
        }
      ]
      
      return res.status(200).json(mockUsers)
    } catch (error) {
      console.error('Request error', error)
      res.status(500).json({ error: 'Error fetching users', details: error.message })
    }
  } else if (req.method === 'POST') {
    try {
      const { name, email, password, phone, role } = req.body
      
      // Return a mock response
      const mockUser = {
        id: 'new-user-' + Date.now(),
        name,
        email,
        phone,
        role: role || 'DRIVER',
        createdAt: new Date().toISOString()
      }
      
      return res.status(201).json(mockUser)
    } catch (error) {
      console.error('Request error', error)
      res.status(500).json({ error: 'Error creating user', details: error.message })
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
} 