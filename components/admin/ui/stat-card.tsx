'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface AdminStatCardProps {
  label: string
  value: number | string
  icon?: ReactNode
  accentColor?: 'emerald' | 'sky' | 'amber' | 'rose' | 'slate' | 'violet'
  description?: string
  className?: string
}

const ACCENT_MAP: Record<
  NonNullable<AdminStatCardProps['accentColor']>,
  { gradient: string; border: string; text: string; iconBg: string }
> = {
  emerald: {
    gradient: 'from-emerald-50 via-emerald-50/80 to-white',
    border: 'border-emerald-200',
    text: 'text-emerald-900',
    iconBg: 'bg-emerald-100 text-emerald-600',
  },
  sky: {
    gradient: 'from-sky-50 via-sky-50/80 to-white',
    border: 'border-sky-200',
    text: 'text-sky-900',
    iconBg: 'bg-sky-100 text-sky-600',
  },
  amber: {
    gradient: 'from-amber-50 via-amber-50/80 to-white',
    border: 'border-amber-200',
    text: 'text-amber-900',
    iconBg: 'bg-amber-100 text-amber-600',
  },
  rose: {
    gradient: 'from-rose-50 via-rose-50/80 to-white',
    border: 'border-rose-200',
    text: 'text-rose-900',
    iconBg: 'bg-rose-100 text-rose-600',
  },
  slate: {
    gradient: 'from-slate-50 via-slate-50/80 to-white',
    border: 'border-slate-200',
    text: 'text-slate-900',
    iconBg: 'bg-slate-100 text-slate-600',
  },
  violet: {
    gradient: 'from-violet-50 via-violet-50/80 to-white',
    border: 'border-violet-200',
    text: 'text-violet-900',
    iconBg: 'bg-violet-100 text-violet-600',
  },
}

export function AdminStatCard({
  label,
  value,
  icon,
  accentColor = 'slate',
  description,
  className,
}: AdminStatCardProps) {
  const accent = ACCENT_MAP[accentColor]
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border bg-white shadow-sm transition-all hover:shadow-lg',
        accent.border,
        className
      )}
    >
      <div className={cn('absolute inset-0 bg-gradient-to-br', accent.gradient)} />
      <div className="relative p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-slate-600 hebrew-text">{label}</p>
            {description && <p className="text-xs text-slate-400 hebrew-text">{description}</p>}
          </div>
          {icon && (
            <span className={cn('flex h-10 w-10 items-center justify-center rounded-full shadow-sm backdrop-blur', accent.iconBg)}>
              {icon}
            </span>
          )}
        </div>
        <div className="flex items-baseline gap-2">
          <span className={cn('text-4xl font-bold tracking-tight hebrew-text', accent.text)}>{value}</span>
        </div>
      </div>
    </div>
  )}
