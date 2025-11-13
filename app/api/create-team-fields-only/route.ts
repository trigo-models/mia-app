import { NextResponse } from 'next/server'
import Airtable from 'airtable'

const base = new Airtable({
  apiKey: process.env.AIRTABLE_API_KEY!,
}).base(process.env.AIRTABLE_BASE_ID!)

export async function POST() {
  try {
    // Create a record with just the team fields to create them
    const record = await base('Mia-data').create({
      'fac_name': 'Create Team Fields',
      'element': 'Test',
      'r_leaders': 'Test Leader',
      'r_team': 'Test Member'
    })
    
    return NextResponse.json({
      success: true,
      message: 'r_leaders and r_team fields created!',
      recordId: record.id,
      fields: Object.keys(record.fields)
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message,
      errorType: error.constructor.name
    }, { status: 500 })
  }
}
