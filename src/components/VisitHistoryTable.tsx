'use client'

import { useEffect, useState } from 'react'
// import { Button } from '@/components/ui/button'
import { newVisitorAPI } from '@/lib/api'

interface VisitForm {
  _id: string
  formType: 'visitor' | 'contractor'
  siteLocation: string
  status: string
  checkIn: string
  checkOutTime: string
  createdAt: string
}

export default function VisitorsPage() {
  const [history, setHistory] = useState<VisitForm[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const data = await newVisitorAPI.getAll()
        setHistory(data)
      } catch (err) {
        console.error('Failed to fetch visit history:', err)
      } finally {
        setLoading(false)
      }
    }

    loadHistory()
  }, [])

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">All Visit History</h1>

      {loading ? (
        <p>Loading history...</p>
      ) : history.length === 0 ? (
        <p>No visit history found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm shadow rounded">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Form Type</th>
                <th className="px-4 py-2 text-left">Location</th>
                <th className="px-4 py-2 text-left">Check-In</th>
                <th className="px-4 py-2 text-left">Check-Out</th>
                <th className="px-4 py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {history.map((entry) => (
                <tr key={entry._id} className="border-t">
                  <td className="px-4 py-2 capitalize">{entry.formType}</td>
                  <td className="px-4 py-2">{entry.siteLocation}</td>
                  <td className="px-4 py-2">{new Date(entry.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-2">
                    {entry.checkOutTime ? new Date(entry.checkOutTime).toLocaleString() : '—'}
                  </td>
                  <td className="px-4 py-2 capitalize">{entry.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
