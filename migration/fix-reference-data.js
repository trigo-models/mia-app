/**
 * Fix reference data migration - add missing factories, leaders, team
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')
const Airtable = require('airtable')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

const airtableBase = new Airtable({
  apiKey: process.env.AIRTABLE_API_KEY
}).base(process.env.AIRTABLE_BASE_ID)

async function migrateReferenceData() {
  console.log('🚀 Fixing reference data in Supabase...\n')
  
  // Migrate factories
  console.log('📦 Migrating factories...')
  try {
    const records = await airtableBase('Factory Name').select().all()
    console.log(`Found ${records.length} factories in Airtable`)
    
    for (const record of records) {
      // Try both Name and name
      const { data, error } = await supabase
        .from('factory_name')
        .upsert({ name: record.fields.Name }, { onConflict: 'name' })
      
      if (error) {
        console.error(`  ✗ Error: ${error.message}`)
      } else {
        console.log(`  ✓ ${record.fields.Name}`)
      }
    }
    console.log(`✅ Migrated ${records.length} factories\n`)
    
    // Verify
    const { data: verify } = await supabase.from('factory_name').select('*')
    console.log(`Verified: ${verify?.length || 0} factories in Supabase\n`)
  } catch (error) {
    console.error('Error migrating factories:', error)
  }

  // Migrate leaders
  console.log('👥 Migrating team leaders...')
  try {
    const records = await airtableBase('Leaders').select().all()
    for (const record of records) {
      await supabase
        .from('leaders')
        .upsert({ name: record.fields.Name }, { onConflict: 'name' })
      console.log(`  ✓ ${record.fields.Name}`)
    }
    console.log(`✅ Migrated ${records.length} leaders\n`)
  } catch (error) {
    console.error('Error migrating leaders:', error)
  }

  // Migrate team
  console.log('👥 Migrating team members...')
  try {
    const records = await airtableBase('team').select().all()
    for (const record of records) {
      await supabase
        .from('team')
        .upsert({ name: record.fields.Name }, { onConflict: 'name' })
      console.log(`  ✓ ${record.fields.Name}`)
    }
    console.log(`✅ Migrated ${records.length} team members\n`)
  } catch (error) {
    console.error('Error migrating team:', error)
  }

  console.log('✅ Reference data migration completed!')
}

migrateReferenceData()
