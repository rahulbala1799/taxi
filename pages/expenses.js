import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { format } from 'date-fns'
import FuelExpenseManager from '../components/FuelExpenseManager'
import MaintenanceExpenseManager from '../components/MaintenanceExpenseManager'
import InsuranceExpenseManager from '../components/InsuranceExpenseManager'

// Helper component for Other expenses
const OtherExpenseManager = ({ vehicles }) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-6 my-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Other Expenses</h2>
      </div>
      <div className="text-center py-6 border border-dashed border-gray-300 rounded-lg">
        <p className="text-gray-500">Other expense management coming soon.</p>
      </div>
    </div>
  )
}

export default function ExpensesPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('fuel')
  const [vehicles, setVehicles] = useState([])
  const [error, setError] = useState('')
  
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user')
    const token = localStorage.getItem('token')

    if (!userData || !token) {
      router.push('/login')
      return
    }

    try {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
      
      // Load data when user is available
      if (parsedUser && parsedUser.id) {
        fetchVehicles(parsedUser.id)
      }
    } catch (err) {
      console.error('Error parsing user data', err)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }, [router])
  
  const fetchVehicles = async (userId) => {
    try {
      const res = await fetch(`/api/vehicles?driverId=${userId}`)
      const data = await res.json()
      
      if (res.ok) {
        setVehicles(data)
      } else {
        console.error('Error fetching vehicles:', data.error)
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error)
    }
  }
  
  const formatDate = (dateString) => {
    if (!dateString) return '-'
    
    const date = new Date(dateString)
    return format(date, 'MMM d, yyyy')
  }
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IE', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount || 0)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-2xl font-bold text-red-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white text-black pb-16">
      <Head>
        <title>Expense Management | Stijoi Million</title>
        <meta name="description" content="Manage your taxi expenses" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className="bg-black shadow-md fixed top-0 left-0 right-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <button 
            onClick={() => router.push('/dashboard')}
            className="text-white flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back
          </button>
          <h1 className="text-xl font-bold text-white">Expense <span className="text-red-600">Management</span></h1>
          <div className="w-10"></div> {/* Placeholder for balance */}
        </div>
      </header>

      <main className="container mx-auto px-4 pt-24 pb-20">
        {/* Tabs */}
        <div className="flex overflow-x-auto mb-6 bg-gray-100 rounded-lg p-1 sticky top-16 z-10 shadow-md">
          <button
            onClick={() => setActiveTab('fuel')}
            className={`flex-1 py-3 px-4 text-sm font-medium rounded-md whitespace-nowrap ${
              activeTab === 'fuel'
                ? 'bg-red-600 text-white'
                : 'text-gray-700 hover:bg-gray-200'
            }`}
          >
            Fuel
          </button>
          <button
            onClick={() => setActiveTab('maintenance')}
            className={`flex-1 py-3 px-4 text-sm font-medium rounded-md whitespace-nowrap ${
              activeTab === 'maintenance'
                ? 'bg-red-600 text-white'
                : 'text-gray-700 hover:bg-gray-200'
            }`}
          >
            Maintenance
          </button>
          <button
            onClick={() => setActiveTab('insurance')}
            className={`flex-1 py-3 px-4 text-sm font-medium rounded-md whitespace-nowrap ${
              activeTab === 'insurance'
                ? 'bg-red-600 text-white'
                : 'text-gray-700 hover:bg-gray-200'
            }`}
          >
            Insurance
          </button>
          <button
            onClick={() => setActiveTab('other')}
            className={`flex-1 py-3 px-4 text-sm font-medium rounded-md whitespace-nowrap ${
              activeTab === 'other'
                ? 'bg-red-600 text-white'
                : 'text-gray-700 hover:bg-gray-200'
            }`}
          >
            Other
          </button>
        </div>
        
        {/* Content based on active tab */}
        <div>
          {activeTab === 'fuel' && (
            <FuelExpenseManager 
              vehicles={vehicles} 
            />
          )}
          
          {activeTab === 'maintenance' && (
            <MaintenanceExpenseManager 
              vehicles={vehicles} 
            />
          )}
          
          {activeTab === 'insurance' && (
            <InsuranceExpenseManager 
              vehicles={vehicles} 
            />
          )}
          
          {activeTab === 'other' && (
            <OtherExpenseManager 
              vehicles={vehicles} 
            />
          )}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800 p-3 z-20">
        <div className="flex justify-around">
          <button 
            className="flex flex-col items-center text-gray-400 text-xs"
            onClick={() => router.push('/dashboard')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span>Home</span>
          </button>
          <button 
            className="flex flex-col items-center text-gray-400 text-xs"
            onClick={() => router.push('/manage-shift')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Shifts</span>
          </button>
          <button 
            className="flex flex-col items-center text-gray-400 text-xs"
            onClick={() => router.push('/ride-details')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span>Rides</span>
          </button>
          <button 
            className="flex flex-col items-center text-white text-xs"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span>Expenses</span>
          </button>
        </div>
      </nav>
    </div>
  )
} 