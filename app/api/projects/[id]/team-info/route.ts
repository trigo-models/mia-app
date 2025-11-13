import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = params.id
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    const owner = searchParams.get('owner')

    if (!projectId || !date || !owner) {
      return NextResponse.json(
        { error: 'Project ID, date, and owner are required' },
        { status: 400 }
      )
    }

    // Fetch team info from mia_data based on project_id, date_made, and r_owner
    const { data: miaData, error } = await supabase
      .from('mia_data')
      .select('r_leaders, r_team')
      .eq('project_id', projectId)
      .eq('date_made', date)
      .eq('r_owner', owner)
      .limit(1)
      .maybeSingle()

    if (error) {
      console.error('Error fetching team info:', error)
      return NextResponse.json(
        { error: 'Failed to fetch team info' },
        { status: 500 }
      )
    }

    // Parse team leaders and members from comma-separated strings
    const leaders = miaData?.r_leaders 
      ? miaData.r_leaders.split(',').map((l: string) => l.trim()).filter(Boolean)
      : []
    
    const members = miaData?.r_team
      ? miaData.r_team.split(',').map((m: string) => m.trim()).filter(Boolean)
      : []

    return NextResponse.json({
      success: true,
      leaders,
      members
    })
  } catch (error: any) {
    console.error('Error in GET /api/projects/[id]/team-info:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}


