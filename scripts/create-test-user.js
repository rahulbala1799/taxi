const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    // Create hashed password
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    // Check if test user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'test@example.com' },
    });

    if (existingUser) {
      console.log('Test user already exists:');
      console.log({
        id: existingUser.id,
        name: existingUser.name,
        email: existingUser.email,
        role: existingUser.role
      });
      return;
    }
    
    // Create the test user
    const user = await prisma.user.create({
      data: {
        name: 'Test User',
        email: 'test@example.com',
        password: hashedPassword,
        role: 'DRIVER',
        totalEarnings: 0,
        goalAmount: 1000000
      },
    });
    
    console.log('Test user created successfully:');
    console.log({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    });
    console.log('\nYou can now log in with:');
    console.log('Email: test@example.com');
    console.log('Password: password123');
    
  } catch (error) {
    console.error('Error creating test user:', error);
  } finally {
    // Disconnect from the database
    await prisma.$disconnect();
  }
}

// Run the function
createTestUser(); 