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
    
    // Test if Mia-data table exists and what fields it has
    const records = await base('Mia-data').select({ maxRecords: 1 }).all()
    
    return NextResponse.json({
      success: true,
      message: "Mia-data table found!",
      recordCount: records.length,
      fields: records[0] ? Object.keys(records[0].fields) : [],
      sampleRecord: records[0]?.fields
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorType = error instanceof Error ? error.constructor.name : 'Unknown'
    return NextResponse.json({
      success: false,
      error: errorMessage,
      errorType: errorType,
      tableName: 'Mia-data'
    }, { status: 500 })
  }
}
