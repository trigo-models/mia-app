import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

type TaskType =
  | 'construction'
  | 'stairs'
  | 'mesh'
  | 'railing'
  | 'sheetMetal'
  | 'equipment'
  | 'minimumPermit'
  | 'anchors'
  | 'manpower'

const TASK_CATEGORY_LABELS: Record<TaskType, string> = {
  construction: 'קונסטרוקציה',
  stairs: 'מדרגה',
  mesh: 'שבכה',
  railing: 'מעקה',
  sheetMetal: 'פחים',
  equipment: 'ציוד',
  minimumPermit: 'הרשאת מינימום',
  anchors: 'עוגנים',
  manpower: 'כח אדם'
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const taskType = searchParams.get('taskType') as TaskType | null

  if (!taskType || !(taskType in TASK_CATEGORY_LABELS)) {
    return NextResponse.json(
      { error: 'Invalid or missing taskType parameter' },
      { status: 400 }
    )
  }

  const categoryLabel = TASK_CATEGORY_LABELS[taskType]

  const { data, error } = await supabase
    .from('clauses')
    .select('*')
    .eq('category', categoryLabel)
    .order('id', { ascending: true })

  if (error) {
    console.error('Error fetching clauses:', error)
    return NextResponse.json(
      { error: 'Failed to fetch clauses' },
      { status: 500 }
    )
  }

  const rawCount = data?.length ?? 0

  const clauses = (data || []).map((clause: any) => {
    const rawName =
      clause.name ||
      clause.title ||
      clause.clause ||
      clause.clause_name ||
      clause.label ||
      clause.value ||
      ''

    const rawDescription = clause.description ?? clause.details ?? clause.note ?? null
    const rawSerial =
      clause.serial ||
      clause.code ||
      clause.serial_number ||
      clause.serialNumber ||
      clause.identifier ||
      clause.sequence ||
      null

    const trimmedName = typeof rawName === 'string' ? rawName.trim() : ''
    const trimmedDescription = typeof rawDescription === 'string' ? rawDescription.trim() : null
    const trimmedSerial =
      typeof rawSerial === 'string'
        ? rawSerial.trim()
        : typeof rawSerial === 'number'
          ? rawSerial.toString()
          : ''

    const displayName =
      trimmedSerial && trimmedDescription
        ? `${trimmedSerial} - ${trimmedDescription}`
        : trimmedSerial && trimmedName
          ? `${trimmedSerial} - ${trimmedName}`
          : trimmedName ||
            trimmedDescription ||
            `סעיף #${clause.id}`

    const clauseId =
      clause.id ??
      clause.uuid ??
      clause.external_id ??
      clause.serial ??
      clause.code ??
      trimmedSerial ??
      Math.random().toString(36).slice(2)

    return {
      id: String(clauseId),
      name: displayName,
      description: trimmedDescription,
      serial: trimmedSerial,
      category: clause.category
    }
  })

  console.log('Clauses response normalized:', {
    taskType,
    categoryLabel,
    rawCount,
    filteredCount: clauses.length
  })

  return NextResponse.json({ clauses })
}

