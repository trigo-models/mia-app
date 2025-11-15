import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    // Test environment variables
    const envCheck = {
      SUPABASE_URL: process.env.SUPABASE_URL ? 'Set' : 'Missing',
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ? 'Set (length: ' + process.env.SUPABASE_ANON_KEY.length + ')' : 'Missing',
    }

    // Test Supabase connection
    const connectionTest = {
      url: process.env.SUPABASE_URL,
      hasKey: !!process.env.SUPABASE_ANON_KEY,
      keyLength: process.env.SUPABASE_ANON_KEY?.length || 0,
      keyPreview: process.env.SUPABASE_ANON_KEY ? 
        `${process.env.SUPABASE_ANON_KEY.substring(0, 10)}...${process.env.SUPABASE_ANON_KEY.substring(process.env.SUPABASE_ANON_KEY.length - 5)}` : 
        'Missing'
    }
    
    // Try a simple connection test
    let connectionTestResult: { success: boolean; error: string | null } = { success: false, error: null }
    try {
      // Try to ping the Supabase REST API directly
      const testUrl = `${process.env.SUPABASE_URL}/rest/v1/`
      const testResponse = await fetch(testUrl, {
        method: 'GET',
        headers: {
          'apikey': process.env.SUPABASE_ANON_KEY || '',
          'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY || ''}`,
        }
      })
      connectionTestResult = {
        success: testResponse.ok,
        error: testResponse.ok ? null : `HTTP ${testResponse.status}: ${testResponse.statusText}`
      }
    } catch (e: any) {
      connectionTestResult = {
        success: false,
        error: e.message || 'Connection test failed'
      }
    }

    // Test fetching from each table
    const tableTests: any = {}
    
    // Test factory_name table
    try {
      const { data: factories, error: factoryError } = await supabase
        .from('factory_name')
        .select('*')
        .limit(5)
      
      tableTests.factory_name = {
        success: !factoryError,
        error: factoryError?.message || null,
        errorCode: factoryError?.code || null,
        errorDetails: factoryError?.details || null,
        errorHint: factoryError?.hint || null,
        count: factories?.length || 0,
        sampleData: factories?.[0] || null,
        columns: factories?.[0] ? Object.keys(factories[0]) : []
      }
    } catch (e: any) {
      tableTests.factory_name = {
        success: false,
        error: e.message,
        errorType: e.constructor?.name,
        errorCause: e.cause?.message || null,
        errorStack: e.stack || null
      }
    }

    // Test leaders table
    try {
      const { data: leaders, error: leaderError } = await supabase
        .from('leaders')
        .select('*')
        .limit(5)
      
      tableTests.leaders = {
        success: !leaderError,
        error: leaderError?.message || null,
        count: leaders?.length || 0,
        sampleData: leaders?.[0] || null,
        columns: leaders?.[0] ? Object.keys(leaders[0]) : []
      }
    } catch (e: any) {
      tableTests.leaders = {
        success: false,
        error: e.message
      }
    }

    // Test team table
    try {
      const { data: team, error: teamError } = await supabase
        .from('team')
        .select('*')
        .limit(5)
      
      tableTests.team = {
        success: !teamError,
        error: teamError?.message || null,
        count: team?.length || 0,
        sampleData: team?.[0] || null,
        columns: team?.[0] ? Object.keys(team[0]) : []
      }
    } catch (e: any) {
      tableTests.team = {
        success: false,
        error: e.message
      }
    }

    // Test mia_data table
    try {
      const { data: miaData, error: miaError } = await supabase
        .from('mia_data')
        .select('*')
        .limit(5)
      
      tableTests.mia_data = {
        success: !miaError,
        error: miaError?.message || null,
        count: miaData?.length || 0,
        sampleData: miaData?.[0] || null,
        columns: miaData?.[0] ? Object.keys(miaData[0]) : []
      }
    } catch (e: any) {
      tableTests.mia_data = {
        success: false,
        error: e.message
      }
    }

    // Test projects table
    try {
      const { data: projects, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .limit(5)
      
      tableTests.projects = {
        success: !projectError,
        error: projectError?.message || null,
        count: projects?.length || 0,
        sampleData: projects?.[0] || null,
        columns: projects?.[0] ? Object.keys(projects[0]) : []
      }
    } catch (e: any) {
      tableTests.projects = {
        success: false,
        error: e.message
      }
    }

    return NextResponse.json({
      success: true,
      environment: envCheck,
      connection: {
        ...connectionTest,
        testResult: connectionTestResult
      },
      tableTests
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}

