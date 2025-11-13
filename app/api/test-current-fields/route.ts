import { NextResponse } from 'next/server'
import Airtable from 'airtable'

const base = new Airtable({
  apiKey: process.env.AIRTABLE_API_KEY!,
}).base(process.env.AIRTABLE_BASE_ID!)

export async function GET() {
  try {
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
      error: error.message,
      errorType: error.constructor.name
    }, { status: 500 })
  }
}
