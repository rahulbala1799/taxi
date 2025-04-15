import Head from 'next/head'
import Link from 'next/link'
import LoginForm from '../components/LoginForm'

export default function Login() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <Head>
        <title>Login | Stijoi Stephen Taxi Millionaire</title>
        <meta name="description" content="Login to track your taxi rides" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <Link href="/">
            <a className="inline-block">
              <h1 className="text-4xl font-bold text-yellow-400">Stijoi Stephen Taxi Millionaire</h1>
            </a>
          </Link>
        </div>
        
        <LoginForm />
        
        <div className="text-center mt-6">
          <Link href="/">
            <a className="text-gray-400 hover:text-white">
              &larr; Back to Home
            </a>
          </Link>
        </div>
      </main>

      <footer className="text-center py-8 text-gray-400">
        <p>© {new Date().getFullYear()} Stijoi Stephen Taxi Millionaire. All rights reserved.</p>
      </footer>
    </div>
  )
} 