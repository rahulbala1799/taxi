import '../styles/globals.css'
import { AuthProvider } from '../lib/auth'
import { useState, useEffect } from 'react'

function MyApp({ Component, pageProps }) {
  const [mounted, setMounted] = useState(false)
  
  // Only render on client-side to avoid hydration issues
  useEffect(() => {
    setMounted(true)
  }, [])

  // Safety wrapper to ensure AuthProvider is only used on client side
  const SafeHydrate = ({ children }) => {
    return (
      <div suppressHydrationWarning>
        {typeof window === 'undefined' ? null : children}
      </div>
    )
  }

  // Prevent flash during hydration
  if (!mounted) {
    return (
      <div style={{ 
        height: '100vh', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center' 
      }}>
        <div>Loading...</div>
      </div>
    )
  }

  return (
    <SafeHydrate>
      <AuthProvider>
        <Component {...pageProps} />
      </AuthProvider>
    </SafeHydrate>
  )
}

export default MyApp 