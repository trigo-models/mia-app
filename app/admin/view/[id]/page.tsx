'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import Image from 'next/image'
import { LogOut } from 'lucide-react'

interface RecordData {
  id: string
  fields: {
    [key: string]: any
  }
}

const HEBREW_FIELD_MAPPINGS: { [key: string]: string } = {
  'r_owner': 'שם הממלא',
  'fac_name': 'שם המפעל',
  'factory_name': 'שם המפעל',
  'element': 'איזור ספציפי',
  'date_made': 'תאריך ביצוע',
  'start_time': 'שעת התחלה',
  'end_time': 'שעת סיום',
  'r_leaders': 'ראשי צוות',
  'r_team': 'אנשי צוות',
  'is_construction': 'יש קונסטרוקציה',
  'has_construction': 'יש קונסטרוקציה',
  'contruction_tons': 'כמות טון קונסטרוקציה',
  'construction_tons': 'כמות טון קונסטרוקציה',
  'is_greetings': 'יש שבכות',
  'has_fences': 'יש שבכות',
  'greetings_dim': 'שטח שבכות (מ"ר)',
  'fence_area': 'שטח שבכות (מ"ר)',
  'is_handrail': 'יש מעקות',
  'has_railings': 'יש מעקות',
  'handrail_length': 'אורך מעקות (מ"א)',
  'railing_length': 'אורך מעקות (מ"א)',
  'is_steps': 'יש מדרגות',
  'steps_qty': 'כמות מדרגות',
  'step_size': 'מידות מדרגה',
  'is_bolts': 'יש עוגנים',
  'bolt_qty': 'כמות עוגנים',
  'bolt_type': 'סוג העוגן',
  'is_distons': 'האם היו פירוקים',
  'disconnected_tons': 'משקל חומר שפורק לפי טון',
  'job_desc': 'תיאור עבודה מפורט',
  'r_comments': 'הערות נוספות',
  'notes': 'הערות נוספות',
  'r_status': 'סטאטוס'
}

const STATUS_OPTIONS = [
  { value: 'ביצוע', label: 'ביצוע' },
  { value: 'מוקפא', label: 'מוקפא' },
  { value: 'הסתיים', label: 'הסתיים' },
  { value: 'בוטל', label: 'בוטל' }
]

