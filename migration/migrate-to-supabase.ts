/**
 * Migration script to move data from Airtable to Supabase
 * 
 * Run this script with: npx ts-node migration/migrate-to-supabase.ts
 */

import Airtable from 'airtable'
import { supabase } from '../lib/supabase'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const airtableBase = new Airtable({
  apiKey: process.env.AIRTABLE_API_KEY!,
}).base(process.env.AIRTABLE_BASE_ID!)

interface AirtableRecord {
  id: string
  fields: any
  createdTime: string
}

/**
 * Migrate factories from Airtable to Supabase
 */
async function migrateFactories() {
  console.log('📦 Migrating factories...')
  
  try {
    const records = await airtableBase('Factory Name').select().all()
    
    for (const record of records) {
      const { data, error } = await supabase
        .from('factory_name')
        .upsert({ Name: record.fields.Name }, { onConflict: 'Name' })
      
      if (error) {
        console.error(`Error migrating factory: ${record.fields.Name}`, error)
      } else {
        console.log(`✅ Migrated factory: ${record.fields.Name}`)
      }
    }
    
    console.log(`✅ Migrated ${records.length} factories`)
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
      const { data, error } = await supabase
        .from('leaders')
        .upsert({ Name: record.fields.Name }, { onConflict: 'Name' })
      
      if (error) {
        console.error(`Error migrating leader: ${record.fields.Name}`, error)
      } else {
        console.log(`✅ Migrated leader: ${record.fields.Name}`)
      }
    }
    
    console.log(`✅ Migrated ${records.length} team leaders`)
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
      const { data, error } = await supabase
        .from('team')
        .upsert({ Name: record.fields.Name }, { onConflict: 'Name' })
      
      if (error) {
        console.error(`Error migrating team member: ${record.fields.Name}`, error)
      } else {
        console.log(`✅ Migrated team member: ${record.fields.Name}`)
      }
    }
    
    console.log(`✅ Migrated ${records.length} team members`)
  } catch (error) {
    console.error('Error migrating team members:', error)
  }
}

/**
 * Migrate Mia-data records from Airtable to Supabase
 */
async function migrateMiaData() {
  console.log('📊 Migrating Mia-data records...')
  
  let batchSize = 100
  let offset = 0
  let allRecords: AirtableRecord[] = []
  
  try {
    // Fetch all records with pagination
    while (true) {
      const records = await airtableBase('Mia-data')
        .select()
        .pageSize(batchSize)
        .offset(offset)
        .all()
      
      if (records.length === 0) break
      
      allRecords = allRecords.concat(
        records.map(record => ({
          id: record.id,
          fields: record.fields,
          createdTime: record.createdTime
        }))
      )
      
      offset += records.length
      console.log(`Fetched ${allRecords.length} records so far...`)
    }
    
    console.log(`Total records to migrate: ${allRecords.length}`)
    
    // Migrate records in batches
    for (let i = 0; i < allRecords.length; i++) {
      const record = allRecords[i]
      
      try {
        // Convert Airtable fields to Supabase format
        const supabaseRecord = {
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
          console.error(`Error migrating record ${record.id}:`, error)
        } else {
          if ((i + 1) % 10 === 0) {
            console.log(`✅ Migrated ${i + 1}/${allRecords.length} records`)
          }
        }
      } catch (error) {
        console.error(`Error processing record ${record.id}:`, error)
      }
    }
    
    console.log(`✅ Migrated ${allRecords.length} Mia-data records`)
  } catch (error) {
    console.error('Error migrating Mia-data:', error)
  }
}

/**
 * Main migration function
 */
async function main() {
  console.log('🚀 Starting migration from Airtable to Supabase...\n')
  
  // Check if Supabase is configured
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    console.error('❌ Supabase credentials not found in environment variables')
    console.log('Please add SUPABASE_URL and SUPABASE_ANON_KEY to your .env.local file')
    process.exit(1)
  }
  
  try {
    // Migrate reference data first
    await migrateFactories()
    await migrateLeaders()
    await migrateTeamMembers()
    
    // Migrate main data
    await migrateMiaData()
    
    console.log('\n✅ Migration completed successfully!')
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

// Run migration
main()





