import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Try to get a mind map to see what columns exist
    const { data: mindMaps, error } = await supabase
      .from('mind_maps')
      .select('*')
      .limit(1)

    // Try to get a summary sheet
    const { data: summarySheets, error: summaryError } = await supabase
      .from('summary_sheets')
      .select('*')
      .limit(1)

    return NextResponse.json({
      mindMaps: {
        data: mindMaps,
        error,
        columns: mindMaps && mindMaps.length > 0 ? Object.keys(mindMaps[0]) : []
      },
      summarySheets: {
        data: summarySheets,
        error: summaryError,
        columns: summarySheets && summarySheets.length > 0 ? Object.keys(summarySheets[0]) : []
      }
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to check schema' },
      { status: 500 }
    )
  }
}
