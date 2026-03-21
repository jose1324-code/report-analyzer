require('dotenv').config()
const cron = require('node-cron')
const nodemailer = require('nodemailer')
const { getAllUsersWithEmailEnabled, getLatestMetric, getReportCount } = require('./firebase')
const { buildEmailHTML } = require('./template')

// ── Mailer setup ─────────────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
})

async function verifyMailer() {
  try {
    await transporter.verify()
    console.log('✅ Gmail connection verified')
  } catch (err) {
    console.error('❌ Gmail connection failed:', err.message)
    console.error('Make sure GMAIL_USER and GMAIL_APP_PASSWORD are set correctly in .env')
    process.exit(1)
  }
}

// ── Send one email ────────────────────────────────────────────────────────────
async function sendDailySummary(uid, name, email) {
  const [metrics, reportCount] = await Promise.all([
    getLatestMetric(uid),
    getReportCount(uid),
  ])

  const date = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  const html = buildEmailHTML({
    name: name || 'there',
    email,
    metrics,
    reportCount,
    appUrl: process.env.APP_URL || 'http://localhost:3000',
    date,
  })

  await transporter.sendMail({
    from: `"CareNova Health" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: `🏥 Your Daily Health Summary — ${date}`,
    html,
  })

  console.log(`  ✉️  Sent to ${email}`)
}

// ── Main job ──────────────────────────────────────────────────────────────────
async function runDailyEmailJob() {
  console.log(`\n📬 Running daily email job — ${new Date().toLocaleString()}`)

  try {
    const users = await getAllUsersWithEmailEnabled()
    console.log(`  Found ${users.length} user(s) with email notifications enabled`)

    if (users.length === 0) {
      console.log('  No emails to send.')
      return
    }

    const results = await Promise.allSettled(
      users.map(u => {
        if (!u.email) {
          console.warn(`  ⚠️  No email for uid: ${u.uid}`)
          return Promise.resolve()
        }
        return sendDailySummary(u.uid, u.fullName || u.name, u.email)
      })
    )

    const failed = results.filter(r => r.status === 'rejected')
    failed.forEach(f => console.error('  ❌ Error:', f.reason?.message))
    console.log(`  ✅ Job complete — ${users.length - failed.length}/${users.length} emails sent`)
  } catch (err) {
    console.error('❌ Job failed:', err.message)
  }
}

// ── Start ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('🚀 CareNova Email Service starting...')
  await verifyMailer()

  const schedule = process.env.CRON_SCHEDULE || '0 8 * * *'
  console.log(`⏰ Scheduled: "${schedule}" (default: every day at 8:00 AM)`)

  if (process.argv.includes('--now')) {
    await runDailyEmailJob()
  }

  cron.schedule(schedule, runDailyEmailJob, { timezone: 'America/New_York' })
  console.log('✅ Email service is running. Press Ctrl+C to stop.\n')
}

main()
