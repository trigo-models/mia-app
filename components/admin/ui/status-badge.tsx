'use client'

import { cn } from '@/lib/utils'
import { getStatusLabel, getStatusStyle } from '@/lib/admin-ui'

interface StatusBadgeProps {
  status?: string
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  if (!status) {
    return <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-300">-</span>
  }

  const style = getStatusStyle(status)
  return (
    <span
      className={cn(
        'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium hebrew-text',
        style.badge,
        className
      )}
    >
      {getStatusLabel(status)}
    </span>
  )
}
