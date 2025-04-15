// Mock Prisma client for now
// This will be replaced with a real Prisma client when the database is set up

const mockPrismaClient = {
  user: {
    findUnique: async () => null,
    findMany: async () => [],
    create: async (data) => ({ id: 'mock-id', ...data.data }),
  },
  ride: {
    findMany: async () => [],
    create: async (data) => ({ id: 'mock-id', ...data.data }),
  },
};

let prisma = mockPrismaClient;

export default prisma; 