import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useAuth } from '../lib/auth'
import Link from 'next/link'

// Simple loading component
const LoadingSpinner = () => (
  <div className="min-h-screen bg-white flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
      <p className="text-red-600 font-medium">Loading...</p>
    </div>
  </div>
);

// Empty state component
const EmptyVehiclesState = () => (
  <div className="bg-yellow-50 p-6 rounded-lg mb-6 border border-yellow-200">
    <h2 className="text-xl font-bold mb-2">You need to add a vehicle first</h2>
    <p className="mb-4">Please add a vehicle to start tracking your expenses.</p>
    <Link href="/vehicles" className="bg-red-600 text-white px-4 py-2 rounded-md inline-block">
      Add Vehicle
    </Link>
  </div>
);

// Error message component
const ErrorMessage = ({ message }) => (
  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 mb-6 rounded">
    {message}
  </div>
);

export default function ExpensesNewPage() {
  // States
  const [isClient, setIsClient] = useState(false)
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // Hooks
  const router = useRouter()
  const { user } = useAuth()

  // Client-side detection
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Data fetching
  useEffect(() => {
    // Only run on client side and when user is available
    if (!isClient || !user) return;
    
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/vehicles?driverId=${user.id}`)
        if (!response.ok) {
          throw new Error('Failed to fetch vehicles')
        }
        
        const data = await response.json()
        setVehicles(data || [])
      } catch (err) {
        console.error('Error fetching vehicles:', err)
        setError('Failed to load vehicles.')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user, isClient])

  // Navigation handlers
  const navigateTo = (path) => () => {
    router.push(path)
  }

  // Don't render anything during SSR
  if (!isClient) {
    return null;
  }

  // Redirect to login if not authenticated
  if (isClient && !user) {
    router.push('/login')
    return <LoadingSpinner />;
  }
  
  // Show loading state
  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-white text-black pb-16">
      <Head>
        <title>Expense Management | Taxi App</title>
        <meta name="description" content="Manage your taxi expenses" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Header */}
      <header className="bg-black shadow-md fixed top-0 left-0 right-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <button 
            onClick={navigateTo('/dashboard')}
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

      {/* Main Content */}
      <main className="container mx-auto px-4 pt-24 pb-20">
        {/* Error message if any */}
        {error && <ErrorMessage message={error} />}
        
        {/* Content based on vehicles */}
        {vehicles.length === 0 ? (
          <EmptyVehiclesState />
        ) : (
          <div className="space-y-6">
            {/* We'll import and render expense components dynamically */}
            <ExpenseSection type="fuel" vehicles={vehicles} />
            <ExpenseSection type="maintenance" vehicles={vehicles} />
            <ExpenseSection type="insurance" vehicles={vehicles} />
            <ExpenseSection type="other" vehicles={vehicles} />
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800 p-3 z-20">
        <div className="flex justify-around">
          <NavButton 
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            }
            label="Home"
            onClick={navigateTo('/dashboard')}
          />
          <NavButton 
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            label="Shifts"
            onClick={navigateTo('/manage-shift')}
          />
          <NavButton 
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            }
            label="Rides"
            onClick={navigateTo('/ride-details')}
          />
          <NavButton 
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            }
            label="Expenses"
            active={true}
          />
        </div>
      </nav>
    </div>
  )
}

// Navigation Button Component
const NavButton = ({ icon, label, onClick, active = false }) => (
  <button 
    className={`flex flex-col items-center text-xs ${active ? 'text-white' : 'text-gray-400'}`}
    onClick={onClick}
  >
    {icon}
    <span>{label}</span>
  </button>
);

// Dynamic expense section component - uses dynamic imports to prevent SSR issues
function ExpenseSection({ type, vehicles }) {
  const [Component, setComponent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadComponent = async () => {
      try {
        let ImportedComponent;
        
        // Dynamically import the appropriate component
        switch (type) {
          case 'fuel':
            ImportedComponent = (await import('../components/FuelExpenseManager')).default;
            break;
          case 'maintenance':
            ImportedComponent = (await import('../components/MaintenanceExpenseManager')).default;
            break;
          case 'insurance':
            ImportedComponent = (await import('../components/InsuranceExpenseManager')).default;
            break;
          case 'other':
            ImportedComponent = (await import('../components/OtherExpenseManager')).default;
            break;
          default:
            throw new Error(`Unknown expense type: ${type}`);
        }
        
        setComponent(() => ImportedComponent);
      } catch (error) {
        console.error(`Error loading ${type} expense component:`, error);
      } finally {
        setLoading(false);
      }
    };

    loadComponent();
  }, [type]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg mb-6 overflow-hidden p-5">
        <div className="h-6 bg-gray-200 animate-pulse rounded mb-4 w-1/3"></div>
        <div className="h-24 bg-gray-100 animate-pulse rounded"></div>
      </div>
    );
  }

  if (!Component) {
    return (
      <div className="bg-white rounded-xl shadow-lg mb-6 overflow-hidden p-5">
        <p className="text-red-500">Failed to load expense component.</p>
      </div>
    );
  }

  // Render the component with vehicles prop
  return <Component vehicles={vehicles} />;
} 