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
    return NextResponse.json({
      success: false,
      error: error.message,
      errorType: error.constructor.name,
      details: error.toString()
    }, { status: 500 })
  }
}
