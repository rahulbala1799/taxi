import React, { useState, useEffect } from 'react'
import { useAuth } from '../lib/auth'

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
    <div className="bg-white rounded-lg shadow-sm mb-6 border border-gray-200">
      <div className="flex justify-between items-center p-4 border-b border-gray-200">
        <h2 className="text-xl font-bold">Fuel Expenses</h2>
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-red-600 hover:bg-red-700 text-white py-3 px-5 rounded-md font-medium text-sm"
            aria-label="Add Expense"
          >
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add
            </div>
          </button>
        )}
      </div>
      
      {/* Filters Row */}
      <div className="p-4 border-b border-gray-200">
        {/* Vehicle Selector */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle</label>
          <select
            value={selectedVehicleId}
            onChange={handleVehicleChange}
            className="p-2 border border-gray-300 rounded focus:ring-red-500 focus:border-red-500 w-full"
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
          <h3 className="text-sm font-medium text-gray-700 mb-1">Time Period</h3>
          <div className="grid grid-cols-5 gap-2">
            <button 
              className={`${selectedPeriod === 'day' ? 'bg-red-600 text-white' : 'bg-white text-gray-700 border border-gray-300'} py-2 px-3 rounded-md text-sm font-medium`}
              onClick={() => setSelectedPeriod('day')}
            >
              Day
            </button>
            <button 
              className={`${selectedPeriod === 'week' ? 'bg-red-600 text-white' : 'bg-white text-gray-700 border border-gray-300'} py-2 px-3 rounded-md text-sm font-medium`}
              onClick={() => setSelectedPeriod('week')}
            >
              Week
            </button>
            <button 
              className={`${selectedPeriod === 'month' ? 'bg-red-600 text-white' : 'bg-white text-gray-700 border border-gray-300'} py-2 px-3 rounded-md text-sm font-medium`}
              onClick={() => setSelectedPeriod('month')}
            >
              Month
            </button>
            <button 
              className={`${selectedPeriod === 'year' ? 'bg-red-600 text-white' : 'bg-white text-gray-700 border border-gray-300'} py-2 px-3 rounded-md text-sm font-medium`}
              onClick={() => setSelectedPeriod('year')}
            >
              Year
            </button>
            <button 
              className={`${selectedPeriod === 'all-time' ? 'bg-red-600 text-white' : 'bg-white text-gray-700 border border-gray-300'} py-2 px-3 rounded-md text-sm font-medium`}
              onClick={() => setSelectedPeriod('all-time')}
            >
              All-Time
            </button>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 m-4 rounded">
          {error}
        </div>
      )}
      
      <div className="p-4">
        {showAddForm && (
          <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
            <h3 className="text-lg font-bold mb-4 text-center">Add Fuel Expense</h3>
            
            <div className="mb-5">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="vehicle">Select Vehicle</label>
              <select
                id="vehicle"
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 text-base"
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
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 text-base"
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
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 text-base"
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
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 text-base"
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
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 text-base"
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
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 text-base"
                      placeholder="Enter km"
                      required
                    />
                  </div>
                  
                  <div className="py-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="fullTank"
                        checked={expenseForm.fullTank}
                        onChange={handleExpenseChange}
                        className="h-5 w-5 text-red-600 mr-3"
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
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 text-base"
                      rows="2"
                      placeholder="Add any notes here"
                    ></textarea>
                  </div>
                </div>
                
                <div className="flex space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-black py-3 px-4 rounded-md font-medium"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-black hover:bg-gray-800 text-white py-3 px-4 rounded-md font-medium disabled:opacity-50"
                  >
                    {isSubmitting ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
        
        <div>
          <h3 className="text-lg font-bold mb-4">Recent Expenses</h3>
          
          {loading ? (
            <div className="py-8 text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading expenses...</p>
            </div>
          ) : fuelExpenses.length === 0 ? (
            <div className="text-center py-8 text-gray-500 border border-dashed border-gray-300 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <p className="mb-1">No fuel expenses recorded yet</p>
              <p className="text-sm">Tap the Add button to record your first expense</p>
            </div>
          ) : (
            <div className="space-y-4">
              {fuelExpenses.map((expense) => (
                <div key={expense.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-red-600">{formatCurrency(expense.amount)}</span>
                    <span className="text-sm text-gray-600">{formatDate(expense.date)}</span>
                  </div>
                  
                  <div className="mb-2">
                    <span className="text-sm text-gray-500">Vehicle:</span>
                    <span className="ml-2">
                      {expense.vehicle?.model} ({expense.vehicle?.licensePlate})
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-y-1">
                    <div className="w-1/2">
                      <span className="text-sm text-gray-500">Quantity:</span>
                      <span className="ml-2">
                        {expense.quantity ? `${expense.quantity} ${expense.fuelType === 'Electric' ? 'kWh' : 'L'}` : '-'}
                      </span>
                    </div>
                    
                    <div className="w-1/2">
                      <span className="text-sm text-gray-500">Price/Unit:</span>
                      <span className="ml-2">
                        {expense.quantity && expense.amount
                          ? formatCurrency(expense.amount / expense.quantity)
                          : '-'}
                      </span>
                    </div>
                    
                    <div className="w-1/2">
                      <span className="text-sm text-gray-500">Odometer:</span>
                      <span className="ml-2">{expense.odometerReading} km</span>
                    </div>
                    
                    <div className="w-1/2">
                      <span className="text-sm text-gray-500">Fuel Type:</span>
                      <span className="ml-2">{expense.fuelType}</span>
                    </div>
                  </div>
                  
                  {expense.notes && (
                    <div className="mt-2 pt-2 border-t border-gray-100">
                      <span className="text-sm text-gray-500">Notes:</span>
                      <p className="text-sm mt-1">{expense.notes}</p>
                    </div>
                  )}
                  
                  <div className="mt-3 pt-3 border-t border-gray-200 flex justify-end">
                    <button
                      onClick={() => handleDeleteExpense(expense.id)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 