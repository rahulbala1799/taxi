import Head from 'next/head'
import Link from 'next/link'
import { useState } from 'react'

export default function Home() {
  const [activeTab, setActiveTab] = useState('driver');

  return (
    <div className="min-h-screen bg-black text-white">
      <Head>
        <title>Stijoi Stephen Taxi Millionaire</title>
        <meta name="description" content="Personal earnings tracker for Stijoi Stephen's Tesla taxi business" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Navigation */}
      <nav className="bg-black shadow-md border-b border-gray-800">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/">
            <a className="flex items-center">
              <span className="text-2xl font-bold text-red-700">STIJOI</span>
              <span className="text-2xl font-bold text-white ml-1">MILLION</span>
            </a>
          </Link>
          
          <div className="flex items-center space-x-6">
            <Link href="/login">
              <a className="bg-red-700 text-white px-4 py-2 rounded-md font-medium hover:bg-red-800 transition-colors">
                Login
              </a>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent z-10"></div>
        <div className="relative h-[600px] bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?q=80&w=2070')" }}>
          <div className="container mx-auto px-4 h-full flex items-center">
            <div className="max-w-lg z-20">
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-2">
                Hello, <span className="text-red-700">Stijoi</span>
              </h1>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">
                Your journey to €1,000,000 starts here
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Track your Tesla taxi earnings and expenses with your personal dashboard. Every ride brings you closer to your goal.
              </p>
              <div className="flex space-x-4">
                <Link href="/login">
                  <a className="bg-red-700 hover:bg-red-800 text-white px-6 py-3 rounded-md font-bold text-lg transition-colors">
                    Log In
                  </a>
                </Link>
                <Link href="/register">
                  <a className="bg-white hover:bg-gray-100 text-black px-6 py-3 rounded-md font-bold text-lg transition-colors">
                    Create Account
                  </a>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Card */}
      <div className="container mx-auto px-4 py-8 -mt-20 relative z-20">
        <div className="bg-gray-900 rounded-lg shadow-xl p-6 max-w-3xl mx-auto border border-gray-800">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="p-4">
              <h3 className="text-gray-400 text-sm uppercase tracking-wider mb-1">Current Earnings</h3>
              <p className="text-3xl font-bold text-white">€0</p>
              <p className="text-red-700 text-sm mt-1">of €1,000,000 goal</p>
            </div>
            <div className="p-4">
              <h3 className="text-gray-400 text-sm uppercase tracking-wider mb-1">Total Rides</h3>
              <p className="text-3xl font-bold text-white">0</p>
              <p className="text-gray-500 text-sm mt-1">Log in to record rides</p>
            </div>
            <div className="p-4">
              <h3 className="text-gray-400 text-sm uppercase tracking-wider mb-1">Progress</h3>
              <p className="text-3xl font-bold text-white">0%</p>
              <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                <div className="bg-red-700 h-2 rounded-full" style={{ width: '0%' }}></div>
              </div>
            </div>
          </div>
          <div className="mt-6 text-center">
            <p className="text-gray-400 mb-4">Log in to access your personalized dashboard and track your progress</p>
            <Link href="/login">
              <a className="inline-block bg-red-700 hover:bg-red-800 text-white px-8 py-3 rounded-md font-medium transition-colors">
                View My Dashboard
              </a>
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-black py-16 border-t border-gray-800">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-white mb-12">Your Personal Tracking Tools</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-900 p-6 rounded-lg shadow-md border border-gray-800">
              <div className="w-12 h-12 bg-red-700/20 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Earnings Tracker</h3>
              <p className="text-gray-400">Record and monitor all your Tesla taxi fares to visualize your progress to €1M.</p>
            </div>
            
            <div className="bg-gray-900 p-6 rounded-lg shadow-md border border-gray-800">
              <div className="w-12 h-12 bg-red-700/20 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Expense Management</h3>
              <p className="text-gray-400">Track your Tesla maintenance, charging costs, and other business expenses.</p>
            </div>
            
            <div className="bg-gray-900 p-6 rounded-lg shadow-md border border-gray-800">
              <div className="w-12 h-12 bg-red-700/20 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Performance Analytics</h3>
              <p className="text-gray-400">Get insights on your most profitable routes, times, and days to maximize earnings.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quote Section */}
      <div className="bg-gray-900 py-16">
        <div className="container mx-auto px-4 text-center">
          <svg className="w-12 h-12 text-red-700 mx-auto mb-6" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
            <path d="M0 216C0 149.7 53.7 96 120 96h8c17.7 0 32 14.3 32 32s-14.3 32-32 32h-8c-30.9 0-56 25.1-56 56v8h64c35.3 0 64 28.7 64 64v64c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V320 288 216zm256 0c0-66.3 53.7-120 120-120h8c17.7 0 32 14.3 32 32s-14.3 32-32 32h-8c-30.9 0-56 25.1-56 56v8h64c35.3 0 64 28.7 64 64v64c0 35.3-28.7 64-64 64H320c-35.3 0-64-28.7-64-64V320 288 216z"/>
          </svg>
          <blockquote className="text-2xl text-white italic max-w-3xl mx-auto mb-6">
            Every journey to a million euros starts with a single fare. Track each step, celebrate every milestone.
          </blockquote>
          <p className="text-red-700 font-bold">Stijoi Stephen</p>
          <p className="text-gray-400">Tesla Taxi Driver</p>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-black py-16 border-t border-gray-800">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Ready to Track Your Progress?</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Your personal dashboard is waiting. Start recording your Tesla taxi rides and watch as you get closer to your €1,000,000 goal.
          </p>
          <Link href="/login">
            <a className="inline-block bg-red-700 hover:bg-red-800 text-white px-8 py-4 rounded-md font-bold text-lg transition-colors">
              Access My Dashboard
            </a>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 border-t border-gray-800">
        <div className="container mx-auto px-4 text-center">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 mb-4 md:mb-0">© {new Date().getFullYear()} Stijoi Stephen Taxi Millionaire. All rights reserved.</p>
            <div className="flex space-x-4">
              <Link href="/privacy">
                <a className="text-gray-400 hover:text-white text-sm">Privacy Policy</a>
              </Link>
              <Link href="/terms">
                <a className="text-gray-400 hover:text-white text-sm">Terms of Use</a>
              </Link>
              <Link href="/contact">
                <a className="text-gray-400 hover:text-white text-sm">Contact</a>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
} 