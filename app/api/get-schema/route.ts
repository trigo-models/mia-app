import { NextResponse } from 'next/server'
import Airtable from 'airtable'

const base = new Airtable({
  apiKey: process.env.AIRTABLE_API_KEY!,
}).base(process.env.AIRTABLE_BASE_ID!)

export async function GET() {
  try {
    // Try to get the table schema by creating a minimal record
    const testRecord = await base('Mia-data').create({})
    
    return NextResponse.json({
      success: true,
      message: 'Empty record created successfully!',
      recordId: testRecord.id,
      fields: Object.keys(testRecord.fields),
      allFields: testRecord.fields
    })
  } catch (error) {
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
