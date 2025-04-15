import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
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
    } catch (err) {
      console.error('Error parsing user data', err)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white flex items-center justify-center">
        <div className="text-2xl font-bold text-yellow-400">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <Head>
        <title>Dashboard | Stijoi Stephen Taxi Millionaire</title>
        <meta name="description" content="Track your progress to €1,000,000" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className="bg-gray-800 shadow-md">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-yellow-400">Stijoi Stephen Taxi Millionaire</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-white">
              Welcome, <span className="font-bold">{user?.name || 'Driver'}</span>
            </div>
            <button 
              onClick={handleLogout}
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Your Progress</h2>
            <div className="bg-yellow-500 text-gray-900 font-bold px-4 py-2 rounded-md">
              €0 / €1,000,000
            </div>
          </div>
          
          <div className="w-full bg-gray-700 rounded-full h-4 mb-2">
            <div className="bg-yellow-500 h-4 rounded-full" style={{ width: '0%' }}></div>
          </div>
          <p className="text-gray-400 text-sm">0% of your goal completed</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-white mb-4">Add New Ride</h3>
            <p className="text-gray-400 mb-4">Record your Tesla taxi ride details to track your progress.</p>
            <button className="w-full bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-2 px-4 rounded">
              Add Ride
            </button>
          </div>
          
          <div className="bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-white mb-4">Recent Activity</h3>
            <div className="text-center py-8 text-gray-400">
              <p>No rides recorded yet.</p>
              <p>Start adding your Tesla taxi rides to track your progress!</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-white mb-4">Earnings Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-700 p-4 rounded-md">
              <h4 className="text-gray-400 text-sm">Today's Earnings</h4>
              <p className="text-2xl font-bold text-white">€0</p>
            </div>
            <div className="bg-gray-700 p-4 rounded-md">
              <h4 className="text-gray-400 text-sm">This Week</h4>
              <p className="text-2xl font-bold text-white">€0</p>
            </div>
            <div className="bg-gray-700 p-4 rounded-md">
              <h4 className="text-gray-400 text-sm">This Month</h4>
              <p className="text-2xl font-bold text-white">€0</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="text-center py-8 text-gray-400">
        <p>© {new Date().getFullYear()} Stijoi Stephen Taxi Millionaire. All rights reserved.</p>
      </footer>
    </div>
  )
} 