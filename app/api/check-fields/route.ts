import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    // Check if Supabase is configured
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
      return NextResponse.json({
        success: false,
        error: 'Supabase environment variables are not configured'
      }, { status: 500 })
    }

    // Try to test fields by checking the table structure
    const testFields = [
      'fac_name',
      'element', 
      'is_construction',
      'contruction_tons',
      'is_greetings',
      'greetings_dim',
      'is_handrail',
      'handrail_length',
      'r_comments'
    ]
    
    const results: Record<string, any> = {}
    
    // Get a sample record to check which fields exist
    const { data: sampleRecord, error: fetchError } = await supabase
      .from('mia_data')
      .select('*')
      .limit(1)
      .maybeSingle()
    
    if (fetchError) {
      return NextResponse.json({
        success: false,
        error: fetchError.message,
        errorType: 'SupabaseError'
      }, { status: 500 })
    }
    
    // Check which fields exist in the table
    const existingFields = sampleRecord ? Object.keys(sampleRecord) : []
    
    for (const fieldName of testFields) {
      results[fieldName] = {
        success: existingFields.includes(fieldName),
        exists: existingFields.includes(fieldName)
      }
    }
    
    return NextResponse.json({
      success: true,
      fieldTests: results,
      existingFields: existingFields
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      errorType: error instanceof Error ? error.constructor.name : 'Unknown'
    }, { status: 500 })
  }
}
