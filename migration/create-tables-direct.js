/**
 * Direct table creation using Supabase client
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

async function createTables() {
  console.log('Creating tables using Supabase JS client...\n')

  try {
    // Create mia_data table
    console.log('Creating mia_data table...')
    const { data: miaData, error: miaError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS mia_data (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
          fac_name TEXT,
          element TEXT,
          r_comments TEXT,
          r_leaders TEXT,
          r_team TEXT,
          r_owner TEXT,
          number TEXT,
          date_made DATE,
          start_time TIMESTAMP WITH TIME ZONE,
          end_time TIMESTAMP WITH TIME ZONE,
          is_construction BOOLEAN DEFAULT false,
          contruction_tons NUMERIC,
          is_greetings BOOLEAN DEFAULT false,
          greetings_dim TEXT,
          is_handrail BOOLEAN DEFAULT false,
          handrail_length TEXT,
          job_desc TEXT,
          disconnected_tons NUMERIC,
          is_steps BOOLEAN DEFAULT false,
          steps_qty TEXT,
          step_size TEXT,
          is_bolts BOOLEAN DEFAULT false,
          bolt_qty TEXT,
          bolt_type TEXT,
          is_distons BOOLEAN DEFAULT false,
          r_status TEXT,
          airtable_id TEXT UNIQUE,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        )
      `
    })
    
    if (miaError) {
      console.log('Note:', miaError.message)
    } else {
      console.log('✅ mia_data table created')
    }

    // Create factory_name table
    console.log('\nCreating factory_name table...')
    const { error: factoryError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS factory_name (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
          Name TEXT UNIQUE NOT NULL
        )
      `
    })
    
    if (factoryError) {
      console.log('Note:', factoryError.message)
    } else {
      console.log('✅ factory_name table created')
    }

    // Create leaders table
    console.log('\nCreating leaders table...')
    const { error: leadersError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS leaders (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
          Name TEXT UNIQUE NOT NULL
        )
      `
    })
    
    if (leadersError) {
      console.log('Note:', leadersError.message)
    } else {
      console.log('✅ leaders table created')
    }

    // Create team table
    console.log('\nCreating team table...')
    const { error: teamError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS team (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
          Name TEXT UNIQUE NOT NULL
        )
      `
    })
    
    if (teamError) {
      console.log('Note:', teamError.message)
    } else {
      console.log('✅ team table created')
    }

    console.log('\n✅ All tables created or already exist!')
    console.log('\nYou can now run the migration script.')
    
  } catch (error) {
    console.error('Error:', error.message)
    console.log('\n⚠️  Supabase JS client may not support SQL execution.')
    console.log('Please create tables manually via Supabase dashboard.')
    console.log('1. Go to: https://tcuzxchvkuryprwnljqfl.supabase.co/project/_/sql/new')
    console.log('2. Paste contents of: migration/create-supabase-schema.sql')
    console.log('3. Click Run')
  }
}

createTables()





