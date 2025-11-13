import { NextResponse } from 'next/server'
import Airtable from 'airtable'

const base = new Airtable({
  apiKey: process.env.AIRTABLE_API_KEY!,
}).base(process.env.AIRTABLE_BASE_ID!)

export async function POST() {
  try {
    // Create a record with the team fields
    const record = await base('Mia-data').create({
      'fac_name': 'Test with team fields',
      'element': 'Test Element',
      'r_leaders': 'יוסי כהן, שרה לוי', // This will create r_leaders field
      'r_team': 'אמיר כהן, ליאור לוי', // This will create r_team field
      'r_comments': 'Test with team fields'
    })
    
    return NextResponse.json({
      success: true,
      message: 'Team fields created successfully!',
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
