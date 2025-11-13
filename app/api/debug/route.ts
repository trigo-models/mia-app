import Airtable from 'airtable'

export async function GET() {
  try {
    const base = new Airtable({
      apiKey: process.env.AIRTABLE_API_KEY!,
    }).base(process.env.AIRTABLE_BASE_ID!)

    // Try to fetch from each table to see what exists
    const results = {}
    
    // Test Factory Name table
    try {
      const factoryRecords = await base('Factory Name').select({ maxRecords: 1 }).all()
      results['Factory Name'] = {
        exists: true,
        fields: Object.keys(factoryRecords[0]?.fields || {}),
        sampleRecord: factoryRecords[0]?.fields
      }
    } catch (error) {
      results['Factory Name'] = { exists: false, error: error.message }
    }

    // Test Leaders table
    try {
      const leaderRecords = await base('Leaders').select({ maxRecords: 1 }).all()
      results['Leaders'] = {
        exists: true,
        fields: Object.keys(leaderRecords[0]?.fields || {}),
        sampleRecord: leaderRecords[0]?.fields
      }
    } catch (error) {
      results['Leaders'] = { exists: false, error: error.message }
    }

    // Test team table
    try {
      const teamRecords = await base('team').select({ maxRecords: 1 }).all()
      results['team'] = {
        exists: true,
        fields: Object.keys(teamRecords[0]?.fields || {}),
        sampleRecord: teamRecords[0]?.fields
      }
    } catch (error) {
      results['team'] = { exists: false, error: error.message }
    }

    // Try some common table name variations
    const commonNames = ['Factories', 'Factory', 'מפעלים', 'Leaders', 'Team', 'Teams', 'Members', 'אנשי צוות']
    
    for (const name of commonNames) {
      try {
        const records = await base(name).select({ maxRecords: 1 }).all()
        results[name] = {
          exists: true,
          fields: Object.keys(records[0]?.fields || {}),
          sampleRecord: records[0]?.fields
        }
      } catch (error) {
        results[name] = { exists: false, error: error.message }
      }
    }
    
    return Response.json({
      success: true,
      results
    })
  } catch (error) {
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
