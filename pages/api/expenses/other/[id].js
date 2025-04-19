import { promises as fs } from 'fs';
import path from 'path';
import { IncomingForm } from 'formidable';
import prisma from '../../../../lib/prisma';

// Configure formidable for API route
export const config = {
  api: {
    bodyParser: false,
  },
};

// Helper to parse form data including files
const parseForm = async (req) => {
  return new Promise((resolve, reject) => {
    const form = new IncomingForm({
      uploadDir: path.join(process.cwd(), 'public/uploads'),
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB max file size
    });

    // Ensure upload directory exists
    try {
      fs.mkdir(path.join(process.cwd(), 'public/uploads'), { recursive: true });
    } catch (error) {
      console.error('Error creating upload directory:', error);
      // Don't fail if directory already exists
    }

    form.parse(req, (err, fields, files) => {
      if (err) return reject(err);
      resolve({ fields, files });
    });
  });
};

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

    case 'PUT':
      try {
        // Parse the multipart form data
        const { fields, files } = await parseForm(req);

        // Check if the expense exists
        const existingExpense = await prisma.otherExpense.findUnique({
          where: { id }
        });

        if (!existingExpense) {
          return res.status(404).json({ error: 'Expense not found' });
        }

        const updateData = {};
        let newReceiptImageUrl = existingExpense.receiptImageUrl; // Keep old image by default

        // Process receipt image if provided
        if (files.receiptImage) {
          const file = files.receiptImage;
          // Generate a relative URL for the uploaded file
          newReceiptImageUrl = `/uploads/${path.basename(file.filepath)}`;
          updateData.receiptImageUrl = newReceiptImageUrl;

          // Delete the old image file if it exists and is different
          if (existingExpense.receiptImageUrl && existingExpense.receiptImageUrl !== newReceiptImageUrl) {
            try {
              const oldFilePath = path.join(process.cwd(), 'public', existingExpense.receiptImageUrl);
              await fs.unlink(oldFilePath);
              console.log(`Deleted old file: ${oldFilePath}`);
            } catch (fileError) {
              console.error('Error deleting old file:', fileError);
            }
          }
        }
        // Allow updating other fields if sent (optional)
        if (fields.date) updateData.date = new Date(fields.date);
        if (fields.amount) updateData.amount = parseFloat(fields.amount);
        if (fields.category) updateData.category = fields.category;
        if (fields.notes) updateData.notes = fields.notes;
        if (fields.vehicleId) updateData.vehicleId = fields.vehicleId;

        // Update the expense record
        const updatedExpense = await prisma.otherExpense.update({
          where: { id },
          data: updateData,
           include: {
            vehicle: {
              select: {
                make: true,
                model: true,
                licensePlate: true
              }
            }
          }
        });

        console.log('Other expense updated:', updatedExpense.id);
        return res.status(200).json(updatedExpense);
      } catch (error) {
        console.error('Error updating other expense:', error);
        return res.status(500).json({ 
          error: 'Failed to update other expense',
          details: error.message,
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
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
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      return res.status(405).end(`Method ${method} Not Allowed`);
  }
} 