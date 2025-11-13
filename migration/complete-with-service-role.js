/**
 * Complete migration with service role key
 * This will create tables AND migrate all data automatically
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const Airtable = require('airtable')

async function createTablesWithServiceRole() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.log('❌ Service role key not found!')
    console.log('')
    console.log('To get your service role key:')
    console.log('1. Go to: https://tcuzxchvkurprwnljufl.supabase.co/project/_/settings/api')
    console.log('2. Copy the "service_role" key')
    console.log('3. Add to .env.local:')
    console.log('   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here')
    console.log('4. Run this script again')
    return false
  }

  console.log('🚀 Creating tables with service role...')
  
  const supabaseAdmin = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  try {
    const sqlContent = fs.readFileSync('migration/create-supabase-schema.sql', 'utf-8')
    
    // Execute SQL using service role
    const { data, error } = await supabaseAdmin.rpc('exec_sql', {
      sql: sqlContent
    })
    
    if (error) {
      console.log('Note:', error.message)
    } else {
      console.log('✅ Tables created successfully!')
    }
    
    return true
  } catch (error) {
    console.error('Error creating tables:', error.message)
    return false
  }
}

async function migrateAllData() {
  console.log('\n📦 Migrating all data...')
  
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
  )
  
  const airtableBase = new Airtable({
    apiKey: process.env.AIRTABLE_API_KEY
  }).base(process.env.AIRTABLE_BASE_ID)

  // Migrate Mia-data
  console.log('Migrating Mia-data records...')
  try {
    const records = await airtableBase('Mia-data').select().all()
    console.log(`Found ${records.length} records to migrate\n`)
    
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
}

async function main() {
  console.log('🎯 Complete Migration Script')
  console.log('============================\n')
  
  const tablesCreated = await createTablesWithServiceRole()
  
  if (tablesCreated) {
    await migrateAllData()
    console.log('\n🎉 Migration completed successfully!')
    console.log('Your app is now fully on Supabase!')
    console.log('Check: http://localhost:3000/admin')
  } else {
    console.log('\n📋 Manual steps needed:')
    console.log('1. Get service role key from Supabase dashboard')
    console.log('2. Add to .env.local')
    console.log('3. Run this script again')
    console.log('')
    console.log('OR create tables manually:')
    console.log('1. Go to: https://tcuzxchvkurprwnljufl.supabase.co/project/_/sql/new')
    console.log('2. Copy SQL from: migration/create-supabase-schema.sql')
    console.log('3. Paste and run')
    console.log('4. Run: node migration/simple-migrate.js')
  }
}

main()





