import { useState, useEffect } from 'react'
import { useAuth } from '../lib/auth'

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
    <div className="bg-white shadow-md rounded-lg p-6 my-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Insurance Expenses</h2>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-200"
        >
          {showAddForm ? 'Cancel' : 'Add New'}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded border border-red-200">
          {error}
        </div>
      )}

      {showAddForm && (
        <form onSubmit={handleAddExpense} className="mb-8 border border-gray-200 rounded-lg p-4 bg-gray-50">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">Add Insurance Expense</h3>
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
        </form>
      )}

      {loading ? (
        <div className="text-center py-6">
          <p className="text-gray-500">Loading insurance expenses...</p>
        </div>
      ) : insuranceExpenses.length === 0 ? (
        <div className="text-center py-6 border border-dashed border-gray-300 rounded-lg">
          <p className="text-gray-500">No insurance expenses recorded yet.</p>
          {!showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="mt-2 text-blue-600 hover:underline"
            >
              Add your first insurance expense
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Provider</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cycle</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Policy #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {insuranceExpenses.map((expense) => (
                <tr key={expense.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {expense.vehicle ? `${expense.vehicle.make} ${expense.vehicle.model}` : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{expense.provider}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{formatCurrency(expense.amount)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {expense.paymentCycle.charAt(0) + expense.paymentCycle.slice(1).toLowerCase()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {formatDate(expense.startDate)} - {formatDate(expense.endDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{expense.policyNumber || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleDeleteExpense(expense.id)}
                      className="text-red-600 hover:text-red-900 ml-2"
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
  )
} 