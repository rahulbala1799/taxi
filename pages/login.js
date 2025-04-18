import Head from 'next/head'
import Link from 'next/link'
import LoginForm from '../components/LoginForm'

export default function Login() {
  return (
    <div className="min-h-screen bg-white text-black">
      <Head>
        <title>Login | Stijoy's Million Euro Journey</title>
        <meta name="description" content="Login to track your taxi earnings" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Navigation */}
      <nav className="bg-black shadow-sm py-4">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <Link href="/">
            <a className="flex items-center">
              <span className="text-xl font-bold text-white">STIJOY'S MILLION</span>
            </a>
          </Link>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto mb-8 text-center">
          <h1 className="text-3xl font-bold">Welcome Back, Stijoy</h1>
          <p className="text-gray-600 mt-2">Log in to continue tracking your journey to €1,000,000</p>
        </div>
        
        <LoginForm />
        
        <div className="text-center mt-6">
          <Link href="/">
            <a className="text-gray-500 hover:text-black inline-flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </a>
          </Link>
        </div>
      </main>

      <footer className="bg-white text-black py-6 border-t border-gray-200 absolute bottom-0 w-full">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-500 text-sm">© {new Date().getFullYear()} Stijoy's Million Euro Journey. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
} 