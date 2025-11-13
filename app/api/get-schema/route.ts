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
    return NextResponse.json({
      success: false,
      error: error.message,
      errorType: error.constructor.name,
      details: error.toString()
    }, { status: 500 })
  }
}
