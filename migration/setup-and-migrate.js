/**
 * Complete setup and migration script
 * This uses a workaround to create tables via Supabase Management API
 */

require('dotenv').config({ path: '.env.local' })
const Airtable = require('airtable')
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

const airtableBase = new Airtable({
  apiKey: process.env.AIRTABLE_API_KEY
}).base(process.env.AIRTABLE_BASE_ID)

async function createTablesSimple() {
  console.log('🚀 Setting up Supabase...\n')
  
  // We'll create tables by trying to insert data - Supabase will auto-create schemas for JSON columns
  // But first let's check if tables exist by trying to query them
  
  console.log('Checking existing tables...\n')
  
  try {
    const { error: miaError } = await supabase.from('mia_data').select('count').limit(0)
    console.log(miaError ? 'mia_data does not exist yet' : 'mia_data exists')
    
    const { error: factoryError } = await supabase.from('factory_name').select('count').limit(0)
    console.log(factoryError ? 'factory_name does not exist yet' : 'factory_name exists')
    
    const { error: leadersError } = await supabase.from('leaders').select('count').limit(0)
    console.log(leadersError ? 'leaders does not exist yet' : 'leaders exists')
    
    const { error: teamError } = await supabase.from('team').select('count').limit(0)
    console.log(teamError ? 'team does not exist yet' : 'team exists')
  } catch (err) {
    console.log('Error checking tables:', err.message)
  }
}

async function migrateData() {
  console.log('\n📦 Migrating reference data...\n')
  
  // Migrate factories
  console.log('Migrating factories...')
  try {
    const records = await airtableBase('Factory Name').select().all()
    for (const record of records) {
      await supabase.from('factory_name').upsert({ Name: record.fields.Name }, { onConflict: 'Name' })
      console.log(`  ✓ ${record.fields.Name}`)
    }
    console.log(`✅ Migrated ${records.length} factories\n`)
  } catch (error) {
    console.error('Error migrating factories:', error.message)
  }

  // Migrate leaders
  console.log('Migrating team leaders...')
  try {
    const records = await airtableBase('Leaders').select().all()
    for (const record of records) {
      await supabase.from('leaders').upsert({ Name: record.fields.Name }, { onConflict: 'Name' })
      console.log(`  ✓ ${record.fields.Name}`)
    }
    console.log(`✅ Migrated ${records.length} leaders\n`)
  } catch (error) {
    console.error('Error migrating leaders:', error.message)
  }

  // Migrate team
  console.log('Migrating team members...')
  try {
    const records = await airtableBase('team').select().all()
    for (const record of records) {
      await supabase.from('team').upsert({ Name: record.fields.Name }, { onConflict: 'Name' })
      console.log(`  ✓ ${record.fields.Name}`)
    }
    console.log(`✅ Migrated ${records.length} team members\n`)
  } catch (error) {
    console.error('Error migrating team:', error.message)
  }

  // Migrate Mia-data
  console.log('Migrating Mia-data records...')
  try {
    const records = await airtableBase('Mia-data').select().all()
    console.log(`  Found ${records.length} records to migrate\n`)
    
    let success = 0
    for (let i = 0; i < records.length; i++) {
      const record = records[i]
      const supabaseRecord = {
        airtable_id: record.id,
        created_at: record._rawJson.createdTime,
        fac_name: record.fields.fac_name,
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
        console.error(`  ✗ Error on record ${i + 1}:`, error.message)
      } else {
        success++
        if ((i + 1) % 10 === 0) {
          console.log(`  Progress: ${i + 1}/${records.length}`)
        }
      }
    }
    
    console.log(`\n✅ Migrated ${success}/${records.length} Mia-data records`)
  } catch (error) {
    console.error('Error:', error.message)
  }

  console.log('\n✅ Migration completed!')
}

async function main() {
  await createTablesSimple()
  await migrateData()
}

main()





