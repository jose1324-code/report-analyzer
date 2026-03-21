/**
 * Builds the HTML email body for a user's daily health summary
 */
function buildEmailHTML({ name, email, metrics, reportCount, appUrl, date }) {
  const hasMetrics = metrics !== null

  const metricRows = hasMetrics ? `
    <tr><td style="padding:8px 0;color:#6b7280;font-size:14px;">❤️ Heart Rate</td>
        <td style="padding:8px 0;font-weight:600;font-size:14px;">${metrics.heartRate ?? '—'} bpm</td></tr>
    <tr><td style="padding:8px 0;color:#6b7280;font-size:14px;">🩸 Blood Pressure</td>
        <td style="padding:8px 0;font-weight:600;font-size:14px;">${metrics.bloodPressureSystolic ?? '—'}/${metrics.bloodPressureDiastolic ?? '—'} mmHg</td></tr>
    <tr><td style="padding:8px 0;color:#6b7280;font-size:14px;">🍬 Blood Sugar</td>
        <td style="padding:8px 0;font-weight:600;font-size:14px;">${metrics.bloodSugar ?? '—'} mg/dL</td></tr>
    <tr><td style="padding:8px 0;color:#6b7280;font-size:14px;">👟 Steps</td>
        <td style="padding:8px 0;font-weight:600;font-size:14px;">${metrics.steps?.toLocaleString() ?? '—'}</td></tr>
    <tr><td style="padding:8px 0;color:#6b7280;font-size:14px;">😴 Sleep</td>
        <td style="padding:8px 0;font-weight:600;font-size:14px;">${metrics.sleep ?? '—'} hrs</td></tr>
    <tr><td style="padding:8px 0;color:#6b7280;font-size:14px;">⚖️ Weight</td>
        <td style="padding:8px 0;font-weight:600;font-size:14px;">${metrics.weight ?? '—'} kg</td></tr>
    <tr><td style="padding:8px 0;color:#6b7280;font-size:14px;">🔥 Calories</td>
        <td style="padding:8px 0;font-weight:600;font-size:14px;">${metrics.calories ?? '—'} kcal</td></tr>
  ` : `<tr><td colspan="2" style="padding:16px 0;color:#9ca3af;font-size:14px;text-align:center;">No health metrics logged yet. <a href="${appUrl}/health-trends" style="color:#3b82f6;">Add your first entry →</a></td></tr>`

  const tips = [
    'Drink at least 8 glasses of water today 💧',
    'Take a 10-minute walk after each meal 🚶',
    'Try to sleep 7–9 hours tonight 😴',
    'Do 5 minutes of deep breathing to reduce stress 🧘',
    'Eat a fruit or vegetable with every meal 🥦',
    'Stand up and stretch every hour ⏰',
    'Limit screen time 1 hour before bed 📵',
  ]
  const tip = tips[new Date().getDay() % tips.length]

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#3b82f6,#6366f1);padding:32px;text-align:center;">
            <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;">🏥 CareNova</h1>
            <p style="margin:8px 0 0;color:#bfdbfe;font-size:14px;">Your Daily Health Summary</p>
            <p style="margin:4px 0 0;color:#bfdbfe;font-size:12px;">${date}</p>
          </td>
        </tr>

        <!-- Greeting -->
        <tr>
          <td style="padding:28px 32px 0;">
            <h2 style="margin:0;font-size:20px;color:#111827;">Good morning, ${name} 👋</h2>
            <p style="margin:8px 0 0;color:#6b7280;font-size:14px;">Here's your health update for today.</p>
          </td>
        </tr>

        <!-- Metrics -->
        <tr>
          <td style="padding:24px 32px 0;">
            <h3 style="margin:0 0 12px;font-size:16px;color:#374151;border-bottom:2px solid #f3f4f6;padding-bottom:8px;">📊 Latest Health Metrics</h3>
            <table width="100%" cellpadding="0" cellspacing="0">
              ${metricRows}
            </table>
          </td>
        </tr>

        <!-- Reports -->
        <tr>
          <td style="padding:24px 32px 0;">
            <h3 style="margin:0 0 12px;font-size:16px;color:#374151;border-bottom:2px solid #f3f4f6;padding-bottom:8px;">📁 Reports</h3>
            <p style="margin:0;font-size:14px;color:#6b7280;">
              You have <strong style="color:#111827;">${reportCount}</strong> medical report${reportCount !== 1 ? 's' : ''} stored.
              ${reportCount === 0 ? `<a href="${appUrl}/report-analyzer" style="color:#3b82f6;">Upload your first report →</a>` : `<a href="${appUrl}/report-analyzer" style="color:#3b82f6;">View reports →</a>`}
            </p>
          </td>
        </tr>

        <!-- Health Tip -->
        <tr>
          <td style="padding:24px 32px 0;">
            <div style="background:#eff6ff;border-left:4px solid #3b82f6;border-radius:8px;padding:16px;">
              <p style="margin:0;font-size:13px;font-weight:600;color:#1d4ed8;">💡 Today's Health Tip</p>
              <p style="margin:6px 0 0;font-size:14px;color:#1e40af;">${tip}</p>
            </div>
          </td>
        </tr>

        <!-- CTA -->
        <tr>
          <td style="padding:28px 32px;" align="center">
            <a href="${appUrl}" style="display:inline-block;background:#3b82f6;color:#ffffff;text-decoration:none;padding:12px 32px;border-radius:8px;font-size:14px;font-weight:600;">Open Dashboard →</a>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f9fafb;padding:20px 32px;text-align:center;border-top:1px solid #e5e7eb;">
            <p style="margin:0;font-size:12px;color:#9ca3af;">
              You're receiving this because email notifications are enabled for <strong>${email}</strong>.<br>
              <a href="${appUrl}/settings" style="color:#6b7280;">Manage notification settings</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}

module.exports = { buildEmailHTML }
