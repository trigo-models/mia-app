'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Image from 'next/image'

interface AdminAuthProps {
  onLogin: () => void
}

export default function AdminAuth({ onLogin }: AdminAuthProps) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Simulate a small delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500))

    if (password === '102030') {
      onLogin()
    } else {
      setError('סיסמה שגויה. נסה שוב.')
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen w-full flex flex-row-reverse" dir="rtl">
      {/* Left Side - Welcome Image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <Image
          src="/welcome.jpg"
          alt="Welcome"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <Image
                src="/gash-logo.svg"
                alt="Gash Logo"
                width={120}
                height={48}
                className="hebrew-text h-auto w-auto"
                priority
              />
            </div>
            <h1 className="text-3xl font-bold hebrew-text text-gray-900">פאנל ניהול - MIA</h1>
            <p className="hebrew-text text-gray-600">
              הכנס סיסמה כדי לגשת לפאנל הניהול
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="password" className="hebrew-text text-right block text-gray-700">סיסמה</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="הכנס סיסמה"
                className="hebrew-text text-right"
                dir="rtl"
                required
              />
            </div>
            {error && (
              <p className="text-sm text-red-600 hebrew-text text-center">{error}</p>
            )}
            <Button 
              type="submit" 
              className="w-full hebrew-text bg-gray-700 hover:bg-gray-800 text-white rounded-full" 
              disabled={loading}
            >
              {loading ? 'בודק...' : 'התחבר'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}