/**
 * Create tables using Supabase Management API
 */

require('dotenv').config({ path: '.env.local' })
const fs = require('fs')

async function createTablesViaManagementAPI() {
  console.log('🚀 Creating tables via Supabase Management API...\n')
  
  const sqlContent = fs.readFileSync('migration/create-supabase-schema.sql', 'utf-8')
  
  // Split SQL into individual statements
  const statements = sqlContent
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'))
  
  console.log(`Found ${statements.length} SQL statements to execute\n`)
  
  // Use the Management API to execute SQL
  const projectId = 'tcuzxchvkurprwnljufl' // Extract from URL
  const accessToken = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i]
    if (statement.length > 0) {
      try {
        console.log(`Executing statement ${i + 1}/${statements.length}...`)
        
        // Use Supabase Management API
        const response = await fetch(`https://api.supabase.com/v1/projects/${projectId}/database/query`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify({
            query: statement
          })
        })
        
        if (response.ok) {
          console.log(`  ✅ Success`)
        } else {
          const errorText = await response.text()
          console.log(`  ⚠️  Response: ${response.status} - ${errorText}`)
        }
      } catch (error) {
        console.log(`  ⚠️  Error: ${error.message}`)
      }
    }
  }
  
  console.log('\n✅ Table creation completed!')
}

async function migrateDataAfterTables() {
  console.log('\n📦 Migrating data after table creation...')
  
  const { createClient } = require('@supabase/supabase-js')
  const Airtable = require('airtable')
  
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
  console.log('🎯 Final Migration Attempt')
  console.log('==========================\n')
  
  await createTablesViaManagementAPI()
  
  // Wait a moment for tables to be created
  console.log('\n⏳ Waiting for tables to be available...')
  await new Promise(resolve => setTimeout(resolve, 3000))
  
  await migrateDataAfterTables()
  
  console.log('\n🎉 Migration completed!')
  console.log('Check your app: http://localhost:3000/admin')
}

main()





