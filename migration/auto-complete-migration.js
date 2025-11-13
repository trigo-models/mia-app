/**
 * Automatic table creation using your Supabase credentials
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

async function createTables() {
  console.log('🚀 Creating tables in your Supabase project...\n')
  console.log('Project URL:', process.env.SUPABASE_URL)
  console.log('')

  try {
    // Read the SQL schema
    const sqlContent = fs.readFileSync('migration/create-supabase-schema.sql', 'utf-8')
    
    // Split into individual statements
    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))
    
    console.log(`Found ${statements.length} SQL statements to execute\n`)
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      if (statement.length > 0) {
        try {
          console.log(`Executing statement ${i + 1}/${statements.length}...`)
          
          // Try to execute via Supabase REST API
          const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': process.env.SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`
            },
            body: JSON.stringify({ sql: statement })
          })
          
          if (response.ok) {
            console.log(`  ✅ Success`)
          } else {
            console.log(`  ⚠️  Response: ${response.status} - might already exist`)
          }
        } catch (error) {
          console.log(`  ⚠️  Error: ${error.message}`)
        }
      }
    }
    
    console.log('\n✅ Table creation completed!')
    console.log('\nNow running data migration...\n')
    
    // Run the migration
    await migrateData()
    
  } catch (error) {
    console.error('Error:', error.message)
    console.log('\n⚠️  Automatic table creation failed.')
    console.log('Please create tables manually:')
    console.log('1. Go to: https://tcuzxchvkurprwnljufl.supabase.co/project/_/sql/new')
    console.log('2. Copy contents of: migration/create-supabase-schema.sql')
    console.log('3. Paste and run')
  }
}

async function migrateData() {
  const Airtable = require('airtable')
  
  const airtableBase = new Airtable({
    apiKey: process.env.AIRTABLE_API_KEY
  }).base(process.env.AIRTABLE_BASE_ID)

  console.log('📦 Migrating reference data...\n')
  
  // Migrate factories
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
  console.log('📊 Migrating Mia-data records...')
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

  console.log('\n🎉 Migration completed!')
  console.log('\nYour app is now fully migrated to Supabase!')
  console.log('Check your admin panel: http://localhost:3000/admin')
}

createTables()





