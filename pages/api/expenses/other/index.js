import { promises as fs } from 'fs';
import path from 'path';
import prisma from '../../../../lib/prisma';

// Temporarily disable bodyParser override for debugging
// export const config = {
//   api: {
//     bodyParser: false,
//   },
// };

// Helper to parse form data including files (Temporarily unused)
// const parseForm = async (req) => { ... };

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
        // Temporarily use req.body directly (assuming JSON)
        const { 
          driverId, 
          vehicleId, 
          date, 
          amount, 
          category, 
          notes 
        } = req.body; // Use req.body instead of fields
        
        console.log("[DEBUG] Received POST data:", req.body);

        // Validate required fields
        if (!driverId || !amount || !category) { // Removed vehicleId validation temporarily
          return res.status(400).json({ 
            error: 'Missing required fields: driverId, amount, and category are required'
          });
        }
        
        // Temporarily skip vehicle check if vehicleId is optional
        // if (vehicleId) {
        //   const vehicle = await prisma.vehicle.findFirst(...);
        //   if (!vehicle) { ... }
        // }
        
        // Temporarily skip image processing
        let receiptImageUrl = null;
        
        // Parse values properly
        const parseDate = date ? new Date(date) : new Date();
        const parseAmount = parseFloat(amount);
        
        // Create the expense record
        const otherExpense = await prisma.otherExpense.create({
          data: {
            vehicleId: vehicleId || null, // Allow null vehicleId
            driverId,
            date: parseDate,
            amount: parseAmount,
            category,
            notes: notes || null,
            receiptImageUrl // Will be null for this test
          },
          include: {
            vehicle: vehicleId ? { // Only include if vehicleId exists
              select: {
                make: true,
                model: true,
                licensePlate: true
              }
            } : undefined
          }
        });
        
        console.log('Other expense created (JSON test):', otherExpense.id);
        return res.status(201).json(otherExpense);
      } catch (error) {
        console.error('Error creating other expense (JSON test):', error);
        return res.status(500).json({ 
          error: 'Failed to create other expense (JSON test)',
          details: error.message,
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
      }
      
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).end(`Method ${method} Not Allowed`);
  }
} 