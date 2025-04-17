import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useAuth } from '../lib/auth'

export default function Profile() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      setLoading(true)
      return
    }
    
    setLoading(false)
  }, [user])

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
        <title>Profile | Stijoi Million</title>
        <meta name="description" content="Your profile" />
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
          <h1 className="text-xl font-bold text-white"><span className="text-red-600">Profile</span></h1>
          <div className="w-10"></div> {/* Placeholder for balance */}
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-200">
          <div className="flex items-center justify-center mb-6">
            <div className="h-24 w-24 bg-red-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
          </div>
          
          <h2 className="text-xl font-bold text-black text-center mb-6">{user?.name || 'User'}</h2>
          
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="text-sm text-gray-500 mb-1">Email</h3>
              <p className="font-medium">{user?.email || 'Not provided'}</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="text-sm text-gray-500 mb-1">Role</h3>
              <p className="font-medium">{user?.role || 'Driver'}</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="text-sm text-gray-500 mb-1">Total Earnings</h3>
              <p className="font-medium text-red-600">{new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'EUR',
                minimumFractionDigits: 2
              }).format(user?.totalEarnings || 0)}</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="text-sm text-gray-500 mb-1">Goal Amount</h3>
              <p className="font-medium">{new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'EUR',
                minimumFractionDigits: 2
              }).format(user?.goalAmount || 1000000)}</p>
            </div>
          </div>
        </div>
        
        {/* Goal Progress */}
        <div className="bg-black rounded-lg shadow-md p-4 mb-6">
          <h2 className="text-lg font-bold text-white mb-3">Goal Progress</h2>
          
          <div className="bg-white p-4 rounded-md">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium">{new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'EUR',
                minimumFractionDigits: 2
              }).format(user?.totalEarnings || 0)}</span>
              <span className="text-sm font-medium">{new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'EUR',
                minimumFractionDigits: 2
              }).format(user?.goalAmount || 1000000)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
              <div 
                className="bg-red-600 h-3 rounded-full" 
                style={{ 
                  width: `${user?.totalEarnings && user?.goalAmount ? (user.totalEarnings / user.goalAmount) * 100 : 0}%` 
                }}
              ></div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">
                {user?.totalEarnings && user?.goalAmount ? 
                  `${((user.totalEarnings / user.goalAmount) * 100).toFixed(2)}% Complete` : 
                  '0% Complete'}
              </span>
              <span className="text-xs text-gray-500">
                {user?.totalEarnings && user?.goalAmount ? 
                  `${new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'EUR',
                    minimumFractionDigits: 2
                  }).format(user.goalAmount - user.totalEarnings)} remaining` : 
                  `${new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'EUR',
                    minimumFractionDigits: 2
                  }).format(1000000)} remaining`}
              </span>
            </div>
          </div>
        </div>
        
        {/* Logout Button */}
        <button 
          onClick={() => {
            localStorage.removeItem('user')
            localStorage.removeItem('token')
            router.push('/login')
          }}
          className="w-full bg-red-600 hover:bg-red-700 text-white rounded-md py-3 font-medium"
        >
          Logout
        </button>
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
            className="flex flex-col items-center text-gray-400 text-xs"
            onClick={() => router.push('/metrics')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span>Stats</span>
          </button>
          <button 
            className="flex flex-col items-center text-white text-xs"
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