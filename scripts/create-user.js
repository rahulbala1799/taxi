// Script to create a user with specified credentials
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createUser() {
  try {
    // Create hashed password
    const hashedPassword = await bcrypt.hash('ADHD2025', 10);
    
    // Create the user
    const user = await prisma.user.create({
      data: {
        name: 'Stijoimillion',
        email: 'stijoimillion@example.com', // Email is required by schema
        password: hashedPassword,
        role: 'DRIVER'
      },
    });
    
    console.log('User created successfully:');
    console.log({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    });
    
  } catch (error) {
    console.error('Error creating user:', error);
  } finally {
    // Disconnect from the database
    await prisma.$disconnect();
  }
}

// Run the function
createUser(); 