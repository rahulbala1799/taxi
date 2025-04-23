import React, { useState, useEffect } from 'react'
import { useAuth } from '../lib/auth'
import Link from 'next/link'
import ErrorBoundary from './ErrorBoundary'

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

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

const FuelExpenseManager = ({ vehicles = [] }) => {
  const { user = null } = useAuth() || {}
  const [activeTab, setActiveTab] = useState(0)
  const [expenses, setExpenses] = useState([])
  const [newExpense, setNewExpense] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    odometer: '',
    liters: '',
    chargeTime: '',
    notes: '',
    vehicleId: vehicles.length > 0 ? vehicles[0].id : null
  })
  
  // If vehicles are available, set the first vehicle as selected by default
  useEffect(() => {
    if (vehicles.length > 0 && !newExpense.vehicleId) {
      setNewExpense(prev => ({ ...prev, vehicleId: vehicles[0].id }))
    }
  }, [vehicles])

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!newExpense.vehicleId || !newExpense.amount) {
      alert('Please fill in required fields')
      return
    }

    const expense = {
      ...newExpense,
      id: Date.now().toString(),
      date: newExpense.date || new Date().toISOString().split('T')[0]
    }
    
    setExpenses([...expenses, expense])
    
    // Reset form fields
    setNewExpense({
      date: new Date().toISOString().split('T')[0],
      amount: '',
      odometer: '',
      liters: '',
      chargeTime: '',
      notes: '',
      vehicleId: vehicles[activeTab]?.id
    })
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setNewExpense({ ...newExpense, [name]: value })
  }

  const handleTabChange = (index) => {
    setActiveTab(index)
    if (vehicles[index]) {
      setNewExpense(prev => ({ ...prev, vehicleId: vehicles[index].id }))
    }
  }

  const deleteExpense = (id) => {
    setExpenses(prev => prev.filter(expense => expense.id !== id))
  }

  const renderFields = (vehicle) => {
    if (!vehicle) return null
    
    const isElectric = vehicle.fuelType === 'electric'
    
    return (
      <>
        {isElectric ? (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Charge Time (hours)
              </label>
              <input
                type="number"
                name="chargeTime"
                value={newExpense.chargeTime}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                min="0"
                step="0.1"
              />
            </div>
          </>
        ) : (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Odometer Reading
              </label>
              <input
                type="number"
                name="odometer"
                value={newExpense.odometer}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                min="0"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Liters/Gallons
              </label>
              <input
                type="number"
                name="liters"
                value={newExpense.liters}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                min="0"
                step="0.01"
              />
            </div>
          </>
        )}
      </>
    )
  }

  const getVehicleById = (id) => {
    return vehicles.find(vehicle => vehicle.id === id) || null
  }

  const getExpensesForVehicle = (vehicleId) => {
    return expenses.filter(expense => expense.vehicleId === vehicleId)
  }

  if (vehicles.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <p className="text-gray-500">No vehicles available. Please add a vehicle first.</p>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div className="bg-white shadow rounded-lg">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Fuel Expense Manager</h2>
          
          {/* Simple Tabs instead of @headlessui/react Tab component */}
          <div className="mb-6">
            <div className="flex space-x-1 rounded-xl bg-blue-900/20 p-1 overflow-x-auto">
              {vehicles.map((vehicle, index) => (
                <button
                  key={vehicle.id}
                  onClick={() => handleTabChange(index)}
                  className={classNames(
                    'w-full py-2.5 text-sm font-medium leading-5 rounded-lg whitespace-nowrap',
                    'focus:outline-none',
                    activeTab === index
                      ? 'bg-white shadow text-blue-700'
                      : 'text-blue-500 hover:bg-white/[0.12] hover:text-blue-600'
                  )}
                >
                  {vehicle.name || `Vehicle ${vehicle.id}`}
                </button>
              ))}
            </div>
          </div>
          
          {/* Tab Panels */}
          <div>
            {vehicles.map((vehicle, index) => (
              <div key={vehicle.id} className={activeTab === index ? 'block' : 'hidden'}>
                <div className="lg:grid lg:grid-cols-2 lg:gap-6">
                  {/* Add New Expense Form */}
                  <div className="mb-6 lg:mb-0">
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Expense</h3>
                      <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Date
                          </label>
                          <input
                            type="date"
                            name="date"
                            value={newExpense.date}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded-md"
                          />
                        </div>
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Amount (${vehicle.currency || 'USD'})
                          </label>
                          <input
                            type="number"
                            name="amount"
                            value={newExpense.amount}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded-md"
                            min="0"
                            step="0.01"
                            required
                          />
                        </div>
                        
                        {renderFields(vehicle)}
                        
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Notes
                          </label>
                          <textarea
                            name="notes"
                            value={newExpense.notes}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded-md"
                            rows="2"
                          />
                        </div>
                        <button
                          type="submit"
                          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                        >
                          Add Expense
                        </button>
                      </form>
                    </div>
                  </div>
                  
                  {/* Expense List */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Expenses</h3>
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                      {getExpensesForVehicle(vehicle.id).length === 0 ? (
                        <p className="text-gray-500">No expenses recorded yet.</p>
                      ) : (
                        getExpensesForVehicle(vehicle.id).map((expense) => (
                          <div key={expense.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium text-gray-800">${expense.amount}</p>
                                <p className="text-sm text-gray-500">{formatDate(expense.date)}</p>
                              </div>
                              <button
                                onClick={() => deleteExpense(expense.id)}
                                className="text-red-500 hover:text-red-700"
                                aria-label="Delete expense"
                              >
                                {/* Plain SVG instead of react-icons */}
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                              </button>
                            </div>
                            
                            <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                              {vehicle.fuelType === 'electric' ? (
                                expense.chargeTime && (
                                  <div>
                                    <span className="text-gray-600">Charge time:</span> {expense.chargeTime} hrs
                                  </div>
                                )
                              ) : (
                                <>
                                  {expense.odometer && (
                                    <div>
                                      <span className="text-gray-600">Odometer:</span> {expense.odometer}
                                    </div>
                                  )}
                                  {expense.liters && (
                                    <div>
                                      <span className="text-gray-600">Liters/Gallons:</span> {expense.liters}
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                            
                            {expense.notes && (
                              <div className="mt-2 border-t border-gray-100 pt-2">
                                <p className="text-sm text-gray-600">{expense.notes}</p>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}

export default FuelExpenseManager 