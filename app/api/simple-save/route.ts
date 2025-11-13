import { NextResponse } from 'next/server'
import Airtable from 'airtable'

const base = new Airtable({
  apiKey: process.env.AIRTABLE_API_KEY!,
}).base(process.env.AIRTABLE_BASE_ID!)

export async function POST() {
  try {
    // Try to create a record with just one field
    const record = await base('Mia-data').create({
      fields: {
        'fac_name': 'Test Factory'
      }
    })
    
    return NextResponse.json({
      success: true,
      message: 'Record created successfully!',
      recordId: record.id
    })
  } catch (error) {
    console.error('Simple save error:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      errorType: error.constructor.name,
      details: error.toString()
    }, { status: 500 })
  }
}
