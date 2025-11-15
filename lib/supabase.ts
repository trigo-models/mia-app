import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_ANON_KEY

// Validate environment variables (log warning but don't throw during build)
if (!supabaseUrl || !supabaseKey) {
  const missing = []
  if (!supabaseUrl) missing.push('SUPABASE_URL')
  if (!supabaseKey) missing.push('SUPABASE_ANON_KEY')
  
  console.warn('⚠️ Missing Supabase environment variables:', missing.join(', '))
  console.warn('Please set these in your Vercel environment variables or .env.local file')
  // Don't throw during build - let individual API routes handle the error
}

// Create Supabase client (will use placeholders if env vars are missing)
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseKey || 'placeholder-key'
)

// Database interfaces matching your Airtable structure
export interface MiaDataRecord {
  id: string
  date_created?: string
  fac_name?: string
  element?: string
  r_comments?: string
  r_leaders?: string
  r_team?: string
  r_owner?: string
  Number?: string
  date_made?: string
  start_time?: string
  end_time?: string
  is_construction?: boolean
  contruction_tons?: number
  is_greetings?: boolean
  greetings_dim?: string
  is_handrail?: boolean
  handrail_length?: string
  job_desc?: string
  disconnected_tons?: number
  is_steps?: boolean
  steps_qty?: string
  step_size?: string
  is_bolts?: boolean
  bolt_qty?: string
  bolt_type?: string
  is_distons?: boolean
  r_status?: string
  [key: string]: any
}

// Helper functions to interact with Supabase
export async function getFactories(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('factory_name')
      .select('name')
      .order('name')
    
    if (error) throw error
    
    return data.map(record => record.name)
  } catch (error) {
    console.error('Error fetching factories:', error)
    return []
  }
}

export async function getTeamLeaders(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('leaders')
      .select('name')
      .order('name')
    
    if (error) throw error
    
    return data.map(record => record.name)
  } catch (error) {
    console.error('Error fetching team leaders:', error)
    return []
  }
}

export async function getTeamMembers(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('team')
      .select('name')
      .order('name')
    
    if (error) throw error
    
    return data.map(record => record.name)
  } catch (error) {
    console.error('Error fetching team members:', error)
    return []
  }
}

export async function getOwners(): Promise<string[]> {
  // Owners come from the Leaders table
  return getTeamLeaders()
}





