import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function ExpensesRedirectPage() {
  const router = useRouter()
  
  useEffect(() => {
    // Redirect to the new expenses page
    router.replace('/expenses-new')
  }, [router])
  
  // Return null to avoid rendering anything that might cause errors
  return null
} 