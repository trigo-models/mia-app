'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface DataTableColumn<T> {
  key: keyof T | string
  header: string
  className?: string
  headerClassName?: string
  align?: 'start' | 'center' | 'end'
  render?: (row: T) => ReactNode
}

interface DataTableProps<T> {
  data: T[]
  columns: Array<DataTableColumn<T>>
  rowKey: (row: T) => string
  emptyState?: ReactNode
  className?: string
}

export function AdminDataTable<T>({
  data,
  columns,
  rowKey,
  emptyState,
  className,
}: DataTableProps<T>) {
  const alignment = {
    start: 'text-right', // RTL
    center: 'text-center',
    end: 'text-left',
  } as const

  return (
    <div className={cn('rounded-xl border border-gray-200 bg-white shadow-sm', className)}>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse hebrew-text table-auto">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            {columns.map((column) => (
              <th
                key={String(column.key)}
                className={cn(
                  'px-3 py-2 text-xs font-medium text-gray-600 whitespace-nowrap',
                  alignment[column.align || 'start'],
                  column.headerClassName
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-3 py-8 text-center text-gray-500 text-sm">
                {emptyState || 'אין נתונים להצגה'}
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr key={rowKey(row)} className="hover:bg-gray-50 transition-colors">
                {columns.map((column) => (
                  <td
                    key={String(column.key)}
                    className={cn(
                      'px-3 py-2 text-sm text-gray-700 align-middle',
                      alignment[column.align || 'start'],
                      column.className
                    )}
                  >
                    {column.render ? column.render(row) : (row as any)[column.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
        </table>
      </div>
    </div>
  )
}
