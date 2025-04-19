import { useState, useEffect } from 'react'
import { useAuth } from '../lib/auth'
import Link from 'next/link'

// Helper functions
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount)
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Payment cycle options
const paymentCycles = [
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'QUARTERLY', label: 'Quarterly' },
  { value: 'SEMIANNUAL', label: 'Semi-Annual' },
  { value: 'ANNUAL', label: 'Annual' }
]

export default function InsuranceExpenseManager({ vehicles }) {
  const { user } = useAuth()
  const [insuranceExpenses, setInsuranceExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [selectedVehicleId, setSelectedVehicleId] = useState('')
  
  // Form state
  const [expenseForm, setExpenseForm] = useState({
    vehicleId: '',
    provider: '',
    amount: '',
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().slice(0, 10),
    paymentCycle: 'MONTHLY',
    policyNumber: '',
    notes: ''
  })
  
  useEffect(() => {
    if (user && user.id) {
      fetchInsuranceExpenses(user.id)
    }
  }, [user])
  
  useEffect(() => {
    if (vehicles.length > 0 && !selectedVehicleId) {
      setSelectedVehicleId(vehicles[0].id)
      setExpenseForm(prev => ({
        ...prev,
        vehicleId: vehicles[0].id
      }))
    }
  }, [vehicles])
  
  const fetchInsuranceExpenses = async (userId) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/expenses/insurance?driverId=${userId}`)
      const data = await res.json()
      
      if (res.ok) {
        setInsuranceExpenses(data)
      } else {
        console.error('Error fetching insurance expenses:', data.error)
        setError('Failed to load insurance expenses')
      }
    } catch (error) {
      console.error('Error fetching insurance expenses:', error)
      setError('Failed to load insurance expenses')
    } finally {
      setLoading(false)
    }
  }
  
  const handleExpenseChange = (e) => {
    const { name, value } = e.target
    setExpenseForm(prev => ({
      ...prev,
      [name]: value
    }))
  }
  
  const handleVehicleChange = (e) => {
    setSelectedVehicleId(e.target.value)
    setExpenseForm(prev => ({
      ...prev,
      vehicleId: e.target.value
    }))
  }
  
  const handleAddExpense = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')
    
    try {
      if (!expenseForm.vehicleId || !expenseForm.provider || !expenseForm.amount) {
        throw new Error('Please fill in all required fields')
      }
      
      const res = await fetch('/api/expenses/insurance', {
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
        throw new Error(data.error || 'Failed to add insurance expense')
      }
      
      // Reset form and refresh expenses
      setExpenseForm({
        vehicleId: selectedVehicleId,
        provider: '',
        amount: '',
        startDate: new Date().toISOString().slice(0, 10),
        endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().slice(0, 10),
        paymentCycle: 'MONTHLY',
        policyNumber: '',
        notes: ''
      })
      
      setShowAddForm(false)
      fetchInsuranceExpenses(user.id)
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
      const res = await fetch(`/api/expenses/insurance/${id}`, {
        method: 'DELETE'
      })
      
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to delete expense')
      }
      
      fetchInsuranceExpenses(user.id)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg mb-6 overflow-hidden">
      <div className="flex justify-between items-center p-5 bg-gradient-to-r from-green-500 to-green-600">
        <h2 className="text-xl font-bold text-white">Insurance Policies</h2>
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-white text-green-600 py-2 px-4 rounded-full font-medium text-sm shadow-md hover:bg-gray-50 transition-all"
          >
            Add Policy
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 px-4 py-3 sm:px-5 text-red-700 mx-4 my-3 rounded-xl border border-red-100 text-sm sm:text-base">
          {error}
        </div>
      )}

      <div className="p-4 sm:p-5">
        {showAddForm && (
          <div className="bg-white p-4 sm:p-5 rounded-xl mb-6 border border-gray-200 shadow-md">
            <h3 className="text-lg font-bold mb-5 text-center text-gray-800">Add Insurance Policy</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vehicle <span className="text-red-500">*</span>
                </label>
                <select
                  name="vehicleId"
                  value={expenseForm.vehicleId}
                  onChange={handleVehicleChange}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select a vehicle</option>
                  {vehicles.map(vehicle => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.make} {vehicle.model} ({vehicle.licensePlate})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Provider <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="provider"
                  value={expenseForm.provider}
                  onChange={handleExpenseChange}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="amount"
                  value={expenseForm.amount}
                  onChange={handleExpenseChange}
                  min="0"
                  step="0.01"
                  className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Cycle
                </label>
                <select
                  name="paymentCycle"
                  value={expenseForm.paymentCycle}
                  onChange={handleExpenseChange}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                >
                  {paymentCycles.map(cycle => (
                    <option key={cycle.value} value={cycle.value}>
                      {cycle.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={expenseForm.startDate}
                  onChange={handleExpenseChange}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={expenseForm.endDate}
                  onChange={handleExpenseChange}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Policy Number
                </label>
                <input
                  type="text"
                  name="policyNumber"
                  value={expenseForm.policyNumber}
                  onChange={handleExpenseChange}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={expenseForm.notes}
                  onChange={handleExpenseChange}
                  rows="3"
                  className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                ></textarea>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-4 py-2 rounded text-white ${isSubmitting ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'} transition duration-200`}
              >
                {isSubmitting ? 'Saving...' : 'Save Expense'}
              </button>
            </div>
          </div>
        )}

        <div>
          <h3 className="text-lg font-bold mb-4 text-gray-800">Current Policies</h3>
          
          {loading ? (
            <div className="py-8 text-center">Loading insurance expenses...</div>
          ) : insuranceExpenses.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-300">
              <p>No insurance policies recorded.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {insuranceExpenses.map((expense) => (
                <Link 
                  key={expense.id} 
                  href={`/expenses/${expense.id}?type=insurance`} 
                  className="block bg-white rounded-xl p-4 sm:p-5 shadow-md border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all duration-200 cursor-pointer"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3">
                    <span className="font-bold text-lg sm:text-xl text-green-600 mb-1 sm:mb-0">{expense.provider}</span>
                    <span className="text-xs sm:text-sm bg-gray-100 text-gray-700 py-1 px-2 sm:px-3 rounded-full self-start sm:self-center">{formatDate(expense.endDate)}</span>
                  </div>

                  <div className="mb-3 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                     <div className="bg-green-50 py-1 px-2 sm:px-3 rounded-lg text-green-800 text-sm font-medium mb-1 sm:mb-0 self-start sm:self-center">
                       {formatCurrency(expense.amount)} / year
                    </div>
                     {expense.vehicle && (
                      <div className="text-xs sm:text-sm text-gray-600 self-start sm:self-end">
                        {expense.vehicle.model} ({expense.vehicle.licensePlate})
                      </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="bg-gray-50 p-3 rounded-lg">
                        <span className="text-xs text-gray-500 uppercase tracking-wide block mb-1">Policy #</span>
                        <span className="font-medium truncate">{expense.policyNumber || '-'}</span>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                        <span className="text-xs text-gray-500 uppercase tracking-wide block mb-1">Monthly Cost</span>
                        <span className="font-medium">{formatCurrency(expense.monthlyAmount)}</span>
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