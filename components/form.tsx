'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ButtonSelect } from '@/components/ui/button-select'
import { Textarea } from '@/components/ui/textarea'

type TaskType =
  | 'construction'
  | 'stairs'
  | 'mesh'
  | 'railing'
  | 'sheetMetal'
  | 'equipment'
  | 'minimumPermit'
  | 'anchors'
  | 'manpower'

interface TaskOption {
  id: TaskType
  label: string
  description: string
}

interface ClauseOption {
  id: string
  name: string
  description?: string | null
}

type MeasurementUnit = 'טון' | 'מטר רבוע' | 'מטר אורך' | 'יחידה' | ''

interface ManpowerPerson {
  localId: string
  firstName: string
  workHours: string
}

interface TaskEntry {
  localId: string
  clauseId: string
  clauseName: string
  description: string
  quantity: string
  measurementUnit: MeasurementUnit
  attachment: string | null
  people?: ManpowerPerson[] // Only for manpower task type
  // Fields for minimumPermit
  title?: string // כותרת
  specificLocation?: string // מיקום ספציפי של העבודה
  whatWasDone?: string // מה בוצע בפועל
}

type TaskCollection = Partial<Record<TaskType, TaskEntry[]>>

interface FormData {
  owner: string
  factoryName: string
  element: string
  dateMade: string
  startTime: string
  endTime: string
  teamLeaders: string[]
  teamMembers: string[]
  hasConstruction: boolean
  constructionType: 'קבועה' | 'זמנית' | ''
  constructionTons: string
  constructionDescription: string
  constructionImage: string | null
  hasFences: boolean
  fenceArea: string
  hasRailings: boolean
  railingLength: string
  hasSteps: boolean
  stepQty: string
  stepSize: string
  hasBolts: boolean
  boltQty: string
  boltType: string
  hasDisconnections: boolean
  disconnectedTons: string
  jobDesc: string
  notes: string
  projectId: string
  selectedTaskType: TaskType | ''
  tasks: TaskCollection
}

type FormErrors = Partial<Record<keyof FormData | 'projectId', string>>

const initialFormData: FormData = {
  owner: '',
  factoryName: '',
  element: '',
  dateMade: '',
  startTime: '',
  endTime: '',
  teamLeaders: [],
  teamMembers: [],
  hasConstruction: false,
  constructionType: '',
  constructionTons: '',
  constructionDescription: '',
  constructionImage: null,
  hasFences: false,
  fenceArea: '',
  hasRailings: false,
  railingLength: '',
  hasSteps: false,
  stepQty: '',
  stepSize: '',
  hasBolts: false,
  boltQty: '',
  boltType: '',
  hasDisconnections: false,
  disconnectedTons: '',
  jobDesc: '',
  notes: '',
  projectId: '',
  selectedTaskType: '',
  tasks: {}
}

// Hebrew text constants
const HEBREW_TEXT = {
  title: 'דיווח עבודה - MIA',
  step1Title: 'פרטים כלליים',
  step2Title: 'צוות העבודה',
  step3Title: 'בחירת משימה',
  step: 'שלב',
  of: 'מתוך',
  previous: 'הקודם',
  next: 'הבא',
  submitting: 'שולח...',
  submit: 'שלח דיווח',
  loading: 'טוען נתונים...',
  owner: 'שם הממלא',
  factoryName: 'שם המפעל',
  specificArea: 'איזור ספציפי',
  dateMade: 'תאריך ביצוע',
  startTime: 'שעת התחלה',
  endTime: 'שעת סיום',
  teamLeaders: 'ראש צוות',
  teamMembers: 'אנשי צוות',
  hasConstruction: 'יש קונסטרוקציה?',
  constructionTons: 'ציין כמה טון',
  hasFences: 'יש שבכות?',
  fenceArea: 'ציין כמה מ"ר',
  hasRailings: 'יש מעקות?',
  railingLength: 'ציין כמה מ"א',
  hasSteps: 'יש מדרגות?',
  stepQty: 'כמות מדרגות',
  stepSize: 'מידות מדרגה',
  hasBolts: 'יש עוגנים?',
  boltQty: 'כמות עוגנים',
  boltType: 'סוג העוגן',
  hasDisconnections: 'האם היו פירוקים?',
  disconnectedTons: 'מה משקל החומר שפורק לפי טון?',
  jobDesc: 'תיאור עבודה מפורט',
  notes: 'הערות נוספות',
  yes: 'כן',
  no: 'לא',
  selectFactory: 'בחר שם מפעל',
  enterArea: 'הכנס תיאור האיזור הספציפי',
  enterTons: 'הכנס מספר טון',
  enterSqm: 'הכנס מספר מ"ר',
  enterMeters: 'הכנס מספר מ"א',
  enterStepQty: 'הכנס כמות מדרגות',
  enterStepSize: 'הכנס מידות מדרגה',
  enterBoltQty: 'הכנס כמות עוגנים',
  enterBoltType: 'הכנס סוג העוגן',
  enterWeight: 'הכנס משקל החומר שפורק לפי טון',
  enterJobDesc: 'הכנס תיאור מפורט של העבודה שבוצעה',
  enterNotes: 'כתב כאן הערות נוספות...',
  taskSelectionTitle: 'בחר סוג משימה',
  taskSelectionSubtitle: 'בחר את סוג המשימה שברצונך להוסיף לפרויקט הקיים',
  taskSelectionNext: 'המשך (בפיתוח)',
  taskSelectionChange: 'בחר משימה אחרת',
  taskSelectionComingSoon: 'פרטי המשימה יוצגו כאן בהמשך הפיתוח'
}

