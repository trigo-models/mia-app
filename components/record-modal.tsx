'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { X, Save } from 'lucide-react'

interface Record {
  id: string
  fields: { [key: string]: any }
  createdTime: string
}

interface RecordModalProps {
  isOpen: boolean
  onClose: () => void
  record: Record | null
  onSave: () => void
  fieldKeys: string[]
}

// Define Hebrew field mappings
const getFieldMappings = (): { [key: string]: string } => {
  return {
    'fac_name': 'שם המפעל',
    'element': 'אלמנט',
    'is_construction': 'קונסטרוקציה',
    'contruction_tons': 'משקל קונסט',
    'is_greetings': 'שבכות',
    'greetings_dim': 'שבכות מ"ר',
    'is_handrail': 'מעקות',
    'handrail_length': 'מעקות מ"א',
    'r_comments': 'הערות ר"צ',
    'r_leaders': 'ראשי צוות',
    'r_team': 'אנשי צוות',
    'Number': 'מספר עבודה'
  }
}

export default function RecordModal({ isOpen, onClose, record, onSave, fieldKeys }: RecordModalProps) {
  const [formData, setFormData] = useState<{ [key: string]: any }>({})
  const [loading, setLoading] = useState(false)
  const fieldMappings = getFieldMappings()

  useEffect(() => {
    if (record) {
      // Only include fields that exist in the current record
      const existingFields = Object.keys(record.fields)
      const filteredData = fieldKeys.reduce((acc, key) => {
        if (existingFields.includes(key)) {
          acc[key] = record.fields[key]
        }
        return acc
      }, {} as any)
      setFormData(filteredData)
    } else {
      setFormData({})
    }
  }, [record, isOpen, fieldKeys])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = record 
        ? `/api/admin/records/${record.id}` 
        : '/api/admin/records'
      
      const method = record ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fields: formData }),
      })

      const result = await response.json()
      
      if (response.ok) {
        onSave()
      } else {
        console.error('Save failed:', result)
        alert(`שגיאה בשמירה: ${result.error || 'שגיאה לא ידועה'}`)
      }
    } catch (error) {
      console.error('Error saving record:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFieldChange = (key: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="hebrew-text">
            {record ? 'עריכת רשומה' : 'הוספת רשומה חדשה'}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {fieldKeys.length > 0 ? (
              fieldKeys.map((key) => {
                const isBooleanField = key.startsWith('is_')
                const isNumberField = key.includes('tons') || key.includes('dim') || key.includes('length')
                
                return (
                  <div key={key} className="space-y-2">
                    <Label htmlFor={key} className="hebrew-text">
                      {fieldMappings[key] || key}
                    </Label>
                    
                    {isBooleanField ? (
                      <div className="flex gap-4">
                        <Button
                          type="button"
                          variant={formData[key] === true ? "default" : "outline"}
                          onClick={() => handleFieldChange(key, true)}
                          className="hebrew-text"
                        >
                          כן
                        </Button>
                        <Button
                          type="button"
                          variant={formData[key] === false ? "default" : "outline"}
                          onClick={() => handleFieldChange(key, false)}
                          className="hebrew-text"
                        >
                          לא
                        </Button>
                      </div>
                    ) : (
                      <Input
                        id={key}
                        type={isNumberField ? "number" : "text"}
                        value={formData[key] || ''}
                        onChange={(e) => handleFieldChange(key, isNumberField ? parseFloat(e.target.value) || 0 : e.target.value)}
                        className="text-right"
                        dir="rtl"
                        placeholder={`הכנס ${fieldMappings[key] || key}`}
                      />
                    )}
                  </div>
                )
              })
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="Name" className="hebrew-text">שם</Label>
                  <Input
                    id="Name"
                    value={formData.Name || ''}
                    onChange={(e) => handleFieldChange('Name', e.target.value)}
                    className="text-right"
                    dir="rtl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="Description" className="hebrew-text">תיאור</Label>
                  <Input
                    id="Description"
                    value={formData.Description || ''}
                    onChange={(e) => handleFieldChange('Description', e.target.value)}
                    className="text-right"
                    dir="rtl"
                  />
                </div>
              </div>
            )}
            
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                ביטול
              </Button>
              <Button type="submit" disabled={loading}>
                <Save className="h-4 w-4 ml-2" />
                {loading ? 'שומר...' : 'שמור'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
