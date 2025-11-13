'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Check, ChevronDown, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MultiSelectProps {
  options: string[]
  value: string[]
  onChange: (value: string[]) => void
  placeholder?: string
  label?: string
  error?: string
  className?: string
}

export function MultiSelect({
  options,
  value,
  onChange,
  placeholder = "בחר אפשרויות",
  label,
  error,
  className
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false)

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
    <div className={cn("space-y-3", className)}>
      {label && <Label className="text-base font-semibold hebrew-text text-right block">{label}</Label>}
      
      <div className="relative">
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-full justify-between text-right h-12 rounded-xl border-gray-300",
            error && "border-red-500"
          )}
          dir="rtl"
        >
          <div className="flex items-center gap-2">
            {value.length > 0 && (
              <div
                onClick={(e) => {
                  e.stopPropagation()
                  clearAll()
                }}
                className="h-6 w-6 p-0 hover:bg-gray-100 cursor-pointer flex items-center justify-center rounded-lg"
              >
                <X className="h-3 w-3" />
              </div>
            )}
            <span className="text-sm text-right hebrew-text">
              {value.length === 0 
                ? placeholder 
                : `${value.length} נבחרו`
              }
            </span>
          </div>
          <ChevronDown className={cn(
            "h-4 w-4 transition-transform",
            isOpen && "rotate-180"
          )} />
        </Button>

        {isOpen && (
          <Card className="absolute z-50 w-full mt-2 max-h-60 overflow-y-auto rounded-xl shadow-lg border-0">
            <CardContent className="p-3">
              <div className="space-y-1">
                {options.map((option) => (
                  <div
                    key={option}
                    onClick={() => toggleOption(option)}
                    className={cn(
                      "w-full justify-start text-right h-10 px-3 cursor-pointer hover:bg-gray-100 rounded-lg flex items-center transition-colors",
                      value.includes(option) && "bg-black/10"
                    )}
                    dir="rtl"
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-sm font-medium hebrew-text">{option}</span>
                      {value.includes(option) && (
                        <Check className="h-4 w-4 text-black" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Selected items display */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {value.map((item) => (
            <div
              key={item}
              className="flex items-center gap-1 bg-black/10 text-black px-3 py-2 rounded-lg text-sm font-medium"
            >
              <span className="hebrew-text">{item}</span>
              <div
                onClick={() => removeOption(item)}
                className="h-4 w-4 p-0 hover:bg-black/20 cursor-pointer flex items-center justify-center rounded"
              >
                <X className="h-3 w-3" />
              </div>
            </div>
          ))}
        </div>
      )}

      {error && <p className="text-red-500 text-sm mt-2 hebrew-text text-right">{error}</p>}
    </div>
  )
}