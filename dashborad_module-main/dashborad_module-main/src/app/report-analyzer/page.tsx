'use client'

import { useState, useRef, useEffect } from 'react'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Upload, FileText, Brain, AlertTriangle, CheckCircle, X, Activity, TrendingUp, Info, ScanText, Copy, CloudUpload, Sparkles } from 'lucide-react'
import { createWorker } from 'tesseract.js'
import { saveMedicalReport, getMedicalReports, MedicalReport, logActivity } from '@/lib/firestoreService'
import { pushReportReadyNotification } from '@/hooks/use-notifications'
import { useToast } from '@/hooks/use-toast'
import { useUser } from '@/hooks/use-user'

interface AnalysisResult {
  summary: string
  findings: { label: string; value: string; status: 'normal' | 'warning' | 'critical' }[]
  recommendations: string[]
  riskLevel: 'low' | 'medium' | 'high'
}

interface RecentReport {
  id: string
  name: string
  date: string
  status: 'Analyzed' | 'Processing'
  analysis?: AnalysisResult
}

export default function ReportAnalyzerPage() {
  const { toast } = useToast()
  const { user, ready } = useUser()
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [ocrProgress, setOcrProgress] = useState(0)
  const [extractedText, setExtractedText] = useState('')
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [recentReports, setRecentReports] = useState<RecentReport[]>([])
  const [selectedReport, setSelectedReport] = useState<RecentReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!ready || !user?.uid) return
    loadReports()
  }, [ready, user?.uid])

  const loadReports = async () => {
    if (!user?.uid) return
    try {
      const reports = await getMedicalReports(user.uid)
      setRecentReports(reports.map(r => ({
        id: r.id || '',
        name: r.fileName,
        date: r.uploadDate,
        status: r.status,
        analysis: r.analysis
      })))
    } catch (error) {
      console.error('Error loading reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }

  const processFile = (file: File) => {
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
    if (validTypes.includes(file.type) && file.size <= 50 * 1024 * 1024) {
      setUploadedFile(file)
      setAnalysisResult(null)
      setSelectedReport(null)
    } else {
      alert('Please upload a valid PDF or image file (max 50MB)')
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) processFile(file)
  }

  const performOCR = async (file: File): Promise<string> => {
    try {
      const worker = await createWorker('eng', 1, {
        logger: (m: any) => {
          if (m.status === 'recognizing text') setOcrProgress(Math.round(m.progress * 100))
        }
      })
      const { data: { text } } = await worker.recognize(file)
      await worker.terminate()
      return text
    } catch (error) {
      console.error('OCR Error:', error)
      throw new Error('Failed to extract text from image')
    }
  }

  const handleAnalyze = async () => {
    if (!uploadedFile) return
    if (!user?.uid) {
      toast({ title: 'Not logged in', description: 'Please log in to analyze reports.', variant: 'destructive' })
      return
    }

    setIsAnalyzing(true)
    setOcrProgress(0)

    try {
      let textContent = ''
      if (uploadedFile.type.startsWith('image/')) {
        try {
          textContent = await performOCR(uploadedFile)
          setExtractedText(textContent)
        } catch (ocrError) {
          console.warn('OCR failed, proceeding with image only:', ocrError)
        }
      }

      const formData = new FormData()
      formData.append('file', uploadedFile)
      if (textContent) formData.append('extractedText', textContent)

      const response = await fetch('/api/analyze', { method: 'POST', body: formData })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Analysis failed')

      setAnalysisResult(result)

      try {
        const reportData: Omit<MedicalReport, 'timestamp'> = {
          fileName: uploadedFile.name,
          fileType: uploadedFile.type,
          fileSize: uploadedFile.size,
          uploadDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          status: 'Analyzed',
          extractedText: textContent,
          analysis: result
        }
        await saveMedicalReport(user.uid, reportData)
        await logActivity(user.uid, { type: 'report_upload', title: 'Uploaded Medical Report', description: `${uploadedFile.name} analyzed successfully` })
        await pushReportReadyNotification(user.uid, uploadedFile.name, user.email)
        await loadReports()
        toast({ title: 'Success', description: 'Report saved successfully' })
      } catch (firestoreError) {
        console.error('Firestore save error:', firestoreError)
        toast({ title: 'Warning', description: 'Report analyzed but not saved to database', variant: 'destructive' })
      }
    } catch (error) {
      alert(`Failed to analyze: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsAnalyzing(false)
      setOcrProgress(0)
    }
  }

  const handleCancel = () => {
    setUploadedFile(null)
    setAnalysisResult(null)
    setExtractedText('')
    setOcrProgress(0)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleViewReport = (report: RecentReport) => {
    setSelectedReport(report)
    setAnalysisResult(report.analysis || null)
    setUploadedFile(null)
  }

  const generateParagraphSummary = (result: AnalysisResult): string => {
    const findingsText = (result.findings ?? []).map(f =>
      typeof f === 'object' && f.label ? `${f.label}: ${f.value} (${f.status})` : ''
    ).filter(Boolean).join(', ')
    const recommendationsText = (result.recommendations ?? []).filter(r => typeof r === 'string').join('. ')
    return `${result.summary} The key findings include: ${findingsText}. Based on these results, the following recommendations are suggested: ${recommendationsText}. The overall risk assessment indicates a ${result.riskLevel} risk level.`
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({ title: 'Copied', description: 'Summary copied to clipboard' })
  }

  const riskConfig = {
    low: { bg: 'bg-emerald-50', border: 'border-emerald-200', badge: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
    medium: { bg: 'bg-amber-50', border: 'border-amber-200', badge: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
    high: { bg: 'bg-red-50', border: 'border-red-200', badge: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
  }

  return (
    <DashboardLayout title="Medical Report Analyzer">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Page Header */}
        <div className="bg-gradient-to-r from-blue-600 to-teal-600 rounded-2xl p-6 text-white">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Brain className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold">Medical Report Analyzer</h1>
          </div>
          <p className="text-blue-100 ml-13 pl-1">Upload your medical reports and get instant AI-powered analysis</p>
        </div>

        {/* Top Row: Upload + Recent Reports */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Upload Card */}
          <div className="lg:col-span-3">
            <Card className="h-full p-0 overflow-hidden">
              <CardHeader className="bg-gray-50 border-b px-6 py-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <CloudUpload className="w-5 h-5 text-blue-600" />
                  Upload Report
                </CardTitle>
                <CardDescription>PDF, JPG, or PNG — max 50MB</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {!uploadedFile ? (
                  <div
                    className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center text-center transition-colors cursor-pointer ${dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-400 hover:bg-gray-50'}`}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                      <Upload className="w-7 h-7 text-blue-600" />
                    </div>
                    <p className="text-base font-semibold text-gray-800 mb-1">Drag & drop your report here</p>
                    <p className="text-sm text-gray-500 mb-4">or click to browse files</p>
                    <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileSelect} className="hidden" />
                    <Button className="bg-blue-600 hover:bg-blue-700 pointer-events-none">
                      <Upload className="w-4 h-4 mr-2" /> Select File
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-5">
                    <div className="flex items-center gap-4 p-4 bg-green-50 border border-green-200 rounded-xl">
                      <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-6 h-6 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{uploadedFile.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB · {uploadedFile.type.split('/')[1].toUpperCase()}</p>
                      </div>
                      <button onClick={handleCancel} disabled={isAnalyzing} className="text-gray-400 hover:text-red-500 transition-colors">
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {isAnalyzing && ocrProgress > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs text-gray-600">
                          <span className="flex items-center gap-1"><ScanText className="w-3.5 h-3.5" /> Extracting text via OCR...</span>
                          <span className="font-medium">{ocrProgress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div className="bg-blue-600 h-1.5 rounded-full transition-all duration-300" style={{ width: `${ocrProgress}%` }} />
                        </div>
                      </div>
                    )}

                    {isAnalyzing && ocrProgress === 0 && (
                      <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                        <Sparkles className="w-4 h-4 text-blue-600 animate-pulse" />
                        <p className="text-sm text-blue-700">AI is analyzing your report...</p>
                      </div>
                    )}

                    <div className="flex gap-3">
                      <Button onClick={handleAnalyze} disabled={isAnalyzing} className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300">
                        <Brain className="w-4 h-4 mr-2" />
                        {isAnalyzing ? 'Analyzing...' : 'Analyze Report'}
                      </Button>
                      <Button onClick={handleCancel} disabled={isAnalyzing} variant="outline" className="border-red-200 text-red-600 hover:bg-red-50">
                        <X className="w-4 h-4 mr-2" /> Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Reports */}
          <div className="lg:col-span-2">
            <Card className="h-full p-0 overflow-hidden">
              <CardHeader className="bg-gray-50 border-b px-6 py-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Recent Reports
                </CardTitle>
                <CardDescription>{recentReports.length} report{recentReports.length !== 1 ? 's' : ''} uploaded</CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                {recentReports.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                      <FileText className="w-6 h-6 text-gray-300" />
                    </div>
                    <p className="text-sm font-medium text-gray-500">No reports yet</p>
                    <p className="text-xs text-gray-400 mt-1">Upload your first report to get started</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {recentReports.map((report) => (
                      <div
                        key={report.id}
                        onClick={() => handleViewReport(report)}
                        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all border ${selectedReport?.id === report.id ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-transparent hover:bg-gray-100'}`}
                      >
                        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <FileText className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{report.name}</p>
                          <p className="text-xs text-gray-500">{report.date}</p>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${report.status === 'Analyzed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                          {report.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Analysis Results */}
        {analysisResult && (
          <div className="space-y-5">
            {/* Results Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">AI Analysis Results</h2>
                  <p className="text-xs text-gray-500">{selectedReport?.name || uploadedFile?.name}</p>
                </div>
              </div>
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full border font-semibold text-sm ${riskConfig[analysisResult.riskLevel].badge} ${riskConfig[analysisResult.riskLevel].border}`}>
                <span className={`w-2 h-2 rounded-full ${riskConfig[analysisResult.riskLevel].dot}`} />
                {analysisResult.riskLevel.charAt(0).toUpperCase() + analysisResult.riskLevel.slice(1)} Risk
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

              {/* Left Column: Summary + Recommendations */}
              <div className="lg:col-span-2 space-y-5">

                {/* Summary */}
                <Card className="p-0 overflow-hidden">
                  <CardHeader className="bg-blue-50 border-b px-5 py-4">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Info className="w-4 h-4 text-blue-600" /> Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-5">
                    <p className="text-sm text-gray-700 leading-relaxed">{analysisResult.summary}</p>
                  </CardContent>
                </Card>

                {/* Complete Report */}
                <Card className="p-0 overflow-hidden">
                  <CardHeader className="bg-blue-50 border-b px-5 py-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-600" /> Complete Report
                      </CardTitle>
                      <Button size="sm" variant="outline" onClick={() => copyToClipboard(generateParagraphSummary(analysisResult))} className="h-7 text-xs text-blue-600 border-blue-200 hover:bg-blue-50">
                        <Copy className="w-3 h-3 mr-1" /> Copy
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-5">
                    <p className="text-sm text-gray-700 leading-relaxed">{generateParagraphSummary(analysisResult)}</p>
                  </CardContent>
                </Card>

                {/* Recommendations */}
                <Card className="p-0 overflow-hidden">
                  <CardHeader className="bg-blue-50 border-b px-5 py-4">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-blue-600" /> Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-5">
                    <ul className="space-y-3">
                      {(analysisResult.recommendations ?? []).map((rec, i) => {
                        const text = typeof rec === 'string' ? rec : (rec as any).title ?? (rec as any).detail ?? JSON.stringify(rec)
                        return (
                          <li key={i} className="flex items-start gap-3">
                            <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                            <span className="text-sm text-gray-700 leading-relaxed">{text}</span>
                          </li>
                        )
                      })}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column: Findings + Risk */}
              <div className="space-y-5">

                {/* Key Findings */}
                <Card className="p-0 overflow-hidden">
                  <CardHeader className="bg-blue-50 border-b px-5 py-4">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Activity className="w-4 h-4 text-blue-600" /> Key Findings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-2">
                    {(analysisResult.findings ?? []).map((finding, i) => (
                      <div key={i} className={`flex items-center justify-between p-3 rounded-lg border-l-4 ${
                        finding.status === 'normal' ? 'bg-emerald-50 border-emerald-400' :
                        finding.status === 'warning' ? 'bg-amber-50 border-amber-400' :
                        'bg-red-50 border-red-400'
                      }`}>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-gray-500 truncate">{finding.label}</p>
                          <p className="text-sm font-semibold text-gray-900">{finding.value}</p>
                        </div>
                        {finding.status === 'normal' && <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 ml-2" />}
                        {finding.status === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 ml-2" />}
                        {finding.status === 'critical' && <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 ml-2" />}
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Risk Level Detail */}
                <Card className={`p-0 overflow-hidden border ${riskConfig[analysisResult.riskLevel].border}`}>
                  <CardContent className={`p-5 ${riskConfig[analysisResult.riskLevel].bg}`}>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Overall Risk Level</p>
                    <div className="flex items-center gap-3">
                      <span className={`w-4 h-4 rounded-full ${riskConfig[analysisResult.riskLevel].dot}`} />
                      <span className={`text-2xl font-bold capitalize ${
                        analysisResult.riskLevel === 'low' ? 'text-emerald-700' :
                        analysisResult.riskLevel === 'medium' ? 'text-amber-700' : 'text-red-700'
                      }`}>{analysisResult.riskLevel}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {analysisResult.riskLevel === 'low' && 'Results are within acceptable ranges. Continue regular checkups.'}
                      {analysisResult.riskLevel === 'medium' && 'Some values need attention. Consult your doctor soon.'}
                      {analysisResult.riskLevel === 'high' && 'Critical values detected. Seek medical attention immediately.'}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
