import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import prisma from '../lib/prisma'

export default function Vehicles() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [vehicles, setVehicles] = useState([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    registrationNumber: '',
    fuelType: 'Electric',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
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
      
      // Fetch user's vehicles when component mounts
      fetchVehicles(parsedUser.id)
    } catch (err) {
      console.error('Error parsing user data', err)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }, [router])

  const fetchVehicles = async (userId) => {
    try {
      const res = await fetch(`/api/vehicles?userId=${userId}`)
      const data = await res.json()
      
      if (res.ok) {
        setVehicles(data)
      } else {
        console.error('Error fetching vehicles:', data.message)
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      // Validate form
      if (!formData.registrationNumber) {
        throw new Error('Vehicle registration number is required')
      }

      const res = await fetch('/api/vehicles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          userId: user.id,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || 'Something went wrong')
      }

      // Reset form and update vehicles list
      setFormData({
        name: '',
        registrationNumber: '',
        fuelType: 'Electric',
      })
      setShowAddForm(false)
      fetchVehicles(user.id)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (vehicleId) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      try {
        const res = await fetch(`/api/vehicles/${vehicleId}`, {
          method: 'DELETE',
        })

        if (res.ok) {
          // Remove vehicle from list
          setVehicles(vehicles.filter(v => v.id !== vehicleId))
        } else {
          const data = await res.json()
          alert(data.message || 'Error deleting vehicle')
        }
      } catch (error) {
        console.error('Error deleting vehicle:', error)
        alert('Error deleting vehicle')
      }
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
        <title>Manage Vehicles | Stijoi Million</title>
        <meta name="description" content="Manage your taxi vehicles" />
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
          <h1 className="text-xl font-bold text-white">Manage <span className="text-red-600">Vehicles</span></h1>
          <div className="w-10"></div> {/* Placeholder for balance */}
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Add New Vehicle Button */}
        {!showAddForm && (
          <div className="mb-6">
            <button 
              onClick={() => setShowAddForm(true)}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-md text-sm transition duration-200 flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add New Vehicle
            </button>
          </div>
        )}
        
        {/* Add Vehicle Form */}
        {showAddForm && (
          <div className="bg-white rounded-lg shadow-md p-4 mb-6 border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-black">Add New Vehicle</h2>
              <button 
                onClick={() => setShowAddForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="name">
                  Vehicle Name (Optional)
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-600"
                  placeholder="e.g. Tesla Model Y"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="registrationNumber">
                  Registration Number *
                </label>
                <input
                  type="text"
                  id="registrationNumber"
                  name="registrationNumber"
                  value={formData.registrationNumber}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-600"
                  placeholder="e.g. 123 ABC"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="fuelType">
                  Fuel Type
                </label>
                <select
                  id="fuelType"
                  name="fuelType"
                  value={formData.fuelType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-600"
                >
                  <option value="Electric">Electric</option>
                  <option value="Petrol">Petrol</option>
                  <option value="Diesel">Diesel</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="mr-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Adding...' : 'Add Vehicle'}
                </button>
              </div>
            </form>
          </div>
        )}
        
        {/* Vehicles List */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6 border border-gray-200">
          <h2 className="text-lg font-bold text-black mb-4">Your Vehicles</h2>
          
          {vehicles.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-2 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 17l-1.5-1.5M13 17l1.5-1.5M6 12l-1-1M18 12l1-1M12 7v3M15 10h-3" />
              </svg>
              <p className="mb-1">No vehicles added yet</p>
              <p className="text-sm">Add your first vehicle to get started</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-2 text-left font-medium text-gray-700">Name</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">Registration</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">Fuel Type</th>
                    <th className="px-4 py-2 text-right font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {vehicles.map((vehicle) => (
                    <tr key={vehicle.id} className="border-b border-gray-200">
                      <td className="px-4 py-3">{vehicle.name || '-'}</td>
                      <td className="px-4 py-3 font-medium">{vehicle.registrationNumber}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                          vehicle.fuelType === 'Electric' ? 'bg-green-100 text-green-800' :
                          vehicle.fuelType === 'Hybrid' ? 'bg-blue-100 text-blue-800' :
                          vehicle.fuelType === 'Petrol' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {vehicle.fuelType}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleDelete(vehicle.id)}
                          className="text-red-600 hover:text-red-800"
                          aria-label="Delete vehicle"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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
          <button className="flex flex-col items-center text-gray-400 text-xs">
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
          <button className="flex flex-col items-center text-gray-400 text-xs">
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