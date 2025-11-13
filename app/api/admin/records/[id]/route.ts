import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const recordId = params.id
    console.log(`Fetching record with ID: ${recordId}`)

    // Check if it's a UUID or Airtable ID
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(recordId)
    
    let query = supabase.from('mia_data').select('*')
    
    if (isUUID) {
      // If it's a UUID, search by id field
      query = query.eq('id', recordId)
    } else {
      // If it's an Airtable ID, search by airtable_id field
      query = query.eq('airtable_id', recordId)
    }
    
    const { data: record, error } = await query.single()
    
    if (error || !record) {
      throw error || new Error('Record not found')
    }
    
    console.log(`Record fetched successfully: ${record.id}`)

    // Create a fields object with all the data, mapping number to Number for compatibility
    const fields: any = {
      ...record,
      Number: record.number, // Map 'number' to 'Number' for compatibility
    }
    
    // Remove Supabase internal fields
    delete fields.airtable_id
    delete fields.id
    
    return NextResponse.json({
      success: true,
      record: {
        id: record.airtable_id || record.id,
        fields: fields,
        createdTime: record.created_at
      }
    })
  } catch (error: any) {
    console.error('Error fetching record:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to fetch record',
      errorType: error.constructor.name
    }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const recordId = params.id
    const body = await request.json()
    const { fields } = body

    console.log(`Updating record ${recordId} with fields:`, Object.keys(fields))

    // Check if it's a UUID or Airtable ID
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(recordId)
    
    let query = supabase.from('mia_data').update(fields)
    
    if (isUUID) {
      query = query.eq('id', recordId)
    } else {
      query = query.eq('airtable_id', recordId)
    }

    const { data: updatedRecord, error } = await query.select().single()

    if (error) {
      throw error
    }
    
    console.log(`Record updated successfully: ${updatedRecord.id}`)

    // Create a fields object with all the data, mapping number to Number for compatibility
    const updatedFields: any = {
      ...updatedRecord,
      Number: updatedRecord.number,
    }
    
    // Remove Supabase internal fields
    delete updatedFields.airtable_id
    delete updatedFields.id

    return NextResponse.json({
      success: true,
      record: {
        id: updatedRecord.airtable_id || updatedRecord.id,
        fields: updatedFields,
        createdTime: updatedRecord.created_at
      }
    })
  } catch (error: any) {
    console.error('Error updating record:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to update record',
      errorType: error.constructor.name
    }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const recordId = params.id
    console.log(`Deleting record with ID: ${recordId}`)

    // Check if it's a UUID or Airtable ID
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(recordId)
    
    let query = supabase.from('mia_data').delete()
    
    if (isUUID) {
      query = query.eq('id', recordId)
    } else {
      query = query.eq('airtable_id', recordId)
    }

    const { error } = await query
    
    if (error) {
      throw error
    }
    
    console.log(`Record deleted successfully: ${recordId}`)

    return NextResponse.json({
      success: true,
      message: 'Record deleted successfully'
    })
  } catch (error: any) {
    console.error('Error deleting record:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to delete record',
      errorType: error.constructor.name
    }, { status: 500 })
  }
}
