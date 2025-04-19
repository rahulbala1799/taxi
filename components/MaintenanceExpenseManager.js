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

export default function MaintenanceExpenseManager({ vehicles }) {
  const { user } = useAuth()
  const [maintenanceExpenses, setMaintenanceExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [selectedVehicleId, setSelectedVehicleId] = useState('')
  
  // Form state
  const [expenseForm, setExpenseForm] = useState({
    vehicleId: '',
    date: new Date().toISOString().slice(0, 10),
    amount: '',
    serviceType: '',
    odometerReading: '',
    notes: ''
  })
  
  // Common service types
  const serviceTypes = [
    'Oil Change',
    'Tire Replacement',
    'Brake Service',
    'Battery Replacement',
    'Air Filter',
    'Wheel Alignment',
    'General Service',
    'Inspection',
    'Repair',
    'Other'
  ]
  
  useEffect(() => {
    if (user && user.id) {
      fetchMaintenanceExpenses(user.id)
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
  
  const fetchMaintenanceExpenses = async (userId) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/expenses/maintenance?driverId=${userId}`)
      const data = await res.json()
      
      if (res.ok) {
        setMaintenanceExpenses(data)
      } else {
        console.error('Error fetching maintenance expenses:', data.error)
        setError('Failed to load maintenance expenses')
      }
    } catch (error) {
      console.error('Error fetching maintenance expenses:', error)
      setError('Failed to load maintenance expenses')
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
      if (!expenseForm.vehicleId || !expenseForm.amount || !expenseForm.serviceType) {
        throw new Error('Please fill in all required fields')
      }
      
      const res = await fetch('/api/expenses/maintenance', {
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
        throw new Error(data.error || 'Failed to add maintenance expense')
      }
      
      // Reset form and refresh expenses
      setExpenseForm({
        vehicleId: selectedVehicleId,
        date: new Date().toISOString().slice(0, 10),
        amount: '',
        serviceType: '',
        odometerReading: '',
        notes: ''
      })
      
      setShowAddForm(false)
      fetchMaintenanceExpenses(user.id)
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
      const res = await fetch(`/api/expenses/maintenance/${id}`, {
        method: 'DELETE'
      })
      
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to delete expense')
      }
      
      fetchMaintenanceExpenses(user.id)
    } catch (err) {
      setError(err.message)
    }
  }
  
  return (
    <div className="bg-white rounded-xl shadow-lg mb-6 overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center p-5 bg-gradient-to-r from-yellow-500 to-yellow-600">
        <h2 className="text-xl font-bold text-white">Maintenance Expenses</h2>
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-white text-yellow-600 py-2 px-4 rounded-full font-medium text-sm shadow-md hover:bg-gray-50 transition-all"
          >
            Add Expense
          </button>
        )}
      </div>

      {/* Filters Row (If needed, similar to FuelExpenseManager) */}
      {/* <div className="p-4 sm:p-5 bg-gray-50"> ... </div> */}

      {error && (
        <div className="bg-red-50 px-4 py-3 sm:px-5 text-red-700 mx-4 my-3 rounded-xl border border-red-100 text-sm sm:text-base">
          {/* Error display */} 
        </div>
      )}

      <div className="p-4 sm:p-5">
        {/* Add Form */} 
        {showAddForm && (
          <div className="bg-white p-4 sm:p-5 rounded-xl mb-6 border border-gray-200 shadow-md">
             {/* Add form JSX */} 
             <h3 className="text-lg font-bold mb-5 text-center text-gray-800">Add Maintenance Expense</h3>
             {/* Vehicle Select */} 
             {/* Form inputs: date, amount, serviceType, odometer, notes */} 
             {/* Submit/Cancel buttons */} 
          </div>
        )}

        <div>
          <h3 className="text-lg font-bold mb-4 text-gray-800">Recent Maintenance</h3>
          
          {loading ? (
             <div className="py-8 text-center">{/* Loading spinner */}</div>
          ) : maintenanceExpenses.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-300">
              {/* Empty state message */} 
               <p>No maintenance expenses recorded.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {maintenanceExpenses.map((expense) => (
                <Link 
                  key={expense.id} 
                  href={`/expenses/${expense.id}?type=maintenance`} 
                  className="block bg-white rounded-xl p-4 sm:p-5 shadow-md border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all duration-200 cursor-pointer"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3">
                    <span className="font-bold text-lg sm:text-xl text-yellow-600 mb-1 sm:mb-0">{formatCurrency(expense.amount)}</span>
                    <span className="text-xs sm:text-sm bg-gray-100 text-gray-700 py-1 px-2 sm:px-3 rounded-full self-start sm:self-center">{formatDate(expense.date)}</span>
                  </div>

                  <div className="mb-3 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    <div className="bg-yellow-50 py-1 px-2 sm:px-3 rounded-lg text-yellow-800 text-sm font-medium mb-1 sm:mb-0 self-start sm:self-center">
                      {expense.serviceType}
                    </div>
                    {expense.vehicle && (
                      <div className="text-xs sm:text-sm text-gray-600 self-start sm:self-end">
                        {expense.vehicle.model} ({expense.vehicle.licensePlate})
                      </div>
                    )}
                  </div>
                  
                  {/* Odometer Reading */}
                  {expense.odometerReading && (
                    <div className="mb-3 bg-gray-50 p-3 rounded-lg">
                        <span className="text-xs text-gray-500 uppercase tracking-wide block mb-1">Odometer</span>
                        <span className="font-medium">{expense.odometerReading} km</span>
                    </div>
                  )}

                  {/* Notes */} 
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
                      {/* Delete Icon */}
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