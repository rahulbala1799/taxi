import Head from 'next/head'
import Link from 'next/link'
import { useState } from 'react'

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-black">
      <Head>
        <title>Stijoy's Million Euro Journey</title>
        <meta name="description" content="Personal earnings tracker for Stijoy's taxi business journey to €1,000,000" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Simple Navigation */}
      <nav className="bg-black shadow-sm py-4">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <Link href="/">
            <a className="flex items-center">
              <span className="text-xl font-bold text-white">STIJOY'S MILLION</span>
            </a>
          </Link>
          
          <Link href="/login">
            <a className="bg-red-600 text-white px-4 py-2 rounded font-medium hover:bg-red-700 transition-colors">
              Login
            </a>
          </Link>
        </div>
      </nav>

      {/* Minimalist Hero Section */}
      <div className="container mx-auto px-4 py-16 flex flex-col items-center text-center">
        <h1 className="text-4xl font-bold mb-2">
          The Handsome Taxi Driver's Journey to €1,000,000
        </h1>
        <h2 className="text-xl text-gray-600 mb-8 max-w-2xl">
          A simple app for Stijoy to track his progress towards a million Euro turnover
        </h2>
        
        <div className="flex space-x-4 mb-12">
          <Link href="/login">
            <a className="bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-md font-medium transition-colors">
              Login
            </a>
          </Link>
          <Link href="/register">
            <a className="bg-gray-200 hover:bg-gray-300 text-black px-6 py-3 rounded-md font-medium transition-colors">
              Create Account
            </a>
          </Link>
        </div>
      </div>

      {/* Minimalist Stats Card */}
      <div className="bg-gray-100 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-sm p-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="p-4">
              <h3 className="text-gray-500 text-sm uppercase mb-1">Current Earnings</h3>
              <p className="text-3xl font-bold">€0</p>
              <p className="text-red-600 text-sm mt-1">of €1,000,000 goal</p>
            </div>
            <div className="p-4 border-y md:border-y-0 md:border-x border-gray-200">
              <h3 className="text-gray-500 text-sm uppercase mb-1">Total Rides</h3>
              <p className="text-3xl font-bold">0</p>
              <p className="text-gray-500 text-sm mt-1">Login to record rides</p>
            </div>
            <div className="p-4">
              <h3 className="text-gray-500 text-sm uppercase mb-1">Progress</h3>
              <p className="text-3xl font-bold">0%</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div className="bg-red-600 h-2 rounded-full" style={{ width: '0%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section - Simplified */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-center mb-12">Simple Tools for Tracking Success</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4 mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold mb-2">Ride Tracker</h3>
            <p className="text-gray-600">Record each fare on your journey to €1M</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4 mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold mb-2">Expense Tracker</h3>
            <p className="text-gray-600">Keep track of all business expenses</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4 mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold mb-2">Stats Dashboard</h3>
            <p className="text-gray-600">Simple visual tracking of your progress</p>
          </div>
        </div>
      </div>

      {/* CTA Section - Simplified */}
      <div className="bg-gray-100 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">Start Tracking Your Way to €1,000,000</h2>
          <p className="text-gray-600 mb-8 max-w-lg mx-auto">
            This simple app was built for one purpose: helping Stijoy track his taxi business journey to a million euro turnover.
          </p>
          <Link href="/login">
            <a className="inline-block bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-md font-medium transition-colors">
              Access Dashboard
            </a>
          </Link>
        </div>
      </div>

      {/* Footer - Simplified */}
      <footer className="bg-white text-black py-6 border-t border-gray-200">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} Stijoy's Million Euro Journey. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
} 