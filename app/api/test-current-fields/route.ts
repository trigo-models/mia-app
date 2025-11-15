import { NextResponse } from 'next/server'
import Airtable from 'airtable'

export async function GET() {
  try {
    // Lazy initialization to avoid build-time errors
    if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID) {
      return NextResponse.json({
        success: false,
        error: 'Airtable environment variables are not configured'
      }, { status: 500 })
    }
    
    const base = new Airtable({
      apiKey: process.env.AIRTABLE_API_KEY,
    }).base(process.env.AIRTABLE_BASE_ID)
    
    // Get the current fields in the table
    const records = await base('Mia-data').select({ maxRecords: 1 }).all()
    
    return NextResponse.json({
      success: true,
      message: 'Current fields retrieved',
      fields: records[0] ? Object.keys(records[0].fields) : [],
      sampleRecord: records[0]?.fields
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      errorType: error instanceof Error ? error.constructor.name : 'Unknown'
    }, { status: 500 })
  }
}
