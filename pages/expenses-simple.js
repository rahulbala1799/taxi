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
  const [renderError, setRenderError] = useState(null)
  
  // Set isClient to true on component mount
  useEffect(() => {
    try {
      setIsClient(true)
    } catch (error) {
      console.error("Error in client-side effect:", error);
      setRenderError(error.message);
    }
  }, [])
  
  // Fetch vehicles from API
  useEffect(() => {
    if (!isClient) return; // Only run on client
    
    async function fetchVehicles() {
      try {
        // For demo purposes, we're using static data
        // In a real app, this would be fetched from an API
        setTimeout(() => {
          try {
            setVehicles([
              { id: 'v1', model: 'Toyota Camry', licensePlate: '211-D-12345', fuelType: 'Petrol' },
              { id: 'v2', model: 'Ford Transit', licensePlate: '191-D-54321', fuelType: 'Diesel' },
              { id: 'v3', model: 'Tesla Model 3', licensePlate: '221-D-98765', fuelType: 'Electric' }
            ])
            setLoading(false)
          } catch (err) {
            console.error("Error setting vehicles:", err);
            setRenderError(err.message);
            setLoading(false);
          }
        }, 1000)
      } catch (error) {
        console.error('Error fetching vehicles:', error)
        setRenderError(error.message);
        setLoading(false)
      }
    }
    
    fetchVehicles()
  }, [isClient])

  // If we're still on the server, show fallback to avoid hydration errors
  if (!isClient) {
    return (
      <div suppressHydrationWarning>
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <div className="p-4 text-center">
            <p className="text-gray-500">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (renderError) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 p-4">
          <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-red-600 mb-4">Something went wrong</h2>
            <p className="text-gray-700">{renderError}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </Layout>
    );
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
              vehicles && vehicles.length > 0 ? (
                <SimpleFuelExpenseManager vehicles={vehicles} />
              ) : (
                <div className="p-8 bg-white rounded-xl shadow-lg text-center">
                  <p className="text-gray-600">No vehicles available.</p>
                </div>
              )
            )}
          </ErrorBoundary>
        </div>
        
        <MobileNavBar activeItem="expenses" />
      </div>
    </Layout>
  )
} 