'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface AdminPageHeaderProps {
  title: string
  subtitle?: string
  actions?: ReactNode
  align?: 'start' | 'center'
  className?: string
}

export function AdminPageHeader({
  title,
  subtitle,
  actions,
  align = 'start',
  className,
}: AdminPageHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between py-6 border-b border-gray-200',
        align === 'center' && 'sm:flex-col sm:text-center',
        className
      )}
    >
      <div className={cn('space-y-2', align === 'center' && 'sm:space-y-1')}>
        <h1 className="text-2xl font-bold text-gray-900 hebrew-text tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-gray-500 hebrew-text max-w-3xl">
            {subtitle}
          </p>
        )}
      </div>
      {actions && (
        <div className={cn('flex flex-wrap gap-2', align === 'center' && 'justify-center')}>
          {actions}
        </div>
      )}
    </div>
  )
}
