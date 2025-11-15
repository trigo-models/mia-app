'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X, Eye, Save, Edit } from 'lucide-react'

interface Record {
  id: string
  fields: { [key: string]: any }
  createdTime: string
}

interface ViewRecordModalProps {
  isOpen: boolean
  onClose: () => void
  record: Record | null
  fieldKeys: string[]
  columnMappings: { [key: string]: string }
  onSave?: (recordId: string, updatedFields: { [key: string]: any }) => void
}

export default function ViewRecordModal({ 
  isOpen, 
  onClose, 
  record, 
  fieldKeys, 
  columnMappings,
  onSave
}: ViewRecordModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedFields, setEditedFields] = useState<{ [key: string]: any }>({})
  const [loading, setLoading] = useState(false)
  const [options, setOptions] = useState<{
    factories: string[]
    teamLeaders: string[]
    teamMembers: string[]
  }>({
    factories: [],
    teamLeaders: [],
    teamMembers: []
  })

  const statusOptions = [
    { value: 'ביצוע', label: 'ביצוע' },
    { value: 'מוקפא', label: 'מוקפא' },
    { value: 'הסתיים', label: 'הסתיים' },
    { value: 'בוטל', label: 'בוטל' }
  ]

  const getFieldMappings = (): { [key: string]: string } => {
    return {
      'fac_name': 'שם המפעל',
      'element': 'איזור ספציפי',
      'date_made': 'תאריך ביצוע',
      'start_time': 'שעת התחלה',
      'end_time': 'שעת סיום',
      'is_construction': 'קונסטרוקציה',
      'contruction_tons': 'משקל קונסט',
      'is_greetings': 'שבכות',
      'greetings_dim': 'שבכות מ"ר',
      'is_handrail': 'מעקות',
      'handrail_length': 'מעקות מ"א',
      'is_steps': 'מדרגות',
      'steps_qty': 'כמות מדרגות',
      'step_size': 'מידות מדרגה',
      'is_bolts': 'עוגנים',
      'bolt_qty': 'כמות עוגנים',
      'bolt_type': 'סוג העוגן',
      'r_comments': 'הערות ר"צ',
      'r_leaders': 'ראשי צוות',
      'r_team': 'אנשי צוות',
      'r_status': 'סטאטוס',
      'job_desc': 'תיאור עבודה מפורט',
      'has_disconnections': 'פירוקים',
      'disconnected_tons': 'משקל חומר שפורק',
      'Number': 'מספר עבודה'
    }
  }

  useEffect(() => {
    if (record) {
      // Filter out computed fields that cannot be edited
      const editableFields = Object.keys(record.fields).reduce((acc, key) => {
        if (key !== 'ID' && key !== 'id' && key !== 'date_created') {
          let value = record.fields[key]
          
          // Convert comma-separated strings to arrays for multi-select fields
          if ((key === 'r_leaders' || key === 'r_team') && typeof value === 'string' && value.includes(',')) {
            value = value.split(',').map(item => item.trim()).filter(item => item)
          }
          
          acc[key] = value
        }
        return acc
      }, {} as any)
      setEditedFields(editableFields)
    }
  }, [record])

  // Fetch options when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchOptions()
    }
  }, [isOpen])

  const fetchOptions = async () => {
    try {
      const response = await fetch('/api/options')
      if (response.ok) {
        const data = await response.json()
        setOptions({
          factories: data.factories || [],
          teamLeaders: data.teamLeaders || [],
          teamMembers: data.teamMembers || []
        })
      }
    } catch (error) {
      console.error('Error fetching options:', error)
    }
  }

  if (!isOpen || !record) return null

  const formatValue = (value: any) => {
    if (value === true) {
      return <span className="text-green-600 font-bold">V</span>
    } else if (value === false) {
      return <span className="text-red-600 font-bold">X</span>
    } else if (Array.isArray(value)) {
      return value.join(', ')
    } else if (value !== null && value !== undefined) {
      return String(value)
    }
    return ''
  }

  const handleFieldChange = (key: string, value: any) => {
    setEditedFields(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleSave = async () => {
    if (!onSave) return
    
    setLoading(true)
    try {
      // Convert arrays back to comma-separated strings for multi-select fields
      const fieldsToSave = { ...editedFields }
      
      if (Array.isArray(fieldsToSave.r_leaders)) {
        fieldsToSave.r_leaders = fieldsToSave.r_leaders.join(', ')
      }
      if (Array.isArray(fieldsToSave.r_team)) {
        fieldsToSave.r_team = fieldsToSave.r_team.join(', ')
      }
      
      await onSave(record.id, fieldsToSave)
      setIsEditing(false)
    } catch (error) {
      console.error('Error saving record:', error)
      alert('שגיאה בשמירת הרשומה. נסה שוב.')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    // Reset to original fields with proper array conversion
    const resetFields = Object.keys(record.fields).reduce((acc, key) => {
      if (key !== 'ID' && key !== 'id' && key !== 'date_created') {
        let value = record.fields[key]
        
        // Convert comma-separated strings to arrays for multi-select fields
        if ((key === 'r_leaders' || key === 'r_team') && typeof value === 'string' && value.includes(',')) {
          value = value.split(',').map(item => item.trim()).filter(item => item)
        }
        
        acc[key] = value
      }
      return acc
    }, {} as any)
    
    setEditedFields(resetFields)
    setIsEditing(false)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="hebrew-text flex items-center">
            <Eye className="h-5 w-5 ml-2" />
            {isEditing ? 'עריכת רשומה' : 'צפיה ברשומה'} - {record.fields.fac_name || 'רשומה'}
          </CardTitle>
          <div className="flex gap-2">
            {!isEditing ? (
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4 ml-1" />
                ערוך
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCancel}>
                  ביטול
                </Button>
                <Button size="sm" onClick={handleSave} disabled={loading}>
                  <Save className="h-4 w-4 ml-1" />
                  {loading ? 'שומר...' : 'שמור'}
                </Button>
              </div>
            )}
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {fieldKeys.filter(key => key !== 'ID' && key !== 'id' && key !== 'date_created').map((key) => {
              const value = isEditing ? editedFields[key] : record.fields[key]
              const fieldMappings = getFieldMappings()
              const label = fieldMappings[key] || columnMappings[key] || key
              
              return (
                <div key={key} className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 hebrew-text block">
                    {label}
                  </label>
                  
                  {isEditing ? (
                    key === 'r_status' ? (
                      <Select
                        value={value || ''}
                        onValueChange={(newValue) => handleFieldChange(key, newValue)}
                      >
                        <SelectTrigger className="h-12 rounded-lg text-right" dir="rtl">
                          <SelectValue placeholder="בחר סטאטוס" className="hebrew-text" />
                        </SelectTrigger>
                        <SelectContent className="rounded-lg">
                          {statusOptions.map((option) => (
                            <SelectItem 
                              key={option.value} 
                              value={option.value} 
                              className="text-right hebrew-text" 
                              dir="rtl"
                            >
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : key === 'fac_name' ? (
                      <Select
                        value={value || ''}
                        onValueChange={(newValue) => handleFieldChange(key, newValue)}
                      >
                        <SelectTrigger className="h-12 rounded-lg text-right" dir="rtl">
                          <SelectValue placeholder="בחר שם מפעל" className="hebrew-text" />
                        </SelectTrigger>
                        <SelectContent className="rounded-lg">
                          {options.factories.map((factory) => (
                            <SelectItem 
                              key={factory} 
                              value={factory} 
                              className="text-right hebrew-text" 
                              dir="rtl"
                            >
                              {factory}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : key === 'r_leaders' ? (
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-2 justify-end" dir="rtl">
                          {Array.isArray(value) ? value.map((leader: string) => (
                            <span
                              key={leader}
                              className="bg-blue-100 text-blue-800 px-3 py-1 rounded-lg text-sm hebrew-text"
                            >
                              {leader}
                            </span>
                          )) : value ? (
                            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-lg text-sm hebrew-text">
                              {value}
                            </span>
                          ) : null}
                        </div>
                        <div className="grid grid-cols-2 gap-2" dir="rtl">
                          {options.teamLeaders.map((leader) => {
                            const isSelected = Array.isArray(value) 
                              ? value.includes(leader) 
                              : value === leader
                            return (
                              <button
                                key={leader}
                                type="button"
                                onClick={() => {
                                  if (Array.isArray(value)) {
                                    if (value.includes(leader)) {
                                      handleFieldChange(key, value.filter((l: string) => l !== leader))
                                    } else {
                                      handleFieldChange(key, [...value, leader])
                                    }
                                  } else {
                                    handleFieldChange(key, [leader])
                                  }
                                }}
                                className={`px-3 py-2 rounded-lg text-sm hebrew-text ${
                                  isSelected 
                                    ? 'bg-blue-600 text-white' 
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                              >
                                {leader}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    ) : key === 'r_team' ? (
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-2 justify-end" dir="rtl">
                          {Array.isArray(value) ? value.map((member: string) => (
                            <span
                              key={member}
                              className="bg-green-100 text-green-800 px-3 py-1 rounded-lg text-sm hebrew-text"
                            >
                              {member}
                            </span>
                          )) : value ? (
                            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-lg text-sm hebrew-text">
                              {value}
                            </span>
                          ) : null}
                        </div>
                        <div className="grid grid-cols-2 gap-2" dir="rtl">
                          {options.teamMembers.map((member) => {
                            const isSelected = Array.isArray(value) 
                              ? value.includes(member) 
                              : value === member
                            return (
                              <button
                                key={member}
                                type="button"
                                onClick={() => {
                                  if (Array.isArray(value)) {
                                    if (value.includes(member)) {
                                      handleFieldChange(key, value.filter((m: string) => m !== member))
                                    } else {
                                      handleFieldChange(key, [...value, member])
                                    }
                                  } else {
                                    handleFieldChange(key, [member])
                                  }
                                }}
                                className={`px-3 py-2 rounded-lg text-sm hebrew-text ${
                                  isSelected 
                                    ? 'bg-green-600 text-white' 
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                              >
                                {member}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    ) : key.startsWith('is_') ? (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleFieldChange(key, true)}
                          className={`px-4 py-2 rounded-lg hebrew-text ${
                            value === true 
                              ? 'bg-green-600 text-white' 
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          כן
                        </button>
                        <button
                          type="button"
                          onClick={() => handleFieldChange(key, false)}
                          className={`px-4 py-2 rounded-lg hebrew-text ${
                            value === false 
                              ? 'bg-red-600 text-white' 
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          לא
                        </button>
                      </div>
                    ) : key.includes('tons') || key.includes('dim') || key.includes('length') || key.includes('qty') ? (
                      <input
                        type="number"
                        value={value || ''}
                        onChange={(e) => handleFieldChange(key, parseFloat(e.target.value) || 0)}
                        className="w-full p-3 rounded-lg border border-gray-300 text-right hebrew-text"
                        dir="rtl"
                      />
                    ) : (
                      <input
                        type="text"
                        value={value || ''}
                        onChange={(e) => handleFieldChange(key, e.target.value)}
                        className="w-full p-3 rounded-lg border border-gray-300 text-right hebrew-text"
                        dir="rtl"
                      />
                    )
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-lg min-h-[40px] flex items-center">
                      <span className="hebrew-text text-right w-full">
                        {formatValue(value)}
                      </span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500 hebrew-text">
                תאריך יצירה: {new Date(record.createdTime).toLocaleDateString('he-IL')}
              </div>
              <Button onClick={onClose} className="hebrew-text">
                סגור
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
