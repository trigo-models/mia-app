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
    return NextResponse.json({
      success: false,
      error: error.message,
      errorType: error.constructor.name,
      details: error.toString()
    }, { status: 500 })
  }
}
