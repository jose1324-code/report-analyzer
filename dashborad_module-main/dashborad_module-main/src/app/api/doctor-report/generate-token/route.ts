import { NextRequest, NextResponse } from 'next/server'
import { saveShareToken } from '@/lib/firestoreService'
import { v4 as uuidv4 } from 'uuid'

export async function POST(req: NextRequest) {
  const { userId, reportId } = await req.json()
  if (!userId || !reportId) {
    return NextResponse.json({ error: 'Missing userId or reportId' }, { status: 400 })
  }
  const token = uuidv4()
  await saveShareToken(token, { userId, reportId })
  return NextResponse.json({ token })
}
