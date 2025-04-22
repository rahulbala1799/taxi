import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function ExpensesRedirectPage() {
  const router = useRouter()
  
  useEffect(() => {
    // Redirect to the new expenses page
    router.replace('/expenses-new')
  }, [router])
  
  // Render a simple loading state while redirecting
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
        <div className="text-xl font-bold text-red-600">Redirecting...</div>
      </div>
    </div>
  )
} 