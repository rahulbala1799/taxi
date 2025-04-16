import { useState, useEffect } from 'react'

export default function FuelExpenseManager({ user, vehicles, formatDate, formatCurrency }) {
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
    fuelType: '',
    odometerReading: '',
    fullTank: true,
    notes: ''
  })
  
  useEffect(() => {
    if (user && user.id) {
      fetchFuelExpenses(user.id)
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
    if (selectedVehicleId) {
      const vehicle = vehicles.find(v => v.id === selectedVehicleId)
      setSelectedVehicle(vehicle)
      setExpenseForm(prev => ({
        ...prev,
        vehicleId: vehicle.id,
        fuelType: vehicle.fuelType
      }))
    }
  }, [selectedVehicleId, vehicles])
  
  const fetchFuelExpenses = async (userId) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/expenses/fuel?driverId=${userId}`)
      const data = await res.json()
      
      if (res.ok) {
        setFuelExpenses(data)
      } else {
        console.error('Error fetching fuel expenses:', data.error)
        setError('Failed to load fuel expenses')
      }
    } catch (error) {
      console.error('Error fetching fuel expenses:', error)
      setError('Failed to load fuel expenses')
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
  
  const handleAddExpense = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')
    
    try {
      if (!expenseForm.vehicleId || !expenseForm.amount) {
        throw new Error('Please fill in all required fields')
      }
      
      const res = await fetch('/api/expenses/fuel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...expenseForm,
          driverId: user.id
        }),
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to add fuel expense')
      }
      
      // Reset form and refresh expenses
      setExpenseForm({
        vehicleId: selectedVehicleId,
        date: new Date().toISOString().slice(0, 10),
        amount: '',
        quantity: '',
        fuelType: selectedVehicle ? selectedVehicle.fuelType : '',
        odometerReading: '',
        fullTank: true,
        notes: ''
      })
      
      setShowAddForm(false)
      fetchFuelExpenses(user.id)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const handleDeleteExpense = async (id) => {
    if (!confirm('Are you sure you want to delete this expense?')) {
      return
    }
    
    try {
      const res = await fetch(`/api/expenses/fuel/${id}`, {
        method: 'DELETE'
      })
      
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to delete expense')
      }
      
      fetchFuelExpenses(user.id)
    } catch (err) {
      setError(err.message)
    }
  }
  
  return (
    <div>
      {/* Vehicle selector */}
      {vehicles.length > 0 && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Vehicle
          </label>
          <select
            value={selectedVehicleId}
            onChange={handleVehicleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-600"
          >
            {vehicles.map(vehicle => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.make} {vehicle.model} ({vehicle.licensePlate}) - {vehicle.fuelType}
              </option>
            ))}
          </select>
        </div>
      )}
      
      {/* Add Expense Button */}
      <div className="mb-6">
        <button 
          onClick={() => setShowAddForm(true)}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-md text-sm transition duration-200 flex items-center justify-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Add Fuel Expense
        </button>
      </div>
      
      {/* Add Expense Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow-md p-4 mb-6 border border-gray-200">
          <h2 className="text-lg font-bold text-black mb-4">Add Fuel Expense</h2>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          <form onSubmit={handleAddExpense}>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="date">
                  Date*
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={expenseForm.date}
                  onChange={handleExpenseChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-600"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="amount">
                  Amount (€)*
                </label>
                <input
                  type="number"
                  step="0.01"
                  id="amount"
                  name="amount"
                  value={expenseForm.amount}
                  onChange={handleExpenseChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-600"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="quantity">
                  {selectedVehicle && selectedVehicle.fuelType === 'Electric' ? 'kWh' : 'Liters'}
                </label>
                <input
                  type="number"
                  step="0.01"
                  id="quantity"
                  name="quantity"
                  value={expenseForm.quantity}
                  onChange={handleExpenseChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="odometerReading">
                  Odometer Reading
                </label>
                <input
                  type="number"
                  id="odometerReading"
                  name="odometerReading"
                  value={expenseForm.odometerReading}
                  onChange={handleExpenseChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-600"
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="fuelType">
                Fuel Type
              </label>
              <select
                id="fuelType"
                name="fuelType"
                value={expenseForm.fuelType}
                onChange={handleExpenseChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-600"
              >
                <option value="Petrol">Petrol</option>
                <option value="Diesel">Diesel</option>
                <option value="Electric">Electric</option>
                <option value="Hybrid">Hybrid</option>
                <option value="LPG">LPG</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="fullTank"
                  checked={expenseForm.fullTank}
                  onChange={handleExpenseChange}
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Full tank/charge</span>
              </label>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="notes">
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                value={expenseForm.notes}
                onChange={handleExpenseChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-600"
                rows="2"
              ></textarea>
            </div>
            
            <div className="flex justify-center space-x-2">
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false)
                  setError('')
                }}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Adding...' : 'Add Expense'}
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Expenses List */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6 border border-gray-200">
        <h2 className="text-lg font-bold text-black mb-4">Recent Fuel Expenses</h2>
        
        {error && !showAddForm && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {loading ? (
          <div className="text-center py-6">
            <p className="text-gray-500">Loading expenses...</p>
          </div>
        ) : fuelExpenses.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-2 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="mb-1">No fuel expenses recorded yet</p>
            <p className="text-sm">Add your first expense to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {fuelExpenses
              .filter(expense => !selectedVehicleId || expense.vehicleId === selectedVehicleId)
              .map(expense => (
              <div key={expense.id} className="bg-gray-50 p-3 rounded-md border border-gray-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">{formatDate(expense.date)}</span>
                  <div className="flex space-x-2">
                    <span className="text-sm bg-gray-200 px-2 py-1 rounded-full">
                      {expense.vehicle.make} {expense.vehicle.model}
                    </span>
                    <button 
                      onClick={() => handleDeleteExpense(expense.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-2 text-sm mb-2">
                  <div>
                    <p className="text-xs text-gray-500">Amount</p>
                    <p className="text-red-600 font-medium">{formatCurrency(expense.amount)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">
                      {expense.fuelType === 'Electric' ? 'kWh' : 'Liters'}
                    </p>
                    <p>{expense.quantity || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Fuel Type</p>
                    <p>{expense.fuelType}</p>
                  </div>
                </div>
                
                {expense.notes && (
                  <div className="text-xs text-gray-600 mt-2 border-t border-gray-200 pt-2">
                    {expense.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 