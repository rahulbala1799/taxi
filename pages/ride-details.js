import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { format } from 'date-fns'

export default function RideDetails() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [rides, setRides] = useState([])
  const [shifts, setShifts] = useState([])
  const [activeShift, setActiveShift] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [stats, setStats] = useState({
    totalRides: 0,
    avgFare: 0,
    totalDistance: 0,
    totalEarnings: 0
  })
  
  // Ride form state
  const [rideForm, setRideForm] = useState({
    distance: '',
    duration: '',
    fare: '',
    tips: '',
    tollAmount: '',
    rideSource: 'WALK_IN',
    shiftId: '',
    notes: ''
  })
  
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
        fetchRides(parsedUser.id)
        fetchShifts(parsedUser.id)
        checkActiveShift(parsedUser.id)
      }
    } catch (err) {
      console.error('Error parsing user data', err)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }, [router])
  
  const fetchRides = async (userId) => {
    try {
      const res = await fetch(`/api/rides?userId=${userId}`)
      const data = await res.json()
      
      if (res.ok) {
        setRides(data)
        calculateStats(data)
      } else {
        console.error('Error fetching rides:', data.error)
      }
    } catch (error) {
      console.error('Error fetching rides:', error)
    }
  }
  
  const fetchShifts = async (userId) => {
    try {
      const res = await fetch(`/api/shifts?driverId=${userId}`)
      const data = await res.json()
      
      if (res.ok) {
        setShifts(data)
      } else {
        console.error('Error fetching shifts:', data.error)
      }
    } catch (error) {
      console.error('Error fetching shifts:', error)
    }
  }
  
  const checkActiveShift = async (userId) => {
    try {
      const res = await fetch(`/api/shifts?driverId=${userId}&status=ACTIVE`)
      const data = await res.json()
      
      if (res.ok && data.length > 0) {
        setActiveShift(data[0])
        
        // If there's an active shift, set it as the default in the form
        setRideForm(prev => ({
          ...prev,
          shiftId: data[0].id
        }))
      } else {
        setActiveShift(null)
      }
    } catch (error) {
      console.error('Error checking active shift:', error)
    }
  }
  
  const calculateStats = (ridesData) => {
    if (!ridesData || ridesData.length === 0) {
      setStats({
        totalRides: 0,
        avgFare: 0,
        totalDistance: 0,
        totalEarnings: 0
      })
      return
    }
    
    // Filter rides for the current week
    const now = new Date()
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay())
    
    const thisWeekRides = ridesData.filter(ride => {
      const rideDate = new Date(ride.date)
      return rideDate >= startOfWeek
    })
    
    const totalRides = thisWeekRides.length
    const totalEarnings = thisWeekRides.reduce((sum, ride) => sum + ride.totalEarned, 0)
    const totalDistance = thisWeekRides.reduce((sum, ride) => sum + ride.distance, 0)
    const avgFare = totalRides > 0 ? totalEarnings / totalRides : 0
    
    setStats({
      totalRides,
      avgFare,
      totalDistance,
      totalEarnings
    })
  }
  
  const handleRideChange = (e) => {
    const { name, value } = e.target
    setRideForm(prev => ({
      ...prev,
      [name]: value
    }))
  }
  
  const handleAddRide = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')
    
    try {
      if (!rideForm.distance || !rideForm.fare) {
        throw new Error('Please fill in all required fields')
      }
      
      // Prepare form data with empty values converted to zeros
      const formData = {
        ...rideForm,
        pickupLocation: 'Not specified',  // Default value
        dropoffLocation: 'Not specified', // Default value
        tips: rideForm.tips === '' ? '0' : rideForm.tips,
        tollAmount: rideForm.tollAmount === '' ? '0' : rideForm.tollAmount,
        duration: rideForm.duration === '' ? '0' : rideForm.duration,
        userId: user.id
      }
      
      const res = await fetch('/api/rides', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to add ride')
      }
      
      // Reset form and refresh rides
      setRideForm({
        distance: '',
        duration: '',
        fare: '',
        tips: '',
        tollAmount: '',
        rideSource: 'WALK_IN',
        shiftId: activeShift ? activeShift.id : '',
        notes: ''
      })
      
      setShowAddForm(false)
      fetchRides(user.id)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const assignToActiveShift = async (rideId) => {
    if (!activeShift) {
      setError('No active shift to assign ride to')
      return
    }
    
    try {
      const res = await fetch(`/api/rides/${rideId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shiftId: activeShift.id
        }),
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to assign ride to shift')
      }
      
      // Refresh rides after successful assignment
      fetchRides(user.id)
    } catch (err) {
      console.error('Error assigning ride to shift:', err)
      setError(err.message)
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
    }).format(amount)
  }
  
  const getRideSourceLabel = (source) => {
    switch (source) {
      case 'WALK_IN': return 'Walk-In';
      case 'UBER': return 'Uber';
      case 'BOLT': return 'Bolt';
      case 'FREE_NOW': return 'FreeNow';
      case 'HOLA_TAXI': return 'Hola Taxi';
      default: return source;
    }
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
        <title>Ride Details | Stijoi Million</title>
        <meta name="description" content="Manage your taxi rides" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className="bg-black shadow-md">
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
          <h1 className="text-xl font-bold text-white">Ride <span className="text-red-600">Details</span></h1>
          <div className="w-10"></div> {/* Placeholder for balance */}
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Active Shift Banner */}
        {activeShift ? (
          <div className="mb-6 bg-green-100 p-3 rounded-md border border-green-200 flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-green-500 h-2 w-2 rounded-full mr-2"></div>
              <span className="text-sm font-medium">Active Shift: {activeShift.vehicle?.make} {activeShift.vehicle?.model}</span>
            </div>
            <button 
              onClick={() => router.push('/manage-shift')}
              className="text-xs bg-black text-white px-2 py-1 rounded"
            >
              Manage
            </button>
          </div>
        ) : (
          <div className="mb-6 bg-yellow-100 p-3 rounded-md border border-yellow-200 flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-yellow-500 h-2 w-2 rounded-full mr-2"></div>
              <span className="text-sm font-medium">No active shift</span>
            </div>
            <button 
              onClick={() => router.push('/manage-shift')}
              className="text-xs bg-black text-white px-2 py-1 rounded"
            >
              Start Shift
            </button>
          </div>
        )}
        
        {/* Add New Ride Button */}
        <div className="mb-6">
          <button 
            onClick={() => setShowAddForm(true)}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-md text-sm transition duration-200 flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add New Ride
          </button>
        </div>
        
        {/* Add Ride Form */}
        {showAddForm && (
          <div className="bg-white rounded-lg shadow-md p-4 mb-6 border border-gray-200">
            <h2 className="text-lg font-bold text-black mb-4">Add New Ride</h2>
            
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}
            
            <form onSubmit={handleAddRide}>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="distance">
                    Distance (km)*
                  </label>
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.1"
                    id="distance"
                    name="distance"
                    value={rideForm.distance}
                    onChange={handleRideChange}
                    className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-600 text-base"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="duration">
                    Duration (min)
                  </label>
                  <input
                    type="number"
                    inputMode="numeric"
                    id="duration"
                    name="duration"
                    value={rideForm.duration}
                    onChange={handleRideChange}
                    className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-600 text-base"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="fare">
                    Fare (€)*
                  </label>
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    id="fare"
                    name="fare"
                    value={rideForm.fare}
                    onChange={handleRideChange}
                    className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-600 text-base"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="tips">
                    Tips (€)
                  </label>
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    id="tips"
                    name="tips"
                    value={rideForm.tips}
                    onChange={handleRideChange}
                    className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-600 text-base"
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="tollAmount">
                  Toll Amount (€)
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  id="tollAmount"
                  name="tollAmount"
                  value={rideForm.tollAmount}
                  onChange={handleRideChange}
                  className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-600 text-base"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="rideSource">
                  Ride Source
                </label>
                <select
                  id="rideSource"
                  name="rideSource"
                  value={rideForm.rideSource}
                  onChange={handleRideChange}
                  className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-600 text-base"
                >
                  <option value="WALK_IN">Walk-In</option>
                  <option value="UBER">Uber</option>
                  <option value="BOLT">Bolt</option>
                  <option value="FREE_NOW">FreeNow</option>
                  <option value="HOLA_TAXI">Hola Taxi</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="shiftId">
                  Assign to Shift
                </label>
                <select
                  id="shiftId"
                  name="shiftId"
                  value={rideForm.shiftId}
                  onChange={handleRideChange}
                  className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-600 text-base"
                >
                  <option value="">-- Not Assigned --</option>
                  {shifts.map(shift => (
                    <option key={shift.id} value={shift.id}>
                      {formatDate(shift.date)} - {shift.vehicle.make} {shift.vehicle.model}
                      {shift.status === 'ACTIVE' ? ' (Active)' : ''}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {!activeShift ? 'You have no active shift. Start a shift or assign this ride later.' : ''}
                </p>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="notes">
                  Notes
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={rideForm.notes}
                  onChange={handleRideChange}
                  className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-600 text-base"
                  rows="2"
                ></textarea>
              </div>
              
              <div className="flex justify-center space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false)
                    setError('')
                  }}
                  className="bg-gray-200 text-gray-700 px-5 py-3 rounded-md text-base font-medium"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-red-600 text-white px-5 py-3 rounded-md text-base font-medium"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Adding...' : 'Add Ride'}
                </button>
              </div>
            </form>
          </div>
        )}
        
        {/* Recent Rides */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-black">Recent Rides</h2>
            
            {/* Error message shown at the top of the list for actions like assigning to shift */}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-1 rounded text-xs">
                {error}
              </div>
            )}
          </div>
          
          {rides.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-2 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="mb-1">No rides recorded yet</p>
              <p className="text-sm">Add your first ride to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {rides.map(ride => (
                <div key={ride.id} className="bg-gray-50 p-3 rounded-md border border-gray-200">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-medium">{formatDate(ride.date)}</span>
                    <span className="text-sm bg-gray-200 px-2 py-1 rounded-full">
                      {getRideSourceLabel(ride.rideSource)}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-sm mb-3">
                    <div>
                      <p className="text-xs text-gray-500">Distance</p>
                      <p className="font-medium">{ride.distance} km</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Fare</p>
                      <p className="text-red-600 font-medium">{formatCurrency(ride.fare)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Total</p>
                      <p className="text-red-600 font-medium">{formatCurrency(ride.totalEarned)}</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    {ride.shift ? (
                      <div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        Shift: {formatDate(ride.shift.date)}
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <div className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                          No Shift Assigned
                        </div>
                        {activeShift && (
                          <button 
                            onClick={() => assignToActiveShift(ride.id)}
                            className="text-xs bg-black text-white px-2 py-1 rounded"
                          >
                            Assign to Active
                          </button>
                        )}
                      </div>
                    )}
                    
                    {ride.tollAmount > 0 && (
                      <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        Toll: {formatCurrency(ride.tollAmount)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Ride Stats */}
        <div className="bg-black rounded-lg shadow-md p-4 mb-6">
          <h2 className="text-lg font-bold text-white mb-4">This Week's Summary</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white p-3 rounded-md">
              <h4 className="text-gray-600 text-xs">Total Rides</h4>
              <p className="text-xl font-bold text-black">{stats.totalRides}</p>
            </div>
            <div className="bg-white p-3 rounded-md">
              <h4 className="text-gray-600 text-xs">Avg. Fare</h4>
              <p className="text-xl font-bold text-red-600">{formatCurrency(stats.avgFare)}</p>
            </div>
            <div className="bg-white p-3 rounded-md">
              <h4 className="text-gray-600 text-xs">Total Distance</h4>
              <p className="text-xl font-bold text-black">{stats.totalDistance.toFixed(1)} km</p>
            </div>
            <div className="bg-white p-3 rounded-md">
              <h4 className="text-gray-600 text-xs">Total Earnings</h4>
              <p className="text-xl font-bold text-red-600">{formatCurrency(stats.totalEarnings)}</p>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800 p-3">
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
            className="flex flex-col items-center text-white text-xs"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span>Rides</span>
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
        </div>
      </nav>
    </div>
  )
} 