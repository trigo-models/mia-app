import Airtable from 'airtable'

export async function GET() {
  try {
    const base = new Airtable({
      apiKey: process.env.AIRTABLE_API_KEY!,
    }).base(process.env.AIRTABLE_BASE_ID!)

    // Try to get the base info using a different approach
    const baseInfo = await base('Table 1').select({ maxRecords: 1 }).all()
    
    return Response.json({
      success: true,
      message: "Base connection successful!",
      recordCount: baseInfo.length,
      sampleFields: Object.keys(baseInfo[0]?.fields || {}),
      sampleRecord: baseInfo[0]?.fields,
      baseId: process.env.AIRTABLE_BASE_ID
    })
  } catch (error) {
    return Response.json({
      success: false,
      error: error.message,
      errorType: error.constructor.name,
      apiKey: process.env.AIRTABLE_API_KEY ? "Present" : "Missing",
      baseId: process.env.AIRTABLE_BASE_ID ? "Present" : "Missing"
    }, { status: 500 })
  }
}
