import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/authContext'

// Helper functions
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount)
}

const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'short', day: 'numeric' }
  return new Date(dateString).toLocaleDateString('en-US', options)
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
  }, [user])
  
  useEffect(() => {
    if (vehicles.length > 0 && !selectedVehicleId) {
      setSelectedVehicleId(vehicles[0].id)
      setSelectedVehicle(vehicles[0])
      setExpenseForm(prev => ({
        ...prev,
        vehicleId: vehicles[0].id,
        fuelType: vehicles[0].fuelType
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
      const response = await fetch(`/api/expenses/fuel?driverId=${user.id}`)
      
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
    <div className="bg-white shadow-md rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Fuel Expenses</h2>
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
          >
            Add Expense
          </button>
        )}
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="space-y-6">
        {showAddForm && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium mb-4">Add Fuel Expense</h3>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Select Vehicle</label>
              <select
                className="w-full p-2 border border-gray-300 rounded"
                value={selectedVehicleId}
                onChange={(e) => setSelectedVehicleId(e.target.value)}
              >
                <option value="">-- Select Vehicle --</option>
                {vehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.make} {vehicle.model} ({vehicle.registrationNumber})
                  </option>
                ))}
              </select>
            </div>
            
            {selectedVehicleId && (
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-gray-700 mb-2">Date</label>
                    <input
                      type="date"
                      name="date"
                      value={expenseForm.date}
                      onChange={handleExpenseChange}
                      className="w-full p-2 border border-gray-300 rounded"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 mb-2">Odometer Reading</label>
                    <input
                      type="number"
                      name="odometerReading"
                      value={expenseForm.odometerReading}
                      onChange={handleExpenseChange}
                      className="w-full p-2 border border-gray-300 rounded"
                      placeholder="Enter miles/km"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 mb-2">Amount Paid</label>
                    <input
                      type="number"
                      name="amount"
                      value={expenseForm.amount}
                      onChange={handleExpenseChange}
                      step="0.01"
                      className="w-full p-2 border border-gray-300 rounded"
                      placeholder="0.00"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 mb-2">
                      {expenseForm.fuelType === 'Electric' ? 'kWh' : 'Gallons/Liters'}
                    </label>
                    <input
                      type="number"
                      name="quantity"
                      value={expenseForm.quantity}
                      onChange={handleExpenseChange}
                      step="0.01"
                      className="w-full p-2 border border-gray-300 rounded"
                      placeholder="0.00"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 mb-2">Fuel Type</label>
                    <select
                      name="fuelType"
                      value={expenseForm.fuelType}
                      onChange={handleExpenseChange}
                      className="w-full p-2 border border-gray-300 rounded"
                    >
                      <option value="Petrol">Petrol</option>
                      <option value="Diesel">Diesel</option>
                      <option value="Electric">Electric</option>
                      <option value="Hybrid">Hybrid</option>
                      <option value="LPG">LPG</option>
                      <option value="CNG">CNG</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  
                  <div className="col-span-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="fullTank"
                        checked={expenseForm.fullTank}
                        onChange={handleExpenseChange}
                        className="mr-2"
                      />
                      <span className="text-gray-700">
                        {expenseForm.fuelType === 'Electric' ? 'Full Charge' : 'Full Tank'}
                      </span>
                    </label>
                  </div>
                  
                  <div className="col-span-2">
                    <label className="block text-gray-700 mb-2">Notes</label>
                    <textarea
                      name="notes"
                      value={expenseForm.notes}
                      onChange={handleExpenseChange}
                      className="w-full p-2 border border-gray-300 rounded"
                      rows="2"
                      placeholder="Optional notes"
                    ></textarea>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded disabled:opacity-50"
                  >
                    {isSubmitting ? 'Saving...' : 'Save Expense'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
        
        <div>
          <h3 className="text-lg font-medium mb-4">Recent Fuel Expenses</h3>
          
          {loading ? (
            <p className="text-gray-500">Loading expenses...</p>
          ) : fuelExpenses.length === 0 ? (
            <p className="text-gray-500">No fuel expenses recorded yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-3 px-4 text-left">Date</th>
                    <th className="py-3 px-4 text-left">Vehicle</th>
                    <th className="py-3 px-4 text-left">Amount</th>
                    <th className="py-3 px-4 text-left">Quantity</th>
                    <th className="py-3 px-4 text-left">Price/Unit</th>
                    <th className="py-3 px-4 text-left">Odometer</th>
                    <th className="py-3 px-4 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {fuelExpenses.map((expense) => (
                    <tr key={expense.id}>
                      <td className="py-3 px-4">{formatDate(expense.date)}</td>
                      <td className="py-3 px-4">
                        {expense.vehicle?.make} {expense.vehicle?.model} ({expense.vehicle?.registrationNumber})
                      </td>
                      <td className="py-3 px-4">{formatCurrency(expense.amount)}</td>
                      <td className="py-3 px-4">
                        {expense.quantity ? `${expense.quantity} ${expense.fuelType === 'Electric' ? 'kWh' : 'gal'}` : '-'}
                      </td>
                      <td className="py-3 px-4">
                        {expense.quantity && expense.amount
                          ? formatCurrency(expense.amount / expense.quantity)
                          : '-'}
                      </td>
                      <td className="py-3 px-4">{expense.odometerReading}</td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleDeleteExpense(expense.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 