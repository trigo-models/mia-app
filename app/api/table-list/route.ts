import Airtable from 'airtable'

type TableResult = {
  exists: boolean
  recordCount?: number
  fields?: string[]
  sampleRecord?: any
  error?: string
}

export async function GET() {
  try {
    const base = new Airtable({
      apiKey: process.env.AIRTABLE_API_KEY!,
    }).base(process.env.AIRTABLE_BASE_ID!)

    // Try different common table names
    const tableNames = [
      'Table 1',
      'Table 2', 
      'Table 3',
      'Factories',
      'Factory Name',
      'Leaders',
      'team',
      'Team',
      'Members',
      'מפעלים',
      'ראשי צוות',
      'אנשי צוות'
    ]

    const results: Record<string, TableResult> = {}
    
    for (const tableName of tableNames) {
      try {
        const records = await base(tableName).select({ maxRecords: 1 }).all()
        results[tableName] = {
          exists: true,
          recordCount: records.length,
          fields: Object.keys(records[0]?.fields || {}),
          sampleRecord: records[0]?.fields
        }
      } catch (error) {
        results[tableName] = {
          exists: false,
          error: error instanceof Error ? error.message : String(error)
        }
      }
    }
    
    return Response.json({
      success: true,
      results,
      baseId: process.env.AIRTABLE_BASE_ID
    })
  } catch (error) {
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      errorType: error instanceof Error ? error.constructor.name : 'Unknown'
    }, { status: 500 })
  }
}
