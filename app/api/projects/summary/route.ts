import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { STATUS_LABELS, normalizeStatusKey } from '@/lib/admin-ui'

const STATUS_KEYS = Object.keys(STATUS_LABELS) as Array<keyof typeof STATUS_LABELS>

export async function GET() {
  try {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
      return NextResponse.json({
        success: false,
        error: 'Supabase environment variables are not configured'
      }, { status: 500 })
    }

    const { data: projects, error } = await supabase
      .from('projects')
      .select('status, invoice_completed')

    if (error) {
      console.error('Supabase summary error:', error)
      throw error
    }

    const summary = {
      totalProjects: projects?.length || 0,
      statusCounts: STATUS_KEYS.reduce((acc, key) => {
        acc[key] = 0
        return acc
      }, {} as Record<keyof typeof STATUS_LABELS, number>),
      invoiceCounts: {
        completed: 0,
        notCompleted: 0
      }
    }

    projects?.forEach(project => {
      const normalizedStatus = normalizeStatusKey(project.status)
      if (normalizedStatus && summary.statusCounts[normalizedStatus] !== undefined) {
        summary.statusCounts[normalizedStatus] += 1
      }

      if (project.invoice_completed === true) {
        summary.invoiceCounts.completed += 1
      } else {
        summary.invoiceCounts.notCompleted += 1
      }
    })

    const response = NextResponse.json({
      success: true,
      summary
    })
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    return response
  } catch (error: any) {
    console.error('Error fetching project summary:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to fetch project summary'
    }, { status: 500 })
  }
}

