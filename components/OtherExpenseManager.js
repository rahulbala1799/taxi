import { useState, useEffect, useRef } from 'react'
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

export default function OtherExpenseManager({ vehicles }) {
  const { user } = useAuth()
  const [otherExpenses, setOtherExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [selectedVehicleId, setSelectedVehicleId] = useState('')
  const [selectedPeriod, setSelectedPeriod] = useState('all-time')
  const fileInputRef = useRef(null)
  const [imagePreview, setImagePreview] = useState(null)
  
  // Tax-deductible expense categories for taxi drivers
  const expenseCategories = [
    'Car Wash',
    'Parking Fees',
    'Tolls',
    'Telephone & Internet',
    'Taxi License Fees',
    'Driver Permits',
    'Vehicle Registration',
    'Professional Memberships',
    'Taxi Meter Certification',
    'Taxi Roof Sign',
    'Personal Protective Equipment',
    'Dispatch System Fees',
    'Office Supplies',
    'Bank Charges',
    'Accounting Fees',
    'Other'
  ]
  
  // Form state
  const [expenseForm, setExpenseForm] = useState({
    vehicleId: '',
    date: new Date().toISOString().slice(0, 10),
    amount: '',
    category: '',
    receiptImage: null,
    notes: ''
  })
  
  useEffect(() => {
    if (user) {
      fetchOtherExpenses()
    }
  }, [user, selectedPeriod])
  
  useEffect(() => {
    if (vehicles.length > 0 && !selectedVehicleId) {
      setSelectedVehicleId(vehicles[0].id)
      setExpenseForm(prev => ({
        ...prev,
        vehicleId: vehicles[0].id
      }))
    }
  }, [vehicles])
  
  const fetchOtherExpenses = async () => {
    setLoading(true)
    try {
      let url = `/api/expenses/other?driverId=${user.id}`;
      
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
        throw new Error('Failed to fetch other expenses')
      }
      
      const data = await response.json()
      setOtherExpenses(data)
    } catch (err) {
      console.error('Error fetching other expenses:', err)
      setError('Failed to load expenses. Please try again.')
    } finally {
      setLoading(false)
    }
  }
  
  const handleExpenseChange = (e) => {
    const { name, value, type } = e.target
    setExpenseForm(prev => ({
      ...prev,
      [name]: value
    }))
  }
  
  const handleVehicleChange = (e) => {
    setSelectedVehicleId(e.target.value)
  }
  
  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Set the receipt image file to the form state
      setExpenseForm(prev => ({
        ...prev,
        receiptImage: file
      }))
      
      // Create a preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }
  
  const handleCameraCapture = () => {
    if (fileInputRef.current) {
      // Set accept attribute for camera capture if needed
      fileInputRef.current.setAttribute('accept', 'image/*');
      fileInputRef.current.setAttribute('capture', 'environment');
      fileInputRef.current.click()
    }
  }
  
  const handleClearImage = () => {
    setExpenseForm(prev => ({
      ...prev,
      receiptImage: null
    }))
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)
    
    if (!expenseForm.amount || isNaN(parseFloat(expenseForm.amount))) {
      setError('Please enter a valid amount')
      setIsSubmitting(false)
      return
    }
    
    if (!expenseForm.category) {
      setError('Please select an expense category')
      setIsSubmitting(false)
      return
    }
    
    try {
      // Temporarily send JSON instead of FormData
      const payload = {
        driverId: user.id,
        vehicleId: selectedVehicleId || null, // Send null if no vehicle selected
        date: expenseForm.date,
        amount: expenseForm.amount,
        category: expenseForm.category,
        notes: expenseForm.notes || '',
      };

      console.log("[DEBUG] Sending JSON payload:", payload);

      const response = await fetch('/api/expenses/other', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      })
      
      if (!response.ok) {
        // Try to get more specific error from response if possible
        let errorData = { error: `HTTP error! status: ${response.status}` };
        try {
          errorData = await response.json(); 
        } catch (jsonError) {
          console.error("Could not parse error response as JSON:", jsonError);
          // Attempt to read response as text if JSON fails
          try {
            const errorText = await response.text();
            errorData.error = errorText || errorData.error; // Use text if available
            console.error("Error response text:", errorText);
          } catch (textError) {
            console.error("Could not read error response as text:", textError);
          }
        }
        throw new Error(errorData.error || 'Failed to add expense')
      }
      
      const newExpense = await response.json()
      
      // Refresh the list to show the new expense
      fetchOtherExpenses()
      
      // Reset form
      setExpenseForm({
        vehicleId: selectedVehicleId, // Keep selected vehicle
        date: new Date().toISOString().slice(0, 10),
        amount: '',
        category: '',
        receiptImage: null,
        notes: ''
      })
      setImagePreview(null)
      
      setShowAddForm(false)
    } catch (err) {
      console.error('Error adding other expense (JSON test):', err)
      // Display the actual error message from the API if available
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
      const response = await fetch(`/api/expenses/other/${id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete expense')
      }
      
      // Refresh the list
      fetchOtherExpenses()
    } catch (err) {
      console.error('Error deleting other expense:', err)
      setError('Failed to delete expense. Please try again.')
    }
  }
  
  return (
    <div className="bg-white rounded-xl shadow-lg mb-6 overflow-hidden">
      <div className="flex justify-between items-center p-5 bg-gradient-to-r from-blue-600 to-blue-700">
        <h2 className="text-xl font-bold text-white">Other Expenses</h2>
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-white text-blue-600 py-2 px-4 rounded-full font-medium text-sm shadow-md hover:bg-gray-50 transition-all"
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
      <div className="p-4 sm:p-5 bg-gray-50">
        {/* Vehicle Selector */}
        {vehicles.length > 0 && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Vehicle (Optional)</label>
            <select
              value={selectedVehicleId}
              onChange={handleVehicleChange}
              className="p-3 border border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500 w-full bg-white shadow-sm text-base"
            >
              <option value="">All Vehicles</option>
              {vehicles.map(vehicle => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.make} {vehicle.model} ({vehicle.licensePlate})
                </option>
              ))}
            </select>
          </div>
        )}
        
        {/* Period Selector */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Filter by Time Period</h3>
          <div className="flex overflow-x-auto py-1 space-x-2 -mx-1">
            <button 
              className={`${selectedPeriod === 'day' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'} py-2 px-3 sm:px-4 rounded-full text-xs sm:text-sm font-medium shadow-sm flex-shrink-0 transition-all`}
              onClick={() => setSelectedPeriod('day')}
            >
              Today
            </button>
            <button 
              className={`${selectedPeriod === 'week' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'} py-2 px-3 sm:px-4 rounded-full text-xs sm:text-sm font-medium shadow-sm flex-shrink-0 transition-all`}
              onClick={() => setSelectedPeriod('week')}
            >
              This Week
            </button>
            <button 
              className={`${selectedPeriod === 'month' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'} py-2 px-3 sm:px-4 rounded-full text-xs sm:text-sm font-medium shadow-sm flex-shrink-0 transition-all`}
              onClick={() => setSelectedPeriod('month')}
            >
              This Month
            </button>
            <button 
              className={`${selectedPeriod === 'year' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'} py-2 px-3 sm:px-4 rounded-full text-xs sm:text-sm font-medium shadow-sm flex-shrink-0 transition-all`}
              onClick={() => setSelectedPeriod('year')}
            >
              This Year
            </button>
            <button 
              className={`${selectedPeriod === 'all-time' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'} py-2 px-3 sm:px-4 rounded-full text-xs sm:text-sm font-medium shadow-sm flex-shrink-0 transition-all`}
              onClick={() => setSelectedPeriod('all-time')}
            >
              All Time
            </button>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 px-4 py-3 sm:px-5 text-red-700 mx-4 my-3 rounded-xl border border-red-100 text-sm sm:text-base">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        </div>
      )}
      
      <div className="p-4 sm:p-5">
        {showAddForm && (
          <div className="bg-white p-4 sm:p-5 rounded-xl mb-6 border border-gray-200 shadow-md">
            <h3 className="text-lg font-bold mb-5 text-center text-gray-800">Add Tax Deductible Expense</h3>
            
            {vehicles.length > 0 && (
              <div className="mb-5">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="vehicle-add">Associate with Vehicle (Optional)</label>
                <select
                  id="vehicle-add"
                  className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-base shadow-sm"
                  value={expenseForm.vehicleId}
                  onChange={(e) => setExpenseForm(prev => ({ ...prev, vehicleId: e.target.value }))}
                >
                  <option value="">-- No Vehicle --</option>
                  {vehicles.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.model} ({vehicle.licensePlate})
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="category">Expense Category</label>
                  <select
                    id="category"
                    name="category"
                    value={expenseForm.category}
                    onChange={handleExpenseChange}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-base shadow-sm"
                    required
                  >
                    <option value="">-- Select Category --</option>
                    {expenseCategories.map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="date">Date</label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={expenseForm.date}
                    onChange={handleExpenseChange}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-base shadow-sm"
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
                    className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-base shadow-sm"
                    placeholder="0.00"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">Receipt Image (Optional)</label>
                  <div className="mt-1 flex flex-col items-center">
                    {imagePreview ? (
                      <div className="relative w-full max-w-xs mb-2">
                        <img 
                          src={imagePreview} 
                          alt="Receipt preview" 
                          className="w-full h-auto rounded-lg border border-gray-200" 
                        />
                        <button
                          type="button"
                          onClick={handleClearImage}
                          className="absolute top-2 right-2 bg-red-500 p-1 rounded-full text-white shadow-md"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <div className="flex w-full space-x-2">
                        <input
                          type="file"
                          ref={fileInputRef}
                          className="hidden"
                          accept="image/*" 
                          onChange={handleImageChange}
                        />
                        {/* Combined Upload/Take Photo Button for Simplicity */}
                        <button
                          type="button"
                          onClick={() => {
                            fileInputRef.current.removeAttribute('capture'); // Allow file selection
                            fileInputRef.current.click();
                          }}
                          className="flex-1 bg-gray-100 hover:bg-gray-200 py-3 px-3 rounded-xl text-gray-700 font-medium flex items-center justify-center shadow-sm text-sm"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 13H11V9.413l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13H5.5z" />
                            <path d="M9 13h2v5a1 1 0 11-2 0v-5z" />
                          </svg>
                          Upload
                        </button>
                        <button
                          type="button"
                          onClick={handleCameraCapture}
                          className="flex-1 bg-gray-100 hover:bg-gray-200 py-3 px-3 rounded-xl text-gray-700 font-medium flex items-center justify-center shadow-sm text-sm"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                          </svg>
                          Use Camera
                        </button>
                      </div>
                    )}
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      Upload a clear photo of your receipt for tax purposes.
                    </p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="notes">Notes (Optional)</label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={expenseForm.notes}
                    onChange={handleExpenseChange}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-base shadow-sm"
                    rows="2"
                    placeholder="Add any additional information"
                  ></textarea>
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false)
                    setImagePreview(null)
                    setExpenseForm({
                      ...expenseForm,
                      receiptImage: null
                    })
                  }}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 px-4 rounded-xl font-medium transition-all"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-xl font-medium disabled:opacity-50 transition-all shadow-sm"
                >
                  {isSubmitting ? 'Saving...' : 'Save Expense'}
                </button>
              </div>
            </form>
          </div>
        )}
        
        <div className={`${showAddForm ? 'mt-6' : ''}`}> 
          <h3 className="text-lg font-bold mb-4 text-gray-800">Recent Tax Deductible Expenses</h3>
          
          {loading ? (
            <div className="py-8 text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading expenses...</p>
            </div>
          ) : otherExpenses.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2z" />
              </svg>
              <p className="mb-1 text-gray-700 font-medium">No expenses recorded</p>
              <p className="text-sm text-gray-500">Tap the Add Expense button to record your first expense</p>
            </div>
          ) : (
            <div className="space-y-4">
              {otherExpenses.map((expense) => (
                <Link 
                  key={expense.id} 
                  href={`/expenses/${expense.id}?type=other`} 
                  className="block bg-white rounded-xl p-4 sm:p-5 shadow-md border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all duration-200 cursor-pointer"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3">
                    <span className="font-bold text-lg sm:text-xl text-blue-600 mb-1 sm:mb-0">{formatCurrency(expense.amount)}</span>
                    <span className="text-xs sm:text-sm bg-gray-100 text-gray-700 py-1 px-2 sm:px-3 rounded-full self-start sm:self-center">{formatDate(expense.date)}</span>
                  </div>
                  
                  <div className="mb-3 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    <div className="bg-blue-50 py-1 px-2 sm:px-3 rounded-lg text-blue-800 text-sm font-medium mb-1 sm:mb-0 self-start sm:self-center">
                      {expense.category}
                    </div>
                    
                    {expense.vehicle && (
                      <div className="text-xs sm:text-sm text-gray-600 self-start sm:self-end">
                        {expense.vehicle.model} ({expense.vehicle.licensePlate})
                      </div>
                    )}
                  </div>
                  
                  {expense.receiptImageUrl && (
                    <div className="mb-3">
                      <div className="flex items-center text-sm text-gray-600 bg-gray-100 p-2 rounded-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                           <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4V5h12v10zm-4.707-3.293a1 1 0 00-1.414-1.414L9 11.586 7.707 10.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Receipt Attached
                      </div>
                    </div>
                  )}
                  
                  {expense.notes && (
                    <div className="mb-3 bg-gray-50 p-3 rounded-lg">
                      <span className="text-xs text-gray-500 uppercase tracking-wide block mb-1">Notes</span>
                      <p className="text-sm truncate">{expense.notes}</p>
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