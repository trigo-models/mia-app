import { NextResponse } from 'next/server'
import Airtable from 'airtable'
import { supabase } from '@/lib/supabase'

export async function GET() {
  // Lazy initialization to avoid build-time errors
  if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID) {
    return NextResponse.json({
      success: false,
      error: 'Airtable environment variables are not configured'
    }, { status: 500 })
  }
  
  const airtableBase = new Airtable({
    apiKey: process.env.AIRTABLE_API_KEY,
  }).base(process.env.AIRTABLE_BASE_ID)
  const results = {
    factories: { count: 0, success: false, errors: [] as string[] },
    leaders: { count: 0, success: false, errors: [] as string[] },
    team: { count: 0, success: false, errors: [] as string[] },
    mia_data: { count: 0, success: false, errors: [] as string[] }
  }

  // Migrate factories
  try {
    const records = await airtableBase('Factory Name').select().all()
    results.factories.count = records.length
    
    for (const record of records) {
      await supabase
        .from('factory_name')
        .upsert({ Name: record.fields.Name }, { onConflict: 'Name' })
    }
    results.factories.success = true
  } catch (error: any) {
    results.factories.errors.push(error instanceof Error ? error.message : String(error))
  }

  // Migrate leaders
  try {
    const records = await airtableBase('Leaders').select().all()
    results.leaders.count = records.length
    
    for (const record of records) {
      await supabase
        .from('leaders')
        .upsert({ Name: record.fields.Name }, { onConflict: 'Name' })
    }
    results.leaders.success = true
  } catch (error: any) {
    results.leaders.errors.push(error instanceof Error ? error.message : String(error))
  }

  // Migrate team
  try {
    const records = await airtableBase('team').select().all()
    results.team.count = records.length
    
    for (const record of records) {
      await supabase
        .from('team')
        .upsert({ Name: record.fields.Name }, { onConflict: 'Name' })
    }
    results.team.success = true
  } catch (error: any) {
    results.team.errors.push(error instanceof Error ? error.message : String(error))
  }

  // Migrate Mia-data
  try {
    const records = await airtableBase('Mia-data').select().all()
    results.mia_data.count = records.length
    
    for (const record of records) {
      const supabaseRecord: any = {
        airtable_id: record.id,
        created_at: (record as any).createdTime,
        fac_name: (record.fields as any).fac_name,
        element: record.fields.element,
        r_comments: record.fields.r_comments,
        r_leaders: record.fields.r_leaders,
        r_team: record.fields.r_team,
        r_owner: record.fields.r_owner,
        number: record.fields.Number,
        date_made: record.fields.date_made,
        start_time: record.fields.start_time,
        end_time: record.fields.end_time,
        is_construction: record.fields.is_construction || false,
        contruction_tons: record.fields.contruction_tons,
        is_greetings: record.fields.is_greetings || false,
        greetings_dim: record.fields.greetings_dim,
        is_handrail: record.fields.is_handrail || false,
        handrail_length: record.fields.handrail_length,
        job_desc: record.fields.job_desc,
        disconnected_tons: record.fields.disconnected_tons,
        is_steps: record.fields.is_steps || false,
        steps_qty: record.fields.steps_qty,
        step_size: record.fields.step_size,
        is_bolts: record.fields.is_bolts || false,
        bolt_qty: record.fields.bolt_qty,
        bolt_type: record.fields.bolt_type,
        is_distons: record.fields.is_distons || false,
        r_status: record.fields.r_status,
      }
      
      const { error } = await supabase
        .from('mia_data')
        .upsert(supabaseRecord, { onConflict: 'airtable_id' })
      
      if (error) {
        results.mia_data.errors.push(error.message)
      }
    }
    results.mia_data.success = results.mia_data.errors.length === 0
  } catch (error: any) {
    results.mia_data.errors.push(error instanceof Error ? error.message : String(error))
  }

  return NextResponse.json({
    success: true,
    results,
    message: 'Migration completed. Check results for any errors.'
  })
}






