import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    // Check if Supabase is configured
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
      return NextResponse.json({
        error: 'Supabase environment variables are not configured',
        details: 'Please set SUPABASE_URL and SUPABASE_ANON_KEY in your Vercel environment variables'
      }, { status: 500 })
    }

    // Fetch all options from Supabase - using lowercase 'name' to match actual schema
    const [factoriesRes, leadersRes, teamRes, projectsResRaw] = await Promise.all([
      supabase.from('factory_name').select('name'),
      supabase.from('leaders').select('name'),
      supabase.from('team').select('name'),
      supabase.from('projects').select('id, project_name, project_number, factory_name')
    ])
    
    // Transform projects data
    const projectsRes = projectsResRaw.data
      ? {
          ...projectsResRaw,
          data: projectsResRaw.data.map((p: any) => ({
            id: p.id,
            name: p.project_name,
            project_number: p.project_number,
            factory_name: p.factory_name
          }))
        }
      : projectsResRaw

    // Log any errors and return them in response
    const errors: any = {}
    if (factoriesRes.error) {
      console.error('Factories error:', factoriesRes.error)
      errors.factories = factoriesRes.error.message
    }
    if (leadersRes.error) {
      console.error('Leaders error:', leadersRes.error)
      errors.leaders = leadersRes.error.message
    }
    if (teamRes.error) {
      console.error('Team error:', teamRes.error)
      errors.team = teamRes.error.message
    }
    if (projectsRes.error) {
      console.error('Projects error:', projectsRes.error)
      errors.projects = projectsRes.error.message
    }

    const factories = factoriesRes.data?.map(r => r.name) || []
    const teamLeaders = leadersRes.data?.map(r => r.name) || []
    const teamMembers = teamRes.data?.map(r => r.name) || []
    const projects = projectsRes.data || []

    // If there are errors but we got some data, still return it
    // If all failed, return error
    if (Object.keys(errors).length > 0 && factories.length === 0 && teamLeaders.length === 0 && teamMembers.length === 0 && projects.length === 0) {
      return NextResponse.json({
        error: 'Failed to fetch options from Supabase',
        details: errors,
        message: 'Please check your Supabase connection and environment variables'
      }, { status: 500 })
    }

    return NextResponse.json({
      factories,
      teamLeaders,
      teamMembers,
      owners: teamLeaders, // Owners come from Leaders table
      projects,
      ...(Object.keys(errors).length > 0 && { warnings: errors })
    })
  } catch (error: any) {
    console.error('Error fetching options:', error)
    return NextResponse.json(
      { error: 'Failed to fetch options', details: error.message },
      { status: 500 }
    )
  }
}
