import { NextResponse } from 'next/server'
import Airtable from 'airtable'

const base = new Airtable({
  apiKey: process.env.AIRTABLE_API_KEY!,
}).base(process.env.AIRTABLE_BASE_ID!)

export async function GET() {
  try {
    // Try to create a simple test record to see what fields are available
    const testRecord = {
      fields: {
        'fac_name': 'Test Factory',
        'element': 'Test Element'
      }
    }
    
    const record = await base('Mia-data').create(testRecord)
    
    return NextResponse.json({
      success: true,
      message: "Test record created successfully!",
      recordId: record.id,
      fields: Object.keys(record.fields),
      recordData: record.fields
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message,
      errorType: error.constructor.name,
      details: error.toString()
    }, { status: 500 })
  }
}
