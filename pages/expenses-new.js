import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useAuth } from '../lib/auth'
import Link from 'next/link'

// Enable debug mode
const DEBUG = true;

// Debug logger
const debug = (area, message, data) => {
  if (!DEBUG) return;
  console.log(`[DEBUG:${area}]`, message, data || '');
}

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
const EmptyVehiclesState = () => {
  debug('EmptyVehiclesState', 'Rendering empty state');
  return (
    <div className="bg-yellow-50 p-6 rounded-lg mb-6 border border-yellow-200">
      <h2 className="text-xl font-bold mb-2">You need to add a vehicle first</h2>
      <p className="mb-4">Please add a vehicle to start tracking your expenses.</p>
      <a 
        href="/vehicles" 
        className="bg-red-600 text-white px-4 py-2 rounded-md inline-block"
      >
        Add Vehicle
      </a>
    </div>
  );
};

// Error message component
const ErrorMessage = ({ message }) => (
  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 mb-6 rounded">
    {message}
  </div>
);

// Error boundary class component to catch rendering errors
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
    debug('ErrorBoundary', 'Constructed');
  }

  static getDerivedStateFromError(error) {
    debug('ErrorBoundary', 'Error caught in getDerivedStateFromError', error.message);
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    debug('ErrorBoundary', 'Error caught in componentDidCatch', { 
      error: error.toString(), 
      component: errorInfo.componentStack 
    });
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-red-100 p-4 rounded-lg">
          <h3 className="text-red-800 font-bold">Something went wrong</h3>
          <p className="text-red-700">Component error: {this.state.error && this.state.error.toString()}</p>
          <details className="mt-2">
            <summary className="cursor-pointer text-red-800">View component stack</summary>
            <pre className="mt-2 text-xs text-red-700 whitespace-pre-wrap">
              {this.state.errorInfo && this.state.errorInfo.componentStack}
            </pre>
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

// Safe component wrapper
const SafeComponentRender = ({ name, children }) => {
  try {
    debug('SafeComponentRender', `Rendering ${name}`);
    return <>{children}</>;
  } catch (error) {
    debug('SafeComponentRender', `Error rendering ${name}`, error);
    return (
      <div className="bg-red-100 p-4 rounded-lg">
        <h3 className="text-red-800 font-bold">Error in {name}</h3>
        <p className="text-red-700">{error.toString()}</p>
      </div>
    );
  }
};

export default function ExpensesNewPage() {
  debug('ExpensesNewPage', 'Component starting render');
  
  // States
  const [isClient, setIsClient] = useState(false)
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [componentsLoaded, setComponentsLoaded] = useState(false)
  
  // Load components statically instead of dynamically
  const [FuelExpenseManager, setFuelExpenseManager] = useState(null)
  const [MaintenanceExpenseManager, setMaintenanceExpenseManager] = useState(null)
  const [InsuranceExpenseManager, setInsuranceExpenseManager] = useState(null)
  const [OtherExpenseManager, setOtherExpenseManager] = useState(null)
  const [componentErrors, setComponentErrors] = useState({})
  
  // Hooks
  const router = useRouter()
  const { user } = useAuth()

  // Debug user and router state
  useEffect(() => {
    debug('auth', 'User state changed', user ? 'User exists' : 'No user');
    debug('router', 'Router state', { pathname: router.pathname, query: router.query });
  }, [user, router]);

  // Client-side detection
  useEffect(() => {
    debug('lifecycle', 'Setting isClient to true');
    setIsClient(true)
  }, [])
  
  // Load components on client-side only
  useEffect(() => {
    if (!isClient) return;
    
    debug('components', 'Starting to load expense components');
    
    const loadComponents = async () => {
      try {
        debug('components', 'Importing FuelExpenseManager');
        const FuelModule = await import('../components/FuelExpenseManager');
        debug('components', 'FuelExpenseManager imported successfully', typeof FuelModule.default);
        setFuelExpenseManager(() => FuelModule.default);
        
        debug('components', 'Importing MaintenanceExpenseManager');
        const MaintenanceModule = await import('../components/MaintenanceExpenseManager');
        debug('components', 'MaintenanceExpenseManager imported successfully', typeof MaintenanceModule.default);
        setMaintenanceExpenseManager(() => MaintenanceModule.default);
        
        debug('components', 'Importing InsuranceExpenseManager');
        const InsuranceModule = await import('../components/InsuranceExpenseManager');
        debug('components', 'InsuranceExpenseManager imported successfully', typeof InsuranceModule.default);
        setInsuranceExpenseManager(() => InsuranceModule.default);
        
        debug('components', 'Importing OtherExpenseManager');
        const OtherModule = await import('../components/OtherExpenseManager');
        debug('components', 'OtherExpenseManager imported successfully', typeof OtherModule.default);
        setOtherExpenseManager(() => OtherModule.default);
        
        debug('components', 'All components loaded successfully');
        setComponentsLoaded(true);
      } catch (err) {
        debug('components', 'Error loading components', err.message);
        setComponentErrors(prev => ({...prev, import: err.message}));
        setError("Failed to load expense components. Please refresh the page.");
      }
    };
    
    loadComponents();
  }, [isClient]);

  // Data fetching
  useEffect(() => {
    // Only run on client side and when user is available
    if (!isClient || !user) {
      debug('data', 'Skipping data fetch - not on client or no user', { isClient, hasUser: !!user });
      return;
    }
    
    debug('data', 'Starting to fetch vehicles for user', user.id);
    
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/vehicles?driverId=${user.id}`)
        if (!response.ok) {
          debug('data', 'Vehicle fetch failed', response.status);
          throw new Error('Failed to fetch vehicles')
        }
        
        const data = await response.json()
        debug('data', 'Vehicles fetched successfully', { count: data.length });
        setVehicles(data || [])
      } catch (err) {
        debug('data', 'Error fetching vehicles', err.message);
        setError('Failed to load vehicles.')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user, isClient])

  // Render debug info
  useEffect(() => {
    debug('render', 'Render states', { 
      isClient, 
      loading, 
      vehiclesCount: vehicles.length, 
      componentsLoaded,
      hasError: !!error
    });
  }, [isClient, loading, vehicles, componentsLoaded, error]);

  // Navigation handlers
  const handleNavigation = (path) => () => {
    debug('navigation', `Navigating to ${path}`);
    router.push(path)
  }

  // Safe component renderer
  const renderExpenseComponent = (Component, name) => {
    if (!Component) {
      debug('render', `${name} component not loaded`);
      return null;
    }

    try {
      debug('render', `Attempting to render ${name}`);
      return (
        <ErrorBoundary>
          <div className="expense-component-wrapper">
            <Component vehicles={vehicles} />
          </div>
        </ErrorBoundary>
      );
    } catch (err) {
      debug('render', `Error rendering ${name}`, err.message);
      setComponentErrors(prev => ({...prev, [name]: err.message}));
      return (
        <div className="bg-red-100 p-4 rounded-lg">
          <h3 className="text-red-800 font-bold">Error rendering {name}</h3>
          <p className="text-red-700">{err.message}</p>
        </div>
      );
    }
  };

  // Don't render anything during SSR
  if (!isClient) {
    debug('render', 'SSR rendering - returning null');
    return null;
  }

  // Redirect to login if not authenticated
  if (isClient && !user) {
    debug('auth', 'User not authenticated, redirecting to login');
    router.push('/login')
    return <LoadingSpinner />;
  }
  
  // Show loading state
  if (loading) {
    debug('render', 'Still loading - showing spinner');
    return <LoadingSpinner />;
  }

  debug('render', 'Main render path', { vehicleCount: vehicles.length });

  return (
    <div className="min-h-screen bg-white text-black pb-16">
      <Head>
        <title>Expense Management | Taxi App</title>
        <meta name="description" content="Manage your taxi expenses" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {DEBUG && (
        <div className="fixed top-2 right-2 z-50 bg-black text-white text-xs p-2 rounded opacity-70">
          Debug Mode: ON
        </div>
      )}

      {/* Header */}
      <header className="bg-black shadow-md fixed top-0 left-0 right-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <button 
            onClick={handleNavigation('/dashboard')}
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
        
        {/* Debug information */}
        {DEBUG && Object.keys(componentErrors).length > 0 && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 p-3 rounded mb-4">
            <h3 className="font-bold">Component Errors:</h3>
            <pre className="text-xs mt-2">
              {JSON.stringify(componentErrors, null, 2)}
            </pre>
          </div>
        )}

        {/* Debug information */}
        {DEBUG && (
          <div className="bg-blue-100 border border-blue-400 text-blue-800 p-3 rounded mb-4">
            <h3 className="font-bold">Debug Info:</h3>
            <pre className="text-xs mt-2">
              isClient: {isClient.toString()}<br />
              vehicles: {vehicles.length}<br />
              components loaded: {componentsLoaded.toString()}<br />
              fuel manager: {FuelExpenseManager ? "loaded" : "not loaded"}<br />
              maintenance manager: {MaintenanceExpenseManager ? "loaded" : "not loaded"}<br />
              insurance manager: {InsuranceExpenseManager ? "loaded" : "not loaded"}<br />
              other manager: {OtherExpenseManager ? "loaded" : "not loaded"}<br />
            </pre>
          </div>
        )}
        
        {/* Content based on vehicles */}
        {vehicles.length === 0 ? (
          <EmptyVehiclesState />
        ) : (
          <div className="space-y-6">
            {/* Expense Managers - each wrapped in error boundary */}
            <SafeComponentRender name="FuelExpenseManager">
              {renderExpenseComponent(FuelExpenseManager, "FuelExpenseManager")}
            </SafeComponentRender>
            
            <SafeComponentRender name="MaintenanceExpenseManager">
              {renderExpenseComponent(MaintenanceExpenseManager, "MaintenanceExpenseManager")}
            </SafeComponentRender>
            
            <SafeComponentRender name="InsuranceExpenseManager">
              {renderExpenseComponent(InsuranceExpenseManager, "InsuranceExpenseManager")}
            </SafeComponentRender>
            
            <SafeComponentRender name="OtherExpenseManager">
              {renderExpenseComponent(OtherExpenseManager, "OtherExpenseManager")}
            </SafeComponentRender>
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800 p-3 z-20">
        <div className="flex justify-around">
          <button 
            className="flex flex-col items-center text-gray-400 text-xs"
            onClick={handleNavigation('/dashboard')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span>Home</span>
          </button>
          
          <button 
            className="flex flex-col items-center text-gray-400 text-xs"
            onClick={handleNavigation('/manage-shift')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Shifts</span>
          </button>
          
          <button 
            className="flex flex-col items-center text-gray-400 text-xs"
            onClick={handleNavigation('/ride-details')}
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