const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createVehicle() {
  try {
    // Check if user exists
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { name: { equals: 'Stijoimillion', mode: 'insensitive' } },
          { email: 'stijoimillion@example.com' }
        ]
      }
    });

    if (!user) {
      console.log('Stijoimillion user not found');
      return;
    }

    console.log('Found user:', user.id);

    // Check if test vehicle already exists
    const existingVehicle = await prisma.vehicle.findFirst({
      where: {
        licensePlate: 'AB-123-CD',
        driverId: user.id
      }
    });

    if (existingVehicle) {
      console.log('Test vehicle already exists:', existingVehicle);
      return;
    }

    // Create a test vehicle
    const vehicle = await prisma.vehicle.create({
      data: {
        make: 'Tesla',
        model: 'Model 3',
        year: 2023,
        licensePlate: 'AB-123-CD',
        fuelType: 'Electric',
        driverId: user.id
      }
    });

    console.log('Vehicle created successfully:', vehicle);
  } catch (error) {
    console.error('Error creating vehicle:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function
createVehicle(); 