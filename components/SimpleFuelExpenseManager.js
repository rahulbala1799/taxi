import React, { useState, useEffect } from 'react'
import { format } from 'date-fns'

// DEBUG LOGGER
const DEBUG = {
  log: (component, action, data) => {
    console.log(`[DEBUG][${component}][${action}]`, data);
  },
  error: (component, action, error) => {
    console.error(`[DEBUG][${component}][${action}]`, error);
  },
  render: (component, returnValue) => {
    console.log(`[DEBUG][${component}][RENDER]`, {
      type: returnValue?.type?.name || typeof returnValue,
      isNull: returnValue === null,
      isUndefined: returnValue === undefined
    });
    return returnValue;
  }
};

// Enhanced version with tabs and fuel-type specific inputs
export default function SimpleFuelExpenseManager({ vehicles }) {
  DEBUG.log('SimpleFuelExpenseManager', 'FUNCTION_START', { vehiclesReceived: !!vehicles, vehiclesLength: vehicles?.length || 0 });
  
  if (!vehicles) {
    DEBUG.error('SimpleFuelExpenseManager', 'NO_VEHICLES', 'Vehicles prop is undefined or null');
    return DEBUG.render('SimpleFuelExpenseManager', <div className="p-4 text-red-500">Error: No vehicles data provided</div>);
  }
  
  // States
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('fuel')
  const [showAddForm, setShowAddForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [selectedVehicleId, setSelectedVehicleId] = useState('')
  const [selectedVehicle, setSelectedVehicle] = useState(null)
  
  DEBUG.log('SimpleFuelExpenseManager', 'INITIAL_STATE', { 
    expenses, loading, error, activeTab, 
    showAddForm, submitting, selectedVehicleId, selectedVehicle 
  });
  
  // Form state
  const [formData, setFormData] = useState({
    vehicleId: '',
    date: new Date().toISOString().split('T')[0],
    amount: '',
    fuelType: '',
    quantity: '',
    odometerReading: '',
    chargeTime: '',
    fullTank: true,
    notes: ''
  })
  
  // Format helpers
  const formatCurrency = (amount) => {
    try {
      return new Intl.NumberFormat('en-IE', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2
      }).format(amount || 0)
    } catch (err) {
      DEBUG.error('SimpleFuelExpenseManager', 'FORMAT_CURRENCY_ERROR', err);
      return '€0.00';
    }
  }
  
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString)
      return format(date, 'dd MMM yyyy')
    } catch (err) {
      DEBUG.error('SimpleFuelExpenseManager', 'FORMAT_DATE_ERROR', err);
      return 'Invalid date';
    }
  }
  
  // Load expenses
  useEffect(() => {
    DEBUG.log('SimpleFuelExpenseManager', 'LOAD_EXPENSES_EFFECT_START', 'Loading expenses');
    loadExpenses()
  }, [])
  
  // Set initial vehicle when vehicles load
  useEffect(() => {
    DEBUG.log('SimpleFuelExpenseManager', 'VEHICLES_EFFECT', { 
      vehiclesLength: vehicles.length, 
      selectedVehicleId
    });
    
    if (vehicles.length > 0 && !selectedVehicleId) {
      DEBUG.log('SimpleFuelExpenseManager', 'SETTING_INITIAL_VEHICLE', vehicles[0]);
      setSelectedVehicleId(vehicles[0].id)
      setSelectedVehicle(vehicles[0])
      setFormData(prev => {
        const newState = {
          ...prev,
          vehicleId: vehicles[0].id,
          fuelType: vehicles[0].fuelType || 'Petrol'
        };
        DEBUG.log('SimpleFuelExpenseManager', 'UPDATED_FORM_DATA', newState);
        return newState;
      })
    }
  }, [vehicles, selectedVehicleId])
  
  // Update selected vehicle when selection changes
  useEffect(() => {
    DEBUG.log('SimpleFuelExpenseManager', 'SELECTED_VEHICLE_EFFECT', { selectedVehicleId });
    
    if (selectedVehicleId) {
      const vehicle = vehicles.find(v => v.id === selectedVehicleId)
      DEBUG.log('SimpleFuelExpenseManager', 'FOUND_VEHICLE', vehicle);
      
      if (vehicle) {
        setSelectedVehicle(vehicle)
        setFormData(prev => {
          const newState = {
            ...prev,
            vehicleId: selectedVehicleId,
            fuelType: vehicle.fuelType || 'Petrol'
          };
          DEBUG.log('SimpleFuelExpenseManager', 'UPDATED_FORM_DATA_SELECTION', newState);
          return newState;
        })
      }
    }
  }, [selectedVehicleId, vehicles])
  
  // Load expenses - in real app would fetch from API
  const loadExpenses = async () => {
    DEBUG.log('SimpleFuelExpenseManager', 'LOAD_EXPENSES_START', 'Starting expense load');
    try {
      // Simulating API call - in real app, fetch from backend
      // For a real implementation, we would fetch from /api/expenses/fuel
      setTimeout(() => {
        try {
          const mockExpenses = [
            { 
              id: 1, 
              date: '2025-04-15', 
              amount: 50, 
              fuelType: 'Petrol',
              quantity: 30,
              odometerReading: 45000,
              fullTank: true,
              vehicle: { id: 'v1', model: 'Toyota Camry', licensePlate: '211-D-12345', fuelType: 'Petrol' }
            },
            { 
              id: 2, 
              date: '2025-04-10', 
              amount: 45, 
              fuelType: 'Diesel',
              quantity: 25,
              odometerReading: 44500,
              fullTank: false,
              vehicle: { id: 'v2', model: 'Ford Transit', licensePlate: '191-D-54321', fuelType: 'Diesel' }
            },
            { 
              id: 3, 
              date: '2025-04-05', 
              amount: 18, 
              fuelType: 'Electric',
              chargeTime: 45,
              odometerReading: 12000,
              vehicle: { id: 'v3', model: 'Tesla Model 3', licensePlate: '221-D-98765', fuelType: 'Electric' }
            }
          ];
          
          DEBUG.log('SimpleFuelExpenseManager', 'EXPENSES_DATA', { count: mockExpenses.length });
          setExpenses(mockExpenses);
          setLoading(false);
          DEBUG.log('SimpleFuelExpenseManager', 'EXPENSES_SET', { loading: false });
        } catch (innerErr) {
          DEBUG.error('SimpleFuelExpenseManager', 'SET_EXPENSES_ERROR', innerErr);
          setError('Failed to process expenses data');
          setLoading(false);
        }
      }, 1000)
    } catch (err) {
      DEBUG.error('SimpleFuelExpenseManager', 'LOAD_EXPENSES_ERROR', err);
      setError('Failed to load expenses')
      setLoading(false)
    }
  }
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    DEBUG.log('SimpleFuelExpenseManager', 'INPUT_CHANGE', { name, value, type });
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }
  
  // Handle vehicle selection
  const handleVehicleChange = (e) => {
    const value = e.target.value;
    DEBUG.log('SimpleFuelExpenseManager', 'VEHICLE_CHANGE', value);
    setSelectedVehicleId(value)
  }
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault()
    DEBUG.log('SimpleFuelExpenseManager', 'SUBMIT_START', formData);
    setSubmitting(true)
    
    try {
      // Validate required fields
      if (!formData.vehicleId || !formData.amount || !formData.date) {
        throw new Error('Please fill in all required fields')
      }
      
      // Simulate API call - in real app would call API
      setTimeout(() => {
        try {
          const newExpense = {
            id: Date.now(), // Generate temp ID
            ...formData,
            amount: parseFloat(formData.amount),
            quantity: formData.quantity ? parseFloat(formData.quantity) : null,
            odometerReading: formData.odometerReading ? parseFloat(formData.odometerReading) : null,
            chargeTime: formData.chargeTime ? parseFloat(formData.chargeTime) : null,
            vehicle: vehicles.find(v => v.id === formData.vehicleId)
          }
          
          DEBUG.log('SimpleFuelExpenseManager', 'NEW_EXPENSE_CREATED', newExpense);
          setExpenses(prev => [newExpense, ...prev])
          
          // Reset form
          const resetFormData = {
            vehicleId: selectedVehicleId,
            date: new Date().toISOString().split('T')[0],
            amount: '',
            fuelType: selectedVehicle?.fuelType || 'Petrol',
            quantity: '',
            odometerReading: '',
            chargeTime: '',
            fullTank: true,
            notes: ''
          };
          
          DEBUG.log('SimpleFuelExpenseManager', 'FORM_RESET', resetFormData);
          setFormData(resetFormData);
          setShowAddForm(false);
          setSubmitting(false);
        } catch (innerErr) {
          DEBUG.error('SimpleFuelExpenseManager', 'ADD_EXPENSE_ERROR', innerErr);
          setError(innerErr.message);
          setSubmitting(false);
        }
      }, 1000)
    } catch (err) {
      DEBUG.error('SimpleFuelExpenseManager', 'SUBMIT_ERROR', err);
      setError(err.message)
      setSubmitting(false)
    }
  }
  
  // Handle expense deletion
  const handleDelete = (id) => {
    DEBUG.log('SimpleFuelExpenseManager', 'DELETE_START', { id });
    
    if (confirm('Are you sure you want to delete this expense?')) {
      // Simulate API call - in real app would call API
      DEBUG.log('SimpleFuelExpenseManager', 'DELETE_CONFIRMED', { id });
      setExpenses(prev => prev.filter(expense => expense.id !== id));
    } else {
      DEBUG.log('SimpleFuelExpenseManager', 'DELETE_CANCELLED', { id });
    }
  }
  
  // Render tabs
  const renderTabs = () => {
    DEBUG.log('SimpleFuelExpenseManager', 'RENDER_TABS_START', { activeTab });
    
    const tabsElement = (
      <div className="flex mb-4 border-b">
        <button
          className={`py-2 px-4 font-medium text-sm ${activeTab === 'fuel' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('fuel')}
        >
          Fuel
        </button>
        <button
          className={`py-2 px-4 font-medium text-sm ${activeTab === 'maintenance' ? 'text-yellow-600 border-b-2 border-yellow-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('maintenance')}
        >
          Maintenance
        </button>
        <button
          className={`py-2 px-4 font-medium text-sm ${activeTab === 'insurance' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('insurance')}
        >
          Insurance
        </button>
        <button
          className={`py-2 px-4 font-medium text-sm ${activeTab === 'other' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('other')}
        >
          Other
        </button>
      </div>
    );
    
    DEBUG.log('SimpleFuelExpenseManager', 'RENDER_TABS_DONE', { isNull: tabsElement === null, isUndefined: tabsElement === undefined });
    return tabsElement;
  }
  
  // Render add form with dynamic fields based on vehicle fuel type
  const renderAddForm = () => {
    const isFuelElectric = selectedVehicle?.fuelType === 'Electric'
    
    return (
      <div className="bg-white p-4 rounded-lg border shadow-sm mb-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">Add Fuel Expense</h3>
          <button 
            onClick={() => setShowAddForm(false)}
            className="text-gray-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          {/* Vehicle Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vehicle *
            </label>
            <select
              name="vehicleId"
              value={formData.vehicleId}
              onChange={handleVehicleChange}
              className="w-full p-2 border rounded-md"
              required
            >
              <option value="">Select a vehicle</option>
              {vehicles.map(vehicle => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.model} ({vehicle.licensePlate})
                </option>
              ))}
            </select>
          </div>
          
          {/* Date input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date *
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md"
              required
            />
          </div>
          
          {/* Amount */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount (€) *
            </label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md"
              placeholder="0.00"
              step="0.01"
              min="0"
              required
            />
          </div>
          
          {/* Dynamic fields based on fuel type */}
          {isFuelElectric ? (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Charge Time (minutes)
              </label>
              <input
                type="number"
                name="chargeTime"
                value={formData.chargeTime}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md"
                placeholder="0"
                min="0"
              />
            </div>
          ) : (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fuel Type
                </label>
                <select
                  name="fuelType"
                  value={formData.fuelType}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="Petrol">Petrol</option>
                  <option value="Diesel">Diesel</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity (Liters)
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                  placeholder="0"
                  step="0.01"
                  min="0"
                />
              </div>
              
              <div className="mb-4">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <input
                    type="checkbox"
                    name="fullTank"
                    checked={formData.fullTank}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  Full Tank
                </label>
              </div>
            </>
          )}
          
          {/* Odometer Reading - common for all fuel types */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Odometer Reading (km)
            </label>
            <input
              type="number"
              name="odometerReading"
              value={formData.odometerReading}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md"
              placeholder="0"
              min="0"
            />
          </div>
          
          {/* Notes */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md"
              rows="2"
            />
          </div>
          
          {/* Submit/Cancel buttons */}
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              disabled={submitting}
            >
              {submitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    )
  }
  
  // Render expense cards
  const renderExpenseCards = () => {
    if (expenses.length === 0) {
      return (
        <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
          </svg>
          <p className="text-gray-500 mb-1">No fuel expenses found</p>
          <button 
            onClick={() => setShowAddForm(true)}
            className="mt-2 text-red-600 font-medium text-sm"
          >
            Add your first expense
          </button>
        </div>
      )
    }
    
    return (
      <div className="space-y-4">
        {expenses.map(expense => (
          <div key={expense.id} className="bg-white rounded-lg border shadow-sm p-4">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-bold text-lg">{formatCurrency(expense.amount)}</div>
                <div className="text-sm text-gray-500">{formatDate(expense.date)}</div>
              </div>
              <div className="flex space-x-2">
                <button className="text-gray-500" onClick={() => handleDelete(expense.id)}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="mt-2 flex">
              <div className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                {expense.vehicle?.model} ({expense.vehicle?.licensePlate})
              </div>
            </div>
            
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              {expense.fuelType === 'Electric' ? (
                <>
                  <div>
                    <span className="text-gray-500">Fuel Type:</span> Electric
                  </div>
                  {expense.chargeTime && (
                    <div>
                      <span className="text-gray-500">Charge Time:</span> {expense.chargeTime} min
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div>
                    <span className="text-gray-500">Fuel Type:</span> {expense.fuelType}
                  </div>
                  {expense.quantity && (
                    <div>
                      <span className="text-gray-500">Quantity:</span> {expense.quantity}L
                    </div>
                  )}
                  {typeof expense.fullTank !== 'undefined' && (
                    <div>
                      <span className="text-gray-500">Full Tank:</span> {expense.fullTank ? 'Yes' : 'No'}
                    </div>
                  )}
                </>
              )}
              
              {expense.odometerReading && (
                <div>
                  <span className="text-gray-500">Odometer:</span> {expense.odometerReading} km
                </div>
              )}
            </div>
            
            {expense.notes && (
              <div className="mt-3 text-sm">
                <span className="text-gray-500">Notes:</span> {expense.notes}
              </div>
            )}
          </div>
        ))}
      </div>
    )
  }
  
  // Debugging pre-render checks
  DEBUG.log('SimpleFuelExpenseManager', 'BEFORE_MAIN_RENDER', {
    vehiclesLength: vehicles.length,
    expensesLength: expenses.length,
    loading,
    error,
    activeTab,
    showAddForm
  });
  
  // Main component render
  try {
    const componentRender = (
      <div className="bg-white rounded-xl shadow-lg mb-6 overflow-hidden">
        <div className="flex justify-between items-center p-4 bg-gradient-to-r from-red-600 to-red-700">
          <h2 className="text-xl font-bold text-white">Expense Manager</h2>
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
                Add
              </div>
            </button>
          )}
        </div>
        
        <div className="p-4">
          {/* Error message */}
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}
          
          {/* Tab navigation */}
          {renderTabs()}
          
          {/* Add Form */}
          {showAddForm && renderAddForm()}
          
          {/* Content based on active tab */}
          {(() => {
            DEBUG.log('SimpleFuelExpenseManager', 'TAB_CONTENT_CHECK', { activeTab, loading });
            
            if (activeTab === 'fuel') {
              if (loading) {
                DEBUG.log('SimpleFuelExpenseManager', 'RENDERING_LOADING', 'Showing loading state');
                return (
                  <div className="py-8 text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600 mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading expenses...</p>
                  </div>
                );
              } else {
                DEBUG.log('SimpleFuelExpenseManager', 'RENDERING_EXPENSES', { count: expenses.length });
                return renderExpenseCards();
              }
            } else {
              DEBUG.log('SimpleFuelExpenseManager', 'RENDERING_COMING_SOON', { activeTab });
              return (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">This tab is coming soon</p>
                </div>
              );
            }
          })()}
        </div>
      </div>
    );
    
    DEBUG.log('SimpleFuelExpenseManager', 'RENDER_COMPLETE', {
      isNull: componentRender === null,
      isUndefined: componentRender === undefined
    });
    
    return DEBUG.render('SimpleFuelExpenseManager', componentRender);
  } catch (renderError) {
    DEBUG.error('SimpleFuelExpenseManager', 'RENDER_ERROR', renderError);
    return DEBUG.render('SimpleFuelExpenseManager', (
      <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">
        <h3 className="font-bold">Render Error</h3>
        <p>{renderError.message}</p>
      </div>
    ));
  }
} 