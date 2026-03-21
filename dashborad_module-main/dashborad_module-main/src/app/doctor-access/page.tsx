'use client'

import { useState, useEffect, useRef } from 'react'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Download, Share2, Shield, Clock, Users, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react'
import QRCode from 'qrcode'
import { getMedicalReports, MedicalReport } from '@/lib/firestoreService'
import { useUser } from '@/hooks/use-user'

export default function DoctorAccessPage() {
  const { user, ready } = useUser()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [reports, setReports] = useState<MedicalReport[]>([])
  const [selectedReportId, setSelectedReportId] = useState<string>('')
  const [shareUrl, setShareUrl] = useState<string>('')
  const [generating, setGenerating] = useState(false)
  const [expiresAt, setExpiresAt] = useState<Date | null>(null)

  useEffect(() => {
    if (!ready || !user?.uid) return
    getMedicalReports(user.uid).then(r => {
      setReports(r)
      if (r.length > 0) setSelectedReportId(r[0].id ?? '')
    })
  }, [ready, user?.uid])

  const generateQR = async () => {
    if (!selectedReportId || !user?.uid) return
    setGenerating(true)
    try {
      const res = await fetch('/api/doctor-report/generate-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid, reportId: selectedReportId }),
      })
      const { token } = await res.json()
      const url = `${window.location.origin}/api/doctor-report/${token}`
      setShareUrl(url)
      setExpiresAt(new Date(Date.now() + 24 * 60 * 60 * 1000))
      if (canvasRef.current) {
        await QRCode.toCanvas(canvasRef.current, url, { width: 240, margin: 2 })
      }
    } finally {
      setGenerating(false)
    }
  }

  const handleDownload = () => {
    if (!canvasRef.current) return
    const link = document.createElement('a')
    link.download = 'report-qr.png'
    link.href = canvasRef.current.toDataURL()
    link.click()
  }

  const handleShare = async () => {
    if (!shareUrl) return
    if (navigator.share) {
      await navigator.share({ title: 'My Medical Report', url: shareUrl })
    } else {
      await navigator.clipboard.writeText(shareUrl)
      alert('Link copied to clipboard!')
    }
  }

  const timeLeft = expiresAt
    ? `Expires ${expiresAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    : 'Expires in 24 hours after generation'

  return (
    <DashboardLayout title="Doctor Access">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Share Your Health Records</h2>
          <p className="text-gray-500 mt-1">Generate a secure QR code — doctor scans it on their phone to view your report as PDF or image</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* QR Code Card */}
          <Card>
            <CardHeader>
              <CardTitle>My Access QR Code</CardTitle>
              <CardDescription>Doctor scans this to open your report in their browser</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center gap-4">
                {/* Report selector */}
                <div className="w-full">
                  <label className="text-sm text-gray-600 mb-1 block">Select Report</label>
                  <Select value={selectedReportId} onValueChange={setSelectedReportId} disabled={reports.length === 0}>
                    <SelectTrigger>
                      <SelectValue placeholder={reports.length === 0 ? 'No reports available' : 'Choose a report'} />
                    </SelectTrigger>
                    <SelectContent>
                      {reports.map(r => (
                        <SelectItem key={r.id} value={r.id ?? ''}>{r.fileName} — {r.uploadDate}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* QR canvas */}
                <div className="w-64 h-64 bg-white border-2 border-gray-200 rounded-lg flex items-center justify-center">
                  {shareUrl
                    ? <canvas ref={canvasRef} />
                    : <canvas ref={canvasRef} className="hidden" />
                  }
                  {!shareUrl && (
                    <p className="text-sm text-gray-400 text-center px-4">
                      Select a report and click Generate
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-orange-500" />
                  <span className="text-sm text-gray-500">{timeLeft}</span>
                </div>

                <Button
                  onClick={generateQR}
                  disabled={!selectedReportId || generating}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${generating ? 'animate-spin' : ''}`} />
                  {generating ? 'Generating…' : shareUrl ? 'Regenerate QR Code' : 'Generate QR Code'}
                </Button>

                {shareUrl && (
                  <div className="flex gap-3 w-full">
                    <Button variant="outline" className="flex-1" onClick={handleDownload}>
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                    <Button className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={handleShare}>
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                  </div>
                )}

                {shareUrl && (
                  <p className="text-xs text-gray-400 break-all text-center">{shareUrl}</p>
                )}
              </div>
            </CardContent>
          </Card>

        
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <Shield className="w-10 h-10 text-green-600 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Your Privacy Protected</h3>
              <p className="text-sm text-gray-500">All data is encrypted and only shared with your consent.</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <Clock className="w-10 h-10 text-blue-600 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Time-Limited Access</h3>
              <p className="text-sm text-gray-500">QR codes expire after 24 hours for your security.</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <AlertCircle className="w-10 h-10 text-purple-600 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Full Control</h3>
              <p className="text-sm text-gray-500">You decide exactly what information to share.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
