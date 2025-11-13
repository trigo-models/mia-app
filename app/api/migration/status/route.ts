import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import Airtable from 'airtable'

const airtableBase = new Airtable({
  apiKey: process.env.AIRTABLE_API_KEY!,
}).base(process.env.AIRTABLE_BASE_ID!)

export async function GET() {
  try {
    const stats = {
      airtable: {
        hasConfig: !!process.env.AIRTABLE_API_KEY && !!process.env.AIRTABLE_BASE_ID,
        tables: {} as Record<string, number>
      },
      supabase: {
        hasConfig: !!process.env.SUPABASE_URL && !!process.env.SUPABASE_ANON_KEY,
        tables: {} as Record<string, number>
      }
    }

    // Check Airtable tables if configured
    if (stats.airtable.hasConfig) {
      try {
        const records = await airtableBase('Mia-data').select().all()
        stats.airtable.tables['Mia-data'] = records.length
      } catch (error) {
        stats.airtable.tables['Mia-data'] = 0
      }
    }

    // Check Supabase tables if configured
    if (stats.supabase.hasConfig) {
      try {
        const { count } = await supabase
          .from('mia_data')
          .select('*', { count: 'exact', head: true })
        stats.supabase.tables['mia_data'] = count || 0
      } catch (error) {
        stats.supabase.tables['mia_data'] = 0
      }
    }

    return NextResponse.json({
      success: true,
      stats
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}





