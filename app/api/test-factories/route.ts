import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    // Get all factories to see what they look like
    const { data: factories, error } = await supabase
      .from('factory_name')
      .select('*')

    console.log('All factories:', factories)
    console.log('Error:', error)

    return NextResponse.json({
      success: true,
      factories: factories || [],
      error: error?.message
    })
  } catch (error: any) {
    console.error('Error fetching factories:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}





