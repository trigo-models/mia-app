'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminAuth from '@/components/admin-auth'

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if user is already authenticated (stored in sessionStorage)
    const authStatus = sessionStorage.getItem('admin_authenticated')
    if (authStatus === 'true') {
      setIsAuthenticated(true)
      router.replace('/admin/projects')
    }
    setLoading(false)
  }, [router])

  const handleLogin = () => {
    setIsAuthenticated(true)
    sessionStorage.setItem('admin_authenticated', 'true')
    router.replace('/admin/projects')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-gray-600 hebrew-text">טוען...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <AdminAuth onLogin={handleLogin} />
  }

  return null
}
