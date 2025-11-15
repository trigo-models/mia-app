import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getNextSerialNumber } from '@/lib/serial-number'

// Helper function to add fields
function addFieldSafely(fields: any, key: string, value: any) {
  fields[key] = value
}

export async function POST(request: NextRequest) {
  let formData: any = null
  let fields: any = null
  
  try {
    formData = await request.json()
    console.log('Received form data:', formData)
    
    // Get project information if projectId is provided
    let projectNumber = null
    let formNumber = null
    
    if (formData.projectId) {
      const { data: project } = await supabase
        .from('projects')
        .select('project_number')
        .eq('id', formData.projectId)
        .single()
      
      if (project?.project_number) {
        projectNumber = project.project_number
        
        // Get the last form number for this project
        const { data: lastForm } = await supabase
          .from('mia_data')
          .select('form_number')
          .eq('project_id', formData.projectId)
          .not('form_number', 'is', null)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()
        
        // Generate form number
        if (lastForm?.form_number) {
          const lastFormNum = lastForm.form_number.split('.')
          const formSequence = parseInt(lastFormNum[lastFormNum.length - 1]) + 1
          formNumber = `${projectNumber}.${formSequence}`
        } else {
          formNumber = `${projectNumber}.1`
        }
      }
    }
    
    // Get the next serial number for this factory (fallback)
    const serialNumber = formNumber || await getNextSerialNumber(formData.factoryName)
    
    // Map form data to Supabase fields - start with core fields
    fields = {
      'fac_name': formData.factoryName,
      'element': formData.element,
      'r_comments': formData.notes || '',
      'r_leaders': formData.teamLeaders.join(', '),
      'r_team': formData.teamMembers.join(', '),
      'r_owner': formData.owner,
      'Number': serialNumber
    }
    
    // Add date/time fields using safe function
    if (formData.dateMade) {
      addFieldSafely(fields, 'date_made', formData.dateMade)
    }
    if (formData.startTime) {
      // Convert time to ISO format with timezone adjustment
      // Subtract 3 hours to compensate for timezone conversion
      const [hours, minutes] = formData.startTime.split(':')
      const adjustedHours = (parseInt(hours) - 3 + 24) % 24
      const adjustedTime = `${adjustedHours.toString().padStart(2, '0')}:${minutes}`
      const startDateTime = `${formData.dateMade}T${adjustedTime}:00.000Z`
      addFieldSafely(fields, 'start_time', startDateTime)
    }
    if (formData.endTime) {
      // Convert time to ISO format with timezone adjustment
      // Subtract 3 hours to compensate for timezone conversion
      const [hours, minutes] = formData.endTime.split(':')
      const adjustedHours = (parseInt(hours) - 3 + 24) % 24
      const adjustedTime = `${adjustedHours.toString().padStart(2, '0')}:${minutes}`
      const endDateTime = `${formData.dateMade}T${adjustedTime}:00.000Z`
      addFieldSafely(fields, 'end_time', endDateTime)
    }
    
    // Add conditional fields only if they have values
    if (formData.hasConstruction) {
      addFieldSafely(fields, 'is_construction', true)
      if (formData.constructionTons) {
        addFieldSafely(fields, 'contruction_tons', parseFloat(formData.constructionTons))
      }
      if (formData.constructionType) {
        addFieldSafely(fields, 'construction_type', formData.constructionType)
      }
      if (formData.constructionDescription) {
        addFieldSafely(fields, 'construction_description', formData.constructionDescription)
      }
      if (formData.constructionImage) {
        addFieldSafely(fields, 'construction_image', formData.constructionImage)
      }
    }
    
    if (formData.hasFences) {
      addFieldSafely(fields, 'is_greetings', true)
      if (formData.fenceArea) {
        addFieldSafely(fields, 'greetings_dim', parseFloat(formData.fenceArea))
      }
    }
    
    if (formData.hasRailings) {
      addFieldSafely(fields, 'is_handrail', true)
      if (formData.railingLength) {
        addFieldSafely(fields, 'handrail_length', parseFloat(formData.railingLength))
      }
    }
    
        // Add new fields - these will be included if they exist in the database
        if (formData.hasSteps !== undefined) {
          addFieldSafely(fields, 'is_steps', formData.hasSteps)
          if (formData.hasSteps && formData.stepQty) {
            addFieldSafely(fields, 'steps_qty', formData.stepQty)
          }
          if (formData.hasSteps && formData.stepSize) {
            addFieldSafely(fields, 'step_size', formData.stepSize)
          }
        }
        
        if (formData.hasBolts !== undefined) {
          addFieldSafely(fields, 'is_bolts', formData.hasBolts)
          if (formData.hasBolts && formData.boltQty) {
            addFieldSafely(fields, 'bolt_qty', formData.boltQty)
          }
          if (formData.hasBolts && formData.boltType) {
            addFieldSafely(fields, 'bolt_type', formData.boltType)
          }
        }
        
        // Add job description field
        if (formData.jobDesc) {
          addFieldSafely(fields, 'job_desc', formData.jobDesc)
        }
        
        // Add disconnections fields
        if (formData.hasDisconnections !== undefined) {
          addFieldSafely(fields, 'is_distons', formData.hasDisconnections)
          if (formData.hasDisconnections && formData.disconnectedTons) {
            addFieldSafely(fields, 'disconnected_tons', parseFloat(formData.disconnectedTons))
          }
        }

    // Remove undefined values
    Object.keys(fields).forEach(key => {
      if (fields[key] === undefined) {
        delete fields[key]
      }
    })

    console.log('Prepared fields:', fields)

    // Create the record in Supabase - only include fields that exist in the table
    const supabaseRecord: any = {
      fac_name: fields.fac_name,
      element: fields.element,
      r_comments: fields.r_comments || '',
      r_leaders: fields.r_leaders,
      r_team: fields.r_team,
      r_owner: fields.r_owner,
      number: fields.Number,
      date_made: fields.date_made,
      start_time: fields.start_time,
      end_time: fields.end_time,
      is_construction: fields.is_construction || false,
      contruction_tons: fields.contruction_tons,
      is_greetings: fields.is_greetings || false,
      greetings_dim: fields.greetings_dim,
      is_handrail: fields.is_handrail || false,
      handrail_length: fields.handrail_length,
      job_desc: fields.job_desc,
      disconnected_tons: fields.disconnected_tons,
      is_steps: fields.is_steps || false,
      steps_qty: fields.steps_qty,
      step_size: fields.step_size,
      is_bolts: fields.is_bolts || false,
      bolt_qty: fields.bolt_qty,
      bolt_type: fields.bolt_type,
      is_distons: fields.is_distons || false,
    }
    
    // Add optional fields only if they exist and have values
    if (formData.projectId) {
      supabaseRecord.project_id = formData.projectId
    }
    if (formNumber) {
      supabaseRecord.form_number = formNumber
    }
    
    // Remove undefined and null values
    Object.keys(supabaseRecord).forEach(key => {
      if (supabaseRecord[key] === undefined || supabaseRecord[key] === null) {
        delete supabaseRecord[key]
      }
    })
    
    const { data: record, error } = await supabase
      .from('mia_data')
      .insert(supabaseRecord)
      .select()
      .single()
    
    if (error) {
      console.error('Error inserting into mia_data:', error)
      console.error('Record attempted:', JSON.stringify(supabaseRecord, null, 2))
      throw error
    }
    
    // Save tasks to project_tasks table if projectId exists and tasks are provided
    if (formData.projectId && formData.tasks) {
      const tasksToInsert: any[] = []
      
      // Iterate through all task types
      Object.entries(formData.tasks).forEach(([taskType, taskEntries]: [string, any]) => {
        if (Array.isArray(taskEntries)) {
          taskEntries.forEach((entry: any) => {
            const taskData: any = {
              project_id: formData.projectId,
              task_type: taskType,
              clause_id: entry.clauseId || '',
              clause_name: entry.clauseName || '',
              created_by: formData.owner,
              date_created: formData.dateMade || new Date().toISOString().split('T')[0]
            }
            
            // Add common fields
            if (entry.description) taskData.description = entry.description
            if (entry.quantity) taskData.quantity = parseFloat(entry.quantity) || null
            if (entry.measurementUnit) taskData.measurement_unit = entry.measurementUnit
            if (entry.attachment) taskData.attachment = entry.attachment
            
            // Add minimumPermit specific fields
            if (taskType === 'minimumPermit') {
              if (entry.title) taskData.title = entry.title
              if (entry.specificLocation) taskData.specific_location = entry.specificLocation
              if (entry.whatWasDone) taskData.what_was_done = entry.whatWasDone
            }
            
            // Add manpower specific fields (people as JSONB)
            if (taskType === 'manpower' && entry.people && Array.isArray(entry.people)) {
              taskData.people = entry.people
            }
            
            tasksToInsert.push(taskData)
          })
        }
      })
      
      // Insert all tasks in batch
      if (tasksToInsert.length > 0) {
        try {
          const { error: tasksError, data: tasksData } = await supabase
            .from('project_tasks')
            .insert(tasksToInsert)
            .select()
          
          if (tasksError) {
            console.error('Error saving tasks:', tasksError)
            console.error('Tasks data attempted:', JSON.stringify(tasksToInsert, null, 2))
            // Don't throw - we still want to return success for the main record
            // But log the error for debugging
          } else {
            console.log(`Successfully saved ${tasksToInsert.length} tasks to project_tasks`)
          }
        } catch (tasksException: any) {
          console.error('Exception saving tasks:', tasksException)
          console.error('This might mean the project_tasks table does not exist yet')
          // Continue - don't fail the whole request
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'דיווח נשמר בהצלחה!',
      recordId: record.id
    })
    
  } catch (error: any) {
    console.error('Error saving form:', error)
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
      errorType: error.constructor.name
    })
    console.error('Form data received:', JSON.stringify(formData, null, 2))
    console.error('Fields prepared:', JSON.stringify(fields, null, 2))
    
    return NextResponse.json({
      success: false,
      error: 'שגיאה בשמירת הדיווח',
      details: error.message || 'Unknown error',
      code: error.code,
      hint: error.hint,
      errorType: error.constructor.name
    }, { status: 500 })
  }
}
