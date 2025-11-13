import { NextResponse } from 'next/server'
import Airtable from 'airtable'

const base = new Airtable({
  apiKey: process.env.AIRTABLE_API_KEY!,
}).base(process.env.AIRTABLE_BASE_ID!)

export async function POST() {
  try {
    // Create a record with text fields for team data
    const record = await base('Mia-data').create({
      'fac_name': 'Test with text fields',
      'element': 'Test Element',
      'leaders_text': 'יוסי כהן, שרה לוי', // Text field for team leaders
      'team_text': 'אמיר כהן, ליאור לוי', // Text field for team members
      'r_comments': 'Test with team text fields'
    })
    
    return NextResponse.json({
      success: true,
      message: 'Text fields created successfully!',
      recordId: record.id,
      fields: Object.keys(record.fields)
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
