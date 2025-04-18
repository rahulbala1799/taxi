import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { format } from 'date-fns'
import { useAuth } from '../lib/auth'

export default function ManageShift() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [vehicles, setVehicles] = useState([])
  const [activeShift, setActiveShift] = useState(null)
  const [shifts, setShifts] = useState([])
  const [showStartForm, setShowStartForm] = useState(false)
  const [showEndForm, setShowEndForm] = useState(false)
  const [error, setError] = useState('')
  const [debugInfo, setDebugInfo] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Edit shift state
  const [showEditForm, setShowEditForm] = useState(false)
  const [currentShiftToEdit, setCurrentShiftToEdit] = useState(null)
  
  // Delete shift state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [currentShiftToDelete, setCurrentShiftToDelete] = useState(null)
  const [deleteAssociatedRides, setDeleteAssociatedRides] = useState(false)
  
  // Start shift form state
  const [startForm, setStartForm] = useState({
    vehicleId: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    startTime: format(new Date(), 'HH:mm'),
    startRange: ''
  })
  
  // End shift form state
  const [endForm, setEndForm] = useState({
    endTime: format(new Date(), 'HH:mm'),
    endRange: ''
  })
  
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (!user) {
          console.log('No user found, checking localStorage')
          // Try to get user data from localStorage
          const userData = localStorage.getItem('user')
          if (userData) {
            console.log('Found user data in localStorage')
            const parsedUser = JSON.parse(userData)
            if (parsedUser && parsedUser.id) {
              console.log('Using user from localStorage:', parsedUser.id)
              await loadData(parsedUser.id)
            } else {
              setError('No valid user found in localStorage')
              setLoading(false)
            }
          } else {
            // No user data found, show login message
            setError('Please log in to manage shifts')
            setLoading(false)
          }
          return
        }
        
        // Load data when user is available from auth context
        if (user && user.id) {
          console.log('User from auth context:', user.id)
          await loadData(user.id)
        }
      } catch (err) {
        console.error('Error in auth check:', err)
        setError('Error checking authentication: ' + err.message)
        setLoading(false)
      }
    }
    
    checkAuth()
  }, [user])
  
  const loadData = async (userId) => {
    try {
      await Promise.all([
        fetchVehicles(userId),
        fetchShifts(userId),
        checkActiveShift(userId)
      ])
    } catch (err) {
      console.error('Error loading data:', err)
      setError('Error loading data: ' + err.message)
    } finally {
      setLoading(false)
    }
  }
  
  const fetchVehicles = async (userId) => {
    try {
      console.log('Fetching vehicles for user:', userId)
      const res = await fetch(`/api/vehicles?driverId=${userId}`)
      const data = await res.json()
      
      if (res.ok) {
        console.log('Vehicles fetched:', data)
        setVehicles(data)
        // Set the first vehicle as default if available
        if (data.length > 0) {
          setStartForm(prev => ({
            ...prev,
            vehicleId: data[0].id
          }))
        }
      } else {
        console.error('Error fetching vehicles:', data.message)
        setError('Error fetching vehicles: ' + data.message)
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error)
      setError('Error fetching vehicles: ' + error.message)
      return Promise.reject(error)
    }
  }
  
  const fetchShifts = async (driverId) => {
    try {
      console.log('Fetching shifts for user:', driverId)
      const res = await fetch(`/api/shifts?driverId=${driverId}`)
      
      if (!res.ok) {
        const errorData = await res.json()
        console.error('Error fetching shifts:', errorData)
        setError(`Error fetching shifts: ${errorData.message || res.statusText}`)
        return Promise.reject(new Error(`Error fetching shifts: ${errorData.message || res.statusText}`))
      }
      
      const data = await res.json()
      console.log('Shifts fetched:', data)
      setDebugInfo(prev => ({...prev, shifts: data}))
      
      // Get shifts that are not active (completed or cancelled)
      const completedShifts = data.filter(shift => shift.status !== 'ACTIVE')
      setShifts(completedShifts)
      
      // For debugging - count statuses
      const statuses = {}
      data.forEach(shift => {
        statuses[shift.status] = (statuses[shift.status] || 0) + 1
      })
      console.log('Shift statuses:', statuses)
      
      return Promise.resolve()
    } catch (error) {
      console.error('Error fetching shifts:', error)
      setError('Error fetching shifts: ' + error.message)
      return Promise.reject(error)
    }
  }
  
  const checkActiveShift = async (driverId) => {
    try {
      console.log('Checking active shift for user:', driverId)
      const res = await fetch(`/api/shifts?driverId=${driverId}&status=ACTIVE`)
      
      if (!res.ok) {
        const errorData = await res.json()
        setError(`Error checking active shift: ${errorData.message || res.statusText}`)
        return Promise.reject(new Error(`Error checking active shift: ${errorData.message || res.statusText}`))
      }
      
      const data = await res.json()
      setDebugInfo(prev => ({...prev, activeShiftCheck: data}))
      
      if (data.length > 0) {
        console.log('Active shift found:', data[0])
        setActiveShift(data[0])
      } else {
        console.log('No active shift found')
        setActiveShift(null)
      }
      
      return Promise.resolve()
    } catch (error) {
      console.error('Error checking active shift:', error)
      setError('Error checking active shift: ' + error.message)
      return Promise.reject(error)
    }
  }
  
  const handleStartChange = (e) => {
    const { name, value } = e.target
    setStartForm(prev => ({
      ...prev,
      [name]: value
    }))
  }
  
  const handleEndChange = (e) => {
    const { name, value } = e.target
    setEndForm(prev => ({
      ...prev,
      [name]: value
    }))
  }
  
  const handleStartShift = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')
    
    try {
      if (!startForm.vehicleId) {
        throw new Error('Please select a vehicle')
      }
      
      // Find the selected vehicle to check if it's electric
      const selectedVehicle = vehicles.find(v => v.id === startForm.vehicleId)
      if (selectedVehicle && selectedVehicle.fuelType === 'Electric' && !startForm.startRange) {
        throw new Error('Starting range is required for electric vehicles')
      }
      
      const res = await fetch('/api/shifts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          driverId: user.id,
          vehicleId: startForm.vehicleId,
          date: startForm.date,
          startTime: startForm.startTime,
          startRange: startForm.startRange
        }),
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to start shift')
      }
      
      // Update active shift
      setActiveShift(data)
      setShowStartForm(false)
      
      // Reset form
      setStartForm({
        vehicleId: vehicles.length > 0 ? vehicles[0].id : '',
        date: format(new Date(), 'yyyy-MM-dd'),
        startTime: format(new Date(), 'HH:mm'),
        startRange: ''
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const handleEndShift = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')
    
    try {
      if (!activeShift) {
        throw new Error('No active shift found')
      }
      
      // Check if end range is required (for electric vehicles)
      if (
        activeShift.vehicle && 
        activeShift.vehicle.fuelType === 'Electric' && 
        !endForm.endRange && 
        endForm.endRange !== '0'
      ) {
        throw new Error('Ending range is required for electric vehicles')
      }
      
      const res = await fetch(`/api/shifts/${activeShift.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          endTime: endForm.endTime,
          endRange: endForm.endRange,
          status: 'COMPLETED'
        }),
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to end shift')
      }
      
      // Update shifts lists
      setActiveShift(null)
      setShifts(prev => [data, ...prev])
      setShowEndForm(false)
      
      // Reset form
      setEndForm({
        endTime: format(new Date(), 'HH:mm'),
        endRange: ''
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const handleEditShift = (shift) => {
    setCurrentShiftToEdit(shift)
    setShowEditForm(true)
  }
  
  const handleDeleteShift = (shift) => {
    setCurrentShiftToDelete(shift)
    setDeleteAssociatedRides(false)
    setShowDeleteConfirm(true)
  }
  
  const confirmDeleteShift = async () => {
    setIsSubmitting(true)
    setError('')
    
    try {
      if (!currentShiftToDelete) {
        throw new Error('No shift selected for deletion')
      }
      
      // First handle associated rides based on user choice
      if (currentShiftToDelete.rides && currentShiftToDelete.rides.length > 0) {
        if (deleteAssociatedRides) {
          // Delete all rides associated with this shift
          await Promise.all(currentShiftToDelete.rides.map(ride => 
            fetch(`/api/rides/${ride.id}`, {
              method: 'DELETE'
            })
          ))
        } else {
          // Unassign rides from the shift (set shiftId to null)
          await Promise.all(currentShiftToDelete.rides.map(ride => 
            fetch(`/api/rides/${ride.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ shiftId: null })
            })
          ))
        }
      }
      
      // Delete the shift
      const res = await fetch(`/api/shifts/${currentShiftToDelete.id}`, {
        method: 'DELETE'
      })
      
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to delete shift')
      }
      
      // Update shifts list
      setShifts(shifts.filter(shift => shift.id !== currentShiftToDelete.id))
      setShowDeleteConfirm(false)
      setCurrentShiftToDelete(null)
      
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const handleEditSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')
    
    try {
      if (!currentShiftToEdit) {
        throw new Error('No shift selected for editing')
      }
      
      // Get form data from the event
      const formData = new FormData(e.target)
      const data = Object.fromEntries(formData)
      
      // Prepare update data
      const updateData = {
        notes: data.notes
      }
      
      // Add date if it was changed
      if (data.date) {
        updateData.date = new Date(data.date)
      }
      
      // Add times if they were provided
      if (data.startTime) {
        // We need the date component from the shift's original startTime
        const originalStartDate = new Date(currentShiftToEdit.startTime)
        const [hours, minutes] = data.startTime.split(':').map(Number)
        
        const newStartTime = new Date(originalStartDate)
        newStartTime.setHours(hours, minutes, 0, 0)
        
        updateData.startTime = newStartTime
      }
      
      if (data.endTime) {
        // We need the date component from the shift's original endTime or startTime
        const baseDate = currentShiftToEdit.endTime 
          ? new Date(currentShiftToEdit.endTime) 
          : new Date(currentShiftToEdit.startTime)
          
        const [hours, minutes] = data.endTime.split(':').map(Number)
        
        const newEndTime = new Date(baseDate)
        newEndTime.setHours(hours, minutes, 0, 0)
        
        // If end time is before start time, adjust to the next day
        const startTime = new Date(currentShiftToEdit.startTime)
        if (newEndTime < startTime) {
          newEndTime.setDate(newEndTime.getDate() + 1)
        }
        
        updateData.endTime = newEndTime
      }
      
      // Update the shift
      const res = await fetch(`/api/shifts/${currentShiftToEdit.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      })
      
      const updatedShift = await res.json()
      
      if (!res.ok) {
        throw new Error(updatedShift.error || 'Failed to update shift')
      }
      
      // Update shifts list
      setShifts(shifts.map(shift => 
        shift.id === updatedShift.id ? { ...shift, ...updatedShift } : shift
      ))
      
      setShowEditForm(false)
      setCurrentShiftToEdit(null)
      
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const formatDuration = (start, end) => {
    if (!start || !end) return '-'
    
    const startTime = new Date(start)
    const endTime = new Date(end)
    const diffMs = endTime - startTime
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    
    return `${diffHrs}h ${diffMins}m`
  }
  
  const formatDate = (dateString) => {
    if (!dateString) return '-'
    
    const date = new Date(dateString)
    return format(date, 'MMM d, yyyy')
  }
  
  const formatTime = (dateString) => {
    if (!dateString) return '-'
    
    const date = new Date(dateString)
    return format(date, 'h:mm a')
  }

  // Add a format currency function
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2
    }).format(amount || 0);
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
        <title>Manage Shift | Stijoy's Million Euro Journey</title>
        <meta name="description" content="Manage your taxi shift" />
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
          <h1 className="text-xl font-bold text-white">Manage <span className="text-red-600">Shift</span></h1>
          <div className="w-10"></div> {/* Placeholder for balance */}
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Current Shift Status */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6 border border-gray-200">
          <h2 className="text-lg font-bold text-black mb-4">Current Shift Status</h2>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          <div className="flex justify-center mb-4">
            <div className={`text-white text-sm font-bold px-4 py-2 rounded-full ${activeShift ? 'bg-green-600' : 'bg-red-600'}`}>
              {activeShift ? 'On Shift' : 'Not On Shift'}
            </div>
          </div>
          
          {activeShift ? (
            <div className="mb-4">
              <div className="bg-gray-100 p-4 rounded-md mb-4">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs text-gray-500">Vehicle</p>
                    <p className="font-medium">{activeShift.vehicle?.model || '-'} ({activeShift.vehicle?.licensePlate || '-'})</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Started</p>
                    <p className="font-medium">{formatTime(activeShift.startTime)}</p>
                  </div>
                  {activeShift.vehicle?.fuelType === 'Electric' && (
                    <div>
                      <p className="text-xs text-gray-500">Starting Range</p>
                      <p className="font-medium">{activeShift.startRange} km</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-gray-500">Date</p>
                    <p className="font-medium">{formatDate(activeShift.date)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Current Earnings</p>
                    <p className="font-medium text-green-600">{formatCurrency(activeShift.totalEarnings)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Rides</p>
                    <p className="font-medium">{activeShift.rides ? activeShift.rides.length : 0}</p>
                  </div>
                </div>
              </div>
              <div className="flex justify-center">
                {showEndForm ? (
                  <form onSubmit={handleEndShift} className="w-full max-w-md">
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="endTime">
                        End Time
                      </label>
                      <input
                        type="time"
                        id="endTime"
                        name="endTime"
                        value={endForm.endTime}
                        onChange={handleEndChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-600"
                        required
                      />
                    </div>
                    
                    {activeShift.vehicle?.fuelType === 'Electric' && (
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="endRange">
                          End Range (km)
                        </label>
                        <input
                          type="number"
                          id="endRange"
                          name="endRange"
                          value={endForm.endRange}
                          onChange={handleEndChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-600"
                          placeholder="Enter the final range"
                          required
                        />
                      </div>
                    )}
                    
                    <div className="flex justify-center space-x-2">
                      <button
                        type="button"
                        onClick={() => setShowEndForm(false)}
                        className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium"
                        disabled={isSubmitting}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Ending...' : 'End Shift'}
                      </button>
                    </div>
                  </form>
                ) : (
                  <button 
                    onClick={() => setShowEndForm(true)}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-md text-sm transition duration-200"
                  >
                    End Shift
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              {showStartForm ? (
                <form onSubmit={handleStartShift} className="w-full max-w-md">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="vehicleId">
                      Vehicle
                    </label>
                    <select
                      id="vehicleId"
                      name="vehicleId"
                      value={startForm.vehicleId}
                      onChange={handleStartChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-600"
                      required
                    >
                      <option value="">Select Vehicle</option>
                      {vehicles.map(vehicle => (
                        <option key={vehicle.id} value={vehicle.id}>
                          {vehicle.model} - {vehicle.licensePlate}
                        </option>
                      ))}
                    </select>
                    {vehicles.length === 0 && (
                      <p className="text-xs text-red-500 mt-1">
                        No vehicles found. Please add a vehicle first.
                      </p>
                    )}
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="date">
                      Date
                    </label>
                    <input
                      type="date"
                      id="date"
                      name="date"
                      value={startForm.date}
                      onChange={handleStartChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-600"
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="startTime">
                      Start Time
                    </label>
                    <input
                      type="time"
                      id="startTime"
                      name="startTime"
                      value={startForm.startTime}
                      onChange={handleStartChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-600"
                      required
                    />
                  </div>
                  
                  {startForm.vehicleId && vehicles.find(v => v.id === startForm.vehicleId)?.fuelType === 'Electric' && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="startRange">
                        Starting Range (km)
                      </label>
                      <input
                        type="number"
                        id="startRange"
                        name="startRange"
                        value={startForm.startRange}
                        onChange={handleStartChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-600"
                        placeholder="Enter the current range"
                        required
                      />
                    </div>
                  )}
                  
                  <div className="flex justify-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowStartForm(false)}
                      className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium"
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-black text-white px-4 py-2 rounded-md text-sm font-medium"
                      disabled={isSubmitting || vehicles.length === 0}
                    >
                      {isSubmitting ? 'Starting...' : 'Start Shift'}
                    </button>
                  </div>
                </form>
              ) : (
                <button 
                  onClick={() => setShowStartForm(true)}
                  className="bg-black hover:bg-gray-800 text-white font-bold py-3 px-8 rounded-md text-sm transition duration-200"
                  disabled={vehicles.length === 0}
                >
                  Start Shift
                </button>
              )}
            </div>
          )}
        </div>
        
        {/* Recent Shifts */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6 border border-gray-200">
          <h2 className="text-lg font-bold text-black mb-4">Recent Shifts</h2>
          
          {shifts.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-2 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="mb-1">No recent shifts</p>
              <p className="text-sm">Your shift history will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {shifts.slice(0, 5).map(shift => (
                <div key={shift.id} className="bg-gray-50 p-3 rounded-md border border-gray-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">{formatDate(shift.date)}</span>
                    <div className="flex space-x-2">
                      <span className="text-sm bg-gray-200 px-2 py-1 rounded-full">
                        {formatDuration(shift.startTime, shift.endTime)}
                      </span>
                      <button 
                        onClick={() => handleEditShift(shift)}
                        className="text-blue-600 p-1"
                        aria-label="Edit shift"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button 
                        onClick={() => handleDeleteShift(shift)}
                        className="text-red-600 p-1"
                        aria-label="Delete shift"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-xs text-gray-500">Vehicle</p>
                      <p>{shift.vehicle?.model} ({shift.vehicle?.licensePlate})</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Time</p>
                      <p>{formatTime(shift.startTime)} - {formatTime(shift.endTime)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Earnings</p>
                      <p className="text-green-600 font-medium">{formatCurrency(shift.totalEarnings)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Rides</p>
                      <p>{shift.rides ? shift.rides.length : 0}</p>
                    </div>
                    {shift.vehicle?.fuelType === 'Electric' && (
                      <div className="col-span-2">
                        <p className="text-xs text-gray-500">Range</p>
                        <p>{shift.startRange || '-'} km → {shift.endRange || '-'} km</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Shift Settings */}
        <div className="bg-black rounded-lg shadow-md p-4 mb-6">
          <h2 className="text-lg font-bold text-white mb-4">Shift Settings</h2>
          
          <div className="bg-white p-4 rounded-md mb-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Auto-End Shift</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
              </label>
            </div>
            <p className="text-xs text-gray-500">Automatically end your shift after 12 hours</p>
          </div>
          
          <div className="bg-white p-4 rounded-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Break Reminders</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
              </label>
            </div>
            <p className="text-xs text-gray-500">Get reminders to take breaks every 4 hours</p>
          </div>
        </div>
      </main>

      {/* Edit Shift Modal */}
      {showEditForm && currentShiftToEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">Edit Shift</h2>
            
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}
            
            <form onSubmit={handleEditSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="date">
                  Date
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  defaultValue={currentShiftToEdit.date ? format(new Date(currentShiftToEdit.date), 'yyyy-MM-dd') : ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-600"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="startTime">
                  Start Time
                </label>
                <input
                  type="time"
                  id="startTime"
                  name="startTime"
                  defaultValue={currentShiftToEdit.startTime ? format(new Date(currentShiftToEdit.startTime), 'HH:mm') : ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-600"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="endTime">
                  End Time
                </label>
                <input
                  type="time"
                  id="endTime"
                  name="endTime"
                  defaultValue={currentShiftToEdit.endTime ? format(new Date(currentShiftToEdit.endTime), 'HH:mm') : ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-600"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="notes">
                  Notes
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  rows="3"
                  defaultValue={currentShiftToEdit.notes || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-600"
                  placeholder="Add notes about this shift"
                ></textarea>
              </div>
              
              <div className="flex justify-end space-x-2 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditForm(false)
                    setCurrentShiftToEdit(null)
                  }}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-black text-white px-4 py-2 rounded-md text-sm font-medium"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && currentShiftToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-2">Delete Shift</h2>
            <p className="text-gray-600 mb-4">Are you sure you want to delete this shift?</p>
            
            {currentShiftToDelete.rides && currentShiftToDelete.rides.length > 0 && (
              <div className="mb-4">
                <p className="text-gray-600 mb-2">This shift has {currentShiftToDelete.rides.length} associated ride(s).</p>
                <div className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    id="deleteRides"
                    checked={deleteAssociatedRides}
                    onChange={() => setDeleteAssociatedRides(!deleteAssociatedRides)}
                    className="h-4 w-4 text-red-600 rounded"
                  />
                  <label htmlFor="deleteRides" className="ml-2 text-sm text-gray-700">
                    Delete associated rides
                  </label>
                </div>
                <p className="text-sm text-gray-500 italic">
                  {deleteAssociatedRides 
                    ? "Associated rides will be permanently deleted." 
                    : "Associated rides will be unassigned from this shift for later reassignment."}
                </p>
              </div>
            )}
            
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}
            
            <div className="flex justify-end space-x-2 mt-6">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteConfirm(false)
                  setCurrentShiftToDelete(null)
                }}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteShift}
                className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Deleting...' : 'Delete Shift'}
              </button>
            </div>
          </div>
        </div>
      )}

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
          <button className="flex flex-col items-center text-white text-xs">
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