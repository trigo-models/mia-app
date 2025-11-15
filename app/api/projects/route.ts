import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const { data: projects, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    const response = NextResponse.json({
      success: true,
      projects: projects || []
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

