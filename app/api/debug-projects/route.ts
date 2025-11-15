import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    // Check environment
    const envInfo = {
      hasUrl: !!process.env.SUPABASE_URL,
      hasKey: !!process.env.SUPABASE_ANON_KEY,
      urlPreview: process.env.SUPABASE_URL ? process.env.SUPABASE_URL.substring(0, 40) + '...' : 'Missing'
    }

    // Direct query to Supabase
    const { data: projects, error } = await supabase
      .from('projects')
      .select('id, project_name, project_number, factory_name, created_at')
      .order('created_at', { ascending: false })

    return NextResponse.json({
      success: true,
      environment: envInfo,
      queryResult: {
        error: error ? {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        } : null,
        count: projects?.length || 0,
        projects: projects || []
      },
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

