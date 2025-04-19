import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { format } from 'date-fns'
import FuelExpenseManager from '../components/FuelExpenseManager'
import MaintenanceExpenseManager from '../components/MaintenanceExpenseManager'
import InsuranceExpenseManager from '../components/InsuranceExpenseManager'
import OtherExpenseManager from '../components/OtherExpenseManager'
import { useAuth } from '../lib/auth'
import Layout from '../components/Layout'

export default function ExpensesPage() {
  const { user } = useAuth()
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  const router = useRouter()

  useEffect(() => {
    if (user) {
      fetchVehicles()
    }
  }, [user])
  
  const fetchVehicles = async () => {
    try {
      const response = await fetch(`/api/vehicles?driverId=${user.id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch vehicles')
      }
      
      const data = await response.json()
      setVehicles(data)
    } catch (err) {
      console.error('Error fetching vehicles:', err)
      setError('Failed to load vehicles.')
    } finally {
      setLoading(false)
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

  if (!user) {
    return (
      <Layout>
        <div className="text-center py-10">
          <p>Please log in to view your expenses.</p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Expenses</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 mb-6 rounded">
            {error}
          </div>
        )}
        
        {loading ? (
          <div className="text-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p>Loading your vehicles and expenses...</p>
          </div>
        ) : vehicles.length === 0 ? (
          <div className="bg-yellow-50 p-6 rounded-lg mb-6 border border-yellow-200">
            <h2 className="text-xl font-bold mb-2">You need to add a vehicle first</h2>
            <p className="mb-4">Please add a vehicle to start tracking your expenses.</p>
            <a href="/vehicles" className="bg-red-600 text-white px-4 py-2 rounded-md inline-block">
              Add Vehicle
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Main expense managers */}
            <FuelExpenseManager vehicles={vehicles} />
            <MaintenanceExpenseManager vehicles={vehicles} />
            <InsuranceExpenseManager vehicles={vehicles} />
            <OtherExpenseManager vehicles={vehicles} />
          </div>
        )}
      </div>
    </Layout>
  )
} 