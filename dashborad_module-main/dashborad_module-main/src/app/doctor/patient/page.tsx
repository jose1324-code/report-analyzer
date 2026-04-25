'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { getPatientProfile, getPatientAccess, getMedicalReports, PatientProfile, MedicalReport } from '@/lib/firestoreService'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Stethoscope, User, AlertCircle, Clock, LogOut, CheckCircle,
  FileText, Activity, TrendingUp, Info, ChevronRight, X,
  AlertTriangle, Sparkles
} from 'lucide-react'

type AnalysisResult = NonNullable<MedicalReport['analysis']>

const riskConfig = {
  low:    { bg: 'bg-emerald-50', border: 'border-emerald-200', badge: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500', text: 'text-emerald-700' },
  medium: { bg: 'bg-amber-50',   border: 'border-amber-200',   badge: 'bg-amber-100 text-amber-700',     dot: 'bg-amber-500',   text: 'text-amber-700'   },
  high:   { bg: 'bg-red-50',     border: 'border-red-200',     badge: 'bg-red-100 text-red-700',         dot: 'bg-red-500',     text: 'text-red-700'     },
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm py-2 border-b last:border-0">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-900">{value}</span>
    </div>
  )
}

function PatientDetailsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const patientId = searchParams.get('patientId') || ''

  const [profile, setProfile] = useState<PatientProfile | null>(null)
  const [reports, setReports] = useState<MedicalReport[]>([])
  const [selectedReport, setSelectedReport] = useState<MedicalReport | null>(null)
  const [status, setStatus] = useState<'loading' | 'auth' | 'expired' | 'denied' | 'ok'>('loading')
  const [doctorEmail, setDoctorEmail] = useState('')
  const [expiresAt, setExpiresAt] = useState<Date | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (doctor) => {
      if (!doctor) { router.push(`/doctor-login?patientId=${patientId}`); return }
      setDoctorEmail(doctor.email || '')

      try {
        const access = await getPatientAccess(patientId)
        if (access) {
          const expires = access.expiresAt.toDate()
          setExpiresAt(expires)
          if (!access.allowed || new Date() > expires) { setStatus('expired'); return }
        }

        const [data, reps] = await Promise.all([
          getPatientProfile(patientId),
          getMedicalReports(patientId),
        ])

        if (!data) { setStatus('denied'); return }
        setProfile(data)
        setReports(reps)
        setStatus('ok')
      } catch {
        setStatus('denied')
      }
    })
    return () => unsubscribe()
  }, [patientId])

  const handleLogout = async () => { await signOut(auth); router.push('/') }

  const analysis = selectedReport?.analysis

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 animate-pulse">Loading patient data...</p>
      </div>
    )
  }

  if (status === 'expired') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="p-8 space-y-4">
            <Clock className="w-12 h-12 text-orange-500 mx-auto" />
            <h2 className="text-xl font-bold text-gray-900">Access Expired</h2>
            <p className="text-gray-500 text-sm">
              {expiresAt ? `This link expired on ${expiresAt.toLocaleString()}.` : 'Access has expired or been revoked.'}
            </p>
            <Button variant="outline" onClick={handleLogout}><LogOut className="w-4 h-4 mr-2" /> Logout</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (status === 'denied') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="p-8 space-y-4">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
            <h2 className="text-xl font-bold text-gray-900">Patient Not Found</h2>
            <p className="text-gray-500 text-sm">No patient data found for this ID.</p>
            <Button variant="outline" onClick={handleLogout}><LogOut className="w-4 h-4 mr-2" /> Logout</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Doctor Portal</p>
              <p className="text-xs text-gray-500">{doctorEmail}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </Button>
        </div>

        {/* Access Status */}
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-4 py-2 text-sm text-green-700">
          <CheckCircle className="w-4 h-4" />
          Access granted
          {expiresAt && <span className="ml-1 text-green-600">· Expires {expiresAt.toLocaleString()}</span>}
        </div>

        {/* Patient Profile */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" /> Patient Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            {profile && (
              <>
                <Row label="Name"       value={profile.name} />
                <Row label="Age"        value={String(profile.age)} />
                <Row label="Condition"  value={profile.condition} />
                <Row label="Blood Type" value={profile.bloodType || '—'} />
                <Row label="Email"      value={profile.email || '—'} />
                <Row label="Patient ID" value={profile.patientId} />
              </>
            )}
          </CardContent>
        </Card>

        {/* Medical Reports */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Reports List */}
          <div className="lg:col-span-1">
            <Card className="p-0 overflow-hidden shadow-md">
              <CardHeader className="bg-gray-50 border-b px-5 py-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" /> Medical Reports
                </CardTitle>
                <p className="text-xs text-gray-500 mt-0.5">{reports.length} report{reports.length !== 1 ? 's' : ''} found</p>
              </CardHeader>
              <CardContent className="p-3">
                {reports.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center text-gray-400">
                    <FileText className="w-10 h-10 mb-2 opacity-30" />
                    <p className="text-sm">No reports available</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {reports.map(r => (
                      <div
                        key={r.id}
                        onClick={() => setSelectedReport(r)}
                        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all border ${
                          selectedReport?.id === r.id
                            ? 'bg-blue-50 border-blue-200'
                            : 'bg-gray-50 border-transparent hover:bg-gray-100'
                        }`}
                      >
                        <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <FileText className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{r.fileName}</p>
                          <p className="text-xs text-gray-500">{r.uploadDate}</p>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            r.status === 'Analyzed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                          }`}>{r.status}</span>
                          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Analysis Panel */}
          <div className="lg:col-span-2">
            {!selectedReport ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl py-20 bg-white">
                <FileText className="w-12 h-12 mb-3 opacity-20" />
                <p className="text-sm font-medium">Select a report to view analysis</p>
              </div>
            ) : !analysis ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl py-20 bg-white">
                <AlertTriangle className="w-10 h-10 mb-3 opacity-30" />
                <p className="text-sm font-medium">{selectedReport.fileName}</p>
                <p className="text-xs mt-1">No analysis available for this report</p>
              </div>
            ) : (
              <div className="space-y-4">

                {/* Analysis Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-gray-900">AI Analysis Results</h3>
                      <p className="text-xs text-gray-500 truncate max-w-xs">{selectedReport.fileName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-semibold ${riskConfig[analysis.riskLevel].badge} ${riskConfig[analysis.riskLevel].border}`}>
                      <span className={`w-2 h-2 rounded-full ${riskConfig[analysis.riskLevel].dot}`} />
                      {analysis.riskLevel.charAt(0).toUpperCase() + analysis.riskLevel.slice(1)} Risk
                    </div>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => setSelectedReport(null)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Summary */}
                <Card className="p-0 overflow-hidden">
                  <CardHeader className="bg-blue-50 border-b px-5 py-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Info className="w-4 h-4 text-blue-600" /> Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-700 leading-relaxed">{analysis.summary}</p>
                  </CardContent>
                </Card>

                {/* Key Findings */}
                <Card className="p-0 overflow-hidden">
                  <CardHeader className="bg-blue-50 border-b px-5 py-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Activity className="w-4 h-4 text-blue-600" /> Key Findings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {analysis.findings.map((f, i) => (
                      <div key={i} className={`flex items-center justify-between p-3 rounded-lg border-l-4 ${
                        f.status === 'normal'   ? 'bg-emerald-50 border-emerald-400' :
                        f.status === 'warning'  ? 'bg-amber-50 border-amber-400' :
                                                  'bg-red-50 border-red-400'
                      }`}>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-gray-500 truncate">{f.label}</p>
                          <p className="text-sm font-semibold text-gray-900">{f.value}</p>
                        </div>
                        {f.status === 'normal'   && <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 ml-2" />}
                        {f.status === 'warning'  && <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 ml-2" />}
                        {f.status === 'critical' && <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 ml-2" />}
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Recommendations */}
                <Card className="p-0 overflow-hidden">
                  <CardHeader className="bg-blue-50 border-b px-5 py-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-blue-600" /> Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <ul className="space-y-2">
                      {analysis.recommendations.map((rec, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                          <span className="text-sm text-gray-700 leading-relaxed">{typeof rec === 'string' ? rec : JSON.stringify(rec)}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Risk Detail */}
                <Card className={`p-0 overflow-hidden border ${riskConfig[analysis.riskLevel].border}`}>
                  <CardContent className={`p-5 ${riskConfig[analysis.riskLevel].bg}`}>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Overall Risk Level</p>
                    <div className="flex items-center gap-3">
                      <span className={`w-4 h-4 rounded-full ${riskConfig[analysis.riskLevel].dot}`} />
                      <span className={`text-2xl font-bold capitalize ${riskConfig[analysis.riskLevel].text}`}>{analysis.riskLevel}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {analysis.riskLevel === 'low'    && 'Results are within acceptable ranges.'}
                      {analysis.riskLevel === 'medium' && 'Some values need attention. Follow up recommended.'}
                      {analysis.riskLevel === 'high'   && 'Critical values detected. Immediate attention required.'}
                    </p>
                  </CardContent>
                </Card>

              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PatientDetailsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <PatientDetailsContent />
    </Suspense>
  )
}