const TASK_OPTIONS: TaskOption[] = [
  {
    id: 'construction',
    label: 'קונסטרוקציה',
    description: 'הוספת משימות הקשורות לעבודות קונסטרוקציה'
  },
  {
    id: 'stairs',
    label: 'מדרגה',
    description: 'תיעוד עבודות התקנה או תיקון של מדרגות'
  },
  {
    id: 'mesh',
    label: 'שבכה',
    description: 'משימות עבור שבכות והתקנות רשת'
  },
  {
    id: 'railing',
    label: 'מעקה',
    description: 'עבודות ייצור או התקנה של מעקות'
  },
  {
    id: 'sheetMetal',
    label: 'פחים',
    description: 'משימות הכוללות עבודות פח וייצור'
  },
  {
    id: 'equipment',
    label: 'ציוד',
    description: 'הוספת משימות לתחזוקה או טיפול בציוד'
  },
  {
    id: 'minimumPermit',
    label: 'הרשאת מינימום',
    description: 'ניהול משימות הקשורות להרשאות מינימום'
  },
  {
    id: 'anchors',
    label: 'עוגנים',
    description: 'עבודות התקנה או תיקון של עוגנים'
  },
  {
    id: 'manpower',
    label: 'כח אדם',
    description: 'מעקב אחר משימות כח אדם ומשימות צוות'
  }
]

const MEASUREMENT_UNITS: MeasurementUnit[] = ['טון', 'מטר רבוע', 'מטר אורך', 'יחידה', '']

const TASK_CATEGORY_LABELS: Record<TaskType, string> = TASK_OPTIONS.reduce((acc, option) => {
  acc[option.id] = option.label
  return acc
}, {} as Record<TaskType, string>)

const generateLocalId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `task_${Math.random().toString(36).slice(2, 10)}`
}

