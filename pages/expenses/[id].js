import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'

// Helper functions (assuming similar formatting needed)
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2
  }).format(amount)
}

const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }
  return new Date(dateString).toLocaleDateString('en-IE', options)
}

export default function ExpenseDetailPage() {
  const router = useRouter()
  const { id, type } = router.query // Get ID and type from URL query
  const [expense, setExpense] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (id && type) {
      fetchExpenseDetails(id, type)
    }
  }, [id, type])

  const fetchExpenseDetails = async (expenseId, expenseType) => {
    setLoading(true)
    setError('')
    try {
      // Construct API URL based on type
      const apiUrl = `/api/expenses/${expenseType}/${expenseId}`
      const response = await fetch(apiUrl)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to fetch ${expenseType} expense details`)
      }

      const data = await response.json()
      setExpense(data)
    } catch (err) {
      console.error(`Error fetching ${expenseType} expense:`, err)
      setError(err.message || 'Failed to load expense details.')
    } finally {
      setLoading(false)
    }
  }

  // Function to handle image upload/update
  const handleImageUpload = async (file) => {
    if (!file || !expense || type !== 'other') return;
    console.log("Uploading image:", file.name);
    setLoading(true); // Show loading state during upload
    setError('');

    const formData = new FormData();
    formData.append('receiptImage', file);
    // Optionally add other fields if you want to update them simultaneously
    // formData.append('notes', updatedNotes);

    try {
      const response = await fetch(`/api/expenses/other/${id}`, {
        method: 'PUT',
        body: formData, // Send FormData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload image');
      }

      const updatedExpense = await response.json();
      setExpense(updatedExpense); // Update local state with new data (including new image URL)
      console.log("Image uploaded successfully:", updatedExpense.receiptImageUrl);
    } catch (err) {
      console.error('Error uploading image:', err);
      setError(err.message || 'Failed to upload image.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Expense Details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 text-black p-4">
        <Head>
          <title>Error | Expense Details</title>
        </Head>
        <header className="mb-4">
          <Link href="/expenses" className="text-blue-600 hover:underline">
            &larr; Back to Expenses
          </Link>
        </header>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p><strong>Error:</strong> {error}</p>
        </div>
      </div>
    )
  }

  if (!expense) {
    return (
      <div className="min-h-screen bg-gray-100 text-black p-4">
         <Head>
          <title>Expense Not Found</title>
        </Head>
        <header className="mb-4">
          <Link href="/expenses" className="text-blue-600 hover:underline">
            &larr; Back to Expenses
          </Link>
        </header>
        <p>Expense details not found.</p>
      </div>
    );
  }

  // Determine title based on type
  const pageTitle = `${type.charAt(0).toUpperCase() + type.slice(1)} Expense Details`;

  return (
    <div className="min-h-screen bg-gray-100 text-black pb-16">
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={`Details for expense ${expense.id}`} />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Simple Header for Mobile */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center">
          <Link href="/expenses" className="text-gray-700 hover:text-gray-900">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-lg font-semibold text-gray-800 ml-2 truncate">{pageTitle}</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-5">
        <div className="bg-white rounded-xl shadow-md overflow-hidden p-5 space-y-4">
          
          {/* General Details */} 
          <div className="flex justify-between items-center border-b pb-3 mb-3">
            <span className="text-2xl font-bold text-gray-800">{formatCurrency(expense.amount)}</span>
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{formatDate(expense.date)}</span>
          </div>

          {expense.vehicle && (
            <DetailItem label="Vehicle" value={`${expense.vehicle.model} (${expense.vehicle.licensePlate})`} />
          )}

          {/* Type Specific Details */} 
          {type === 'fuel' && (
            <>
              <DetailItem label="Fuel Type" value={expense.fuelType} />
              <DetailItem label="Quantity" value={expense.quantity ? `${expense.quantity} L` : '-'} />
              <DetailItem label="Price/Litre" value={expense.quantity && expense.amount ? formatCurrency(expense.amount / expense.quantity) : '-'} />
              <DetailItem label="Odometer" value={expense.odometerReading ? `${expense.odometerReading} km` : '-'} />
              <DetailItem label="Full Tank" value={expense.fullTank ? 'Yes' : 'No'} />
            </>
          )}

          {type === 'maintenance' && (
            <>
              <DetailItem label="Service Type" value={expense.serviceType} />
              <DetailItem label="Odometer" value={expense.odometerReading ? `${expense.odometerReading} km` : '-'} />
            </>
          )}

          {type === 'insurance' && (
            <>
              <DetailItem label="Provider" value={expense.provider} />
              <DetailItem label="Policy Number" value={expense.policyNumber || '-'} />
              <DetailItem label="Start Date" value={formatDate(expense.startDate)} />
              <DetailItem label="End Date" value={formatDate(expense.endDate)} />
              <DetailItem label="Payment Cycle" value={expense.paymentCycle} />
              <DetailItem label="Monthly Amount" value={formatCurrency(expense.monthlyAmount)} />
            </>
          )}

          {type === 'other' && (
            <>
              <DetailItem label="Category" value={expense.category} />
              {/* Receipt Image Section */} 
              <div className="pt-3">
                <label className="block text-sm font-bold text-gray-700 mb-2">Receipt Image</label>
                {expense.receiptImageUrl ? (
                  <div className="mb-2">
                    <a href={expense.receiptImageUrl} target="_blank" rel="noopener noreferrer">
                      <img 
                        src={expense.receiptImageUrl}
                        alt="Receipt" 
                        className="w-full max-w-sm h-auto rounded-lg border border-gray-200 shadow-sm object-contain"
                      />
                    </a>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic mb-2">No receipt image uploaded.</p>
                )}
                {/* Add/Change Image Button - Placeholder */}
                <input 
                  type="file"
                  accept="image/*"
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  onChange={(e) => handleImageUpload(e.target.files[0])}
                />
              </div>
            </>
          )}

          {/* Notes */} 
          {expense.notes && (
             <DetailItem label="Notes" value={expense.notes} isTextArea={true} />
          )}

        </div>
      </main>
    </div>
  )
}

// Helper component for consistent detail item display
const DetailItem = ({ label, value, isTextArea = false }) => (
  <div className="py-2 border-b border-gray-100">
    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">{label}</label>
    {isTextArea ? (
      <p className="text-base text-gray-800 whitespace-pre-wrap">{value}</p>
    ) : (
      <p className="text-base font-medium text-gray-800">{value}</p>
    )}
  </div>
); 