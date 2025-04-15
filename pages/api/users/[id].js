import prisma from '../../../lib/prisma'

export default async function handler(req, res) {
  const { id } = req.query

  if (!id) {
    return res.status(400).json({ message: 'User ID is required' })
  }

  try {
    if (req.method === 'GET') {
      // Get user from database
      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          totalEarnings: true,
          goalAmount: true
        }
      })

      if (!user) {
        return res.status(404).json({ message: 'User not found' })
      }

      return res.status(200).json(user)
    } else if (req.method === 'PUT' || req.method === 'PATCH') {
      const updateData = { ...req.body }
      
      // Remove any properties that shouldn't be updated directly
      delete updateData.id
      delete updateData.createdAt
      delete updateData.email // Prevent email changes in this endpoint

      // Update user in database
      const updatedUser = await prisma.user.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          totalEarnings: true,
          goalAmount: true
        }
      })

      return res.status(200).json(updatedUser)
    } else if (req.method === 'DELETE') {
      // Delete user from database
      await prisma.user.delete({
        where: { id }
      })

      return res.status(200).json({ message: 'User deleted successfully' })
    } else {
      res.setHeader('Allow', ['GET', 'PUT', 'PATCH', 'DELETE'])
      return res.status(405).end(`Method ${req.method} Not Allowed`)
    }
  } catch (error) {
    console.error('Request error', error)
    return res.status(500).json({ error: 'Error processing request', details: error.message })
  }
} 