import { supabase } from './supabase'

// Get the next serial number for a factory
export async function getNextSerialNumber(factoryName: string): Promise<string> {
  try {
    // Extract prefix from factory name (assuming format like "מפעל גיבוש - 62")
    // We'll look for the number at the end of the factory name
    const match = factoryName.match(/(\d+)$/)
    const prefix = match ? match[1] : '1' // Default to '1' if no number found
    
    // Get all existing records for this factory to find the highest number
    const { data: existingRecords, error } = await supabase
      .from('mia_data')
      .select('number')
      .eq('fac_name', factoryName)
    
    if (error) {
      console.error('Error fetching existing records:', error)
    }
    
    // Find the highest number for this factory
    let maxNumber = 0
    existingRecords?.forEach(record => {
      const number = record.number as string
      if (number && number.includes('.')) {
        const parts = number.split('.')
        if (parts.length === 2 && parts[0] === prefix) {
          const num = parseInt(parts[1])
          if (!isNaN(num) && num > maxNumber) {
            maxNumber = num
          }
        }
      }
    })
    
    // Return the next number
    return `${prefix}.${maxNumber + 1}`
    
  } catch (error) {
    console.error('Error getting next serial number:', error)
    // Fallback: return a timestamp-based number
    return `${Date.now()}.1`
  }
}
