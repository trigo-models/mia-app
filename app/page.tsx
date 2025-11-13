import MultiStepForm from '@/components/form'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Settings } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Admin Link */}
      <div className="absolute top-4 left-4">
        <Link href="/admin">
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 ml-2" />
            פאנל ניהול
          </Button>
        </Link>
      </div>

      {/* Logo Section */}
      <div className="flex justify-center py-8">
        <Image
          src="/gash-logo.svg"
          alt="Gash Logo"
          width={480}
          height={192}
          className="hebrew-text"
          priority
        />
      </div>
      
      {/* Form Section */}
      <MultiStepForm />
    </div>
  )
}

