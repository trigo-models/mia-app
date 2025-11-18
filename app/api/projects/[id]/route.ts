import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    
    const { data, error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      project: data
    })
  } catch (error: any) {
    console.error('Error deleting project:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to delete project'
    }, { status: 500 })
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    
    const { data: project, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      project
    })
  } catch (error: any) {
    console.error('Error fetching project:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to fetch project'
    }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    
    // Map Hebrew status labels to English
    const statusMap: Record<string, string> = {
      'פעיל': 'active',
      'מוקפא': 'paused',
      'הסתיים': 'completed',
      'בוטל': 'cancelled'
    }
    
    // Prepare update data
    const updateData: any = {}
    
    if (body.specific_area !== undefined) {
      updateData.specific_area = body.specific_area
    }
    if (body.project_name !== undefined) {
      updateData.project_name = body.project_name
    }
    if (body.project_description !== undefined) {
      updateData.project_description = body.project_description
    }
    if (body.start_date !== undefined) {
      updateData.start_date = body.start_date || null
    }
    if (body.status !== undefined) {
      // Convert Hebrew status to English if needed
      updateData.status = statusMap[body.status] || body.status
    }
    if (body.invoice_completed !== undefined) {
      updateData.invoice_completed = body.invoice_completed
    }
    if (body.invoice_issued !== undefined) {
      updateData.invoice_issued = body.invoice_issued
    }
    
    const { data: project, error } = await supabase
      .from('projects')
      .update(updateData)
      .eq('id', id)
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
    console.error('Error updating project:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to update project'
    }, { status: 500 })
  }
}
