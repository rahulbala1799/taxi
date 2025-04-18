import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [apiResponseData, setApiResponseData] = useState(null)
  const [lifetimeEarnings, setLifetimeEarnings] = useState(0)
  const [lifetimeRides, setLifetimeRides] = useState(0)
  const [lifetimeHours, setLifetimeHours] = useState(0)
  const [lifetimeAvgPerHour, setLifetimeAvgPerHour] = useState(0)
  const [todayEarnings, setTodayEarnings] = useState(0)
  const [todayRides, setTodayRides] = useState(0)
  const [todayHours, setTodayHours] = useState(0)
  const [todayTips, setTodayTips] = useState(0)
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user')
    const token = localStorage.getItem('token')

    console.log('User data from localStorage:', userData)
    console.log('Token from localStorage:', token ? 'Token exists' : 'No token')

    if (!userData || !token) {
      setError('No user data or token found. Please log in again.')
      
      // For testing/demo purposes, use a sample user ID
      // WARNING: This is only for testing - remove in production
      // In a real app, we would redirect to login
      const demoUserId = 'clpvgamrj0000v7opjg2o6xij'; 
      console.log('Using demo user ID for testing:', demoUserId);
      
      // Fetch metrics with demo user ID
      fetchLifetimeMetrics(demoUserId);
      fetchTodayMetrics(demoUserId);
      
      setLoading(false);
      return;
    }

    try {
      const parsedUser = JSON.parse(userData)
      console.log('Parsed user:', parsedUser)
      setUser(parsedUser)
      
      if (parsedUser && parsedUser.id) {
        console.log('Fetching metrics with user ID:', parsedUser.id)
        // Fetch metrics after user is set
        fetchLifetimeMetrics(parsedUser.id)
        fetchTodayMetrics(parsedUser.id)
      } else {
        setError('User ID is missing in parsed user data')
        // For demo/testing, use a fallback ID
        const fallbackId = 'clpvgamrj0000v7opjg2o6xij';
        console.log('Using fallback ID:', fallbackId);
        fetchLifetimeMetrics(fallbackId);
        fetchTodayMetrics(fallbackId);
      }
    } catch (err) {
      console.error('Error parsing user data', err)
      setError('Error parsing user data: ' + err.message)
      
      // For demo purposes, use a fallback ID
      const fallbackId = 'clpvgamrj0000v7opjg2o6xij';
      console.log('Using fallback ID after error:', fallbackId);
      fetchLifetimeMetrics(fallbackId);
      fetchTodayMetrics(fallbackId);
    } finally {
      setLoading(false)
    }
  }, [router])

  const fetchLifetimeMetrics = async (userId) => {
    try {
      console.log('Fetching lifetime metrics for user ID:', userId)
      const response = await fetch(`/api/metrics?period=all-time&driverId=${userId}`);
      const data = await response.json();
      console.log('Lifetime metrics API response:', data);
      setApiResponseData(prev => ({...prev, lifetime: data}));

      if (response.ok) {
        setLifetimeEarnings(data.earnings || 0);
        setLifetimeRides(data.rides || 0);
        setLifetimeHours(data.hours || 0);
        setLifetimeAvgPerHour(data.avgPerHour || 0);
      } else {
        setError('API error: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error fetching lifetime metrics:', error);
      setError('Error fetching lifetime metrics: ' + error.message);
    }
  }

  const fetchTodayMetrics = async (userId) => {
    try {
      console.log('Fetching today metrics for user ID:', userId)
      const response = await fetch(`/api/metrics?period=day&driverId=${userId}`);
      const data = await response.json();
      console.log('Today metrics API response:', data);
      setApiResponseData(prev => ({...prev, today: data}));
      
      if (response.ok) {
        setTodayEarnings(data.earnings || 0);
        setTodayRides(data.rides || 0);
        setTodayHours(data.hours || 0);
        setTodayTips(data.tipsPercentage > 0 ? (data.earnings * data.tipsPercentage / 100) : 0);
      } else {
        setError(prev => prev + ' | API error (today): ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error fetching today metrics:', error);
      setError(prev => prev + ' | Error fetching today metrics: ' + error.message);
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-2xl font-bold text-red-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white text-black">
      <Head>
        <title>Dashboard | Stijoy's Million Euro Journey</title>
        <meta name="description" content="Track your progress to €1,000,000" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Display any errors at the top of the page */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 m-4 rounded">
          <p>{error}</p>
        </div>
      )}

      {/* Display API response data for debugging */}
      {apiResponseData && (
        <div className="bg-gray-100 border border-gray-400 text-gray-700 px-4 py-3 m-4 rounded text-xs overflow-auto max-h-40">
          <p className="font-bold">API Response Data:</p>
          <pre>{JSON.stringify(apiResponseData, null, 2)}</pre>
        </div>
      )}

      <header className="bg-black shadow-md">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">STIJOY'S MILLION</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-white text-sm">
              Welcome, <span className="font-bold">{user?.name || 'Driver'}</span>
            </div>
            <button 
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Progress Bar */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6 border border-gray-200">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-bold text-black">Goal Progress</h2>
            <div className="bg-red-600 text-white font-bold px-3 py-1 rounded-md text-sm">
              €{lifetimeEarnings.toFixed(2)} / €1,000,000
            </div>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
            <div 
              className="bg-red-600 h-3 rounded-full" 
              style={{ width: `${Math.min((lifetimeEarnings / 1000000) * 100, 100)}%` }}
            ></div>
          </div>
          <p className="text-gray-600 text-xs">{((lifetimeEarnings / 1000000) * 100).toFixed(2)}% of your €1M goal completed</p>
        </div>
        
        {/* Main Navigation Sections */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Section 1: Manage Shift */}
          <div 
            className="bg-white rounded-lg shadow-md p-4 flex flex-col items-center justify-center border-2 border-red-600 min-h-[120px] transition-transform hover:scale-105"
            onClick={() => router.push('/manage-shift')}
          >
            <div className="text-red-600 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-black font-bold text-center">Manage Shift</h3>
          </div>
          
          {/* Section 2: Ride Details */}
          <div 
            className="bg-white rounded-lg shadow-md p-4 flex flex-col items-center justify-center border-2 border-black min-h-[120px] transition-transform hover:scale-105"
            onClick={() => router.push('/ride-details')}
          >
            <div className="text-black mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-black font-bold text-center">Ride Details</h3>
          </div>
          
          {/* Section 3: Expenses */}
          <div 
            className="bg-white rounded-lg shadow-md p-4 flex flex-col items-center justify-center border-2 border-black min-h-[120px] transition-transform hover:scale-105"
            onClick={() => router.push('/expenses')}
          >
            <div className="text-black mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <h3 className="text-black font-bold text-center">Expenses</h3>
          </div>
          
          {/* Section 4: Metrics */}
          <div 
            className="bg-white rounded-lg shadow-md p-4 flex flex-col items-center justify-center border-2 border-red-600 min-h-[120px] transition-transform hover:scale-105"
            onClick={() => router.push('/metrics')}
          >
            <div className="text-red-600 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-black font-bold text-center">Metrics</h3>
          </div>
          
          {/* Section 5: Manage Vehicles */}
          <div 
            className="bg-white rounded-lg shadow-md p-4 flex flex-col items-center justify-center border-2 border-red-600 min-h-[120px] transition-transform hover:scale-105 col-span-2"
            onClick={() => router.push('/vehicles')}
          >
            <div className="text-red-600 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 17l-1.5-1.5M13 17l1.5-1.5M6 12l-1-1M18 12l1-1M12 7v3M15 10h-3" />
              </svg>
            </div>
            <h3 className="text-black font-bold text-center">Manage Vehicles</h3>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="bg-black rounded-lg shadow-md p-4 mb-6">
          <h3 className="text-white font-bold mb-3 text-center">Today's Overview</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white p-3 rounded-md">
              <h4 className="text-gray-600 text-xs">Earnings</h4>
              <p className="text-xl font-bold text-red-600">€{todayEarnings.toFixed(2)}</p>
            </div>
            <div className="bg-white p-3 rounded-md">
              <h4 className="text-gray-600 text-xs">Rides</h4>
              <p className="text-xl font-bold text-black">{todayRides}</p>
            </div>
            <div className="bg-white p-3 rounded-md">
              <h4 className="text-gray-600 text-xs">Hours</h4>
              <p className="text-xl font-bold text-black">{todayHours.toFixed(1)}</p>
            </div>
            <div className="bg-white p-3 rounded-md">
              <h4 className="text-gray-600 text-xs">Tips</h4>
              <p className="text-xl font-bold text-red-600">€{todayTips.toFixed(2)}</p>
            </div>
          </div>
        </div>
        
        {/* Lifetime Stats */}
        <div className="bg-red-600 rounded-lg shadow-md p-4 mb-6">
          <h3 className="text-white font-bold mb-3 text-center">Lifetime Stats</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white p-3 rounded-md">
              <h4 className="text-gray-600 text-xs">Total Earnings</h4>
              <p className="text-xl font-bold text-red-600">€{lifetimeEarnings.toFixed(2)}</p>
            </div>
            <div className="bg-white p-3 rounded-md">
              <h4 className="text-gray-600 text-xs">Total Rides</h4>
              <p className="text-xl font-bold text-black">{lifetimeRides}</p>
            </div>
            <div className="bg-white p-3 rounded-md">
              <h4 className="text-gray-600 text-xs">Total Hours</h4>
              <p className="text-xl font-bold text-black">{lifetimeHours.toFixed(1)}</p>
            </div>
            <div className="bg-white p-3 rounded-md">
              <h4 className="text-gray-600 text-xs">Avg/Hour</h4>
              <p className="text-xl font-bold text-red-600">€{lifetimeAvgPerHour.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800 p-3">
        <div className="flex justify-around">
          <button 
            className="flex flex-col items-center text-white text-xs"
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
            onClick={() => router.push('/metrics')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span>Stats</span>
          </button>
          <button 
            className="flex flex-col items-center text-gray-400 text-xs"
            onClick={() => router.push('/profile')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>Profile</span>
          </button>
        </div>
      </nav>
    </div>
  )
} 