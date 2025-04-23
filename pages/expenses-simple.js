import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '../components/Layout'
import MobileNavBar from '../components/MobileNavBar'
import SimpleFuelExpenseManager from '../components/SimpleFuelExpenseManager'
import ErrorBoundary from '../components/ErrorBoundary'

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

export default function ExpensesSimple() {
  DEBUG.log('ExpensesSimple', 'FUNCTION_START', 'Component function started');
  
  const router = useRouter()
  DEBUG.log('ExpensesSimple', 'ROUTER', router?.pathname);
  
  const [isClient, setIsClient] = useState(false)
  const [loading, setLoading] = useState(true)
  const [vehicles, setVehicles] = useState([])
  const [renderError, setRenderError] = useState(null)
  
  DEBUG.log('ExpensesSimple', 'INITIAL_STATE', { isClient, loading, vehiclesLength: vehicles.length, renderError });
  
  // Set isClient to true on component mount
  useEffect(() => {
    DEBUG.log('ExpensesSimple', 'CLIENT_EFFECT_START', { isClient });
    
    try {
      setIsClient(true)
      DEBUG.log('ExpensesSimple', 'CLIENT_EFFECT_DONE', 'isClient set to true');
    } catch (error) {
      DEBUG.error('ExpensesSimple', 'CLIENT_EFFECT_ERROR', error);
      setRenderError(error.message);
    }
  }, [])
  
  // Fetch vehicles from API
  useEffect(() => {
    if (!isClient) {
      DEBUG.log('ExpensesSimple', 'VEHICLES_EFFECT_SKIP', 'Not client yet, skipping');
      return;
    }
    
    DEBUG.log('ExpensesSimple', 'VEHICLES_EFFECT_START', { isClient });
    
    async function fetchVehicles() {
      try {
        // For demo purposes, we're using static data
        // In a real app, this would be fetched from an API
        DEBUG.log('ExpensesSimple', 'FETCH_VEHICLES_START', 'Starting timeout');
        
        setTimeout(() => {
          try {
            const mockVehicles = [
              { id: 'v1', model: 'Toyota Camry', licensePlate: '211-D-12345', fuelType: 'Petrol' },
              { id: 'v2', model: 'Ford Transit', licensePlate: '191-D-54321', fuelType: 'Diesel' },
              { id: 'v3', model: 'Tesla Model 3', licensePlate: '221-D-98765', fuelType: 'Electric' }
            ];
            
            DEBUG.log('ExpensesSimple', 'VEHICLES_DATA', mockVehicles);
            setVehicles(mockVehicles);
            setLoading(false);
            DEBUG.log('ExpensesSimple', 'VEHICLES_SET', { vehiclesLength: mockVehicles.length, loading: false });
          } catch (err) {
            DEBUG.error('ExpensesSimple', 'SET_VEHICLES_ERROR', err);
            setRenderError(err.message);
            setLoading(false);
          }
        }, 1000)
      } catch (error) {
        DEBUG.error('ExpensesSimple', 'FETCH_VEHICLES_ERROR', error);
        setRenderError(error.message);
        setLoading(false);
      }
    }
    
    fetchVehicles();
  }, [isClient])

  // Add debug checks before renders
  DEBUG.log('ExpensesSimple', 'PRE_RENDER_CHECK', { 
    isClient, 
    loading, 
    vehiclesLength: vehicles.length,
    renderError,
    pathName: router?.pathname 
  });

  // If we're still on the server, show fallback to avoid hydration errors
  if (!isClient) {
    const serverRender = (
      <div suppressHydrationWarning>
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <div className="p-4 text-center">
            <p className="text-gray-500">Loading...</p>
          </div>
        </div>
      </div>
    );
    DEBUG.log('ExpensesSimple', 'SERVER_RENDER', { isNull: serverRender === null, isUndefined: serverRender === undefined });
    return DEBUG.render('ExpensesSimple', serverRender);
  }

  // Error state
  if (renderError) {
    const errorRender = (
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
    DEBUG.log('ExpensesSimple', 'ERROR_RENDER', { error: renderError });
    return DEBUG.render('ExpensesSimple', errorRender);
  }

  // Main render
  const mainRender = (
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
              (() => {
                DEBUG.log('ExpensesSimple', 'CONDITIONAL_RENDER', { 
                  vehiclesExist: !!vehicles, 
                  vehiclesLength: vehicles?.length || 0 
                });
                
                if (vehicles && vehicles.length > 0) {
                  DEBUG.log('ExpensesSimple', 'RENDERING_MANAGER', { vehicleCount: vehicles.length });
                  return <SimpleFuelExpenseManager vehicles={vehicles} />;
                } else {
                  DEBUG.log('ExpensesSimple', 'RENDERING_EMPTY', 'No vehicles available');
                  return (
                    <div className="p-8 bg-white rounded-xl shadow-lg text-center">
                      <p className="text-gray-600">No vehicles available.</p>
                    </div>
                  );
                }
              })()
            )}
          </ErrorBoundary>
        </div>
        
        <MobileNavBar activeItem="expenses" />
      </div>
    </Layout>
  );
  
  DEBUG.log('ExpensesSimple', 'MAIN_RENDER', { isNull: mainRender === null, isUndefined: mainRender === undefined });
  return DEBUG.render('ExpensesSimple', mainRender);
} 