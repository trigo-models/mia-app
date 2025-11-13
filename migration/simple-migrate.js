/**
 * Simple migration script using JavaScript instead of TypeScript
 */

require('dotenv').config({ path: '.env.local' })
const Airtable = require('airtable')
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

const airtableBase = new Airtable({
  apiKey: process.env.AIRTABLE_API_KEY
}).base(process.env.AIRTABLE_BASE_ID)

async function migrateData() {
  console.log('🚀 Starting migration...\n')

  // Migrate factories
  console.log('📦 Migrating factories...')
  try {
    const factories = await airtableBase('Factory Name').select().all()
    for (const record of factories) {
      const { error } = await supabase
        .from('factory_name')
        .upsert({ Name: record.fields.Name }, { onConflict: 'Name' })
      if (!error) console.log(`  ✓ ${record.fields.Name}`)
    }
    console.log(`✅ Migrated ${factories.length} factories\n`)
  } catch (error) {
    console.error('Error:', error.message)
  }

  // Migrate leaders
  console.log('👥 Migrating team leaders...')
  try {
    const leaders = await airtableBase('Leaders').select().all()
    for (const record of leaders) {
      const { error } = await supabase
        .from('leaders')
        .upsert({ Name: record.fields.Name }, { onConflict: 'Name' })
      if (!error) console.log(`  ✓ ${record.fields.Name}`)
    }
    console.log(`✅ Migrated ${leaders.length} leaders\n`)
  } catch (error) {
    console.error('Error:', error.message)
  }

  // Migrate team
  console.log('👥 Migrating team members...')
  try {
    const team = await airtableBase('team').select().all()
    for (const record of team) {
      const { error } = await supabase
        .from('team')
        .upsert({ Name: record.fields.Name }, { onConflict: 'Name' })
      if (!error) console.log(`  ✓ ${record.fields.Name}`)
    }
    console.log(`✅ Migrated ${team.length} team members\n`)
  } catch (error) {
    console.error('Error:', error.message)
  }

  // Migrate Mia-data
  console.log('📊 Migrating Mia-data records...')
  try {
    const records = await airtableBase('Mia-data').select().all()
    console.log(`  Found ${records.length} records to migrate\n`)
    
    let successCount = 0
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
        successCount++
        if ((i + 1) % 10 === 0) {
          console.log(`  Progress: ${i + 1}/${records.length}`)
        }
      }
    }
    
    console.log(`\n✅ Migrated ${successCount}/${records.length} Mia-data records`)
  } catch (error) {
    console.error('Error:', error.message)
  }

  console.log('\n✅ Migration completed!')
}

migrateData()





