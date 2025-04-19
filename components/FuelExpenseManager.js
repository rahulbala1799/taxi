import React, { useState, useEffect } from 'react'
import { useAuth } from '../lib/auth'
import Link from 'next/link'

// Helper functions
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2
  }).format(amount)
}

const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'short', day: 'numeric' }
  return new Date(dateString).toLocaleDateString('en-IE', options)
}

export default function FuelExpenseManager({ vehicles }) {
  const { user } = useAuth()
  const [fuelExpenses, setFuelExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [selectedVehicleId, setSelectedVehicleId] = useState('')
  const [selectedVehicle, setSelectedVehicle] = useState(null)
  const [selectedPeriod, setSelectedPeriod] = useState('all-time')
  
  // Form state
  const [expenseForm, setExpenseForm] = useState({
    vehicleId: '',
    date: new Date().toISOString().slice(0, 10),
    amount: '',
    quantity: '',
    fuelType: 'Petrol',
    odometerReading: '',
    fullTank: true,
    notes: ''
  })
  
  useEffect(() => {
    if (user) {
      fetchFuelExpenses()
    }
  }, [user, selectedPeriod])
  
  useEffect(() => {
    if (vehicles.length > 0 && !selectedVehicleId) {
      setSelectedVehicleId(vehicles[0].id)
      setSelectedVehicle(vehicles[0])
      setExpenseForm(prev => ({
        ...prev,
        vehicleId: vehicles[0].id,
        fuelType: vehicles[0].fuelType || 'Petrol'
      }))
    }
  }, [vehicles])
  
  useEffect(() => {
    if (selectedVehicleId && showAddForm) {
      const vehicle = vehicles.find(v => v.id === selectedVehicleId)
      setSelectedVehicle(vehicle)
      setExpenseForm(prev => ({
        ...prev,
        vehicleId: selectedVehicleId,
        fuelType: vehicle?.fuelType || 'Petrol'
      }))
    }
  }, [selectedVehicleId, showAddForm, vehicles])
  
  const fetchFuelExpenses = async () => {
    setLoading(true)
    try {
      let url = `/api/expenses/fuel?driverId=${user.id}`;
      
      // Add vehicle ID filter if selected
      if (selectedVehicleId) {
        url += `&vehicleId=${selectedVehicleId}`;
      }
      
      // Add date range based on selected period
      if (selectedPeriod !== 'all-time') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const startDate = new Date(today);
        const endDate = new Date(today);
        endDate.setHours(23, 59, 59, 999);
        
        switch (selectedPeriod) {
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
            endDate.setMonth(today.getMonth() + 1, 0);
            endDate.setHours(23, 59, 59, 999);
            break;
          case 'year':
            // Start of current year
            startDate.setMonth(0, 1);
            // End of current year
            endDate.setFullYear(today.getFullYear(), 11, 31);
            endDate.setHours(23, 59, 59, 999);
            break;
          default:
            break;
        }
        
        url += `&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`;
      }
      
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error('Failed to fetch fuel expenses')
      }
      
      const data = await response.json()
      setFuelExpenses(data)
    } catch (err) {
      console.error('Error fetching fuel expenses:', err)
      setError('Failed to load fuel expenses. Please try again.')
    } finally {
      setLoading(false)
    }
  }
  
  const handleExpenseChange = (e) => {
    const { name, value, type, checked } = e.target
    setExpenseForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }
  
  const handleVehicleChange = (e) => {
    setSelectedVehicleId(e.target.value)
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)
    
    if (!expenseForm.vehicleId) {
      setError('Please select a vehicle')
      setIsSubmitting(false)
      return
    }
    
    if (!expenseForm.amount || isNaN(parseFloat(expenseForm.amount))) {
      setError('Please enter a valid amount')
      setIsSubmitting(false)
      return
    }
    
    try {
      const response = await fetch('/api/expenses/fuel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...expenseForm,
          driverId: user.id
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to add expense')
      }
      
      const newExpense = await response.json()
      
      setFuelExpenses(prev => [newExpense, ...prev])
      
      setExpenseForm({
        vehicleId: selectedVehicleId,
        date: new Date().toISOString().slice(0, 10),
        amount: '',
        quantity: '',
        fuelType: vehicles.find(v => v.id === selectedVehicleId)?.fuelType || 'Petrol',
        odometerReading: '',
        fullTank: true,
        notes: ''
      })
      
      setShowAddForm(false)
    } catch (err) {
      console.error('Error adding fuel expense:', err)
      setError(err.message || 'Failed to add expense. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const handleDeleteExpense = async (id) => {
    if (!confirm('Are you sure you want to delete this expense?')) {
      return
    }
    
    try {
      const response = await fetch(`/api/expenses/fuel/${id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete expense')
      }
      
      setFuelExpenses(prev => prev.filter(expense => expense.id !== id))
    } catch (err) {
      console.error('Error deleting fuel expense:', err)
      setError('Failed to delete expense. Please try again.')
    }
  }
  
  return (
    <div className="bg-white rounded-xl shadow-lg mb-6 overflow-hidden">
      <div className="flex justify-between items-center p-5 bg-gradient-to-r from-red-600 to-red-700">
        <h2 className="text-xl font-bold text-white">Fuel Expenses</h2>
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-white text-red-600 py-2 px-4 rounded-full font-medium text-sm shadow-md hover:bg-gray-50 transition-all"
            aria-label="Add Expense"
          >
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add Expense
            </div>
          </button>
        )}
      </div>
      
      {/* Filters Row */}
      <div className="p-5 bg-gray-50">
        {/* Vehicle Selector */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Vehicle</label>
          <select
            value={selectedVehicleId}
            onChange={handleVehicleChange}
            className="p-3 border border-gray-300 rounded-xl focus:ring-red-500 focus:border-red-500 w-full bg-white shadow-sm text-base"
          >
            <option value="">All Vehicles</option>
            {vehicles.map(vehicle => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.make} {vehicle.model} ({vehicle.licensePlate})
              </option>
            ))}
          </select>
        </div>
        
        {/* Period Selector */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Time Period</h3>
          <div className="flex overflow-x-auto py-1 space-x-2 -mx-1">
            <button 
              className={`${selectedPeriod === 'day' ? 'bg-red-600 text-white' : 'bg-white text-gray-700'} py-2 px-4 rounded-full text-sm font-medium shadow-sm flex-shrink-0 transition-all`}
              onClick={() => setSelectedPeriod('day')}
            >
              Today
            </button>
            <button 
              className={`${selectedPeriod === 'week' ? 'bg-red-600 text-white' : 'bg-white text-gray-700'} py-2 px-4 rounded-full text-sm font-medium shadow-sm flex-shrink-0 transition-all`}
              onClick={() => setSelectedPeriod('week')}
            >
              This Week
            </button>
            <button 
              className={`${selectedPeriod === 'month' ? 'bg-red-600 text-white' : 'bg-white text-gray-700'} py-2 px-4 rounded-full text-sm font-medium shadow-sm flex-shrink-0 transition-all`}
              onClick={() => setSelectedPeriod('month')}
            >
              This Month
            </button>
            <button 
              className={`${selectedPeriod === 'year' ? 'bg-red-600 text-white' : 'bg-white text-gray-700'} py-2 px-4 rounded-full text-sm font-medium shadow-sm flex-shrink-0 transition-all`}
              onClick={() => setSelectedPeriod('year')}
            >
              This Year
            </button>
            <button 
              className={`${selectedPeriod === 'all-time' ? 'bg-red-600 text-white' : 'bg-white text-gray-700'} py-2 px-4 rounded-full text-sm font-medium shadow-sm flex-shrink-0 transition-all`}
              onClick={() => setSelectedPeriod('all-time')}
            >
              All Time
            </button>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 px-5 py-3 text-red-700 mx-4 my-3 rounded-xl border border-red-100">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        </div>
      )}
      
      <div className="p-4 sm:p-5">
        {/* Add Form */}
        {showAddForm && (
          <div className="bg-white p-4 sm:p-5 rounded-xl mb-6 border border-gray-200 shadow-md">
            <h3 className="text-lg font-bold mb-5 text-center text-gray-800">Add Fuel Expense</h3>
            
            <div className="mb-5">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="vehicle">Vehicle</label>
              <select
                id="vehicle"
                className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 text-base shadow-sm"
                value={selectedVehicleId}
                onChange={(e) => setSelectedVehicleId(e.target.value)}
              >
                <option value="">-- Select Vehicle --</option>
                {vehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.model} ({vehicle.licensePlate})
                  </option>
                ))}
              </select>
            </div>
            
            {selectedVehicleId && (
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="date">Date</label>
                    <input
                      type="date"
                      id="date"
                      name="date"
                      value={expenseForm.date}
                      onChange={handleExpenseChange}
                      className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 text-base shadow-sm"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="amount">Amount Paid (€)</label>
                    <input
                      type="number"
                      id="amount"
                      name="amount"
                      value={expenseForm.amount}
                      onChange={handleExpenseChange}
                      step="0.01"
                      className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 text-base shadow-sm"
                      placeholder="0.00"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="fuelType">Fuel Type</label>
                    <select
                      id="fuelType"
                      name="fuelType"
                      value={expenseForm.fuelType}
                      onChange={handleExpenseChange}
                      className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 text-base shadow-sm"
                    >
                      <option value="Petrol">Petrol</option>
                      <option value="Diesel">Diesel</option>
                      <option value="Electric">Electric</option>
                      <option value="Hybrid">Hybrid</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="quantity">
                      {expenseForm.fuelType === 'Electric' ? 'kWh' : 'Liters'}
                    </label>
                    <input
                      type="number"
                      id="quantity"
                      name="quantity"
                      value={expenseForm.quantity}
                      onChange={handleExpenseChange}
                      step="0.01"
                      className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 text-base shadow-sm"
                      placeholder="0.00"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="odometerReading">Odometer Reading</label>
                    <input
                      type="number"
                      id="odometerReading"
                      name="odometerReading"
                      value={expenseForm.odometerReading}
                      onChange={handleExpenseChange}
                      className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 text-base shadow-sm"
                      placeholder="Enter km"
                      required
                    />
                  </div>
                  
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="fullTank"
                        checked={expenseForm.fullTank}
                        onChange={handleExpenseChange}
                        className="h-5 w-5 text-red-600 mr-3 rounded"
                      />
                      <span className="text-gray-700 text-base">
                        {expenseForm.fuelType === 'Electric' ? 'Full Charge' : 'Full Tank'}
                      </span>
                    </label>
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="notes">Notes (Optional)</label>
                    <textarea
                      id="notes"
                      name="notes"
                      value={expenseForm.notes}
                      onChange={handleExpenseChange}
                      className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 text-base shadow-sm"
                      rows="2"
                      placeholder="Add any notes here"
                    ></textarea>
                  </div>
                </div>
                
                <div className="flex space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 px-4 rounded-xl font-medium transition-all"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-xl font-medium disabled:opacity-50 transition-all shadow-sm"
                  >
                    {isSubmitting ? 'Saving...' : 'Save Expense'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
        
        {/* Expense List Section */}
        <div className={`${showAddForm ? 'mt-6' : ''}`}> 
          <h3 className="text-lg font-bold mb-4 text-gray-800">Recent Expenses</h3>
          
          {loading ? (
            <div className="py-8 text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading expenses...</p>
            </div>
          ) : fuelExpenses.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
              <p className="mb-1 text-gray-700 font-medium">No fuel expenses recorded</p>
              <p className="text-sm text-gray-500">Tap the Add Expense button to record your first expense</p>
            </div>
          ) : (
            <div className="space-y-4">
              {fuelExpenses.map((expense) => (
                <Link 
                  key={expense.id} 
                  href={`/expenses/${expense.id}?type=fuel`} 
                  className="block bg-white rounded-xl p-4 sm:p-5 shadow-md border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all duration-200 cursor-pointer"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3">
                    <span className="font-bold text-lg sm:text-xl text-red-600 mb-1 sm:mb-0">{formatCurrency(expense.amount)}</span>
                    <span className="text-xs sm:text-sm bg-gray-100 text-gray-700 py-1 px-2 sm:px-3 rounded-full self-start sm:self-center">{formatDate(expense.date)}</span>
                  </div>
                  
                  <div className="mb-3 bg-gray-50 py-2 px-3 rounded-lg">
                    <span className="text-xs text-gray-500 uppercase tracking-wide block mb-1">Vehicle</span>
                    <div className="font-medium mt-1">
                      {expense.vehicle?.model} ({expense.vehicle?.licensePlate})
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <span className="text-xs text-gray-500 uppercase tracking-wide block mb-1">Quantity</span>
                      <span className="font-medium">
                        {expense.quantity ? `${expense.quantity} ${expense.fuelType === 'Electric' ? 'kWh' : 'L'}` : '-'}
                      </span>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <span className="text-xs text-gray-500 uppercase tracking-wide block mb-1">Price/Unit</span>
                      <span className="font-medium">
                        {expense.quantity && expense.amount
                          ? formatCurrency(expense.amount / expense.quantity)
                          : '-'}
                      </span>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <span className="text-xs text-gray-500 uppercase tracking-wide block mb-1">Odometer</span>
                      <span className="font-medium">{expense.odometerReading} km</span>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <span className="text-xs text-gray-500 uppercase tracking-wide block mb-1">Fuel Type</span>
                      <span className="font-medium">{expense.fuelType}</span>
                    </div>
                  </div>
                  
                  {expense.notes && (
                    <div className="mb-3 bg-gray-50 p-3 rounded-lg">
                      <span className="text-xs text-gray-500 uppercase tracking-wide block mb-1">Notes</span>
                      <p className="text-sm">{expense.notes}</p>
                    </div>
                  )}

                  <div className="pt-3 flex justify-end">
                    <button
                      onClick={(e) => { 
                        e.stopPropagation();
                        e.preventDefault();
                        handleDeleteExpense(expense.id); 
                      }}
                      className="bg-white hover:bg-red-50 text-red-600 py-2 px-3 sm:px-4 rounded-full text-xs sm:text-sm font-medium flex items-center transition-all shadow-sm border border-red-200"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      Delete
                    </button>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 