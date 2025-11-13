import { NextResponse } from 'next/server'
import Airtable from 'airtable'

const base = new Airtable({
  apiKey: process.env.AIRTABLE_API_KEY!,
}).base(process.env.AIRTABLE_BASE_ID!)

export async function GET() {
  try {
    // Try to create a record with just one field to see what works
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
    
    for (const fieldName of testFields) {
      try {
        const record = await base('Mia-data').create({
          [fieldName]: 'test'
        })
        results[fieldName] = { success: true, recordId: (record as any).id }
        // Delete the test record
        await base('Mia-data').destroy((record as any).id)
      } catch (error) {
        results[fieldName] = { 
          success: false, 
          error: (error as any).message,
          errorType: (error as any).constructor.name
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      fieldTests: results
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: (error as any).message,
      errorType: (error as any).constructor.name
    }, { status: 500 })
  }
}
