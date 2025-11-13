import Airtable from 'airtable'

export async function GET() {
  try {
    // Test with your current credentials
    const base = new Airtable({
      apiKey: process.env.AIRTABLE_API_KEY!,
    }).base(process.env.AIRTABLE_BASE_ID!)

    // Try to get any table (this will fail if base ID is wrong)
    const records = await base('Table 1').select({ maxRecords: 1 }).all()
    
    return Response.json({
      success: true,
      message: "Base connection successful!",
      recordCount: records.length,
      sampleFields: Object.keys(records[0]?.fields || {}),
      sampleRecord: records[0]?.fields
    })
  } catch (error) {
    return Response.json({
      success: false,
      error: error.message,
      apiKey: process.env.AIRTABLE_API_KEY ? "Present" : "Missing",
      baseId: process.env.AIRTABLE_BASE_ID ? "Present" : "Missing"
    }, { status: 500 })
  }
}
