import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST() {
  try {
    // Try to create a record with just one field
    const { data: record, error } = await supabase
      .from('mia_data')
      .insert({
        fac_name: 'Test Factory'
      })
      .select()
      .single()
    
    if (error) {
      throw error
    }
    
    return NextResponse.json({
      success: true,
      message: 'Record created successfully!',
      recordId: record.id
    })
  } catch (error) {
    console.error('Simple save error:', error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorType = error instanceof Error ? error.constructor.name : 'Unknown'
    return NextResponse.json({
      success: false,
      error: errorMessage,
      errorType: errorType,
      details: error instanceof Error ? error.toString() : String(error)
    }, { status: 500 })
  }
}
