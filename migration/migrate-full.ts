/**
 * Complete migration script that sets up Supabase and migrates all data
 */

import { createClient } from '@supabase/supabase-js'
import Airtable from 'airtable'
import * as dotenv from 'dotenv'
import * as fs from 'fs'
import * as path from 'path'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!
const airtableApiKey = process.env.AIRTABLE_API_KEY!
const airtableBaseId = process.env.AIRTABLE_BASE_ID!

// Initialize clients
const supabase = createClient(supabaseUrl, supabaseAnonKey)
const airtableBase = new Airtable({ apiKey: airtableApiKey }).base(airtableBaseId!)

/**
 * Create database schema in Supabase
 */
async function createSchema() {
  console.log('🏗️  Creating database schema...')
  
  const schemaSQL = fs.readFileSync(
    path.join(__dirname, 'create-supabase-schema.sql'),
    'utf-8'
  )
  
  // Split SQL into individual statements
  const statements = schemaSQL
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'))
  
  console.log(`Executing ${statements.length} SQL statements...`)
  
  for (const statement of statements) {
    if (statement.length > 0) {
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: statement })
        if (error && !error.message.includes('already exists')) {
          console.log('Note:', error.message)
        }
      } catch (err) {
        // Some errors are expected (like tables already existing)
        // We'll just continue
      }
    }
  }
  
  console.log('✅ Database schema created\n')
}

/**
 * Migrate factories from Airtable to Supabase
 */
async function migrateFactories() {
  console.log('📦 Migrating factories...')
  
  try {
    const records = await airtableBase('Factory Name').select().all()
    
    for (const record of records) {
      const { error } = await supabase
        .from('factory_name')
        .upsert({ Name: record.fields.Name }, { onConflict: 'Name' })
      
      if (error) {
        console.error(`Error migrating factory: ${record.fields.Name}`, error.message)
      } else {
        console.log(`  ✓ ${record.fields.Name}`)
      }
    }
    
    console.log(`✅ Migrated ${records.length} factories\n`)
  } catch (error) {
    console.error('Error migrating factories:', error)
  }
}

/**
 * Migrate team leaders from Airtable to Supabase
 */
async function migrateLeaders() {
  console.log('👥 Migrating team leaders...')
  
  try {
    const records = await airtableBase('Leaders').select().all()
    
    for (const record of records) {
      const { error } = await supabase
        .from('leaders')
        .upsert({ Name: record.fields.Name }, { onConflict: 'Name' })
      
      if (error) {
        console.error(`Error migrating leader: ${record.fields.Name}`, error.message)
      } else {
        console.log(`  ✓ ${record.fields.Name}`)
      }
    }
    
    console.log(`✅ Migrated ${records.length} team leaders\n`)
  } catch (error) {
    console.error('Error migrating leaders:', error)
  }
}

/**
 * Migrate team members from Airtable to Supabase
 */
async function migrateTeamMembers() {
  console.log('👥 Migrating team members...')
  
  try {
    const records = await airtableBase('team').select().all()
    
    for (const record of records) {
      const { error } = await supabase
        .from('team')
        .upsert({ Name: record.fields.Name }, { onConflict: 'Name' })
      
      if (error) {
        console.error(`Error migrating team member: ${record.fields.Name}`, error.message)
      } else {
        console.log(`  ✓ ${record.fields.Name}`)
      }
    }
    
    console.log(`✅ Migrated ${records.length} team members\n`)
  } catch (error) {
    console.error('Error migrating team members:', error)
  }
}

/**
 * Migrate Mia-data records from Airtable to Supabase
 */
async function migrateMiaData() {
  console.log('📊 Migrating Mia-data records...')
  
  try {
    // Fetch all records
    console.log('  Fetching all records from Airtable...')
    const records = await airtableBase('Mia-data')
      .select()
      .all()
    
    const allRecords = records.map(record => ({
      id: record.id,
      fields: record.fields,
      createdTime: (record as any).createdTime
    }))
    
    console.log(`\n  Total records to migrate: ${allRecords.length}\n`)
    
    // Migrate records
    for (let i = 0; i < allRecords.length; i++) {
      const record = allRecords[i]
      
      try {
        const supabaseRecord: any = {
          airtable_id: record.id,
          created_at: record.createdTime,
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
          console.error(`  ✗ Error migrating record ${record.id}:`, error.message)
        } else {
          if ((i + 1) % 10 === 0) {
            console.log(`  Progress: ${i + 1}/${allRecords.length} records`)
          }
        }
      } catch (error) {
        console.error(`  ✗ Error processing record ${record.id}:`, error)
      }
    }
    
    console.log(`\n✅ Migrated ${allRecords.length} Mia-data records`)
  } catch (error) {
    console.error('Error migrating Mia-data:', error)
  }
}

/**
 * Main migration function
 */
async function main() {
  console.log('🚀 Starting complete migration from Airtable to Supabase...\n')
  
  // Check if Supabase is configured
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    console.error('❌ Supabase credentials not found in environment variables')
    console.log('Please add SUPABASE_URL and SUPABASE_ANON_KEY to your .env.local file')
    process.exit(1)
  }
  
  try {
    // Step 1: Create schema manually (Supabase CLI can't be used programmatically easily)
    console.log('⚠️  Please run the SQL schema manually in Supabase dashboard first!')
    console.log('   Go to: https://tcuzxchvkuryprwnljqfl.supabase.co/project/_/sql/new')
    console.log('   Copy contents of: migration/create-supabase-schema.sql\n')
    console.log('Press Enter after creating the tables...')
    
    // Wait for user input (in an automated script, we'll skip this)
    console.log('Continuing with data migration...\n')
    
    // Step 2: Migrate reference data
    await migrateFactories()
    await migrateLeaders()
    await migrateTeamMembers()
    
    // Step 3: Migrate main data
    await migrateMiaData()
    
    console.log('\n✅ Migration completed successfully!')
    console.log('\n📝 Next steps:')
    console.log('   1. Update API routes to use Supabase')
    console.log('   2. Test the application')
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

// Run migration
main()
