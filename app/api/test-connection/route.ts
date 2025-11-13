import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_ANON_KEY

    const tests: any = {}

    // Test 1: Direct fetch to Supabase REST API
    try {
      const testUrl = `${supabaseUrl}/rest/v1/`
      const response = await fetch(testUrl, {
        method: 'GET',
        headers: {
          'apikey': supabaseKey || '',
          'Authorization': `Bearer ${supabaseKey || ''}`,
        },
        // Add timeout
        signal: AbortSignal.timeout(10000)
      })
      tests.directFetch = {
        success: response.ok,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      }
    } catch (e: any) {
      tests.directFetch = {
        success: false,
        error: e.message,
        errorType: e.constructor?.name,
        cause: e.cause?.message
      }
    }

    // Test 2: Try fetching from a specific table
    try {
      const tableUrl = `${supabaseUrl}/rest/v1/factory_name?select=Name&limit=1`
      const response = await fetch(tableUrl, {
        method: 'GET',
        headers: {
          'apikey': supabaseKey || '',
          'Authorization': `Bearer ${supabaseKey || ''}`,
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(10000)
      })
      const data = await response.json()
      tests.tableFetch = {
        success: response.ok,
        status: response.status,
        data: data
      }
    } catch (e: any) {
      tests.tableFetch = {
        success: false,
        error: e.message,
        errorType: e.constructor?.name,
        cause: e.cause?.message
      }
    }

    // Test 3: Check if it's a DNS/network issue
    try {
      const dnsTest = await fetch('https://www.google.com', {
        method: 'HEAD',
        signal: AbortSignal.timeout(5000)
      })
      tests.internetConnection = {
        success: dnsTest.ok,
        status: dnsTest.status
      }
    } catch (e: any) {
      tests.internetConnection = {
        success: false,
        error: e.message
      }
    }

    return NextResponse.json({
      success: true,
      supabaseUrl,
      keyLength: supabaseKey?.length || 0,
      tests
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}

