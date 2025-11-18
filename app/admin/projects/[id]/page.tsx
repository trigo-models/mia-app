'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose, DialogBody } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AdminDataTable, AdminEmptyState } from '@/components/admin/ui'
import { Calendar, Building2, MapPin, FileText, Download, Eye, Trash2, Users, User, Tag, Image as ImageIcon, Package, Clock } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'

interface Project {
  id: string
  project_name: string
  project_description?: string
  factory_name: string
  specific_area?: string
  start_date?: string
  status: string
  project_number?: string
  invoice_completed?: boolean
  invoice_issued?: boolean
  created_at: string
  updated_at: string
}

interface ProjectTask {
  id: string
  project_id: string
  task_type: string
  clause_id: string
  clause_name: string
  description?: string
  quantity?: number
  measurement_unit?: string
  attachment?: string
  title?: string
  specific_location?: string
  what_was_done?: string
  people?: Array<{ localId: string; firstName: string; workHours: string }>
  created_by?: string
  date_created?: string
  created_at: string
}

interface TeamInfo {
  leaders?: string[]
  members?: string[]
}

const TASK_TYPE_LABELS: Record<string, string> = {
  construction: 'קונסטרוקציה',
  stairs: 'מדרגה',
  mesh: 'שבכה',
  railing: 'מעקה',
  sheetMetal: 'פחים',
  equipment: 'ציוד',
  minimumPermit: 'הרשאת מינימום',
  anchors: 'עוגנים',
  manpower: 'כח אדם'
}

