import { NextResponse } from 'next/server'
import Airtable from 'airtable'

const base = new Airtable({
  apiKey: process.env.AIRTABLE_API_KEY!,
}).base(process.env.AIRTABLE_BASE_ID!)

export async function POST() {
  try {
    // Create a record with r_leaders and r_team fields
    const record = await base('Mia-data').create({
      'fac_name': 'Test Leaders Team Fields',
      'element': 'Test Element',
      'r_leaders': 'יוסי כהן, שרה לוי',
      'r_team': 'אמיר כהן, ליאור לוי',
      'r_comments': 'Test with proper team fields'
    })
    
    return NextResponse.json({
      success: true,
      message: 'r_leaders and r_team fields created successfully!',
      recordId: record.id,
      fields: Object.keys(record.fields)
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: (error as any).message,
      errorType: (error as any).constructor.name,
      details: (error as any).toString()
    }, { status: 500 })
  }
}
