import '../styles/globals.css'
import { AuthProvider } from '../lib/auth'
import { useState, useEffect } from 'react'

function MyApp({ Component, pageProps }) {
  const [mounted, setMounted] = useState(false)
  
  // Only render on client-side to avoid hydration issues
  useEffect(() => {
    setMounted(true)
  }, [])

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
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  )
}

export default MyApp 