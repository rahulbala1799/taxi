import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
  const { method } = req;

  if (method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${method} Not Allowed` });
  }

  try {
    const { driverId, period = 'day' } = req.query;

    if (!driverId) {
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
        return res.status(400).json({ error: 'Invalid period' });
    }

    // Get all completed rides within the date range
    const rides = await prisma.ride.findMany({
      where: {
        driverId,
        status: 'COMPLETED',
        endTime: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        vehicle: true,
      },
    });

    // Get all shifts within the date range
    const shifts = await prisma.shift.findMany({
      where: {
        driverId,
        endTime: {
          not: null,
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        vehicle: true,
      },
    });

    // Get all fuel expenses within the date range
    const fuelExpenses = await prisma.fuelExpense.findMany({
      where: {
        driverId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    // Get all maintenance expenses within the date range
    const maintenanceExpenses = await prisma.maintenanceExpense.findMany({
      where: {
        driverId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    // Get all insurance expenses within the date range
    const insuranceExpenses = await prisma.insuranceExpense.findMany({
      where: {
        driverId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    // Calculate metrics
    const totalEarnings = rides.reduce((sum, ride) => sum + (parseFloat(ride.fare) + parseFloat(ride.tips || 0)), 0);
    const totalHours = shifts.reduce((sum, shift) => {
      if (shift.startTime && shift.endTime) {
        const hours = (new Date(shift.endTime) - new Date(shift.startTime)) / (1000 * 60 * 60);
        return sum + hours;
      }
      return sum;
    }, 0);
    
    const totalFuelExpenses = fuelExpenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
    const totalMaintenanceExpenses = maintenanceExpenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
    const totalInsuranceExpenses = insuranceExpenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
    const totalExpenses = totalFuelExpenses + totalMaintenanceExpenses + totalInsuranceExpenses;
    
    const totalTips = rides.reduce((sum, ride) => sum + parseFloat(ride.tips || 0), 0);
    const totalFares = rides.reduce((sum, ride) => sum + parseFloat(ride.fare), 0);
    const tipsPercentage = totalFares > 0 ? (totalTips / totalFares) * 100 : 0;
    
    const totalDistance = rides.reduce((sum, ride) => sum + parseFloat(ride.distance || 0), 0);
    
    // Group rides by shift to calculate rides per shift
    const ridesByShift = rides.reduce((acc, ride) => {
      const shiftDate = new Date(ride.startTime).toDateString();
      if (!acc[shiftDate]) {
        acc[shiftDate] = [];
      }
      acc[shiftDate].push(ride);
      return acc;
    }, {});
    
    const totalShifts = Object.keys(ridesByShift).length;
    const ridesPerShift = totalShifts > 0 ? rides.length / totalShifts : 0;
    
    // Calculate fuel efficiency
    let fuelEfficiency = 0;
    if (totalDistance > 0 && totalFuelExpenses > 0) {
      const totalFuel = fuelExpenses.reduce((sum, expense) => sum + parseFloat(expense.quantity || 0), 0);
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

    return res.status(200).json(metrics);
  } catch (error) {
    console.error('Error fetching metrics:', error);
    return res.status(500).json({ error: 'Failed to fetch metrics', details: error.message });
  }
} 