import React, { useState, useEffect } from 'react'

// Simple version without any complex patterns
export default function SimpleFuelExpenseManager({ vehicles }) {
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    // Simple load logic
    const loadExpenses = async () => {
      try {
        // For testing, just create a static placeholder
        setExpenses([
          { id: 1, date: new Date().toISOString(), amount: 50, fuelType: 'Petrol' },
          { id: 2, date: new Date().toISOString(), amount: 45, fuelType: 'Diesel' },
        ])
      } catch (err) {
        console.error('Error:', err)
      } finally {
        setLoading(false)
      }
    }
    
    loadExpenses()
  }, [])
  
  // Extremely simple component with no complex children
  return (
    <div className="bg-white rounded-xl shadow-lg mb-6 overflow-hidden">
      <div className="flex justify-between items-center p-4 bg-gradient-to-r from-red-600 to-red-700">
        <h2 className="text-xl font-bold text-white">Fuel Expenses</h2>
      </div>
      
      <div className="p-4">
        {loading ? (
          <div className="text-center py-4">Loading...</div>
        ) : (
          <div className="space-y-4">
            <div className="text-lg font-medium">Your Fuel Expenses</div>
            
            {expenses.map(expense => (
              <div key={expense.id} className="border rounded p-3">
                <div className="flex justify-between">
                  <div className="font-bold">€{expense.amount}</div>
                  <div className="text-sm text-gray-500">
                    {new Date(expense.date).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-gray-600 text-sm">{expense.fuelType}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 