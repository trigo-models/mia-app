import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

const STATUS_FILTER_MAP: Record<string, string[]> = {
  active: ['active', 'Active', 'פעיל', 'פעילה'],
  completed: ['completed', 'complete', 'Completed', 'הסתיים', 'הסתיימה'],
  paused: ['paused', 'pause', 'Paused', 'מוקפא', 'הוקפא'],
  cancelled: ['cancelled', 'canceled', 'Cancelled', 'בוטל', 'בוטלה'],
}

const applyProjectFilters = (
  query: any,
  {
    factory,
    status,
    invoiceStatus,
  }: { factory?: string | null; status?: string | null; invoiceStatus?: string | null }
) => {
  if (factory && factory !== 'all') {
    query = query.eq('factory_name', factory)
  }

  if (status && status !== 'all') {
    const allowedValues = STATUS_FILTER_MAP[status] || [status]
    query = query.in('status', allowedValues)
  }

  if (invoiceStatus === 'completed') {
    query = query.eq('invoice_completed', true)
  } else if (invoiceStatus === 'not_completed') {
    query = query.or('invoice_completed.is.false,invoice_completed.is.null')
  }

  return query
}

export async function GET(request: Request) {
  try {
    // Check if Supabase is configured
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
      return NextResponse.json({
        success: false,
        error: 'Supabase environment variables are not configured'
      }, { status: 500 })
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '30')
    const offset = parseInt(searchParams.get('offset') || '0')
    const factory = searchParams.get('factory')
    const status = searchParams.get('status')
    const invoiceStatus = searchParams.get('invoiceStatus')

    console.log('Fetching projects from Supabase...', { limit, offset })
    console.log('Supabase URL:', process.env.SUPABASE_URL?.substring(0, 30) + '...')
    
    // Get total count
    const { count: totalCount, error: countError } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })

    if (countError) {
      console.error('Supabase count error:', countError)
      throw countError
    }

    // Get paginated projects
    const { count: filteredCount, error: filteredCountError } = await applyProjectFilters(
      supabase.from('projects').select('*', { count: 'exact', head: true }),
      { factory, status, invoiceStatus }
    )

    if (filteredCountError) {
      console.error('Supabase filtered count error:', filteredCountError)
      throw filteredCountError
    }

    const { data: projects, error } = await applyProjectFilters(
      supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1),
      { factory, status, invoiceStatus }
    )

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }

    console.log(`Fetched ${projects?.length || 0} projects from Supabase (offset: ${offset}, limit: ${limit})`)
    if (projects && projects.length > 0) {
      console.log(
        'Sample project IDs:',
        projects.slice(0, 3).map((project: { id: string }) => project.id)
      )
      console.log(
        'Sample project names:',
        projects.slice(0, 3).map((project: { project_name?: string | null }) => project.project_name)
      )
    }

    const response = NextResponse.json({
      success: true,
      projects: projects || [],
      count: projects?.length || 0,
      totalCount: totalCount || 0,
      filteredCount: filteredCount || 0,
      hasMore: (offset + (projects?.length || 0)) < (filteredCount || 0),
      supabaseUrl: process.env.SUPABASE_URL?.substring(0, 30) + '...' // For debugging
    })
    
    // Prevent caching to ensure fresh data
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    
    return response
  } catch (error: any) {
    console.error('Error fetching projects:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to fetch projects'
    }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.factory_name || !body.project_name) {
      return NextResponse.json({
        success: false,
        error: 'שם המפעל ושם הפרויקט נדרשים'
      }, { status: 400 })
    }
    
    // Extract factory number from factory name (like "מפעל גיבוש - 62")
    const match = body.factory_name.match(/(\d+)$/)
    const factoryNumber = match ? match[1] : null
    
    let projectNumber = null
    
    // Only generate project number if we found a number in the factory name
    if (factoryNumber) {
      // Get all existing projects for this factory to find the highest number
      const { data: existingProjects } = await supabase
        .from('projects')
        .select('project_number')
        .eq('factory_name', body.factory_name)

      // Find the highest project number for this factory
      let maxProjectNum = 0
      existingProjects?.forEach(project => {
        const num = project.project_number as string
        if (num && num.includes('.')) {
          const parts = num.split('.')
          if (parts.length === 2 && parts[0] === factoryNumber) {
            const projectNum = parseInt(parts[1])
            if (!isNaN(projectNum) && projectNum > maxProjectNum) {
              maxProjectNum = projectNum
            }
          }
        }
      })

      // Generate the next project number
      projectNumber = `${factoryNumber}.${maxProjectNum + 1}`
    }
    
    // Build insert object dynamically to handle missing columns
    const insertData: any = {
      factory_name: body.factory_name,
      specific_area: body.specific_area || null,
      project_name: body.project_name,
      project_description: body.project_description || null,
      start_date: body.start_date || null,
      status: body.status || 'active'
    }
    
    // Always add project_number if it was generated
    if (projectNumber) {
      insertData.project_number = projectNumber
    }
    
    const { data: project, error } = await supabase
      .from('projects')
      .insert([insertData])
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      project
    })
  } catch (error: any) {
    console.error('Error creating project:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to create project'
    }, { status: 500 })
  }
}

