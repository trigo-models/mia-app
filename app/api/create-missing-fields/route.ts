import { NextResponse } from 'next/server'
import Airtable from 'airtable'

const base = new Airtable({
  apiKey: process.env.AIRTABLE_API_KEY!,
}).base(process.env.AIRTABLE_BASE_ID!)

export async function POST() {
  try {
    // Create a record with the missing fields
    // This will automatically create the fields in Airtable
    const record = await base('Mia-data').create({
      'fac_name': 'Test with missing fields',
      'element': 'Test Element',
      'Attachments': [], // This will create an Attachments field
      'r_leaders': [], // This will create a linked record field to Leaders
      'r_team': [], // This will create a linked record field to team
      'r_comments': 'Test with all fields'
    })
    
    return NextResponse.json({
      success: true,
      message: 'Missing fields created successfully!',
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