export default function ViewRecordPage() {
  const params = useParams()
  const router = useRouter()
  const [record, setRecord] = useState<RecordData | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [options, setOptions] = useState({
    factories: [] as string[],
    teamLeaders: [] as string[],
    teamMembers: [] as string[]
  })

  useEffect(() => {
    // Check authentication status
    const authStatus = sessionStorage.getItem('admin_authenticated')
    if (authStatus === 'true') {
      setIsAuthenticated(true)
    } else {
      router.push('/admin')
      return
    }

    if (params.id) {
      fetchRecord(params.id as string)
    }
    fetchOptions()
  }, [params.id, router])

  const handleLogout = () => {
    sessionStorage.removeItem('admin_authenticated')
    router.push('/admin')
  }

  const fetchOptions = async () => {
    try {
      const response = await fetch('/api/options')
      const data = await response.json()
      if (data) {
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

  const fetchRecord = async (id: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/records/${id}`)
      const data = await response.json()
      
      if (data.success) {
        setRecord(data.record)
      } else {
        setError(data.error || 'Failed to fetch record')
      }
    } catch (err) {
      setError('Error fetching record')
      console.error('Error fetching record:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!record) return
    
    try {
      setSaving(true)
      
      // Filter out computed fields that cannot be updated
      const { ID, date_created, ...updatableFields } = record.fields
      
      // Format multi-select fields properly for Airtable
      const formattedFields = { ...updatableFields }
      
      // Get the original record to check which fields exist
      const originalResponse = await fetch(`/api/admin/records/${record.id}`)
      const originalData = await originalResponse.json()
      const originalFields = originalData.success ? Object.keys(originalData.record.fields) : []
      
      // Include all fields that are being updated, regardless of whether they existed in the original
      // The API will handle field validation
      const safeFields = { ...formattedFields }
      
      console.log('Original fields:', originalFields)
      console.log('Fields to update:', Object.keys(safeFields))
      console.log('Safe fields data:', safeFields)
      
      const response = await fetch(`/api/admin/records/${record.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields: safeFields })
      })
      
      const data = await response.json()
      if (data.success) {
        setEditing(false)
        alert('Record updated successfully!')
      } else {
        alert(`Error: ${data.error}`)
      }
    } catch (err) {
      alert('Error updating record')
      console.error('Error updating record:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!record) return
    
    if (!confirm('Are you sure you want to delete this record?')) return
    
    try {
      setSaving(true)
      const response = await fetch(`/api/admin/records/${record.id}`, {
        method: 'DELETE'
      })
      
      const data = await response.json()
      if (data.success) {
        alert('Record deleted successfully!')
        router.push('/admin')
      } else {
        alert(`Error: ${data.error}`)
      }
    } catch (err) {
      alert('Error deleting record')
      console.error('Error deleting record:', err)
    } finally {
      setSaving(false)
    }
  }

  const updateField = (fieldName: string, value: any) => {
    if (!record) return
    
    const updatedFields = { ...record.fields, [fieldName]: value }
    
    // Clear conditional fields when checkbox is unchecked
    if (fieldName === 'is_construction' && !value) {
      updatedFields.contruction_tons = ''
    }
    if (fieldName === 'is_greetings' && !value) {
      updatedFields.greetings_dim = ''
    }
    if (fieldName === 'is_handrail' && !value) {
      updatedFields.handrail_length = ''
    }
    if (fieldName === 'is_steps' && !value) {
      updatedFields.steps_qty = ''
      updatedFields.step_size = ''
    }
    if (fieldName === 'is_bolts' && !value) {
      updatedFields.bolt_qty = ''
      updatedFields.bolt_type = ''
    }
    if (fieldName === 'is_distons' && !value) {
      updatedFields.disconnected_tons = ''
    }
    
    setRecord({
      ...record,
      fields: updatedFields
    })
  }

  const renderField = (fieldName: string, value: any) => {
    const hebrewLabel = HEBREW_FIELD_MAPPINGS[fieldName] || fieldName
    
    // Handle field name variations
    const actualFieldName = fieldName
    
    // Special handling for factory name - show as dropdown
    if (fieldName === 'fac_name') {
      return (
        <div className="space-y-2">
          <Label className="text-sm font-medium hebrew-text">{hebrewLabel}</Label>
          {editing ? (
            <Select value={value || ''} onValueChange={(val) => updateField(fieldName, val)}>
              <SelectTrigger className="h-10 text-right hebrew-text" dir="rtl">
                <SelectValue placeholder="בחר שם מפעל" />
              </SelectTrigger>
              <SelectContent>
                {options.factories.map((factory) => (
                  <SelectItem key={factory} value={factory} className="text-right hebrew-text" dir="rtl">
                    {factory}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <p className="text-sm text-gray-700 hebrew-text p-2 bg-gray-50 rounded">
              {value || 'אין נתונים'}
            </p>
          )}
        </div>
      )
    }

    // Special handling for team leaders - show as multi-select
    if (fieldName === 'r_leaders') {
      const items = Array.isArray(value) ? value : (value ? value.split(',').map((item: string) => item.trim()) : [])
      return (
        <div className="space-y-2">
          <Label className="text-sm font-medium hebrew-text">{hebrewLabel}</Label>
          {editing ? (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                {options.teamLeaders.map((leader) => (
                  <Button
                    key={leader}
                    type="button"
                    variant={items.includes(leader) ? "default" : "outline"}
                    onClick={() => {
                      const newItems = items.includes(leader) 
                        ? items.filter(item => item !== leader)
                        : [...items, leader]
                      updateField(fieldName, newItems)
                    }}
                    className="h-8 text-xs hebrew-text"
                  >
                    {leader}
                  </Button>
                ))}
              </div>
              <div className="flex flex-wrap gap-1">
                {items.map((item, index) => (
                  <span key={index} className="text-xs bg-black text-white px-2 py-1 rounded hebrew-text">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-2 bg-gray-50 rounded">
              {items.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {items.map((item, index) => (
                    <span key={index} className="text-xs bg-black text-white px-2 py-1 rounded hebrew-text">
                      {item}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 hebrew-text">אין נתונים</p>
              )}
            </div>
          )}
        </div>
      )
    }

    // Special handling for team members - show as multi-select
    if (fieldName === 'r_team') {
      const items = Array.isArray(value) ? value : (value ? value.split(',').map((item: string) => item.trim()) : [])
      return (
        <div className="space-y-2">
          <Label className="text-sm font-medium hebrew-text">{hebrewLabel}</Label>
          {editing ? (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                {options.teamMembers.map((member) => (
                  <Button
                    key={member}
                    type="button"
                    variant={items.includes(member) ? "default" : "outline"}
                    onClick={() => {
                      const newItems = items.includes(member) 
                        ? items.filter(item => item !== member)
                        : [...items, member]
                      updateField(fieldName, newItems)
                    }}
                    className="h-8 text-xs hebrew-text"
                  >
                    {member}
                  </Button>
                ))}
              </div>
              <div className="flex flex-wrap gap-1">
                {items.map((item, index) => (
                  <span key={index} className="text-xs bg-black text-white px-2 py-1 rounded hebrew-text">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-2 bg-gray-50 rounded">
              {items.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {items.map((item, index) => (
                    <span key={index} className="text-xs bg-black text-white px-2 py-1 rounded hebrew-text">
                      {item}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 hebrew-text">אין נתונים</p>
              )}
            </div>
          )}
        </div>
      )
    }

    // Special handling for time fields - show only time part
    if (fieldName === 'start_time' || fieldName === 'end_time') {
      const timeValue = value ? (value.includes('T') ? value.split('T')[1].substring(0, 5) : value.substring(0, 5)) : ''
      return (
        <div className="space-y-2">
          <Label className="text-sm font-medium hebrew-text">{hebrewLabel}</Label>
          {editing ? (
            <Input
              type="time"
              value={timeValue}
              onChange={(e) => updateField(fieldName, e.target.value)}
              className="h-10 text-right hebrew-text"
              dir="rtl"
            />
          ) : (
            <p className="text-sm text-gray-700 hebrew-text p-2 bg-gray-50 rounded">
              {timeValue || 'אין נתונים'}
            </p>
          )}
        </div>
      )
    }
    
    if (fieldName === 'r_status') {
      return (
        <div className="space-y-2">
          <Label className="text-sm font-medium hebrew-text">{hebrewLabel}</Label>
          {editing ? (
            <Select value={value || ''} onValueChange={(val) => updateField(fieldName, val)}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="בחר סטאטוס" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <p className="text-sm text-gray-700 hebrew-text p-2 bg-gray-50 rounded">
              {value || 'לא מוגדר'}
            </p>
          )}
        </div>
      )
    }

    if (fieldName === 'job_desc' || fieldName === 'notes') {
      return (
        <div className="space-y-2">
          <Label className="text-sm font-medium hebrew-text">{hebrewLabel}</Label>
          {editing ? (
            <Textarea
              value={value || ''}
              onChange={(e) => updateField(fieldName, e.target.value)}
              className="min-h-[100px] text-right hebrew-text"
              dir="rtl"
            />
          ) : (
            <p className="text-sm text-gray-700 hebrew-text p-2 bg-gray-50 rounded min-h-[100px] whitespace-pre-wrap">
              {value || 'אין תוכן'}
            </p>
          )}
        </div>
      )
    }

    // Handle checkbox fields - check if it's a boolean field by field name
    const isCheckboxField = [
      'is_construction', 'has_construction',
      'is_greetings', 'has_fences', 
      'is_handrail', 'has_railings',
      'is_steps', 'has_steps',
      'is_bolts', 'has_bolts',
      'is_distons'
    ].includes(fieldName)

    if (isCheckboxField) {
      // Convert various values to boolean
      const isChecked = value === true || value === 'true' || value === 'כן' || value === 'yes' || value === 1
      return (
        <div className="space-y-2">
          <Label className="text-sm font-medium hebrew-text">{hebrewLabel}</Label>
          {editing ? (
            <div className="flex items-center space-x-2 space-x-reverse">
              <Checkbox
                checked={isChecked}
                onCheckedChange={(checked) => updateField(fieldName, checked)}
              />
              <span className="text-sm hebrew-text">{isChecked ? 'כן' : 'לא'}</span>
            </div>
          ) : (
            <p className="text-sm text-gray-700 hebrew-text p-2 bg-gray-50 rounded">
              {isChecked ? 'כן' : 'לא'}
            </p>
          )}
        </div>
      )
    }

    if (typeof value === 'boolean') {
      return (
        <div className="space-y-2">
          <Label className="text-sm font-medium hebrew-text">{hebrewLabel}</Label>
          {editing ? (
            <div className="flex items-center space-x-2 space-x-reverse">
              <Checkbox
                checked={value}
                onCheckedChange={(checked) => updateField(fieldName, checked)}
              />
              <span className="text-sm hebrew-text">{value ? 'כן' : 'לא'}</span>
            </div>
          ) : (
            <p className="text-sm text-gray-700 hebrew-text p-2 bg-gray-50 rounded">
              {value ? 'כן' : 'לא'}
            </p>
          )}
        </div>
      )
    }


    // Default text/number input
    return (
      <div className="space-y-2">
        <Label className="text-sm font-medium hebrew-text">{hebrewLabel}</Label>
        {editing ? (
          <Input
            value={value || ''}
            onChange={(e) => updateField(fieldName, e.target.value)}
            className="h-10 text-right hebrew-text"
            dir="rtl"
          />
        ) : (
          <p className="text-sm text-gray-700 hebrew-text p-2 bg-gray-50 rounded">
            {value || 'אין נתונים'}
          </p>
        )}
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600 hebrew-text">מעביר לדף ההתחברות...</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <div className="hebrew-text text-lg">טוען נתונים...</div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !record) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <Card>
            <CardContent className="p-8 text-center">
              <div className="hebrew-text text-lg text-red-600">
                {error || 'Record not found'}
              </div>
              <Button 
                onClick={() => router.push('/admin')} 
                className="mt-4 hebrew-text"
              >
                חזור לפאנל הניהול
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4 space-x-reverse">
              <Image
                src="/gash-logo.svg"
                alt="Gash Logo"
                width={80}
                height={32}
                className="hebrew-text"
                priority
              />
              <h1 className="text-3xl font-bold hebrew-text">צפייה ועריכה - רשומה</h1>
            </div>
            <div className="flex space-x-2 space-x-reverse">
              <Button
                variant="outline"
                onClick={() => router.push('/admin')}
                className="hebrew-text"
              >
                חזור לפאנל
              </Button>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="hebrew-text"
              >
                <LogOut className="h-4 w-4 ml-2" />
                התנתק
              </Button>
              {editing ? (
                <>
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="hebrew-text bg-green-600 hover:bg-green-700"
                  >
                    {saving ? 'שומר...' : 'שמור'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setEditing(false)}
                    className="hebrew-text"
                  >
                    ביטול
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={() => setEditing(true)}
                    className="hebrew-text"
                  >
                    ערוך
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={saving}
                    className="hebrew-text"
                  >
                    מחק
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>


        {/* Record Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="hebrew-text">פרטים בסיסיים</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {renderField('r_owner', record.fields.r_owner)}
              {renderField('fac_name', record.fields.fac_name)}
              {renderField('element', record.fields.element)}
              {renderField('date_made', record.fields.date_made)}
              {renderField('start_time', record.fields.start_time)}
              {renderField('end_time', record.fields.end_time)}
              {renderField('r_status', record.fields.r_status)}
            </CardContent>
          </Card>

          {/* Team Information */}
          <Card>
            <CardHeader>
              <CardTitle className="hebrew-text">פרטי הצוות</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {renderField('r_leaders', record.fields.r_leaders)}
              {renderField('r_team', record.fields.r_team)}
            </CardContent>
          </Card>

          {/* Work Details */}
          <Card>
            <CardHeader>
              <CardTitle className="hebrew-text">פרטי העבודה</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {renderField('is_construction', record.fields.is_construction)}
              {record.fields.is_construction && renderField('contruction_tons', record.fields.contruction_tons)}
              
              {renderField('is_greetings', record.fields.is_greetings)}
              {record.fields.is_greetings && renderField('greetings_dim', record.fields.greetings_dim)}
              
              {renderField('is_handrail', record.fields.is_handrail)}
              {record.fields.is_handrail && renderField('handrail_length', record.fields.handrail_length)}
              
              {renderField('is_steps', record.fields.is_steps)}
              {record.fields.is_steps && (
                <>
                  {renderField('steps_qty', record.fields.steps_qty)}
                  {renderField('step_size', record.fields.step_size)}
                </>
              )}
              
              {renderField('is_bolts', record.fields.is_bolts)}
              {record.fields.is_bolts && (
                <>
                  {renderField('bolt_qty', record.fields.bolt_qty)}
                  {renderField('bolt_type', record.fields.bolt_type)}
                </>
              )}
              
              {renderField('is_distons', record.fields.is_distons)}
              {record.fields.is_distons && renderField('disconnected_tons', record.fields.disconnected_tons)}
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle className="hebrew-text">מידע נוסף</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {renderField('job_desc', record.fields.job_desc)}
              {renderField('r_comments', record.fields.r_comments)}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
