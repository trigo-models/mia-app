'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface AdminEmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  actions?: ReactNode
  className?: string
}

export function AdminEmptyState({ icon, title, description, actions, className }: AdminEmptyStateProps) {
  return (
    <div className={cn('py-16 text-center space-y-4 text-gray-500 hebrew-text', className)}>
      {icon && <div className="flex justify-center text-5xl">{icon}</div>}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {description && <p className="text-sm text-gray-500 max-w-md mx-auto">{description}</p>}
      </div>
      {actions && <div className="flex items-center justify-center gap-2">{actions}</div>}
    </div>
  )}
