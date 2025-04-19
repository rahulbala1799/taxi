import { IncomingForm } from 'formidable';
import { promises as fs } from 'fs';
import path from 'path';
import prisma from '../../../../lib/prisma';

// Configure formidable to parse form data
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
    }

    form.parse(req, (err, fields, files) => {
      if (err) return reject(err);
      resolve({ fields, files });
    });
  });
};

export default async function handler(req, res) {
  const { method } = req;

  switch (method) {
    case 'GET':
      try {
        const { driverId, vehicleId, startDate, endDate } = req.query;
        
        // Build where clause based on query parameters
        const whereClause = {};
        
        if (driverId) {
          whereClause.driverId = driverId;
        }
        
        if (vehicleId) {
          whereClause.vehicleId = vehicleId;
        }
        
        // Add date range filtering if provided
        if (startDate || endDate) {
          whereClause.date = {};
          
          if (startDate) {
            whereClause.date.gte = new Date(startDate);
          }
          
          if (endDate) {
            whereClause.date.lte = new Date(endDate);
          }
        }
        
        const otherExpenses = await prisma.otherExpense.findMany({
          where: whereClause,
          include: {
            vehicle: {
              select: {
                make: true,
                model: true,
                licensePlate: true
              }
            }
          },
          orderBy: {
            date: 'desc'
          }
        });
        
        return res.status(200).json(otherExpenses);
      } catch (error) {
        console.error('Error fetching other expenses:', error);
        return res.status(500).json({ error: 'Failed to fetch other expenses' });
      }
      
    case 'POST':
      try {
        // Parse the multipart form data
        const { fields, files } = await parseForm(req);
        
        const { 
          driverId, 
          vehicleId, 
          date, 
          amount, 
          category, 
          notes 
        } = fields;
        
        // Validate required fields
        if (!vehicleId || !driverId || !amount || !category) {
          return res.status(400).json({ 
            error: 'Missing required fields: vehicleId, driverId, amount, and category are required'
          });
        }
        
        // Check if vehicle exists and belongs to driver
        const vehicle = await prisma.vehicle.findFirst({
          where: {
            id: vehicleId,
            driverId: driverId
          }
        });
        
        if (!vehicle) {
          return res.status(400).json({ error: 'Vehicle does not belong to this driver' });
        }
        
        // Process receipt image if provided
        let receiptImageUrl = null;
        if (files.receiptImage) {
          const file = files.receiptImage;
          // Generate a relative URL for the uploaded file
          receiptImageUrl = `/uploads/${path.basename(file.filepath)}`;
        }
        
        // Parse values properly
        const parseDate = date ? new Date(date) : new Date();
        const parseAmount = parseFloat(amount);
        
        // Create the expense record
        const otherExpense = await prisma.otherExpense.create({
          data: {
            vehicleId,
            driverId,
            date: parseDate,
            amount: parseAmount,
            category,
            notes: notes || null,
            receiptImageUrl
          },
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
        
        console.log('Other expense created:', otherExpense.id);
        return res.status(201).json(otherExpense);
      } catch (error) {
        console.error('Error creating other expense:', error);
        return res.status(500).json({ 
          error: 'Failed to create other expense',
          details: error.message,
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
      }
      
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).end(`Method ${method} Not Allowed`);
  }
} 