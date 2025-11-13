import { NextResponse } from 'next/server'
import Airtable from 'airtable'

const base = new Airtable({
  apiKey: process.env.AIRTABLE_API_KEY!,
}).base(process.env.AIRTABLE_BASE_ID!)

export async function POST() {
  try {
    // Create a record with all the fields we need
    // This will automatically create the fields in Airtable
    const record = await base('Mia-data').create({
      'fac_name': 'Test Factory',
      'element': 'Test Element',
      'is_construction': false,
      'contruction_tons': 0,
      'is_greetings': false,
      'greetings_dim': 0,
      'is_handrail': false,
      'handrail_length': 0,
      'r_comments': 'Test comment'
    })
    
    return NextResponse.json({
      success: true,
      message: 'Fields created successfully!',
      recordId: (record as any).id,
      fields: Object.keys((record as any).fields)
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: (error as any).message,
      errorType: (error as any).constructor.name,
      details: (error as any).toString()
    }, { status: 500 })
  }
}
