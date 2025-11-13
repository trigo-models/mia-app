export async function GET() {
  try {
    // Test if environment variables are loaded
    const apiKey = process.env.AIRTABLE_API_KEY
    const baseId = process.env.AIRTABLE_BASE_ID
    
    return Response.json({
      success: true,
      message: "Environment variables loaded",
      apiKeyLength: apiKey?.length || 0,
      baseIdLength: baseId?.length || 0,
      apiKeyStart: apiKey?.substring(0, 10) || "Not found",
      baseIdStart: baseId?.substring(0, 10) || "Not found"
    })
  } catch (error) {
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