export default function MultiStepForm() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)
  const [options, setOptions] = useState({
    factories: [] as string[],
    teamLeaders: [] as string[],
    teamMembers: [] as string[],
    owners: [] as string[],
    projects: [] as { id: string; name: string; project_number?: string; factory_name?: string }[]
  })
  const [clausesByCategory, setClausesByCategory] = useState<Partial<Record<TaskType, ClauseOption[]>>>({})
  const [clausesLoadingCategory, setClausesLoadingCategory] = useState<TaskType | null>(null)
  const [clausesError, setClausesError] = useState<string | null>(null)
  const [completedCategories, setCompletedCategories] = useState<Set<TaskType>>(new Set())
  const [taskErrors, setTaskErrors] = useState<
    Partial<Record<TaskType, Record<string, Partial<Record<keyof TaskEntry, string>>>>>
  >({})
  const [taskValidationMessage, setTaskValidationMessage] = useState<string | null>(null)

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const response = await fetch('/api/options')
        const data = await response.json()
        
        if (!response.ok) {
          console.error('API Error:', data)
          if (data.error) {
            console.error('Error message:', data.error)
            console.error('Error details:', data.details)
          }
          return
        }
        
        if (data) {
          setOptions({
            factories: data.factories || [],
            teamLeaders: data.teamLeaders || [],
            teamMembers: data.teamMembers || [],
            owners: data.owners || [],
            projects: data.projects || []
          })
          console.log('Fetched options:', {
            factories: data.factories?.length || 0,
            teamLeaders: data.teamLeaders?.length || 0,
            teamMembers: data.teamMembers?.length || 0,
            projects: data.projects?.length || 0
          })
          
          if (data.warnings) {
            console.warn('Warnings from API:', data.warnings)
          }
        }
      } catch (error) {
        console.error('Error fetching options:', error)
      }
    }
    fetchOptions()
  }, [])

  useEffect(() => {
    const loadClauses = async (taskType: TaskType) => {
      try {
        setClausesError(null)
        setClausesLoadingCategory(taskType)
        const response = await fetch(`/api/clauses?taskType=${taskType}`)
        if (!response.ok) {
          throw new Error('Failed to fetch clauses')
        }
        const data = await response.json()
        setClausesByCategory(prev => ({
          ...prev,
          [taskType]: data.clauses || []
        }))
      } catch (error: any) {
        console.error('Error fetching clauses:', error)
        setClausesError('אירעה שגיאה בטעינת הסעיפים. נסה שוב.')
      } finally {
        setClausesLoadingCategory(null)
      }
    }

    if (formData.selectedTaskType && !clausesByCategory[formData.selectedTaskType]) {
      loadClauses(formData.selectedTaskType)
    }
  }, [formData.selectedTaskType, clausesByCategory])

  // Auto-set first clause for minimumPermit entries when clauses are loaded
  useEffect(() => {
    const taskType = formData.selectedTaskType
    if (taskType === 'minimumPermit' && clausesByCategory[taskType] && clausesByCategory[taskType].length > 0) {
      const firstClause = clausesByCategory[taskType][0]
      const entries = getTaskEntries(taskType)
      const needsUpdate = entries.some(entry => !entry.clauseId)
      
      if (needsUpdate) {
        const updatedEntries = entries.map(entry => {
          if (!entry.clauseId) {
            return {
              ...entry,
              clauseId: firstClause.id,
              clauseName: firstClause.name || ''
            }
          }
          return entry
        })
        setTaskEntries(taskType, updatedEntries)
      }
    }
  }, [clausesByCategory, formData.selectedTaskType])

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
    // Clear project selection when factory changes
    if (field === 'factoryName') {
      console.log('Factory selected:', value)
      console.log('Available projects:', options.projects.filter(p => p.factory_name === value))
      setFormData(prev => ({ ...prev, [field]: value, projectId: '' }))
      // Clear project error when factory changes
      if (errors.projectId) {
        setErrors(prev => ({ ...prev, projectId: undefined }))
      }
    }

    if (field === 'selectedTaskType') {
      setClausesError(null)
      setTaskValidationMessage(null)
    }
  }

  const getTaskEntries = (taskType: TaskType): TaskEntry[] => {
    return formData.tasks[taskType] || []
  }

  const setTaskEntries = (taskType: TaskType, entries: TaskEntry[]) => {
    setFormData(prev => ({
      ...prev,
      tasks: {
        ...prev.tasks,
        [taskType]: entries
      }
    }))
    setTaskErrors(prev => {
      const prevErrors = prev[taskType]
      if (!prevErrors) return prev
      const nextErrors: Record<string, Partial<Record<keyof TaskEntry, string>>> = {}
      entries.forEach(entry => {
        if (prevErrors[entry.localId]) {
          nextErrors[entry.localId] = prevErrors[entry.localId]
        }
      })
      return { ...prev, [taskType]: nextErrors }
    })
  }

  const addTaskEntry = (taskType: TaskType) => {
    const existingEntries = getTaskEntries(taskType)
    const clauseOptions = clausesByCategory[taskType] || []
    const newEntry: TaskEntry = {
      localId: generateLocalId(),
      clauseId: '',
      clauseName: '',
      description: '',
      quantity: '',
      measurementUnit: '',
      attachment: null,
      ...(taskType === 'manpower' ? { people: [] } : {}),
      ...(taskType === 'minimumPermit' ? { title: '', specificLocation: '', whatWasDone: '' } : {})
    }

    // For minimumPermit: automatically set the first clause if available
    if (taskType === 'minimumPermit' && clauseOptions.length > 0) {
      const firstClause = clauseOptions[0]
      newEntry.clauseId = firstClause.id
      newEntry.clauseName = firstClause.name || ''
    }

    setTaskEntries(taskType, [...existingEntries, newEntry])
  }

  const addManpowerPerson = (taskType: TaskType, entryId: string) => {
    const entries = getTaskEntries(taskType)
    const updated = entries.map(entry => {
      if (entry.localId === entryId) {
        const newPerson: ManpowerPerson = {
          localId: generateLocalId(),
          firstName: '',
          workHours: ''
        }
        return {
          ...entry,
          people: [...(entry.people || []), newPerson]
        }
      }
      return entry
    })
    setTaskEntries(taskType, updated)
  }

  const removeManpowerPerson = (taskType: TaskType, entryId: string, personId: string) => {
    const entries = getTaskEntries(taskType)
    const updated = entries.map(entry => {
      if (entry.localId === entryId) {
        return {
          ...entry,
          people: (entry.people || []).filter(p => p.localId !== personId)
        }
      }
      return entry
    })
    setTaskEntries(taskType, updated)
  }

  const updateManpowerPerson = (
    taskType: TaskType,
    entryId: string,
    personId: string,
    updates: Partial<ManpowerPerson>
  ) => {
    const entries = getTaskEntries(taskType)
    const updated = entries.map(entry => {
      if (entry.localId === entryId) {
        return {
          ...entry,
          people: (entry.people || []).map(person =>
            person.localId === personId ? { ...person, ...updates } : person
          )
        }
      }
      return entry
    })
    setTaskEntries(taskType, updated)
  }

  const clearTaskEntryError = (taskType: TaskType, entryId: string, field: keyof TaskEntry) => {
    setTaskErrors(prev => {
      const taskTypeErrors = prev[taskType]
      if (!taskTypeErrors) return prev
      const entryErrors = taskTypeErrors[entryId]
      if (!entryErrors || !entryErrors[field]) return prev
      const updatedEntryErrors = { ...entryErrors }
      delete updatedEntryErrors[field]
      const updatedTaskTypeErrors = { ...taskTypeErrors, [entryId]: updatedEntryErrors }
      return { ...prev, [taskType]: updatedTaskTypeErrors }
    })
  }

  const setTaskEntryError = (
    taskType: TaskType,
    entryId: string,
    field: keyof TaskEntry,
    message: string
  ) => {
    setTaskErrors(prev => ({
      ...prev,
      [taskType]: {
        ...(prev[taskType] || {}),
        [entryId]: {
          ...(prev[taskType]?.[entryId] || {}),
          [field]: message
        }
      }
    }))
  }

  const updateTaskEntry = (taskType: TaskType, entryId: string, updates: Partial<TaskEntry>) => {
    const updated = getTaskEntries(taskType).map(entry =>
      entry.localId === entryId ? { ...entry, ...updates } : entry
    )
    setTaskEntries(taskType, updated)
    Object.keys(updates).forEach(field => {
      clearTaskEntryError(taskType, entryId, field as keyof TaskEntry)
    })
  }

  const removeTaskEntry = (taskType: TaskType, entryId: string) => {
    const filtered = getTaskEntries(taskType).filter(entry => entry.localId !== entryId)
    setTaskEntries(taskType, filtered)
    setTaskErrors(prev => {
      if (!prev[taskType]) return prev
      const updatedTaskTypeErrors = { ...prev[taskType] }
      delete updatedTaskTypeErrors[entryId]
      return { ...prev, [taskType]: updatedTaskTypeErrors }
    })
  }

  const validateStep = (step: number): boolean => {
    const newErrors: FormErrors = {}
    
    if (step === 1) {
      if (!formData.owner) newErrors.owner = 'שם הממלא נדרש'
      if (!formData.factoryName) newErrors.factoryName = 'שם המפעל נדרש'
      if (!formData.projectId) newErrors.projectId = 'שיוך לפרויקט נדרש'
      if (!formData.dateMade) newErrors.dateMade = 'תאריך ביצוע נדרש'
      if (!formData.startTime) newErrors.startTime = 'שעת התחלה נדרשת'
      if (!formData.endTime) newErrors.endTime = 'שעת סיום נדרשת'
    } else if (step === 2) {
      if (formData.teamLeaders.length === 0) newErrors.teamLeaders = 'נדרש לפחות ראש צוות אחד'
      if (formData.teamMembers.length === 0) newErrors.teamMembers = 'נדרש לפחות איש צוות אחד'
    } else if (step === 3) {
      // Check if there are any completed tasks instead of checking selectedTaskType
      // (selectedTaskType gets cleared after saving a task)
      const hasCompletedTasks = completedCategories.size > 0
      const hasTasks = Object.keys(formData.tasks).length > 0 && 
        Object.values(formData.tasks).some((taskArray: any) => 
          Array.isArray(taskArray) && taskArray.length > 0
        )
      
      if (!hasCompletedTasks && !hasTasks) {
        newErrors.selectedTaskType = 'נדרש להוסיף לפחות משימה אחת לפני שמירה'
      }
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const nextStep = () => {
    if (currentStep === 2) {
      const newErrors: FormErrors = {}
      if (formData.teamLeaders.length === 0) newErrors.teamLeaders = 'נדרש לפחות ראש צוות אחד'
      if (formData.teamMembers.length === 0) newErrors.teamMembers = 'נדרש לפחות איש צוות אחד'
      
      setErrors(newErrors)
      if (Object.keys(newErrors).length === 0) {
        setCurrentStep(prev => Math.min(prev + 1, 3))
      }
    } else if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3))
    }
  }

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate step 3 before submitting
    if (!validateStep(3)) return
    
    setLoading(true)
    try {
      const response = await fetch('/api/save-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      const result = await response.json()
      if (result.success) {
        alert(result.message)
        if (result.warning) {
          alert(`Warning: ${result.warning}`)
        }
        setFormData(initialFormData)
        setCurrentStep(1)
      } else {
        const errorMsg = `Error: ${result.error}\nDetails: ${result.details || 'Unknown error'}${result.code ? `\nCode: ${result.code}` : ''}${result.hint ? `\nHint: ${result.hint}` : ''}`
        console.error('Form submission error:', result)
        alert(errorMsg)
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      alert('Error submitting form. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const renderStep1 = () => {
    return (
      <div className="space-y-8">
        <div className="space-y-3">
          <Label htmlFor="owner" className="text-base font-semibold hebrew-text text-right block">{HEBREW_TEXT.owner} *</Label>
          <Select 
            value={formData.owner} 
            onValueChange={(value) => updateFormData('owner', value)}
          >
            <SelectTrigger className={`${errors.owner ? 'border-red-500' : 'border-gray-300'} h-12 rounded-xl text-right`} dir="rtl">
              <SelectValue placeholder="בחר שם ממלא" className="hebrew-text" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {options.owners.map((owner) => (
                <SelectItem key={owner} value={owner} className="text-right hebrew-text" dir="rtl">
                  {owner}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.owner && <p className="text-red-500 text-sm mt-2 hebrew-text text-right">{errors.owner}</p>}
        </div>

        <div className="space-y-3">
          <Label htmlFor="factoryName" className="text-base font-semibold hebrew-text text-right block">{HEBREW_TEXT.factoryName} *</Label>
          <Select 
            value={formData.factoryName} 
            onValueChange={(value) => updateFormData('factoryName', value)}
          >
            <SelectTrigger className={`${errors.factoryName ? 'border-red-500' : 'border-gray-300'} h-12 rounded-xl text-right`} dir="rtl">
              <SelectValue placeholder={HEBREW_TEXT.selectFactory} className="hebrew-text" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {options.factories.map((factory) => (
                <SelectItem key={factory} value={factory} className="text-right hebrew-text" dir="rtl">
                  {factory}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.factoryName && <p className="text-red-500 text-sm mt-2 hebrew-text text-right">{errors.factoryName}</p>}
        </div>

        <div className="space-y-3">
          <Label htmlFor="projectId" className="text-base font-semibold hebrew-text text-right block">שיוך לפרויקט *</Label>
          <Select 
            value={formData.projectId || ''} 
            onValueChange={(value) => updateFormData('projectId', value)}
            disabled={!formData.factoryName}
            required
          >
            <SelectTrigger className={`${errors.projectId ? 'border-red-500' : 'border-gray-300'} h-12 rounded-xl text-right`} dir="rtl">
              <SelectValue placeholder={formData.factoryName ? "בחר פרויקט" : "בחר ראשית שם מפעל"} />
            </SelectTrigger>
            <SelectContent>
              {options.projects
                .filter(project => !formData.factoryName || project.factory_name === formData.factoryName)
                .map((project) => (
                  <SelectItem key={project.id} value={project.id} className="text-right hebrew-text" dir="rtl">
                    <span className="font-mono text-blue-600 font-bold">{project.project_number}</span>
                    {project.project_number && <span className="mx-2">-</span>}
                    <span>{project.name}</span>
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          {errors.projectId && <p className="text-red-500 text-sm mt-2 hebrew-text text-right">{errors.projectId}</p>}
        </div>

        <div className="space-y-3">
          <Label htmlFor="dateMade" className="text-base font-semibold hebrew-text text-right block">{HEBREW_TEXT.dateMade} *</Label>
          <Input
            id="dateMade"
            type="date"
            value={formData.dateMade}
            onChange={(e) => updateFormData('dateMade', e.target.value)}
            className={`${errors.dateMade ? 'border-red-500' : 'border-gray-300'} h-12 rounded-xl text-right hebrew-text`}
            style={{ textAlign: 'right', direction: 'rtl' }}
            dir="rtl"
          />
          {errors.dateMade && <p className="text-red-500 text-sm mt-2 hebrew-text text-right">{errors.dateMade}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <Label htmlFor="startTime" className="text-base font-semibold hebrew-text text-right block">{HEBREW_TEXT.startTime} *</Label>
            <Input
              id="startTime"
              type="time"
              value={formData.startTime}
              onChange={(e) => updateFormData('startTime', e.target.value)}
              className={`${errors.startTime ? 'border-red-500' : 'border-gray-300'} h-12 rounded-xl text-right hebrew-text`}
              style={{ textAlign: 'right', direction: 'rtl' }}
              dir="rtl"
            />
            {errors.startTime && <p className="text-red-500 text-sm mt-2 hebrew-text text-right">{errors.startTime}</p>}
          </div>

          <div className="space-y-3">
            <Label htmlFor="endTime" className="text-base font-semibold hebrew-text text-right block">{HEBREW_TEXT.endTime} *</Label>
            <Input
              id="endTime"
              type="time"
              value={formData.endTime}
              onChange={(e) => updateFormData('endTime', e.target.value)}
              className={`${errors.endTime ? 'border-red-500' : 'border-gray-300'} h-12 rounded-xl text-right hebrew-text`}
              style={{ textAlign: 'right', direction: 'rtl' }}
              dir="rtl"
            />
            {errors.endTime && <p className="text-red-500 text-sm mt-2 hebrew-text text-right">{errors.endTime}</p>}
          </div>
        </div>
      </div>
    )
  }

  const renderStep2 = () => {
    return (
      <div className="space-y-8">
        <div className="space-y-3">
          <ButtonSelect
            label={`${HEBREW_TEXT.teamLeaders} *`}
            options={options.teamLeaders}
            value={formData.teamLeaders}
            onChange={(value) => updateFormData('teamLeaders', value)}
            error={errors.teamLeaders}
          />
        </div>

        <div className="space-y-3">
          <ButtonSelect
            label={`${HEBREW_TEXT.teamMembers} *`}
            options={options.teamMembers}
            value={formData.teamMembers}
            onChange={(value) => updateFormData('teamMembers', value)}
            error={errors.teamMembers}
          />
        </div>
      </div>
    )
  }

  const renderTaskDetailScreen = (selectedOption: TaskOption) => {
    const taskType = selectedOption.id as TaskType
    const entries = getTaskEntries(taskType)
    const clauseOptions = clausesByCategory[taskType] || []
    const isLoadingClauses = clausesLoadingCategory === taskType
    const isManpower = taskType === 'manpower'

    return (
      <div className="space-y-8">
        <div className="space-y-4 text-center">
          <h3 className="text-2xl font-bold hebrew-text text-gray-900">
            {isManpower ? 'ניהול כח אדם' : `הוספת משימה: ${selectedOption.label}`}
          </h3>
          <p className="text-gray-600 hebrew-text">
            {isManpower 
              ? 'בחר תפקיד מהרשימה והוסף את אנשי הצוות עם פרטי השעות שלהם.'
              : 'בחר סעיף מהרשימה והזן את פרטי המשימה שבוצעה במסגרת הפרויקט שנבחר.'}
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          <Button
            type="button"
            className="hebrew-text px-6 py-3 rounded-xl"
            onClick={() => addTaskEntry(taskType)}
          >
            {isManpower ? 'הוסף תפקיד חדש' : 'הוסף משימה חדשה'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setTaskEntries(taskType, [])
              setCompletedCategories(prev => {
                const next = new Set(prev)
                next.delete(taskType)
                return next
              })
              setTaskValidationMessage(null)
              updateFormData('selectedTaskType', '')
            }}
            className="hebrew-text px-6 py-3 rounded-xl border-gray-300 text-red-500 border-red-300 hover:bg-red-50"
          >
            {isManpower ? 'בטל' : 'בטל פעילות'}
          </Button>
          <Button
            type="button"
            variant="default"
            onClick={() => {
              setTaskValidationMessage(null)
              const currentErrors: Record<string, Partial<Record<keyof TaskEntry, string>>> = {}
              let hasErrors = false

              if (entries.length === 0) {
                setTaskValidationMessage(isManpower ? 'אנא הוסף תפקיד אחד לפחות לפני שמירה.' : 'אנא הוסף משימה אחת לפחות לפני שמירה.')
                return
              }

              entries.forEach(entry => {
                const entryError: Partial<Record<keyof TaskEntry, string>> = {}
                if (!entry.clauseId) {
                  entryError.clauseId = isManpower ? 'נדרש לבחור תפקיד' : 'נדרש לבחור סעיף'
                }
                
                if (taskType === 'manpower') {
                  // For manpower: validate that at least one person is added and all people have required fields
                  if (!entry.people || entry.people.length === 0) {
                    entryError.clauseId = 'נדרש להוסיף לפחות אדם אחד לתפקיד זה'
                  } else {
                    entry.people.forEach((person, personIndex) => {
                      if (!person.firstName || !person.firstName.trim()) {
                        entryError.clauseId = `אדם #${personIndex + 1}: שם פרטי נדרש`
                        hasErrors = true
                      }
                      if (!person.workHours || !person.workHours.trim()) {
                        entryError.clauseId = `אדם #${personIndex + 1}: מספר שעות עבודה נדרש`
                        hasErrors = true
                      }
                    })
                  }
                } else if (taskType === 'minimumPermit') {
                  // For minimumPermit: validate title, specificLocation, and whatWasDone
                  if (!entry.title || !entry.title.trim()) {
                    entryError.title = 'נדרש למלא כותרת'
                    hasErrors = true
                  }
                  if (!entry.specificLocation || !entry.specificLocation.trim()) {
                    entryError.specificLocation = 'נדרש למלא מיקום ספציפי של העבודה'
                    hasErrors = true
                  }
                  if (!entry.whatWasDone || !entry.whatWasDone.trim()) {
                    entryError.whatWasDone = 'נדרש למלא מה בוצע בפועל'
                    hasErrors = true
                  }
                } else {
                  // For other task types: validate description, quantity, and measurement unit
                  if (!entry.description) entryError.description = 'נדרש למלא תיאור'
                  if (!entry.quantity) entryError.quantity = 'נדרש למלא כמות'
                  if (!entry.measurementUnit) entryError.measurementUnit = 'בחר יחידת מדידה'
                }
                
                if (Object.keys(entryError).length > 0) {
                  hasErrors = true
                  currentErrors[entry.localId] = entryError
                }
              })

              if (hasErrors) {
                setTaskErrors(prev => ({
                  ...prev,
                  [taskType]: {
                    ...(prev[taskType] || {}),
                    ...currentErrors
                  }
                }))
                setTaskValidationMessage('יש להשלים את כל השדות המסומנים לפני שמירה.')
                return
              }

              setCompletedCategories(prev => {
                const next = new Set(prev)
                next.add(taskType)
                return next
              })
              setTaskErrors(prev => ({ ...prev, [taskType]: {} }))
              setTaskValidationMessage(null)
              updateFormData('selectedTaskType', '')
            }}
            className="hebrew-text px-6 py-3 rounded-xl bg-black text-white hover:bg-gray-800"
          >
            {isManpower ? 'שמור כח אדם' : 'שמור פעילות'}
          </Button>
        </div>

        {taskValidationMessage && (
          <div className="mt-4 bg-yellow-50 border border-yellow-200 text-yellow-800 p-3 rounded-xl hebrew-text text-right">
            {taskValidationMessage}
          </div>
        )}

        {clausesError && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl hebrew-text text-right">
            {clausesError}
          </div>
        )}

        {entries.length === 0 && !isLoadingClauses && (
          <div className="text-center text-gray-500 hebrew-text">
            {isManpower 
              ? 'עדיין לא נוספו תפקידים. לחץ על "הוסף תפקיד חדש" כדי להתחיל.'
              : 'עדיין לא נוספו משימות. לחץ על "הוסף משימה חדשה" כדי להתחיל.'}
          </div>
        )}

        {isLoadingClauses && (
          <div className="text-center text-gray-500 hebrew-text">
            {isManpower ? 'טוען תפקידים...' : 'טוען סעיפים...'}
          </div>
        )}

        {entries.map((entry, index) => {
          const entryErrors = taskErrors[taskType]?.[entry.localId] || {}
          return (
            <Card key={entry.localId} className="rounded-2xl border-2 border-gray-100 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div>
                  <CardTitle className="text-xl hebrew-text">
                    {isManpower ? `תפקיד #${index + 1}` : taskType === 'minimumPermit' ? `הרשאת מינימום #${index + 1}` : `משימה #${index + 1}`}
                  </CardTitle>
                  <CardDescription className="hebrew-text mt-1">
                    {entry.clauseName || (isManpower ? 'בחר תפקיד מהרשימה כדי להמשיך' : taskType === 'minimumPermit' ? 'הסעיף יטען אוטומטית' : 'בחר סעיף מהרשימה כדי להמשיך')}
                  </CardDescription>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  className="text-red-500 hover:text-red-600 hebrew-text"
                  onClick={() => removeTaskEntry(taskType, entry.localId)}
                >
                  {isManpower ? 'הסר תפקיד' : taskType === 'minimumPermit' ? 'הסר הרשאה' : 'הסר משימה'}
                </Button>
              </CardHeader>

              <CardContent className="space-y-6">
                {taskType !== 'minimumPermit' && (
                  <div className="space-y-3">
                    <Label className="text-base font-semibold hebrew-text text-right block">
                      {isManpower ? 'בחר תפקיד' : 'בחר סעיף'}
                    </Label>
                    <Select
                      value={entry.clauseId || undefined}
                      onValueChange={(value) => {
                        const selectedClause = clauseOptions.find(option => option.id === value)
                        
                        // For manpower: automatically add one person when role is selected if no people exist
                        if (taskType === 'manpower' && (!entry.people || entry.people.length === 0)) {
                          const newPerson: ManpowerPerson = {
                            localId: generateLocalId(),
                            firstName: '',
                            workHours: ''
                          }
                          updateTaskEntry(taskType, entry.localId, {
                            clauseId: value,
                            clauseName: selectedClause?.name || '',
                            people: [newPerson]
                          })
                        } else {
                          updateTaskEntry(taskType, entry.localId, {
                            clauseId: value,
                            clauseName: selectedClause?.name || ''
                          })
                        }
                      }}
                      disabled={isLoadingClauses}
                    >
                    <SelectTrigger
                      className={`h-12 rounded-xl text-right hebrew-text ${entryErrors.clauseId ? 'border-red-500' : ''}`}
                      dir="rtl"
                    >
                      <SelectValue placeholder={isLoadingClauses ? (isManpower ? 'טוען תפקידים...' : 'טוען סעיפים...') : (isManpower ? 'בחר תפקיד מתאים' : 'בחר סעיף מתאים')} />
                    </SelectTrigger>
                    <SelectContent>
                      {clauseOptions.map((clause) => (
                        <SelectItem key={clause.id} value={clause.id} className="text-right hebrew-text" dir="rtl">
                          {clause.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                    </Select>
                    {entryErrors.clauseId && (
                      <p className="text-red-500 text-sm hebrew-text text-right">
                        {entryErrors.clauseId.replace('סעיף', isManpower ? 'תפקיד' : 'סעיף')}
                      </p>
                    )}
                  </div>
                )}

                {entry.clauseId && (
                  taskType === 'minimumPermit' ? (
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <Label className="text-base font-semibold hebrew-text text-right block">
                          סעיף
                        </Label>
                        <div className="h-12 rounded-xl border border-gray-300 bg-gray-50 px-3 py-2 flex items-center text-right hebrew-text">
                          {entry.clauseName || 'טוען...'}
                        </div>
                        <p className="text-sm text-gray-500 hebrew-text text-right">
                          הסעיף נבחר אוטומטית ואינו ניתן לשינוי
                        </p>
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor={`title-${entry.localId}`} className="text-base font-semibold hebrew-text text-right block">
                          כותרת *
                        </Label>
                        <Input
                          id={`title-${entry.localId}`}
                          value={entry.title || ''}
                          onChange={(e) => updateTaskEntry(taskType, entry.localId, { title: e.target.value })}
                          className={`h-12 rounded-xl text-right hebrew-text ${entryErrors.title ? 'border-red-500' : ''}`}
                          placeholder="הזן כותרת"
                          dir="rtl"
                        />
                        {entryErrors.title && (
                          <p className="text-red-500 text-sm hebrew-text text-right">{entryErrors.title}</p>
                        )}
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor={`specificLocation-${entry.localId}`} className="text-base font-semibold hebrew-text text-right block">
                          מיקום ספציפי של העבודה *
                        </Label>
                        <Input
                          id={`specificLocation-${entry.localId}`}
                          value={entry.specificLocation || ''}
                          onChange={(e) => updateTaskEntry(taskType, entry.localId, { specificLocation: e.target.value })}
                          className={`h-12 rounded-xl text-right hebrew-text ${entryErrors.specificLocation ? 'border-red-500' : ''}`}
                          placeholder="הזן מיקום ספציפי של העבודה"
                          dir="rtl"
                        />
                        {entryErrors.specificLocation && (
                          <p className="text-red-500 text-sm hebrew-text text-right">{entryErrors.specificLocation}</p>
                        )}
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor={`whatWasDone-${entry.localId}`} className="text-base font-semibold hebrew-text text-right block">
                          מה בוצע בפועל *
                        </Label>
                        <Textarea
                          id={`whatWasDone-${entry.localId}`}
                          value={entry.whatWasDone || ''}
                          onChange={(e) => updateTaskEntry(taskType, entry.localId, { whatWasDone: e.target.value })}
                          className={`min-h-[120px] rounded-xl text-right hebrew-text ${entryErrors.whatWasDone ? 'border-red-500' : ''}`}
                          placeholder="תאר מה בוצע בפועל"
                          dir="rtl"
                        />
                        {entryErrors.whatWasDone && (
                          <p className="text-red-500 text-sm hebrew-text text-right">{entryErrors.whatWasDone}</p>
                        )}
                      </div>
                    </div>
                  ) : taskType === 'manpower' ? (
                    <div className="space-y-6">
                      <div className="flex justify-end">
                        <Button
                          type="button"
                          onClick={() => addManpowerPerson(taskType, entry.localId)}
                          className="hebrew-text px-4 py-2 rounded-xl bg-black text-white hover:bg-gray-800"
                        >
                          הוסף אדם
                        </Button>
                      </div>

                      {entry.people && entry.people.length > 0 ? (
                        <div className="space-y-4">
                          {entry.people.map((person, personIndex) => (
                            <Card key={person.localId} className="rounded-xl border border-gray-200 p-4">
                              <div className="flex justify-between items-center mb-4">
                                <h4 className="text-lg font-semibold hebrew-text">אדם #{personIndex + 1}</h4>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  className="text-red-500 hover:text-red-600 hebrew-text text-sm"
                                  onClick={() => removeManpowerPerson(taskType, entry.localId, person.localId)}
                                >
                                  הסר
                                </Button>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label className="text-base font-semibold hebrew-text text-right block">
                                    שם פרטי *
                                  </Label>
                                  <Input
                                    value={person.firstName}
                                    onChange={(e) => updateManpowerPerson(taskType, entry.localId, person.localId, { firstName: e.target.value })}
                                    className={`h-12 rounded-xl text-right hebrew-text ${entryErrors.clauseId && (!person.firstName || !person.firstName.trim()) ? 'border-red-500' : ''}`}
                                    placeholder="הזן שם פרטי"
                                    dir="rtl"
                                  />
                                  {entryErrors.clauseId && (!person.firstName || !person.firstName.trim()) && (
                                    <p className="text-red-500 text-sm hebrew-text text-right">שם פרטי נדרש</p>
                                  )}
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-base font-semibold hebrew-text text-right block">
                                    מספר שעות עבודה *
                                  </Label>
                                  <Input
                                    type="number"
                                    min="0"
                                    step="0.5"
                                    value={person.workHours}
                                    onChange={(e) => updateManpowerPerson(taskType, entry.localId, person.localId, { workHours: e.target.value })}
                                    className={`h-12 rounded-xl text-right hebrew-text ${entryErrors.clauseId && (!person.workHours || !person.workHours.trim()) ? 'border-red-500' : ''}`}
                                    placeholder="הזן מספר שעות"
                                    dir="rtl"
                                  />
                                  {entryErrors.clauseId && (!person.workHours || !person.workHours.trim()) && (
                                    <p className="text-red-500 text-sm hebrew-text text-right">מספר שעות עבודה נדרש</p>
                                  )}
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center text-gray-500 hebrew-text py-8 border-2 border-dashed border-gray-300 rounded-xl">
                          לחץ על "הוסף אדם" כדי להוסיף אנשים לתפקיד זה
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label htmlFor={`task-desc-${taskType}-${entry.localId}`} className="text-base font-semibold hebrew-text text-right block">
                          תיאור
                        </Label>
                        <Input
                          id={`task-desc-${taskType}-${entry.localId}`}
                          value={entry.description}
                          onChange={(e) => updateTaskEntry(taskType, entry.localId, { description: e.target.value })}
                          className={`h-12 rounded-xl text-right hebrew-text ${entryErrors.description ? 'border-red-500' : ''}`}
                          placeholder="כתוב תיאור קצר של המשימה"
                          dir="rtl"
                        />
                        {entryErrors.description && (
                          <p className="text-red-500 text-sm hebrew-text text-right">{entryErrors.description}</p>
                        )}
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor={`task-quantity-${taskType}-${entry.localId}`} className="text-base font-semibold hebrew-text text-right block">
                          כמות
                        </Label>
                        <Input
                          id={`task-quantity-${taskType}-${entry.localId}`}
                          type="number"
                          min="0"
                          step="0.01"
                          value={entry.quantity}
                          onChange={(e) => updateTaskEntry(taskType, entry.localId, { quantity: e.target.value })}
                          className={`h-12 rounded-xl text-right hebrew-text ${entryErrors.quantity ? 'border-red-500' : ''}`}
                          placeholder="הזן כמות"
                          dir="rtl"
                        />
                        {entryErrors.quantity && (
                          <p className="text-red-500 text-sm hebrew-text text-right">{entryErrors.quantity}</p>
                        )}
                      </div>

                      <div className="space-y-3">
                        <Label className="text-base font-semibold hebrew-text text-right block">
                          יחידת מדידה
                        </Label>
                        <Select
                          value={entry.measurementUnit}
                          onValueChange={(value) =>
                            updateTaskEntry(taskType, entry.localId, { measurementUnit: value as MeasurementUnit })
                          }
                        >
                          <SelectTrigger className={`h-12 rounded-xl text-right hebrew-text ${entryErrors.measurementUnit ? 'border-red-500' : ''}`} dir="rtl">
                            <SelectValue placeholder="בחר יחידת מדידה" />
                          </SelectTrigger>
                          <SelectContent>
                            {MEASUREMENT_UNITS.filter(Boolean).map(unit => (
                              <SelectItem key={unit} value={unit} className="text-right hebrew-text" dir="rtl">
                                {unit}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {entryErrors.measurementUnit && (
                          <p className="text-red-500 text-sm hebrew-text text-right">{entryErrors.measurementUnit}</p>
                        )}
                      </div>

                      <div className="space-y-3">
                        <Label className="text-base font-semibold hebrew-text text-right block text-gray-700">
                          העלאת תמונה (אופציונלי)
                        </Label>
                        {!entry.attachment ? (
                          <div className="relative">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) {
                                  const reader = new FileReader()
                                  reader.onload = () => {
                                    updateTaskEntry(taskType, entry.localId, { attachment: reader.result as string })
                                  }
                                  reader.readAsDataURL(file)
                                }
                              }}
                              className="hidden"
                              id={`image-upload-${entry.localId}`}
                            />
                            <label
                              htmlFor={`image-upload-${entry.localId}`}
                              className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 group"
                            >
                              <div className="flex flex-col items-center justify-center pt-2 pb-3">
                                <svg
                                  className="w-10 h-10 mb-2 text-gray-400 group-hover:text-gray-600 transition-colors"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                  />
                                </svg>
                                <p className="mb-1 text-sm text-gray-600 hebrew-text">
                                  <span className="font-semibold text-gray-700">לחץ לבחירת תמונה</span> או גרור לכאן
                                </p>
                                <p className="text-xs text-gray-500 hebrew-text">PNG, JPG, GIF (עד 10MB)</p>
                              </div>
                            </label>
                          </div>
                        ) : (
                          <div className="relative group">
                            <div className="relative w-full h-48 bg-gray-50 rounded-xl overflow-hidden border border-gray-200">
                              <img
                                src={entry.attachment}
                                alt="תצוגה מקדימה"
                                className="w-full h-full object-contain"
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 hebrew-text"
                                  onClick={() => updateTaskEntry(taskType, entry.localId, { attachment: null })}
                                >
                                  <svg
                                    className="w-4 h-4 ml-2"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M6 18L18 6M6 6l12 12"
                                    />
                                  </svg>
                                  הסר תמונה
                                </Button>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                const input = document.getElementById(`image-upload-replace-${entry.localId}`) as HTMLInputElement
                                input?.click()
                              }}
                              className="mt-2 text-sm text-gray-600 hover:text-gray-800 hebrew-text underline"
                            >
                              החלף תמונה
                            </button>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) {
                                  const reader = new FileReader()
                                  reader.onload = () => {
                                    updateTaskEntry(taskType, entry.localId, { attachment: reader.result as string })
                                  }
                                  reader.readAsDataURL(file)
                                }
                              }}
                              className="hidden"
                              id={`image-upload-replace-${entry.localId}`}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    )
  }

  const renderStep3 = () => {
    const selectedOption = TASK_OPTIONS.find(option => option.id === formData.selectedTaskType)

    if (!selectedOption) {
      return (
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h3 className="text-2xl font-bold hebrew-text text-gray-900">{HEBREW_TEXT.taskSelectionTitle}</h3>
            <p className="text-gray-600 hebrew-text">{HEBREW_TEXT.taskSelectionSubtitle}</p>
        </div>

          <div className="grid grid-cols-3 gap-5">
            {TASK_OPTIONS.map(option => {
              const isActive = formData.selectedTaskType === option.id
              const isCompleted = completedCategories.has(option.id)
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => updateFormData('selectedTaskType', option.id)}
                  className={`w-full text-center hebrew-text rounded-2xl border-2 p-6 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center justify-center ${
                    isActive
                      ? 'border-black bg-black text-white focus:ring-black'
                      : isCompleted
                        ? 'border-green-500 bg-green-50 hover:border-green-600 hover:bg-green-100 focus:ring-green-400'
                        : 'border-gray-200 bg-white hover:border-black hover:bg-gray-50 focus:ring-gray-400'
                  }`}
                  aria-pressed={isActive}
                  dir="rtl"
                >
                  <span className={`text-xl font-semibold ${isActive ? 'text-white' : isCompleted ? 'text-green-700' : ''}`}>
                    {option.label}
                  </span>
                </button>
              )
            })}
          </div>
              
          {errors.selectedTaskType && (
            <p className="text-red-500 text-sm hebrew-text text-right">{errors.selectedTaskType}</p>
          )}
        </div>
      )
    }


    return renderTaskDetailScreen(selectedOption)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-3xl mx-auto">
          <Card className="rounded-2xl shadow-lg border-0 bg-white">
            <CardContent className="px-8 py-12 text-center">
              <div className="hebrew-text text-lg">{HEBREW_TEXT.loading}</div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-12">
          <div className="flex justify-between text-sm text-muted-foreground mb-3">
            <span className="hebrew-text">{HEBREW_TEXT.step} {currentStep} {HEBREW_TEXT.of} 3</span>
            <span className="hebrew-text">{Math.round((currentStep / 3) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-black h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 3) * 100}%` }}
            />
          </div>
        </div>

        <Card className="rounded-2xl shadow-lg border-0 bg-white">
          <CardHeader className="text-center pb-8">
            <CardTitle className="text-3xl font-bold text-gray-900 hebrew-text mb-2">
              {HEBREW_TEXT.title}
            </CardTitle>
            <CardDescription className="text-lg text-gray-600 hebrew-text">
              {currentStep === 1 && HEBREW_TEXT.step1Title}
              {currentStep === 2 && HEBREW_TEXT.step2Title}
              {currentStep === 3 && HEBREW_TEXT.step3Title}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="px-8 pb-8">
            <form onSubmit={handleSubmit}>
              <div className="space-y-8">
                {currentStep === 1 && renderStep1()}
                {currentStep === 2 && renderStep2()}
                {currentStep === 3 && renderStep3()}
              </div>

              {!(currentStep === 3 && formData.selectedTaskType) && (
              <div className="flex justify-between mt-12">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 1}
                    className="hebrew-text px-8 py-3 rounded-xl font-medium border-gray-300 hover:bg-gray-50"
                  >
                    {HEBREW_TEXT.previous}
                  </Button>

                  {currentStep < 3 ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    className="hebrew-text px-8 py-3 rounded-xl font-medium bg-black hover:bg-gray-800"
                  >
                    {HEBREW_TEXT.next}
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={loading}
                    className="hebrew-text px-8 py-3 rounded-xl font-medium bg-black hover:bg-gray-800"
                  >
                    {loading ? HEBREW_TEXT.submitting : HEBREW_TEXT.submit}
                  </Button>
                )}
              </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}