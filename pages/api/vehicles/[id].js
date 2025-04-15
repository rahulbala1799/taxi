import prisma from '../../../lib/prisma'

export default async function handler(req, res) {
  const { id } = req.query

  if (!id) {
    return res.status(400).json({ message: 'Vehicle ID is required' })
  }

  switch (req.method) {
    case 'DELETE':
      return deleteVehicle(req, res, id)
    default:
      return res.status(405).json({ message: 'Method not allowed' })
  }
}

// Delete a vehicle by ID
async function deleteVehicle(req, res, id) {
  try {
    // Check if vehicle exists
    const vehicle = await prisma.vehicle.findUnique({
      where: { id }
    })

    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' })
    }

    // Delete the vehicle
    await prisma.vehicle.delete({
      where: { id }
    })

    return res.status(200).json({ message: 'Vehicle deleted successfully' })
  } catch (error) {
    console.error('Error deleting vehicle:', error)
    return res.status(500).json({ message: 'Error deleting vehicle', details: error.message })
  }
} 