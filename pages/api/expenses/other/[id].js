import { promises as fs } from 'fs';
import path from 'path';
import prisma from '../../../../lib/prisma';

export default async function handler(req, res) {
  const { method } = req;
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Expense ID is required' });
  }

  switch (method) {
    case 'GET':
      try {
        const otherExpense = await prisma.otherExpense.findUnique({
          where: { id },
          include: {
            vehicle: {
              select: {
                id: true,
                make: true,
                model: true,
                licensePlate: true
              }
            }
          }
        });

        if (!otherExpense) {
          return res.status(404).json({ error: 'Expense not found' });
        }

        return res.status(200).json(otherExpense);
      } catch (error) {
        console.error('Error fetching other expense:', error);
        return res.status(500).json({ error: 'Failed to fetch expense' });
      }

    case 'DELETE':
      try {
        // Check if the expense exists
        const existingExpense = await prisma.otherExpense.findUnique({
          where: { id }
        });

        if (!existingExpense) {
          return res.status(404).json({ error: 'Expense not found' });
        }

        // If there is a receipt image, delete the file
        if (existingExpense.receiptImageUrl) {
          try {
            const filePath = path.join(process.cwd(), 'public', existingExpense.receiptImageUrl);
            await fs.unlink(filePath);
            console.log(`Deleted file: ${filePath}`);
          } catch (fileError) {
            console.error('Error deleting file:', fileError);
            // Continue with deletion even if file removal fails
          }
        }

        // Delete the expense record
        await prisma.otherExpense.delete({
          where: { id }
        });

        return res.status(200).json({ message: 'Expense deleted successfully' });
      } catch (error) {
        console.error('Error deleting other expense:', error);
        return res.status(500).json({ error: 'Failed to delete expense' });
      }

    default:
      res.setHeader('Allow', ['GET', 'DELETE']);
      return res.status(405).end(`Method ${method} Not Allowed`);
  }
} 