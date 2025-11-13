import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = params.id
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // Calculate pagination offset
    const offset = (page - 1) * limit

    // Get project info
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single()

    if (projectError) {
      throw projectError
    }

    // Get reports for this project
    const { data: reports, error: reportsError, count } = await supabase
      .from('mia_data')
      .select('*', { count: 'exact' })
      .eq('project_id', projectId)
      .order('date_made', { ascending: false })
      .range(offset, offset + limit - 1)

    if (reportsError) {
      throw reportsError
    }

    const total = count || 0
    const hasMore = offset + limit < total

    // Transform reports to match expected format
    const transformedReports = (reports || []).map(record => {
      const fields: any = {
        ...record,
        Number: record.number,
      }
      
      // Remove Supabase internal fields
      delete fields.airtable_id
      delete fields.id
      
      return {
        id: record.airtable_id || record.id,
        fields: fields,
        createdTime: record.created_at
      }
    })

    return NextResponse.json({
      success: true,
      project,
      reports: transformedReports,
      pagination: {
        page,
        limit,
        total,
        hasMore
      }
    })
  } catch (error: any) {
    console.error('Error fetching project reports:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to fetch project reports'
    }, { status: 500 })
  }
}





