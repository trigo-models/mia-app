import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = params.id
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      )
    }

    // Fetch total count first
    const { count: totalCount } = await supabase
      .from('project_tasks')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', projectId)

    // Fetch tasks with pagination
    const { data: tasks, error } = await supabase
      .from('project_tasks')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching project tasks:', error)
      return NextResponse.json(
        { error: 'Failed to fetch project tasks' },
        { status: 500 }
      )
    }

    // Group tasks by task_type for easier consumption
    const tasksByType = tasks?.reduce((acc: any, task: any) => {
      if (!acc[task.task_type]) {
        acc[task.task_type] = []
      }
      acc[task.task_type].push(task)
      return acc
    }, {}) || {}

    return NextResponse.json({
      success: true,
      tasks: tasks || [],
      tasksByType,
      count: tasks?.length || 0,
      totalCount: totalCount || 0,
      hasMore: (offset + limit) < (totalCount || 0)
    })
  } catch (error: any) {
    console.error('Error in GET /api/projects/[id]/tasks:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const taskId = searchParams.get('taskId')

    if (!taskId) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      )
    }

    // Delete the task
    const { error } = await supabase
      .from('project_tasks')
      .delete()
      .eq('id', taskId)

    if (error) {
      console.error('Error deleting task:', error)
      return NextResponse.json(
        { error: 'Failed to delete task' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Task deleted successfully'
    })
  } catch (error: any) {
    console.error('Error in DELETE /api/projects/[id]/tasks:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

