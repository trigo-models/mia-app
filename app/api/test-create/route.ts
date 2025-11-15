import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    // Try to create a simple test record to see what fields are available
    const testRecord = {
      fac_name: 'Test Factory',
      element: 'Test Element'
    }
    
    const { data: record, error } = await supabase
      .from('mia_data')
      .insert(testRecord)
      .select()
      .single()
    
    if (error) {
      throw error
    }
    
    return NextResponse.json({
      success: true,
      message: "Test record created successfully!",
      recordId: record.id,
      fields: Object.keys(record),
      recordData: record
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      errorType: error instanceof Error ? error.constructor.name : 'Unknown',
      details: error instanceof Error ? error.toString() : String(error)
    }, { status: 500 })
  }
}
