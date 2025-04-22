import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '../components/Layout'
import MobileNavBar from '../components/MobileNavBar'
import SimpleFuelExpenseManager from '../components/SimpleFuelExpenseManager'
import ErrorBoundary from '../components/ErrorBoundary'

export default function ExpensesSimple() {
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)
  const [loading, setLoading] = useState(true)
  const [vehicles, setVehicles] = useState([])
  
  // Set isClient to true on component mount
  useEffect(() => {
    setIsClient(true)
  }, [])
  
  // Fetch vehicles from API
  useEffect(() => {
    async function fetchVehicles() {
      try {
        // For demo purposes, we're using static data
        // In a real app, this would be fetched from an API
        setTimeout(() => {
          setVehicles([
            { id: 'v1', model: 'Toyota Camry', licensePlate: '211-D-12345', fuelType: 'Petrol' },
            { id: 'v2', model: 'Ford Transit', licensePlate: '191-D-54321', fuelType: 'Diesel' },
            { id: 'v3', model: 'Tesla Model 3', licensePlate: '221-D-98765', fuelType: 'Electric' }
          ])
          setLoading(false)
        }, 1000)
      } catch (error) {
        console.error('Error fetching vehicles:', error)
        setLoading(false)
      }
    }
    
    fetchVehicles()
  }, [])

  // If we're still on the server, show nothing to avoid hydration errors
  if (!isClient) {
    return null
  }

  return (
    <Layout>
      <div className="bg-gray-50 min-h-screen">
        <div className="container max-w-md mx-auto px-4 py-8">
          <ErrorBoundary>
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Vehicle Expenses</h1>
            
            {loading ? (
              <div className="p-8 bg-white rounded-xl shadow-lg flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
                <span className="ml-3 text-gray-600">Loading vehicles...</span>
              </div>
            ) : (
              <SimpleFuelExpenseManager vehicles={vehicles} />
            )}
          </ErrorBoundary>
        </div>
        
        <MobileNavBar activeItem="expenses" />
      </div>
    </Layout>
  )
} 