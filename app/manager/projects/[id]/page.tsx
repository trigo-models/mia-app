'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface Project {
  id: string
  project_name: string
  project_description?: string
  factory_name: string
  specific_area?: string
  start_date?: string
  status: string
  project_number?: string
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

  useEffect(() => {
    if (projectId) {
      fetchProjectDetails()
      fetchProjectTasks()
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

  const fetchProjectTasks = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/tasks`)
      const data = await response.json()
      
      if (data.success) {
        setTasks(data.tasks || [])
        setTasksByType(data.tasksByType || {})
      } else {
        console.error('Error fetching tasks:', data.error)
      }
    } catch (err) {
      console.error('Error fetching project tasks:', err)
    } finally {
      setLoading(false)
    }
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

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('he-IL')
  }

  const renderTaskDetails = (task: ProjectTask) => {
    if (task.task_type === 'manpower' && task.people && Array.isArray(task.people)) {
      return (
        <div className="space-y-3">
          <div className="font-semibold text-gray-700 hebrew-text">אנשים:</div>
          {task.people.map((person, idx) => (
            <div key={person.localId || idx} className="bg-gray-50 p-3 rounded-lg">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="text-gray-600">שם פרטי:</span> <span className="font-medium">{person.firstName}</span></div>
                <div><span className="text-gray-600">שעות עבודה:</span> <span className="font-medium">{person.workHours}</span></div>
              </div>
            </div>
          ))}
        </div>
      )
    }

    if (task.task_type === 'minimumPermit') {
      return (
        <div className="space-y-3">
          {task.title && (
            <div>
              <span className="text-gray-600 font-semibold hebrew-text">כותרת:</span>
              <p className="mt-1 text-gray-900 hebrew-text">{task.title}</p>
            </div>
          )}
          {task.specific_location && (
            <div>
              <span className="text-gray-600 font-semibold hebrew-text">מיקום ספציפי:</span>
              <p className="mt-1 text-gray-900 hebrew-text">{task.specific_location}</p>
            </div>
          )}
          {task.what_was_done && (
            <div>
              <span className="text-gray-600 font-semibold hebrew-text">מה בוצע בפועל:</span>
              <p className="mt-1 text-gray-900 hebrew-text whitespace-pre-wrap">{task.what_was_done}</p>
            </div>
          )}
        </div>
      )
    }

    // Regular task types
    return (
      <div className="space-y-3">
        {task.description && (
          <div>
            <span className="text-gray-600 font-semibold hebrew-text">תיאור:</span>
            <p className="mt-1 text-gray-900 hebrew-text">{task.description}</p>
          </div>
        )}
        {(task.quantity || task.measurement_unit) && (
          <div className="grid grid-cols-2 gap-4">
            {task.quantity && (
              <div>
                <span className="text-gray-600 font-semibold hebrew-text">כמות:</span>
                <p className="mt-1 text-gray-900 hebrew-text">{task.quantity} {task.measurement_unit || ''}</p>
              </div>
            )}
          </div>
        )}
        {task.attachment && (
          <div>
            <span className="text-gray-600 font-semibold hebrew-text">תמונה:</span>
            <div className="mt-2">
              <img src={task.attachment} alt="תמונה" className="max-w-full h-auto rounded-lg border border-gray-200" />
            </div>
          </div>
        )}
      </div>
    )
  }

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
            href="/manager"
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
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 hebrew-text">{project.project_name}</h1>
              {project.project_number && (
                <p className="mt-1 text-lg text-gray-600 hebrew-text font-mono">#{project.project_number}</p>
              )}
              <p className="mt-2 text-gray-600 hebrew-text">פרטי פרויקט ומשימות</p>
            </div>
            <div className="flex gap-4">
              <Link
                href="/manager"
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors hebrew-text"
              >
                חזור לפרויקטים
              </Link>
            </div>
          </div>
        </div>

        {/* Project Info */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="hebrew-text">פרטי הפרויקט</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 hebrew-text">מידע כללי</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 hebrew-text">מפעל:</span>
                    <span className="font-medium hebrew-text">{project.factory_name}</span>
                  </div>
                  {project.specific_area && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 hebrew-text">איזור ספציפי:</span>
                      <span className="font-medium hebrew-text">{project.specific_area}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600 hebrew-text">סטטוס:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium hebrew-text ${getStatusColor(project.status)}`}>
                      {project.status}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 hebrew-text">תאריכים</h3>
                <div className="space-y-3">
                  {project.start_date && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 hebrew-text">תאריך התחלה:</span>
                      <span className="font-medium hebrew-text">{formatDate(project.start_date)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600 hebrew-text">נוצר ב:</span>
                    <span className="font-medium hebrew-text">{formatDate(project.created_at)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 hebrew-text">עודכן ב:</span>
                    <span className="font-medium hebrew-text">{formatDate(project.updated_at)}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 hebrew-text">סטטיסטיקה</h3>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{tasks.length}</div>
                  <div className="text-gray-600 hebrew-text">סה"כ משימות</div>
                </div>
              </div>
            </div>

            {project.project_description && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 hebrew-text">תיאור הפרויקט</h3>
                <p className="text-gray-700 hebrew-text">{project.project_description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tasks by Type */}
        {tasks.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <div className="text-gray-400 text-6xl mb-4">📋</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2 hebrew-text">אין משימות עדיין</h3>
                <p className="text-gray-600 hebrew-text">המשימות יופיעו כאן כאשר הן יוקצו לפרויקט זה</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.entries(tasksByType).map(([taskType, typeTasks]) => (
              <Card key={taskType}>
                <CardHeader>
                  <CardTitle className="hebrew-text">
                    {TASK_TYPE_LABELS[taskType] || taskType} ({typeTasks.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {typeTasks.map((task) => (
                      <Card key={task.id} className="border border-gray-200">
                        <CardHeader className="pb-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-lg hebrew-text">{task.clause_name || 'ללא שם'}</CardTitle>
                              <CardDescription className="hebrew-text mt-1">
                                נוצר ב: {formatDate(task.date_created || task.created_at)}
                                {task.created_by && ` • על ידי: ${task.created_by}`}
                              </CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          {renderTaskDetails(task)}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}




