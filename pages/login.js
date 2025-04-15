import Head from 'next/head'
import Link from 'next/link'
import LoginForm from '../components/LoginForm'

export default function Login() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Head>
        <title>Login | Stijoi Stephen Taxi Millionaire</title>
        <meta name="description" content="Login to track your taxi earnings" />
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
        </div>
      </nav>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto mb-8 text-center">
          <h1 className="text-3xl font-bold text-white">Welcome Back, Stijoi</h1>
          <p className="text-gray-400 mt-2">Log in to continue tracking your journey to €1,000,000</p>
        </div>
        
        <LoginForm />
        
        <div className="text-center mt-6">
          <Link href="/">
            <a className="text-gray-400 hover:text-white inline-flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </a>
          </Link>
        </div>
      </main>

      <footer className="bg-gray-900 text-white py-8 border-t border-gray-800 absolute bottom-0 w-full">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">© {new Date().getFullYear()} Stijoi Stephen Taxi Millionaire. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
} 