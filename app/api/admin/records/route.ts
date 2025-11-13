import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    console.log(`Starting admin records fetch... page: ${page}, limit: ${limit}`)
    
    // Calculate pagination offset
    const offset = (page - 1) * limit
    
    // Get records from Supabase
    const { data: allRecords, error, count } = await supabase
      .from('mia_data')
      .select('*', { count: 'exact' })
      .order('date_made', { ascending: false })
      .range(offset, offset + limit - 1)
    
    if (error) {
      throw error
    }
    
    const total = count || 0
    const hasMore = offset + limit < total

    console.log(`Records fetched successfully: ${allRecords?.length || 0} of ${total}`)

    // Transform Supabase records to match expected format
    const records = (allRecords || []).map(record => {
      // Create a fields object with all the data, mapping number to Number for compatibility
      const fields: any = {
        ...record,
        Number: record.number, // Map 'number' to 'Number' for compatibility
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
      records,
      pagination: {
        page,
        limit,
        total,
        hasMore
      }
    })
  } catch (error: any) {
    console.error('Error in admin records:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      errorType: error.constructor.name
    }, { status: 500 })
  }
}
