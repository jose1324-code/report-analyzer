import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

const ALLOWED_ORIGINS = ['http://localhost:8081', 'http://localhost:3000']

function corsHeaders(origin: string | null) {
  const allowed = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[1]
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }
}

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin')
  return new NextResponse(null, { status: 204, headers: corsHeaders(origin) })
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: { rejectUnauthorized: false },
})

export async function POST(request: NextRequest) {
  const { to, subject, text } = await request.json()

  if (!to || !subject || !text) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const origin = request.headers.get('origin')
  try {
    await transporter.sendMail({
      from: `"CareNova" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
    })
    return NextResponse.json({ success: true }, { headers: corsHeaders(origin) })
  } catch (error) {
    console.error('Email send error:', error)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500, headers: corsHeaders(origin) })
  }
}
