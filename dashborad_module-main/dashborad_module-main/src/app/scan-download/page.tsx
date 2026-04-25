'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  FileText, Brain, AlertTriangle, CheckCircle, Activity,
  TrendingUp, Info, Copy, Sparkles, X, ChevronRight
} from 'lucide-react'
import { getMedicalReports, MedicalReport } from '@/lib/firestoreService'
import { useUser } from '@/hooks/use-user'
import { useToast } from '@/hooks/use-toast'

type AnalysisResult = NonNullable<MedicalReport['analysis']>

const riskConfig = {
  low:    { bg: 'bg-emerald-50', border: 'border-emerald-200', badge: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500', text: 'text-emerald-700' },
  medium: { bg: 'bg-amber-50',   border: 'border-amber-200',   badge: 'bg-amber-100 text-amber-700',     dot: 'bg-amber-500',   text: 'text-amber-700'   },
  high:   { bg: 'bg-red-50',     border: 'border-red-200',     badge: 'bg-red-100 text-red-700',         dot: 'bg-red-500',     text: 'text-red-700'     },
}

export default function ScanDownloadPage() {
  const { user, ready } = useUser()
  const { toast } = useToast()
  const [reports, setReports] = useState<MedicalReport[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<MedicalReport | null>(null)

  useEffect(() => {
    if (!ready || !user?.uid) return
    getMedicalReports(user.uid)
      .then(setReports)
      .catch(() => toast({ title: 'Error', description: 'Failed to load reports', variant: 'destructive' }))
      .finally(() => setLoading(false))
  }, [ready, user?.uid])

  const generateParagraphSummary = (result: AnalysisResult) => {
    const findings = result.findings.map(f => `${f.label}: ${f.value} (${f.status})`).join(', ')
    const recs = result.recommendations.join('. ')
    return `${result.summary} The key findings include: ${findings}. Recommendations: ${recs}. Overall risk: ${result.riskLevel}.`
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({ title: 'Copied', description: 'Summary copied to clipboard' })
  }

  const analysis = selected?.analysis

  return (
    <DashboardLayout title="My Reports">
      <div className="space-y-6">

        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Medical Reports</h2>
          <p className="text-gray-500 mt-1">Click a report to view its AI analysis summary</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Reports List */}
          <div className="lg:col-span-1">
            <Card className="p-0 overflow-hidden">
              <CardHeader className="bg-gray-50 border-b px-5 py-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Reports
                </CardTitle>
                <CardDescription>{reports.length} report{reports.length !== 1 ? 's' : ''} found</CardDescription>
              </CardHeader>
              <CardContent className="p-3">
                {loading ? (
                  <div className="space-y-2 py-2">
                    {[1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />)}
                  </div>
                ) : reports.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center text-gray-400">
                    <FileText className="w-10 h-10 mb-2 opacity-30" />
                    <p className="text-sm">No reports yet</p>
                    <p className="text-xs mt-1">Upload reports in the Report Analyzer</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {reports.map(r => (
                      <div
                        key={r.id}
                        onClick={() => setSelected(r)}
                        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all border ${
                          selected?.id === r.id
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
                          }`}>
                            {r.status}
                          </span>
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
            {!selected ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl py-20">
                <Brain className="w-12 h-12 mb-3 opacity-20" />
                <p className="text-sm font-medium">Select a report to view its analysis</p>
              </div>
            ) : !analysis ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl py-20">
                <AlertTriangle className="w-10 h-10 mb-3 opacity-30" />
                <p className="text-sm font-medium">{selected.fileName}</p>
                <p className="text-xs mt-1">No analysis available for this report</p>
              </div>
            ) : (
              <div className="space-y-4">

                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-gray-900">AI Analysis Results</h3>
                      <p className="text-xs text-gray-500 truncate max-w-xs">{selected.fileName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-semibold ${riskConfig[analysis.riskLevel].badge} ${riskConfig[analysis.riskLevel].border}`}>
                      <span className={`w-2 h-2 rounded-full ${riskConfig[analysis.riskLevel].dot}`} />
                      {analysis.riskLevel.charAt(0).toUpperCase() + analysis.riskLevel.slice(1)} Risk
                    </div>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => setSelected(null)}>
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

                {/* Complete Report + Copy */}
                <Card className="p-0 overflow-hidden">
                  <CardHeader className="bg-blue-50 border-b px-5 py-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-600" /> Complete Report
                      </CardTitle>
                      <Button size="sm" variant="outline" onClick={() => copyToClipboard(generateParagraphSummary(analysis))} className="h-7 text-xs text-blue-600 border-blue-200 hover:bg-blue-50">
                        <Copy className="w-3 h-3 mr-1" /> Copy
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-700 leading-relaxed">{generateParagraphSummary(analysis)}</p>
                  </CardContent>
                </Card>

              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