export default function ProjectDetails() {
  const params = useParams()
  const projectId = params.id as string
  
  const [project, setProject] = useState<Project | null>(null)
  const [tasks, setTasks] = useState<ProjectTask[]>([])
  const [tasksByType, setTasksByType] = useState<Record<string, ProjectTask[]>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTask, setSelectedTask] = useState<ProjectTask | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingField, setEditingField] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [filterCategory, setFilterCategory] = useState<string | null>(null)
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null)
  const [tasksLimit, setTasksLimit] = useState(20)
  const [totalTasksCount, setTotalTasksCount] = useState(0)
  const [loadingMore, setLoadingMore] = useState(false)
  const [teamInfo, setTeamInfo] = useState<TeamInfo | null>(null)
  const [loadingTeamInfo, setLoadingTeamInfo] = useState(false)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    if (projectId) {
      fetchProjectDetails()
      fetchProjectTasks(true)
    }
  }, [projectId])

  const fetchProjectDetails = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}`)
      const data = await response.json()
      
      if (data.success) {
        setProject(data.project)
      } else {
        setError(data.error || 'Failed to fetch project details')
      }
    } catch (err) {
      setError('Error fetching project details')
      console.error('Error fetching project details:', err)
    }
  }

  const fetchProjectTasks = async (reset: boolean = false) => {
    try {
      if (reset) {
        setTasksLimit(20)
        setTasks([])
      }
      
      const offset = reset ? 0 : tasks.length
      const response = await fetch(`/api/projects/${projectId}/tasks?limit=20&offset=${offset}`)
      const data = await response.json()
      
      if (data.success) {
        if (reset) {
          setTasks(data.tasks || [])
        } else {
          setTasks(prev => [...prev, ...(data.tasks || [])])
        }
        setTasksByType(data.tasksByType || {})
        setTotalTasksCount(data.totalCount || 0)
      } else {
        console.error('Error fetching tasks:', data.error)
      }
    } catch (err) {
      console.error('Error fetching project tasks:', err)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const loadMoreTasks = async () => {
    setLoadingMore(true)
    await fetchProjectTasks(false)
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      case 'paused': return 'bg-yellow-100 text-yellow-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'פעיל'
      case 'completed': return 'הסתיים'
      case 'paused': return 'מוקפא'
      case 'cancelled': return 'בוטל'
      default: return status
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('he-IL')
  }

  const formatDateForInput = (dateString?: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toISOString().split('T')[0]
  }

  const handleDoubleClick = (field: string) => {
    if (!project) return
    
    let initialValue = ''
    switch (field) {
      case 'specific_area':
        initialValue = project.specific_area || ''
        break
      case 'project_name':
        initialValue = project.project_name || ''
        break
      case 'project_description':
        initialValue = project.project_description || ''
        break
      case 'start_date':
        initialValue = formatDateForInput(project.start_date)
        break
      case 'status':
        initialValue = getStatusLabel(project.status)
        break
    }
    
    setEditValues({ ...editValues, [field]: initialValue })
    setEditingField(field)
  }

  const handleSave = async (field: string) => {
    if (!project || saving) return
    
    setSaving(true)
    try {
      const value = editValues[field]
      const updateData: any = {}
      
      switch (field) {
        case 'specific_area':
          updateData.specific_area = value || null
          break
        case 'project_name':
          updateData.project_name = value || ''
          break
        case 'project_description':
          updateData.project_description = value || null
          break
        case 'start_date':
          updateData.start_date = value || null
          break
        case 'status':
          updateData.status = value
          break
      }
      
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })
      
      const data = await response.json()
      
      if (data.success) {
        setProject(data.project)
        setEditingField(null)
        setEditValues({ ...editValues, [field]: '' })
      } else {
        alert('שגיאה בעדכון: ' + (data.error || 'שגיאה לא ידועה'))
      }
    } catch (err) {
      console.error('Error saving:', err)
      alert('שגיאה בעדכון הפרויקט')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = (field: string) => {
    setEditingField(null)
    setEditValues({ ...editValues, [field]: '' })
  }

  const handleKeyDown = (e: React.KeyboardEvent, field: string) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSave(field)
    } else if (e.key === 'Escape') {
      handleCancel(field)
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('האם אתה בטוח שברצונך למחוק משימה זו?')) {
      return
    }

    setDeletingTaskId(taskId)
    try {
      const response = await fetch(`/api/projects/${projectId}/tasks?taskId=${taskId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        // Refresh tasks
        await fetchProjectTasks(true)
      } else {
        alert('שגיאה במחיקת המשימה: ' + (data.error || 'שגיאה לא ידועה'))
      }
    } catch (err) {
      console.error('Error deleting task:', err)
      alert('שגיאה במחיקת המשימה')
    } finally {
      setDeletingTaskId(null)
    }
  }

  const fetchTeamInfo = async (task: ProjectTask) => {
    if (!task.date_created || !task.created_by) return

    setLoadingTeamInfo(true)
    try {
      const response = await fetch(`/api/projects/${projectId}/team-info?date=${task.date_created}&owner=${encodeURIComponent(task.created_by)}`)
      const data = await response.json()
      
      if (data.success) {
        setTeamInfo({
          leaders: data.leaders || [],
          members: data.members || []
        })
      }
    } catch (err) {
      console.error('Error fetching team info:', err)
    } finally {
      setLoadingTeamInfo(false)
    }
  }

  const handleTaskView = (task: ProjectTask) => {
    setSelectedTask(task)
    setIsModalOpen(true)
    setTeamInfo(null)
    fetchTeamInfo(task)
  }

  const handleExportToExcel = async () => {
    setExporting(true)
    try {
      const response = await fetch(`/api/projects/${projectId}/export`)
      
      if (!response.ok) {
        throw new Error('Failed to export')
      }

      // Get the blob from the response
      const blob = await response.blob()
      
      // Create a download link
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      
      // Get filename from Content-Disposition header or use default
      const contentDisposition = response.headers.get('Content-Disposition')
      let filename = `Project_${project?.project_number || 'Export'}_${new Date().toISOString().split('T')[0]}.xlsx`
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
        if (filenameMatch && filenameMatch[1]) {
          filename = decodeURIComponent(filenameMatch[1].replace(/['"]/g, ''))
        }
      }
      
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error('Error exporting to Excel:', err)
      alert('שגיאה בייצוא לקובץ Excel')
    } finally {
      setExporting(false)
    }
  }

  // Get unique categories from tasks
  const getUniqueCategories = () => {
    const categories = new Set<string>()
    tasks.forEach(task => {
      if (task.task_type) {
        categories.add(task.task_type)
      }
    })
    return Array.from(categories)
  }

  // Filter tasks based on selected category
  const getFilteredTasks = () => {
    if (!filterCategory) {
      return tasks
    }
    return tasks.filter(task => task.task_type === filterCategory)
  }

  // Group tasks by clause and calculate totals
  const getClauseSummary = () => {
    const clauseMap = new Map<string, { name: string; totalQuantity: number; unit: string; count: number }>()
    
    tasks.forEach(task => {
      if (!task.clause_id || !task.clause_name) return
      
      const key = task.clause_id
      let quantity = 0
      let unit = 'יחידה'
      
      // Special handling for manpower - sum work hours
      if (task.task_type === 'manpower' && task.people && Array.isArray(task.people)) {
        quantity = task.people.reduce((sum, person) => {
          const hours = parseFloat(person.workHours) || 0
          return sum + hours
        }, 0)
        unit = 'שעות'
      }
      // Special handling for minimumPermit - count tasks
      else if (task.task_type === 'minimumPermit') {
        quantity = 1 // Count as 1 task
        unit = 'משימות'
      }
      // Regular tasks - use quantity
      else {
        quantity = task.quantity || 0
        unit = task.measurement_unit || 'יחידה'
      }
      
      if (clauseMap.has(key)) {
        const existing = clauseMap.get(key)!
        existing.count += 1
        // For minimumPermit, totalQuantity is the count of tasks
        if (task.task_type === 'minimumPermit') {
          existing.totalQuantity = existing.count
        } else {
          existing.totalQuantity += quantity
        }
      } else {
        clauseMap.set(key, {
          name: task.clause_name,
          totalQuantity: task.task_type === 'minimumPermit' ? 1 : quantity,
          unit: unit,
          count: 1
        })
      }
    })
    
    return Array.from(clauseMap.entries()).map(([clauseId, data]) => ({
      clauseId,
      ...data
    }))
  }

  const renderTaskDetails = (task: ProjectTask) => {
    if (task.task_type === 'manpower' && task.people && Array.isArray(task.people)) {
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <Users className="h-4 w-4 text-gray-400" />
            <div className="text-xs text-gray-500 hebrew-text font-medium">אנשים</div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {task.people.map((person, idx) => (
              <div key={person.localId || idx} className="rounded-lg p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="text-xs text-gray-500 hebrew-text">שם פרטי</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 hebrew-text">{person.firstName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-xs text-gray-500 hebrew-text">שעות עבודה</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-700 hebrew-text">{person.workHours} שעות</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    }

    if (task.task_type === 'minimumPermit') {
      return (
        <div className="space-y-4">
          {task.title && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs text-gray-500 hebrew-text font-medium">
                <FileText className="h-4 w-4 text-gray-400" />
                <span>כותרת</span>
              </div>
              <div className="text-sm font-semibold text-gray-900 hebrew-text rounded-lg px-4 py-3">
                {task.title}
              </div>
            </div>
          )}
          {task.specific_location && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs text-gray-500 hebrew-text font-medium">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span>מיקום ספציפי</span>
              </div>
              <div className="text-sm font-semibold text-gray-900 hebrew-text rounded-lg px-4 py-3">
                {task.specific_location}
              </div>
            </div>
          )}
          {task.what_was_done && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs text-gray-500 hebrew-text font-medium">
                <FileText className="h-4 w-4 text-gray-400" />
                <span>מה בוצע בפועל</span>
              </div>
              <div className="text-sm text-gray-900 hebrew-text rounded-lg px-4 py-3 whitespace-pre-wrap">
                {task.what_was_done}
              </div>
            </div>
          )}
        </div>
      )
    }

    // Regular task types
    return (
      <div className="space-y-4">
        {task.description && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs text-gray-500 hebrew-text font-medium">
              <FileText className="h-4 w-4 text-gray-400" />
              <span>תיאור</span>
            </div>
            <div className="text-sm text-gray-900 hebrew-text rounded-lg px-4 py-3">
              {task.description}
            </div>
          </div>
        )}
        {(task.quantity || task.measurement_unit) && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs text-gray-500 hebrew-text font-medium">
              <Package className="h-4 w-4 text-gray-400" />
              <span>כמות</span>
            </div>
            <div className="text-sm font-semibold text-gray-900 hebrew-text rounded-lg px-4 py-3">
              {task.quantity} {task.measurement_unit || ''}
            </div>
          </div>
        )}
        {task.attachment && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs text-gray-500 hebrew-text font-medium">
              <ImageIcon className="h-4 w-4 text-gray-400" />
              <span>תמונה</span>
            </div>
            <div className="mt-2 rounded-lg overflow-hidden">
              <img src={task.attachment} alt="תמונה" className="w-full h-auto" />
            </div>
          </div>
        )}
      </div>
    )
  }

  const taskTableColumns = [
    {
      key: 'date',
      header: 'תאריך ביצוע',
      render: (task: ProjectTask) => (
        <span className="text-xs text-gray-600 hebrew-text whitespace-nowrap">
          {formatDate(task.date_created || task.created_at)}
        </span>
      ),
      className: 'whitespace-nowrap',
    },
    {
      key: 'task_type',
      header: 'קטגוריה',
      render: (task: ProjectTask) => (
        <span className="text-xs text-gray-600 hebrew-text">
          {TASK_TYPE_LABELS[task.task_type] || task.task_type}
        </span>
      ),
      className: 'whitespace-nowrap',
    },
    {
      key: 'clause_name',
      header: 'שם הסעיף',
      render: (task: ProjectTask) => (
        <span className="text-sm text-gray-900 hebrew-text font-medium">
          {task.clause_name || 'ללא שם'}
        </span>
      ),
    },
    {
      key: 'created_by',
      header: 'ראש צוות',
      render: (task: ProjectTask) => (
        <span className="text-sm text-gray-600 hebrew-text">
          {task.created_by || '-'}
        </span>
      ),
      className: 'whitespace-nowrap',
    },
    {
      key: 'actions',
      header: 'פעולות',
      align: 'center' as const,
      render: (task: ProjectTask) => (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-slate-600 hover:text-blue-600"
            onClick={() => handleTaskView(task)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-slate-600 hover:text-rose-600"
            onClick={() => handleDeleteTask(task.id)}
            disabled={deletingTaskId === task.id}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
      className: 'whitespace-nowrap',
    },
  ]

  const filteredTasks = getFilteredTasks()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 hebrew-text">טוען פרטי פרויקט...</p>
        </div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2 hebrew-text">שגיאה</h3>
          <p className="text-gray-600 mb-4 hebrew-text">{error || 'הפרויקט לא נמצא'}</p>
          <Link
            href="/admin/projects"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors hebrew-text"
          >
            חזור לפרויקטים
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header - Structured like invoice form */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 hebrew-text mb-2">פרטי פרויקט</h1>
                <p className="text-gray-500 hebrew-text text-sm">מידע כללי על הפרויקט</p>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={handleExportToExcel}
                  disabled={exporting}
                  className="hebrew-text text-sm flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-4 py-2 shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className="h-4 w-4" />
                  {exporting ? 'מייצא...' : 'ייצא ל-Excel'}
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="hebrew-text text-sm rounded-full border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 px-4 py-2 shadow-sm"
                >
                  <Link href="/admin/projects">חזור לפרויקטים</Link>
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Row 1 */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-gray-500 hebrew-text">
                  <FileText className="h-4 w-4" />
                  <span>מספר פרויקט</span>
                </div>
                <div className="text-base font-semibold text-gray-900 hebrew-text">
                  {project.project_number || '-'}
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-gray-500 hebrew-text">
                  <Building2 className="h-4 w-4" />
                  <span>מפעל</span>
                </div>
                <div className="text-base font-semibold text-gray-900 hebrew-text">
                  {project.factory_name || '-'}
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-gray-500 hebrew-text">
                  <MapPin className="h-4 w-4" />
                  <span>איזור ספציפי</span>
                </div>
                {editingField === 'specific_area' ? (
                  <div className="space-y-2">
                    <Input
                      value={editValues.specific_area || ''}
                      onChange={(e) => setEditValues({ ...editValues, specific_area: e.target.value })}
                      onKeyDown={(e) => handleKeyDown(e, 'specific_area')}
                      onBlur={() => handleSave('specific_area')}
                      className="h-10 text-right hebrew-text"
                      dir="rtl"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleSave('specific_area')}
                        className="hebrew-text text-xs"
                        disabled={saving}
                      >
                        שמור
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCancel('specific_area')}
                        className="hebrew-text text-xs"
                      >
                        ביטול
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div
                    className="text-base font-semibold text-gray-900 hebrew-text cursor-pointer hover:bg-gray-100 px-2 py-1 rounded transition-colors"
                    onDoubleClick={() => handleDoubleClick('specific_area')}
                    title="לחץ פעמיים לעריכה"
                  >
                    {project.specific_area || '-'}
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-gray-500 hebrew-text">
                  <FileText className="h-4 w-4" />
                  <span>שם הפרויקט</span>
                </div>
                {editingField === 'project_name' ? (
                  <div className="space-y-2">
                    <Input
                      value={editValues.project_name || ''}
                      onChange={(e) => setEditValues({ ...editValues, project_name: e.target.value })}
                      onKeyDown={(e) => handleKeyDown(e, 'project_name')}
                      onBlur={() => handleSave('project_name')}
                      className="h-10 text-right hebrew-text"
                      dir="rtl"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleSave('project_name')}
                        className="hebrew-text text-xs"
                        disabled={saving}
                      >
                        שמור
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCancel('project_name')}
                        className="hebrew-text text-xs"
                      >
                        ביטול
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div
                    className="text-base font-semibold text-gray-900 hebrew-text cursor-pointer hover:bg-gray-100 px-2 py-1 rounded transition-colors"
                    onDoubleClick={() => handleDoubleClick('project_name')}
                    title="לחץ פעמיים לעריכה"
                  >
                    {project.project_name || '-'}
                  </div>
                )}
              </div>

              {/* Row 2 */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-gray-500 hebrew-text">
                  <FileText className="h-4 w-4" />
                  <span>תיאור</span>
                </div>
                {editingField === 'project_description' ? (
                  <div className="space-y-2">
                    <Textarea
                      value={editValues.project_description || ''}
                      onChange={(e) => setEditValues({ ...editValues, project_description: e.target.value })}
                      onKeyDown={(e) => handleKeyDown(e, 'project_description')}
                      className="min-h-[80px] text-right hebrew-text"
                      dir="rtl"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleSave('project_description')}
                        className="hebrew-text text-xs"
                        disabled={saving}
                      >
                        שמור
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCancel('project_description')}
                        className="hebrew-text text-xs"
                      >
                        ביטול
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div
                    className="text-base font-semibold text-gray-900 hebrew-text line-clamp-2 cursor-pointer hover:bg-gray-100 px-2 py-1 rounded transition-colors"
                    onDoubleClick={() => handleDoubleClick('project_description')}
                    title="לחץ פעמיים לעריכה"
                  >
                    {project.project_description || '-'}
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-gray-500 hebrew-text">
                  <Calendar className="h-4 w-4" />
                  <span>תאריך התחלה</span>
                </div>
                {editingField === 'start_date' ? (
                  <div className="space-y-2">
                    <Input
                      type="date"
                      value={editValues.start_date || ''}
                      onChange={(e) => setEditValues({ ...editValues, start_date: e.target.value })}
                      onKeyDown={(e) => handleKeyDown(e, 'start_date')}
                      onBlur={() => handleSave('start_date')}
                      className="h-10 text-right hebrew-text"
                      dir="rtl"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleSave('start_date')}
                        className="hebrew-text text-xs"
                        disabled={saving}
                      >
                        שמור
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCancel('start_date')}
                        className="hebrew-text text-xs"
                      >
                        ביטול
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div
                    className="text-base font-semibold text-gray-900 hebrew-text cursor-pointer hover:bg-gray-100 px-2 py-1 rounded transition-colors"
                    onDoubleClick={() => handleDoubleClick('start_date')}
                    title="לחץ פעמיים לעריכה"
                  >
                    {project.start_date ? formatDate(project.start_date) : '-'}
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-gray-500 hebrew-text">
                  <span>סטטוס</span>
                </div>
                {editingField === 'status' ? (
                  <div className="space-y-2">
                    <Select
                      value={editValues.status || getStatusLabel(project.status)}
                      onValueChange={(value) => {
                        setEditValues({ ...editValues, status: value })
                        // Save immediately when status changes
                        setTimeout(() => {
                          const updateData: any = { status: value }
                          fetch(`/api/projects/${projectId}`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(updateData),
                          })
                            .then(res => res.json())
                            .then(data => {
                              if (data.success) {
                                setProject(data.project)
                                setEditingField(null)
                                setEditValues({ ...editValues, status: '' })
                              }
                            })
                            .catch(err => {
                              console.error('Error saving status:', err)
                              alert('שגיאה בעדכון הסטטוס')
                            })
                        }, 100)
                      }}
                    >
                      <SelectTrigger className="h-10 text-right hebrew-text" dir="rtl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="פעיל" className="text-right hebrew-text" dir="rtl">פעיל</SelectItem>
                        <SelectItem value="מוקפא" className="text-right hebrew-text" dir="rtl">מוקפא</SelectItem>
                        <SelectItem value="הסתיים" className="text-right hebrew-text" dir="rtl">הסתיים</SelectItem>
                        <SelectItem value="בוטל" className="text-right hebrew-text" dir="rtl">בוטל</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCancel('status')}
                      className="hebrew-text text-xs"
                    >
                      ביטול
                    </Button>
                  </div>
                ) : (
                  <div
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                    onDoubleClick={() => handleDoubleClick('status')}
                    title="לחץ פעמיים לעריכה"
                  >
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium hebrew-text ${getStatusColor(project.status)}`}>
                      {getStatusLabel(project.status)}
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-gray-500 hebrew-text">
                  <span>בוצע חשבון / יצא חשבונית מס</span>
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 hebrew-text">בוצע חשבון</span>
                    <Checkbox
                      checked={project.invoice_completed || false}
                      onCheckedChange={async (checked) => {
                        try {
                          const updateData: any = { invoice_completed: checked }
                          const response = await fetch(`/api/projects/${projectId}`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(updateData),
                          })
                          const data = await response.json()
                          if (data.success) {
                            setProject(data.project)
                          } else {
                            alert('שגיאה בעדכון: ' + (data.error || 'שגיאה לא ידועה'))
                          }
                        } catch (err) {
                          console.error('Error saving invoice_completed:', err)
                          alert('שגיאה בעדכון בוצע חשבון')
                        }
                      }}
                      className="h-5 w-5"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 hebrew-text">יצא חשבונית מס</span>
                    <Checkbox
                      checked={project.invoice_issued || false}
                      onCheckedChange={async (checked) => {
                        try {
                          const updateData: any = { invoice_issued: checked }
                          const response = await fetch(`/api/projects/${projectId}`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(updateData),
                          })
                          const data = await response.json()
                          if (data.success) {
                            setProject(data.project)
                          } else {
                            alert('שגיאה בעדכון: ' + (data.error || 'שגיאה לא ידועה'))
                          }
                        } catch (err) {
                          console.error('Error saving invoice_issued:', err)
                          alert('שגיאה בעדכון יצא חשבונית מס')
                        }
                      }}
                      className="h-5 w-5"
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Clauses Summary */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="hebrew-text">סיכום סעיפים פעילים</CardTitle>
          </CardHeader>
          <CardContent>
            {tasks.length === 0 ? (
              <div className="text-center py-8 text-gray-500 hebrew-text">
                אין סעיפים פעילים בפרויקט זה
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {getClauseSummary().map((clause) => (
                  <div
                    key={clause.clauseId}
                    className="bg-white rounded-lg p-4 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all"
                  >
                    <div className="space-y-2">
                      <div className="text-2xl font-bold text-blue-600 hebrew-text">
                        {clause.totalQuantity.toLocaleString('he-IL')}
                      </div>
                      <div className="text-sm font-medium text-gray-900 hebrew-text line-clamp-2 min-h-[2.5rem]">
                        {clause.name}
                      </div>
                      <div className="flex items-center gap-1.5 pt-1 border-t border-gray-100">
                        <span className="text-xs text-gray-600 hebrew-text">
                          {clause.unit}
                        </span>
                        {clause.count > 1 && (
                          <>
                            <span className="text-gray-300">•</span>
                            <span className="text-xs text-gray-500 hebrew-text">
                              {clause.count} משימות
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tasks Table */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="hebrew-text">משימות מוקצות</CardTitle>
              {tasks.length > 0 && (
                <div className="text-sm text-gray-500 hebrew-text">
                  {filterCategory 
                    ? `מציג: ${filteredTasks.length} מתוך ${tasks.length} נטענו`
                    : `מציג: ${tasks.length} מתוך ${totalTasksCount} סה"כ`
                  }
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {tasks.length === 0 ? (
              <div className="py-12 text-center">
                <div className="text-gray-400 text-6xl mb-4">📋</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2 hebrew-text">אין משימות עדיין</h3>
                <p className="text-gray-600 hebrew-text">המשימות יופיעו כאן כאשר הן יוקצו לפרויקט זה</p>
              </div>
            ) : (
              <>
                {/* Category Filter Tags */}
                <div className="mb-6 flex flex-wrap gap-2">
                  <button
                    onClick={() => setFilterCategory(null)}
                    className={`px-4 py-2 rounded-full text-sm font-medium hebrew-text transition-all shadow-sm ${
                      filterCategory === null
                        ? 'bg-blue-600 text-white border border-blue-600 hover:bg-blue-700'
                        : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                    }`}
                  >
                    הכל ({tasks.length})
                  </button>
                  {getUniqueCategories().map((category) => {
                    const count = tasks.filter(t => t.task_type === category).length
                    return (
                      <button
                        key={category}
                        onClick={() => setFilterCategory(category)}
                        className={`px-4 py-2 rounded-full text-sm font-medium hebrew-text transition-all shadow-sm ${
                          filterCategory === category
                            ? 'bg-blue-600 text-white border border-blue-600 hover:bg-blue-700'
                            : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                        }`}
                      >
                        {TASK_TYPE_LABELS[category] || category} ({count})
                      </button>
                    )
                  })}
                </div>

                <AdminDataTable
                  data={filteredTasks}
                  columns={taskTableColumns}
                  rowKey={(task) => task.id}
                  emptyState={
                    <AdminEmptyState
                      title={filterCategory ? 'אין משימות בקטגוריה זו' : 'אין משימות להצגה'}
                      description={filterCategory ? 'נסה לבחור קטגוריה אחרת או לבטל את הסינון.' : undefined}
                    />
                  }
                />

                {/* Load More Button */}
                {tasks.length < totalTasksCount && (
                  <div className="mt-6 flex justify-center">
                    <Button
                      onClick={loadMoreTasks}
                      disabled={loadingMore}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors hebrew-text disabled:opacity-50"
                    >
                      {loadingMore ? 'טוען...' : `טען עוד (${totalTasksCount - tasks.length} נותרו)`}
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Task Details Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="hebrew-text text-xl font-bold text-gray-900">
                {selectedTask?.clause_name || 'ללא שם'}
              </DialogTitle>
              <DialogClose onClose={() => setIsModalOpen(false)} />
            </DialogHeader>
            <DialogBody>
              {selectedTask && (
                <div className="space-y-6">
                  {/* Basic Info - Clean Card Design */}
                  <div className="bg-white rounded-lg p-6 border border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-xs text-gray-500 hebrew-text font-medium">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span>תאריך ביצוע</span>
                        </div>
                        <div className="text-sm font-semibold text-gray-900 hebrew-text">
                          {formatDate(selectedTask.date_created || selectedTask.created_at)}
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-xs text-gray-500 hebrew-text font-medium">
                          <Tag className="h-4 w-4 text-gray-400" />
                          <span>קטגוריה</span>
                        </div>
                        <div className="text-sm font-semibold text-gray-900 hebrew-text">
                          {TASK_TYPE_LABELS[selectedTask.task_type] || selectedTask.task_type}
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-xs text-gray-500 hebrew-text font-medium">
                          <FileText className="h-4 w-4 text-gray-400" />
                          <span>שם הסעיף</span>
                        </div>
                        <div className="text-sm font-semibold text-gray-900 hebrew-text line-clamp-2">
                          {selectedTask.clause_name || 'ללא שם'}
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-xs text-gray-500 hebrew-text font-medium">
                          <User className="h-4 w-4 text-gray-400" />
                          <span>ראש צוות</span>
                        </div>
                        <div className="text-sm font-semibold text-gray-900 hebrew-text">
                          {selectedTask.created_by || '-'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Team Members Section */}
                  {loadingTeamInfo ? (
                    <div className="bg-white rounded-lg p-6 border border-gray-200">
                      <div className="text-center text-gray-500 hebrew-text">טוען מידע על הצוות...</div>
                    </div>
                  ) : (teamInfo && ((teamInfo.leaders?.length ?? 0) > 0 || (teamInfo.members?.length ?? 0) > 0)) ? (
                    <div className="bg-white rounded-lg p-6 border border-gray-200">
                      <div className="flex items-center gap-2 mb-4">
                        <Users className="h-4 w-4 text-gray-400" />
                        <h3 className="text-sm font-semibold text-gray-800 hebrew-text">צוות העבודה</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {teamInfo.leaders && teamInfo.leaders.length > 0 && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-xs text-gray-500 hebrew-text font-medium mb-2">
                              <User className="h-4 w-4 text-gray-400" />
                              <span>ראשי צוות</span>
                            </div>
                            <div className="space-y-1.5">
                              {teamInfo.leaders.map((leader, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center rounded-lg px-3 py-2 text-sm text-gray-700 hebrew-text"
                                >
                                  <span className="truncate">{leader}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {teamInfo.members && teamInfo.members.length > 0 && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-xs text-gray-500 hebrew-text font-medium mb-2">
                              <Users className="h-4 w-4 text-gray-400" />
                              <span>אנשי צוות</span>
                            </div>
                            <div className="space-y-1.5">
                              {teamInfo.members.map((member, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center rounded-lg px-3 py-2 text-sm text-gray-700 hebrew-text"
                                >
                                  <span className="truncate">{member}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : null}

                  {/* Task Details */}
                  <div className="bg-white rounded-lg p-6 border border-gray-200">
                    <div className="flex items-center gap-2 mb-4">
                      <FileText className="h-4 w-4 text-gray-400" />
                      <h3 className="text-sm font-semibold text-gray-800 hebrew-text">פרטי המשימה</h3>
                    </div>
                    <div className="space-y-4">
                      {renderTaskDetails(selectedTask)}
                    </div>
                  </div>
                </div>
              )}
            </DialogBody>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

