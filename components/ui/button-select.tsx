'use client'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ButtonSelectProps {
  options: string[]
  value: string[]
  onChange: (value: string[]) => void
  label?: string
  error?: string
  className?: string
}

export function ButtonSelect({
  options,
  value,
  onChange,
  label,
  error,
  className
}: ButtonSelectProps) {
  const toggleOption = (option: string) => {
    if (value.includes(option)) {
      onChange(value.filter(item => item !== option))
    } else {
      onChange([...value, option])
    }
  }

  const removeOption = (option: string) => {
    onChange(value.filter(item => item !== option))
  }

  const clearAll = () => {
    onChange([])
  }

  return (
    <div className={cn("space-y-4", className)}>
      {label && <Label className="text-base font-semibold hebrew-text text-right block">{label}</Label>}
      
      {/* Selected items display */}
      {value.length > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 hebrew-text">נבחרו ({value.length}):</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearAll}
              className="text-red-600 hover:text-red-700 h-8 px-2 text-xs hebrew-text"
            >
              נקה הכל
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {value.map((item) => (
              <div
                key={item}
                className="flex items-center gap-1 bg-black text-white px-3 py-2 rounded-lg text-sm font-medium"
              >
                <span className="hebrew-text">{item}</span>
                <div
                  onClick={() => removeOption(item)}
                  className="h-4 w-4 p-0 hover:bg-white/20 cursor-pointer flex items-center justify-center rounded"
                >
                  <X className="h-3 w-3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available options as clickable buttons */}
      <div className="space-y-2">
        <span className="text-sm text-gray-600 hebrew-text block">לחץ על השמות לבחירה:</span>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {options.map((option) => (
            <Button
              key={option}
              type="button"
              variant={value.includes(option) ? "default" : "outline"}
              onClick={() => toggleOption(option)}
              className={cn(
                "h-10 rounded-lg text-sm font-medium transition-all duration-200 hebrew-text",
                value.includes(option) 
                  ? "bg-black text-white hover:bg-gray-800" 
                  : "border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
              )}
              dir="rtl"
            >
              {option}
            </Button>
          ))}
        </div>
      </div>

      {error && <p className="text-red-500 text-sm mt-2 hebrew-text text-right">{error}</p>}
    </div>
  )
}

