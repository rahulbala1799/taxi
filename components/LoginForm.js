import { useState } from 'react'
import { useRouter } from 'next/router'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || 'Something went wrong')
      }

      // Store token in localStorage
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))

      // Redirect to dashboard
      router.push('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="bg-gray-800 shadow-xl rounded-lg px-8 pt-6 pb-8 mb-4 border border-gray-700">
        <h2 className="text-2xl mb-6 text-center font-bold text-white">Login to Your Account</h2>
        
        {error && (
          <div className="bg-red-900 border border-red-700 text-white px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <div className="mb-4">
          <label className="block text-yellow-400 text-sm font-bold mb-2" htmlFor="email">
            Email
          </label>
          <input
            className="bg-gray-700 shadow appearance-none border border-gray-600 rounded w-full py-3 px-4 text-white leading-tight focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
            id="email"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-yellow-400 text-sm font-bold mb-2" htmlFor="password">
            Password
          </label>
          <input
            className="bg-gray-700 shadow appearance-none border border-gray-600 rounded w-full py-3 px-4 text-white leading-tight focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
            id="password"
            type="password"
            placeholder="******************"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        
        <div className="flex items-center justify-between">
          <button
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-3 px-4 rounded focus:outline-none focus:shadow-outline transition duration-200"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Sign In'}
          </button>
        </div>
      </form>
    </div>
  )
} 