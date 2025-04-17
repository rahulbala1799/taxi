import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
  const { method } = req;

  if (method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${method} Not Allowed` });
  }

  try {
    const { driverId, period = 'day' } = req.query;

    console.log('[Metrics API] Request received:', { driverId, period });

    if (!driverId) {
      console.log('[Metrics API] No driver ID provided');
      return res.status(400).json({ error: 'Driver ID is required' });
    }

    // Get date range based on the period
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const startDate = new Date(today);
    let endDate = new Date(today);
    endDate.setHours(23, 59, 59, 999);

    switch (period) {
      case 'day':
        // Already set to today
        break;
      case 'week':
        // Start of current week (Sunday)
        startDate.setDate(today.getDate() - today.getDay());
        // End of current week (Saturday)
        endDate.setDate(startDate.getDate() + 6);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'month':
        // Start of current month
        startDate.setDate(1);
        // End of current month
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'year':
        // Start of current year
        startDate.setMonth(0, 1);
        // End of current year
        endDate = new Date(today.getFullYear(), 11, 31);
        endDate.setHours(23, 59, 59, 999);
        break;
      default:
        console.log('[Metrics API] Invalid period provided:', period);
        return res.status(400).json({ error: 'Invalid period' });
    }

    console.log('[Metrics API] Date range:', { startDate, endDate });

    // Define default empty arrays for data
    let rides = [];
    let shifts = [];
    let fuelExpenses = [];
    let maintenanceExpenses = [];
    let insuranceExpenses = [];

    // IMPORTANT FIX: Get all rides within the date range
    // Remove status and endTime as they don't exist in the schema
    try {
      console.log('[Metrics API] Querying rides...');
      rides = await prisma.ride.findMany({
        where: {
          userId: driverId, // Using userId not driverId
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        include: {
          vehicle: true,
        },
      });
      console.log(`[Metrics API] Found ${rides.length} rides`);
    } catch (error) {
      console.error('[Metrics API] Error querying rides:', error);
    }

    // Get all shifts within the date range
    try {
      console.log('[Metrics API] Querying shifts...');
      shifts = await prisma.shift.findMany({
        where: {
          driverId, // This is correct as per schema
          // Remove endTime check since rides don't use it
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        include: {
          vehicle: true,
        },
      });
      console.log(`[Metrics API] Found ${shifts.length} shifts`);
    } catch (error) {
      console.error('[Metrics API] Error querying shifts:', error);
    }

    // Get all fuel expenses within the date range
    try {
      console.log('[Metrics API] Querying fuel expenses...');
      fuelExpenses = await prisma.fuelExpense.findMany({
        where: {
          driverId, // This is correct as per schema
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
      });
      console.log(`[Metrics API] Found ${fuelExpenses.length} fuel expenses`);
    } catch (error) {
      console.error('[Metrics API] Error querying fuel expenses:', error);
    }

    // Get all maintenance expenses within the date range
    try {
      console.log('[Metrics API] Querying maintenance expenses...');
      maintenanceExpenses = await prisma.maintenanceExpense.findMany({
        where: {
          driverId, // This is correct as per schema
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
      });
      console.log(`[Metrics API] Found ${maintenanceExpenses.length} maintenance expenses`);
    } catch (error) {
      console.error('[Metrics API] Error querying maintenance expenses:', error);
    }

    // Get all insurance expenses within the date range
    try {
      console.log('[Metrics API] Querying insurance expenses...');
      insuranceExpenses = await prisma.insuranceExpense.findMany({
        where: {
          driverId, // This is correct as per schema
          startDate: { // Changed from 'date' to 'startDate' to match schema
            gte: startDate,
            lte: endDate,
          },
        },
      });
      console.log(`[Metrics API] Found ${insuranceExpenses.length} insurance expenses`);
    } catch (error) {
      console.error('[Metrics API] Error querying insurance expenses:', error);
    }

    // Calculate metrics with safe operations
    const totalEarnings = rides.reduce((sum, ride) => {
      const fare = parseFloat(ride.fare || 0);
      const tips = parseFloat(ride.tips || 0);
      return sum + (isNaN(fare) ? 0 : fare) + (isNaN(tips) ? 0 : tips);
    }, 0);
    
    const totalHours = shifts.reduce((sum, shift) => {
      if (shift.startTime && shift.endTime) {
        const hours = (new Date(shift.endTime) - new Date(shift.startTime)) / (1000 * 60 * 60);
        return sum + (isNaN(hours) ? 0 : hours);
      }
      return sum;
    }, 0);
    
    const totalFuelExpenses = fuelExpenses.reduce((sum, expense) => {
      const amount = parseFloat(expense.amount || 0);
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);
    
    const totalMaintenanceExpenses = maintenanceExpenses.reduce((sum, expense) => {
      const amount = parseFloat(expense.amount || 0);
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);
    
    const totalInsuranceExpenses = insuranceExpenses.reduce((sum, expense) => {
      const amount = parseFloat(expense.amount || 0);
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);
    
    const totalExpenses = totalFuelExpenses + totalMaintenanceExpenses + totalInsuranceExpenses;
    
    const totalTips = rides.reduce((sum, ride) => {
      const tips = parseFloat(ride.tips || 0);
      return sum + (isNaN(tips) ? 0 : tips);
    }, 0);
    
    const totalFares = rides.reduce((sum, ride) => {
      const fare = parseFloat(ride.fare || 0);
      return sum + (isNaN(fare) ? 0 : fare);
    }, 0);
    
    const tipsPercentage = totalFares > 0 ? (totalTips / totalFares) * 100 : 0;
    
    const totalDistance = rides.reduce((sum, ride) => {
      const distance = parseFloat(ride.distance || 0);
      return sum + (isNaN(distance) ? 0 : distance);
    }, 0);
    
    // Group rides by shift to calculate rides per shift
    const ridesByShift = rides.reduce((acc, ride) => {
      if (ride.date) {  // Changed from startTime to date
        const shiftDate = new Date(ride.date).toDateString();
        if (!acc[shiftDate]) {
          acc[shiftDate] = [];
        }
        acc[shiftDate].push(ride);
      }
      return acc;
    }, {});
    
    const totalShifts = Object.keys(ridesByShift).length;
    const ridesPerShift = totalShifts > 0 ? rides.length / totalShifts : 0;
    
    // Calculate fuel efficiency
    let fuelEfficiency = 0;
    if (totalDistance > 0 && totalFuelExpenses > 0) {
      const totalFuel = fuelExpenses.reduce((sum, expense) => {
        const quantity = parseFloat(expense.quantity || 0);
        return sum + (isNaN(quantity) ? 0 : quantity);
      }, 0);
      fuelEfficiency = totalFuel > 0 ? totalDistance / totalFuel : 0;
    }

    // Prepare metrics response
    const metrics = {
      earnings: totalEarnings,
      rides: rides.length,
      hours: parseFloat(totalHours.toFixed(2)),
      avgPerHour: totalHours > 0 ? parseFloat((totalEarnings / totalHours).toFixed(2)) : 0,
      expenses: totalExpenses,
      fuelExpenses: totalFuelExpenses,
      maintenanceExpenses: totalMaintenanceExpenses,
      insuranceExpenses: totalInsuranceExpenses,
      profit: parseFloat((totalEarnings - totalExpenses).toFixed(2)),
      tipsPercentage: parseFloat(tipsPercentage.toFixed(2)),
      ridesPerShift: parseFloat(ridesPerShift.toFixed(2)),
      distanceTraveled: parseFloat(totalDistance.toFixed(2)),
      fuelEfficiency: parseFloat(fuelEfficiency.toFixed(2)),
      dateRange: {
        startDate,
        endDate,
      },
    };

    console.log('[Metrics API] Calculated metrics:', metrics);
    return res.status(200).json(metrics);
  } catch (error) {
    console.error('[Metrics API] Error fetching metrics:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch metrics', 
      details: error.message,
      stack: error.stack 
    });
  }
} 