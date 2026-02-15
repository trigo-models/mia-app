'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AdminPageHeader, AdminStatCard, AdminDataTable, AdminEmptyState, StatusBadge } from '@/components/admin/ui'
import { Plus, Trash2, X, LogOut, ArrowRight } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { STATUS_LABELS } from '@/lib/admin-ui'

interface Project {
  id: string
  factory_name: string
  specific_area: string
  project_name: string
  project_number: string | null
  project_description: string
  start_date: string
  status: string
  invoice_completed?: boolean
  invoice_issued?: boolean
  created_at: string
}


interface Options {
  factories: string[]
}

const formatDate = (date?: string) => {
  if (!date) return '-'
  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return '-'
  return parsed.toLocaleDateString('he-IL')
}

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [filteredCount, setFilteredCount] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [currentOffset, setCurrentOffset] = useState(0)
  const [options, setOptions] = useState<Options>({ factories: [] })
  const [showAddForm, setShowAddForm] = useState(false)
  const router = useRouter()
  const [formData, setFormData] = useState({
    factory_name: '',
    specific_area: '',
    project_name: '',
    project_description: '',
    start_date: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [selectedFactory, setSelectedFactory] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<'all' | keyof typeof STATUS_LABELS>('all')
  const [selectedInvoiceStatus, setSelectedInvoiceStatus] = useState<'all' | 'completed' | 'not_completed'>('all')
  const [selectedInvoiceIssued, setSelectedInvoiceIssued] = useState<'all' | 'yes' | 'no'>('all')
  const [projectSummary, setProjectSummary] = useState({
    totalProjects: 0,
    statusCounts: {
      active: 0,
      completed: 0,
      paused: 0,
      cancelled: 0
    }
  })

  useEffect(() => {
    fetchProjects(true)
    fetchOptions()
    fetchProjectSummary()
  }, [])

  // Reset pagination when filters change
  useEffect(() => {
    // Skip on initial load (handled by first useEffect)
    const timer = setTimeout(() => {
      fetchProjects(true)
    }, 100)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFactory, selectedStatus, selectedInvoiceStatus, selectedInvoiceIssued])

  const fetchProjects = async (reset: boolean = false) => {
    try {
      if (reset) {
        setLoading(true)
        setCurrentOffset(0)
      } else {
        setLoadingMore(true)
      }

      const offset = reset ? 0 : currentOffset
      const limit = 30
      
      const params = new URLSearchParams()
      params.set('limit', String(limit))
      params.set('offset', String(offset))
      params.set('t', String(Date.now()))
      if (selectedFactory !== 'all') params.set('factory', selectedFactory)
      if (selectedStatus !== 'all') params.set('status', selectedStatus)
      if (selectedInvoiceStatus !== 'all') params.set('invoiceStatus', selectedInvoiceStatus)
      if (selectedInvoiceIssued !== 'all') params.set('invoiceIssued', selectedInvoiceIssued)

      const response = await fetch(`/api/projects?${params.toString()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      })
      const data = await response.json()
      
      if (data.success) {
        if (reset) {
          setProjects(data.projects || [])
        } else {
          setProjects(prev => [...prev, ...(data.projects || [])])
        }
        setFilteredCount(data.filteredCount ?? data.count ?? 0)
        setHasMore(data.hasMore || false)
        setCurrentOffset(offset + (data.projects?.length || 0))
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const fetchProjectSummary = async () => {
    try {
      const response = await fetch(`/api/projects/summary?t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      })
      const data = await response.json()
      if (data.success && data.summary) {
        setProjectSummary({
          totalProjects: data.summary.totalProjects || 0,
          statusCounts: {
            active: data.summary.statusCounts?.active || 0,
            completed: data.summary.statusCounts?.completed || 0,
            paused: data.summary.statusCounts?.paused || 0,
            cancelled: data.summary.statusCounts?.cancelled || 0
          }
        })
      }
    } catch (error) {
      console.error('Error fetching project summary:', error)
    }
  }

  const loadMoreProjects = () => {
    if (!loadingMore && hasMore) {
      fetchProjects(false)
    }
  }

  const fetchOptions = async () => {
    try {
      const response = await fetch(`/api/options?t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      })
      const data = await response.json()
      
      if (data.factories) {
        setOptions({ factories: data.factories })
      }
    } catch (error) {
      console.error('Error fetching options:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.factory_name || !formData.project_name) {
      alert('נא למלא את שם המפעל ושם הפרויקט')
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch(`/api/projects?t=${Date.now()}`, {
        method: 'POST',
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        alert('הפרויקט נוצר בהצלחה!')
        setShowAddForm(false)
        setFormData({
          factory_name: '',
          specific_area: '',
          project_name: '',
          project_description: '',
          start_date: ''
        })
        fetchProjectSummary()
        fetchProjects(true)
      } else {
        alert(`שגיאה: ${data.error || 'שגיאה לא ידועה'}`)
      }
    } catch (error) {
      console.error('Error creating project:', error)
      alert('שגיאה ביצירת הפרויקט')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (projectId: string) => {
    if (!confirm('האם אתה בטוח שברצונך למחוק את הפרויקט הזה?')) {
      return
    }

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        alert('הפרויקט נמחק בהצלחה!')
        fetchProjectSummary()
        fetchProjects(true)
      } else {
        alert('שגיאה במחיקת הפרויקט')
      }
    } catch (error) {
      console.error('Error deleting project:', error)
      alert('שגיאה במחיקת הפרויקט')
    }
  }

  const handleLogout = () => {
    sessionStorage.removeItem('admin_authenticated')
    router.replace('/admin')
  }

  const statusCounts = projectSummary.statusCounts

  const STATUS_ORDER: Array<keyof typeof STATUS_LABELS> = ['active', 'completed', 'paused', 'cancelled']

  const projectColumns = [
    {
      key: 'project_name',
      header: 'שם הפרויקט',
      render: (project: Project) => (
        <Link
          href={`/admin/projects/${project.id}`}
          className="text-sm text-gray-900 hover:text-blue-600 hover:underline max-w-[180px] truncate block"
          title={project.project_name}
        >
          {project.project_name}
        </Link>
      ),
      className: 'max-w-[180px]',
    },
    {
      key: 'project_number',
      header: 'מספר פרויקט',
      render: (project: Project) => (
        project.project_number ? (
          <span className="text-xs text-gray-600 font-mono">{project.project_number}</span>
        ) : (
          <span className="text-gray-400 text-xs">-</span>
        )
      ),
      className: 'whitespace-nowrap',
    },
    {
      key: 'factory_name',
      header: 'מפעל',
      render: (project: Project) => (
        <span className="text-xs text-gray-700 max-w-[120px] truncate block" title={project.factory_name}>
          {project.factory_name}
        </span>
      ),
      className: 'max-w-[120px]',
    },
    {
      key: 'specific_area',
      header: 'איזור ספציפי',
      render: (project: Project) => (
        <span className="text-xs text-gray-600 max-w-[120px] truncate block" title={project.specific_area || ''}>
          {project.specific_area || <span className="text-gray-400">-</span>}
        </span>
      ),
      className: 'max-w-[120px]',
    },
    {
      key: 'project_description',
      header: 'תיאור',
      render: (project: Project) => project.project_description ? (
        <p className="text-xs text-gray-600 max-w-[150px] truncate" title={project.project_description}>
          {project.project_description}
        </p>
      ) : (
        <span className="text-gray-400 text-xs">-</span>
      ),
      className: 'max-w-[150px]',
    },
    {
      key: 'start_date',
      header: 'תאריך התחלה',
      render: (project: Project) => (
        <span className="text-xs text-gray-600 whitespace-nowrap">
          {formatDate(project.start_date)}
        </span>
      ),
      className: 'whitespace-nowrap',
    },
    {
      key: 'status',
      header: 'סטטוס',
      render: (project: Project) => <StatusBadge status={project.status} />,
      className: 'whitespace-nowrap',
    },
    {
      key: 'invoice_completed',
      header: 'בוצע חשבון',
      render: (project: Project) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={project.invoice_completed || false}
            disabled
            className="h-4 w-4"
          />
        </div>
      ),
      className: 'whitespace-nowrap',
      align: 'center' as const,
    },
    {
      key: 'invoice_issued',
      header: 'חשבונית מס',
      render: (project: Project) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={project.invoice_issued || false}
            disabled
            className="h-4 w-4"
          />
        </div>
      ),
      className: 'whitespace-nowrap',
      align: 'center' as const,
    },
    {
      key: 'created_at',
      header: 'תאריך יצירה',
      render: (project: Project) => (
        <span className="text-xs text-gray-500 whitespace-nowrap">
          {formatDate(project.created_at)}
        </span>
      ),
      className: 'whitespace-nowrap',
    },
    {
      key: 'actions',
      header: 'פעולות',
      align: 'center' as const,
      render: (project: Project) => (
        <div className="flex items-center justify-center gap-1">
          <Link href={`/admin/projects/${project.id}`}>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-gray-600 hover:text-blue-600">
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(project.id)}
            className="h-7 w-7 p-0 text-gray-600 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
      className: 'whitespace-nowrap',
    },
  ]


  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <AdminPageHeader
          title="ניהול פרויקטים"
          subtitle="נהל את כל הפרויקטים בממשק אחיד. ניתן לסנן לפי מפעל ולסקור כל פרויקט לעומק."
          actions={(
            <>
              <Button
                variant="outline"
                className="hebrew-text flex items-center gap-2 rounded-full border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 px-4 py-2 shadow-sm"
                onClick={handleLogout}
              >
                התנתק
                <LogOut className="h-4 w-4" />
              </Button>
              <Button 
                onClick={() => setShowAddForm(true)} 
                className="hebrew-text flex items-center gap-2 rounded-full border border-blue-600 bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 shadow-sm"
              >
                <Plus className="h-4 w-4" />
                הוסף פרויקט חדש
              </Button>
            </>
          )}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
          <AdminStatCard
            label="כל הפרויקטים"
            value={projectSummary.totalProjects}
            description="סך הפרויקטים במערכת"
            accentColor="violet"
          />
          <AdminStatCard
            label={STATUS_LABELS.active}
            value={statusCounts.active}
            description="פרויקטים פעילים בביצוע"
            accentColor="emerald"
          />
          <AdminStatCard
            label={STATUS_LABELS.completed}
            value={statusCounts.completed}
            description="פרויקטים שהסתיימו"
            accentColor="sky"
          />
          <AdminStatCard
            label={STATUS_LABELS.paused}
            value={statusCounts.paused}
            description="פרויקטים בהשהייה"
            accentColor="amber"
          />
          <AdminStatCard
            label={STATUS_LABELS.cancelled}
            value={statusCounts.cancelled}
            description="פרויקטים שבוטלו"
            accentColor="rose"
          />
          </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3 sm:flex-nowrap">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:items-center sm:gap-2 w-full sm:w-auto">
              <div className="text-sm font-medium text-gray-600 hebrew-text whitespace-nowrap">מפעל:</div>
              <Select
                value={selectedFactory}
                onValueChange={(value) => setSelectedFactory(value)}
              >
              <SelectTrigger className="w-full sm:w-52 hebrew-text flex-row-reverse">
                <SelectValue placeholder="בחר מפעל" className="text-right" />
                </SelectTrigger>
                <SelectContent>
                <SelectItem value="all" className="hebrew-text text-right justify-end">
                    כל המפעלים
                  </SelectItem>
                  {options.factories.map((factory) => (
                  <SelectItem key={factory} value={factory} className="hebrew-text text-right justify-end">
                      {factory}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:items-center sm:gap-2 w-full sm:w-auto">
            <div className="text-sm font-medium text-gray-600 hebrew-text whitespace-nowrap">סטטוס:</div>
            <Select
              value={selectedStatus}
              onValueChange={(value) => setSelectedStatus(value as 'all' | keyof typeof STATUS_LABELS)}
            >
              <SelectTrigger className="w-full sm:w-40 hebrew-text flex-row-reverse">
                <SelectValue placeholder="בחר סטטוס" className="text-right" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="hebrew-text text-right justify-end">
                  כל הסטטוסים
                </SelectItem>
                {Object.entries(STATUS_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key} className="hebrew-text text-right justify-end">
                    {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:items-center sm:gap-2 w-full sm:w-auto">
            <div className="text-sm font-medium text-gray-600 hebrew-text whitespace-nowrap">בוצע חשבון:</div>
            <Select
              value={selectedInvoiceStatus}
              onValueChange={(value) => setSelectedInvoiceStatus(value as 'all' | 'completed' | 'not_completed')}
            >
              <SelectTrigger className="w-full sm:w-36 hebrew-text flex-row-reverse">
                <SelectValue placeholder="בחר" className="text-right" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="hebrew-text text-right justify-end">
                  הכל
                </SelectItem>
                <SelectItem value="completed" className="hebrew-text text-right justify-end">
                  בוצע
                </SelectItem>
                <SelectItem value="not_completed" className="hebrew-text text-right justify-end">
                  לא בוצע
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:items-center sm:gap-2 w-full sm:w-auto">
            <div className="text-sm font-medium text-gray-600 hebrew-text whitespace-nowrap">חשבונית מס:</div>
            <Select
              value={selectedInvoiceIssued}
              onValueChange={(value) => setSelectedInvoiceIssued(value as 'all' | 'yes' | 'no')}
            >
              <SelectTrigger className="w-full sm:w-36 hebrew-text flex-row-reverse">
                <SelectValue placeholder="בחר" className="text-right" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="hebrew-text text-right justify-end">
                  הכל
                </SelectItem>
                <SelectItem value="yes" className="hebrew-text text-right justify-end">
                  כן
                </SelectItem>
                <SelectItem value="no" className="hebrew-text text-right justify-end">
                  לא
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="text-sm text-gray-500 hebrew-text sm:mr-auto">
              מציג {projects.length} מתוך {filteredCount} תוצאות מסוננות ({projectSummary.totalProjects} סה"כ במערכת)
          </div>
        </div>

        {loading ? (
          <AdminEmptyState
            title="טוען פרויקטים..."
            description="אנא המתן בזמן שאנו טוענים את הנתונים ממסד הנתונים."
          />
        ) : projects.length === 0 ? (
          <AdminEmptyState
            icon={<span className="text-4xl">📂</span>}
            title="אין פרויקטים להצגה"
            description="שנה את הסינון או צור פרויקט חדש כדי להתחיל."
            actions={
              <Button onClick={() => setShowAddForm(true)} className="hebrew-text">
                הוסף פרויקט חדש
              </Button>
            }
          />
        ) : (
          <>
            <AdminDataTable
              data={projects}
              columns={projectColumns}
              rowKey={(project) => project.id}
            />
            {hasMore && (
              <div className="mt-6 flex justify-center">
                <Button
                  onClick={loadMoreProjects}
                  disabled={loadingMore}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors hebrew-text disabled:opacity-50"
                >
                  {loadingMore ? 'טוען...' : 'טען פרויקטים נוספים'}
                </Button>
              </div>
            )}
          </>
        )}

        {/* Add Project Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" dir="rtl">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="hebrew-text">הוסף פרויקט חדש</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAddForm(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="factory_name" className="hebrew-text text-right block">
                      שם המפעל *
                    </Label>
                    <Select
                      value={formData.factory_name}
                      onValueChange={(value) => setFormData({ ...formData, factory_name: value })}
                      required
                    >
                      <SelectTrigger className="hebrew-text text-right flex-row-reverse [&>svg]:mr-0 [&>svg]:ml-3">
                        <SelectValue placeholder="בחר מפעל" className="text-right" />
                      </SelectTrigger>
                      <SelectContent className="text-right" dir="rtl">
                        {options.factories.map((factory) => (
                          <SelectItem key={factory} value={factory} className="hebrew-text text-right [&>span]:right-2 [&>span]:left-auto">
                            {factory}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="specific_area" className="hebrew-text text-right block">
                      איזור ספציפי
                    </Label>
                    <Input
                      id="specific_area"
                      value={formData.specific_area}
                      onChange={(e) => setFormData({ ...formData, specific_area: e.target.value })}
                      placeholder="הכנס איזור ספציפי"
                      className="hebrew-text text-right"
                      dir="rtl"
                    />
                  </div>

                  <div>
                    <Label htmlFor="project_name" className="hebrew-text text-right block">
                      שם הפרויקט *
                    </Label>
                    <Input
                      id="project_name"
                      value={formData.project_name}
                      onChange={(e) => setFormData({ ...formData, project_name: e.target.value })}
                      placeholder="הכנס שם פרויקט"
                      required
                      className="hebrew-text text-right"
                      dir="rtl"
                    />
                  </div>

                  <div>
                    <Label htmlFor="project_description" className="hebrew-text text-right block">
                      תיאור הפרויקט
                    </Label>
                    <Textarea
                      id="project_description"
                      value={formData.project_description}
                      onChange={(e) => setFormData({ ...formData, project_description: e.target.value })}
                      placeholder="הכנס תיאור מפורט של הפרויקט"
                      rows={4}
                      className="hebrew-text text-right"
                      dir="rtl"
                    />
                  </div>

                  <div>
                    <Label htmlFor="start_date" className="hebrew-text text-right block">
                      תאריך התחלה
                    </Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      className="hebrew-text text-right"
                      dir="rtl"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowAddForm(false)}
                      disabled={submitting}
                    >
                      ביטול
                    </Button>
                    <Button type="submit" disabled={submitting}>
                      {submitting ? 'שולח...' : 'שמור'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

