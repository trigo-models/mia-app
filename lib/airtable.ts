import Airtable from 'airtable'

// Initialize Airtable
const base = new Airtable({
  apiKey: process.env.AIRTABLE_API_KEY!,
}).base(process.env.AIRTABLE_BASE_ID!)

export interface AirtableRecord {
  id: string
  fields: {
    Name: string
    [key: string]: any
  }
}

// Fetch factories
export async function getFactories(): Promise<string[]> {
  try {
    const records = await base(process.env.AIRTABLE_FACTORIES_TABLE!)
      .select({
        fields: ['Name']
      })
      .all()
    
    return records.map(record => record.fields.Name as string)
  } catch (error) {
    console.error('Error fetching factories:', error)
    return ['מפעל א', 'מפעל ב', 'מפעל ג'] // Fallback data
  }
}

// Fetch team leaders
export async function getTeamLeaders(): Promise<string[]> {
  try {
    const records = await base(process.env.AIRTABLE_TEAM_LEADERS_TABLE!)
      .select({
        fields: ['Name']
      })
      .all()
    
    return records.map(record => record.fields.Name as string)
  } catch (error) {
    console.error('Error fetching team leaders:', error)
    return ['יוסי כהן', 'שרה לוי', 'דוד ישראלי'] // Fallback data
  }
}

// Fetch team members
export async function getTeamMembers(): Promise<string[]> {
  try {
    const records = await base(process.env.AIRTABLE_TEAM_MEMBERS_TABLE!)
      .select({
        fields: ['Name']
      })
      .all()
    
    return records.map(record => record.fields.Name as string)
  } catch (error) {
    console.error('Error fetching team members:', error)
    return ['אמיר כהן', 'ליאור לוי', 'דני ישראלי'] // Fallback data
  }
}

// Fetch owners from Leaders table
export async function getOwners(): Promise<string[]> {
  try {
    const records = await base('Leaders')
      .select({
        fields: ['Name']
      })
      .all()
    
    return records.map(record => record.fields.Name as string)
  } catch (error) {
    console.error('Error fetching owners:', error)
    return ['יוסי כהן', 'שרה לוי', 'דוד ישראלי', 'מיכאל אברהם', 'רחל גולדברג'] // Fallback data
  }
}