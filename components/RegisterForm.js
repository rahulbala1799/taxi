import { useState } from 'react'
import { useRouter } from 'next/router'

export default function RegisterForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          name, 
          email, 
          password, 
          phone,
          role: 'DRIVER' // Default role for this app
        })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || 'Something went wrong')
      }

      // Redirect to login page after successful registration
      router.push('/login?success=Account created successfully. Please log in.')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="bg-gray-800 shadow-xl rounded-lg px-8 pt-6 pb-8 mb-4 border border-gray-700">
        <h2 className="text-2xl mb-6 text-center font-bold text-white">Create Your Account</h2>
        
        {error && (
          <div className="bg-red-900 border border-red-700 text-white px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <div className="mb-4">
          <label className="block text-yellow-400 text-sm font-bold mb-2" htmlFor="name">
            Full Name
          </label>
          <input
            className="bg-gray-700 shadow appearance-none border border-gray-600 rounded w-full py-3 px-4 text-white leading-tight focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
            id="name"
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        
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
        
        <div className="mb-4">
          <label className="block text-yellow-400 text-sm font-bold mb-2" htmlFor="phone">
            Phone Number
          </label>
          <input
            className="bg-gray-700 shadow appearance-none border border-gray-600 rounded w-full py-3 px-4 text-white leading-tight focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
            id="phone"
            type="tel"
            placeholder="Phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
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
            minLength={6}
          />
          <p className="text-gray-400 text-xs mt-1">Password must be at least 6 characters</p>
        </div>
        
        <div className="flex items-center justify-between">
          <button
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-3 px-4 rounded focus:outline-none focus:shadow-outline transition duration-200"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </div>
      </form>
    </div>
  )
} 