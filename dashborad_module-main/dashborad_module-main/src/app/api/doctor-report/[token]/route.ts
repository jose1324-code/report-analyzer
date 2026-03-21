import { NextRequest, NextResponse } from 'next/server'
import { getShareToken, getMedicalReports } from '@/lib/firestoreService'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  const { searchParams } = new URL(req.url)
  const format = searchParams.get('format') ?? 'json' // 'json' | 'pdf' | 'image'

  const shareData = await getShareToken(token)
  if (!shareData) {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 404 })
  }

  const reports = await getMedicalReports(shareData.userId)
  const report = reports.find(r => r.id === shareData.reportId)
  if (!report) {
    return NextResponse.json({ error: 'Report not found' }, { status: 404 })
  }

  if (format === 'json') {
    return NextResponse.json({
      fileName: report.fileName,
      uploadDate: report.uploadDate,
      analysis: report.analysis,
      extractedText: report.extractedText,
    })
  }

  // For PDF/image: return the analysis as a formatted HTML page that the browser can print/save
  const findings = (report.analysis?.findings ?? [])
    .map(f => `<tr><td>${f.label}</td><td>${f.value}</td><td style="color:${f.status === 'normal' ? 'green' : f.status === 'warning' ? 'orange' : 'red'}">${f.status}</td></tr>`)
    .join('')

  const recommendations = (report.analysis?.recommendations ?? [])
    .map(r => `<li>${r}</li>`)
    .join('')

  const riskColor = report.analysis?.riskLevel === 'low' ? 'green' : report.analysis?.riskLevel === 'medium' ? 'orange' : 'red'

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>Medical Report – ${report.fileName}</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; color: #111; }
    h1 { color: #1d4ed8; }
    h2 { color: #374151; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; }
    th, td { text-align: left; padding: 8px 12px; border: 1px solid #e5e7eb; }
    th { background: #f3f4f6; }
    .risk { display: inline-block; padding: 4px 14px; border-radius: 20px; font-weight: bold; color: white; background: ${riskColor}; }
    .summary { background: #eff6ff; border-left: 4px solid #3b82f6; padding: 12px 16px; border-radius: 4px; }
    @media print { button { display: none; } }
  </style>
</head>
<body>
  <h1>Medical Report</h1>
  <p><strong>File:</strong> ${report.fileName}</p>
  <p><strong>Date:</strong> ${report.uploadDate}</p>
  <p><strong>Risk Level:</strong> <span class="risk">${(report.analysis?.riskLevel ?? 'N/A').toUpperCase()}</span></p>

  <h2>Summary</h2>
  <div class="summary">${report.analysis?.summary ?? 'No summary available.'}</div>

  <h2>Key Findings</h2>
  <table>
    <thead><tr><th>Finding</th><th>Value</th><th>Status</th></tr></thead>
    <tbody>${findings || '<tr><td colspan="3">No findings</td></tr>'}</tbody>
  </table>

  <h2>Recommendations</h2>
  <ul>${recommendations || '<li>No recommendations</li>'}</ul>

  ${report.extractedText ? `<h2>Extracted Text</h2><pre style="white-space:pre-wrap;font-size:12px;background:#f9fafb;padding:12px;border-radius:4px">${report.extractedText}</pre>` : ''}

  <br/>
  <button onclick="window.print()" style="padding:10px 20px;background:#1d4ed8;color:white;border:none;border-radius:6px;cursor:pointer;font-size:14px">
    Save as PDF / Print
  </button>
</body>
</html>`

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}
