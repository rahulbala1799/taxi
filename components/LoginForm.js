import { useState } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../lib/auth'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { login } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      console.log("Attempting login with:", { email })
      
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })

      const data = await res.json()

      if (!res.ok) {
        console.error("Login failed:", data)
        throw new Error(data.message || 'Login failed. Please check your credentials.')
      }

      console.log("Login successful:", { name: data.user.name, role: data.user.role })
      
      // Store manually like before to ensure compatibility
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      
      // Use the context login function as well
      login(data.user, data.token)

      // Redirect to dashboard
      router.push('/dashboard')
    } catch (err) {
      console.error("Login error:", err)
      setError(err.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="bg-white shadow-sm rounded-lg px-8 pt-6 pb-8 mb-4 border border-gray-200">
        <h2 className="text-2xl mb-6 text-center font-bold">Access Your Dashboard</h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
            Username or Email
          </label>
          <input
            className="shadow appearance-none border border-gray-300 rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
            id="email"
            type="text"
            placeholder="stijoymillion or your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
            Password
          </label>
          <input
            className="shadow appearance-none border border-gray-300 rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
            id="password"
            type="password"
            placeholder="******************"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <div className="flex justify-end mt-2">
            <a href="#" className="text-sm text-red-600 hover:text-red-700">Forgot password?</a>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <button
            className="w-full bg-black hover:bg-gray-800 text-white font-bold py-3 px-4 rounded focus:outline-none focus:shadow-outline transition duration-200"
            type="submit"
            disabled={loading}
          >
            {loading ? 
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing In...
              </span> 
              : 'Sign In'
            }
          </button>
        </div>
      </form>
    </div>
  )
} 