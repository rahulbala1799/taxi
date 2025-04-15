import Head from 'next/head'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <Head>
        <title>Stijoi Stephen Taxi Millionaire</title>
        <meta name="description" content="Track your taxi rides to millionaire status" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-3 text-yellow-400">
            Stijoi Stephen Taxi Millionaire
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Track your Tesla taxi rides and progress towards your €1,000,000 goal
          </p>
        </div>
        
        <div className="max-w-md mx-auto bg-gray-800 shadow-lg rounded-lg overflow-hidden">
          <div className="p-6">
            <div className="flex justify-center mb-8">
              <div className="h-24 w-24 rounded-full bg-yellow-400 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-gray-900">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                </svg>
              </div>
            </div>
            
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Driver Login</h2>
              <p className="text-gray-400">Enter your credentials to track your progress</p>
            </div>
            
            <div className="space-y-4">
              <Link href="/login">
                <a className="block w-full bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-3 px-4 rounded transition duration-200 text-center">
                  Login
                </a>
              </Link>
              
              <div className="text-center text-gray-400">
                New driver? 
                <Link href="/register">
                  <a className="text-yellow-400 hover:text-yellow-300 ml-1">Create an account</a>
                </Link>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-yellow-400 mr-2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
                <span>Goal: €1,000,000</span>
              </div>
              <div>
                <span className="text-yellow-400">Tesla Rides Only</span>
              </div>
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