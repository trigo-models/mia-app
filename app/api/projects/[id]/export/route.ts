import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import * as XLSX from 'xlsx'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = params.id

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      )
    }

    // Fetch project details
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single()

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // Fetch all tasks for this project (no pagination limit)
    const { data: tasks, error: tasksError } = await supabase
      .from('project_tasks')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true })

    if (tasksError) {
      console.error('Error fetching tasks:', tasksError)
      return NextResponse.json(
        { error: 'Failed to fetch tasks' },
        { status: 500 }
      )
    }

    // Create a new workbook
    const workbook = XLSX.utils.book_new()

    // Sheet 1: Project Information
    const projectData = [
      ['מספר פרויקט', project.project_number || ''],
      ['שם הפרויקט', project.project_name || ''],
      ['תיאור', project.project_description || ''],
      ['מפעל', project.factory_name || ''],
      ['איזור ספציפי', project.specific_area || ''],
      ['תאריך התחלה', project.start_date ? new Date(project.start_date).toLocaleDateString('he-IL') : ''],
      ['סטטוס', getStatusLabel(project.status)],
      ['תאריך יצירה', project.created_at ? new Date(project.created_at).toLocaleDateString('he-IL') : ''],
      ['תאריך עדכון', project.updated_at ? new Date(project.updated_at).toLocaleDateString('he-IL') : '']
    ]

    const projectSheet = XLSX.utils.aoa_to_sheet(projectData)
    XLSX.utils.book_append_sheet(workbook, projectSheet, 'פרטי פרויקט')

    // Sheet 2: Tasks
    if (tasks && tasks.length > 0) {
      const tasksData = tasks.map((task: any) => {
        // Handle different task types
        let details = ''
        if (task.task_type === 'manpower' && task.people) {
          const people = Array.isArray(task.people) ? task.people : []
          details = people.map((p: any) => `${p.firstName || ''}: ${p.workHours || 0} שעות`).join('; ')
        } else if (task.task_type === 'minimumPermit') {
          details = `כותרת: ${task.title || ''}; מיקום: ${task.specific_location || ''}; מה בוצע: ${task.what_was_done || ''}`
        } else {
          details = task.description || ''
        }

        return [
          task.date_created ? new Date(task.date_created).toLocaleDateString('he-IL') : '',
          getTaskTypeLabel(task.task_type),
          task.clause_name || '',
          task.created_by || '',
          task.quantity || '',
          task.measurement_unit || '',
          details,
          task.attachment ? 'כן' : 'לא',
          task.created_at ? new Date(task.created_at).toLocaleDateString('he-IL') : ''
        ]
      })

      const tasksHeaders = [
        'תאריך ביצוע',
        'קטגוריה',
        'שם הסעיף',
        'ראש צוות',
        'כמות',
        'יחידת מידה',
        'פרטים',
        'תמונה',
        'תאריך יצירה'
      ]

      const tasksSheet = XLSX.utils.aoa_to_sheet([tasksHeaders, ...tasksData])
      XLSX.utils.book_append_sheet(workbook, tasksSheet, 'משימות')
    } else {
      // Create empty tasks sheet
      const tasksHeaders = [
        'תאריך ביצוע',
        'קטגוריה',
        'שם הסעיף',
        'ראש צוות',
        'כמות',
        'יחידת מידה',
        'פרטים',
        'תמונה',
        'תאריך יצירה'
      ]
      const tasksSheet = XLSX.utils.aoa_to_sheet([tasksHeaders])
      XLSX.utils.book_append_sheet(workbook, tasksSheet, 'משימות')
    }

    // Generate Excel file buffer
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })

    // Create filename with project number and name
    const projectNumber = project.project_number || 'Unknown'
    const projectName = (project.project_name || 'Project').replace(/[^a-zA-Z0-9]/g, '_')
    const filename = `Project_${projectNumber}_${projectName}_${new Date().toISOString().split('T')[0]}.xlsx`

    // Return Excel file
    return new NextResponse(excelBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
      },
    })
  } catch (error: any) {
    console.error('Error exporting to Excel:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

function getStatusLabel(status: string): string {
  switch (status?.toLowerCase()) {
    case 'active': return 'פעיל'
    case 'completed': return 'הסתיים'
    case 'paused': return 'מוקפא'
    case 'cancelled': return 'בוטל'
    default: return status
  }
}

function getTaskTypeLabel(taskType: string): string {
  const labels: Record<string, string> = {
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
  return labels[taskType] || taskType
}


