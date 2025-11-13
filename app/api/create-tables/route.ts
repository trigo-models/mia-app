import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST() {
  try {
    // Read the SQL schema file
    const fs = require('fs')
    const path = require('path')
    const sqlPath = path.join(process.cwd(), 'migration', 'create-supabase-schema.sql')
    const sqlContent = fs.readFileSync(sqlPath, 'utf-8')
    
    // Split SQL into individual statements
    const statements = sqlContent
      .split(';')
      .map((s: string) => s.trim())
      .filter((s: string) => s.length > 0 && !s.startsWith('--'))
    
    console.log(`Executing ${statements.length} SQL statements...`)
    
    const results = []
    const errors = []
    
    for (const statement of statements) {
      if (statement.length > 0) {
        try {
          // Note: Supabase JS client doesn't support raw SQL execution via client
          // We need to use the REST API directly
          const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': process.env.SUPABASE_ANON_KEY!,
              'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`
            },
            body: JSON.stringify({ sql: statement })
          })
          
          if (!response.ok) {
            const errorText = await response.text()
            console.log('Statement failed (might be expected):', statement.substring(0, 50))
            results.push({ statement: statement.substring(0, 50), status: 'might already exist' })
          } else {
            results.push({ statement: statement.substring(0, 50), status: 'success' })
          }
        } catch (err: any) {
          errors.push({ statement: statement.substring(0, 50), error: err.message })
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'SQL executed',
      results,
      errors
    })
  } catch (error: any) {
    console.error('Error creating tables:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}





