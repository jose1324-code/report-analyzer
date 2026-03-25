'use client'

import { useState, useRef, useEffect } from 'react'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Upload, FileText, Brain, AlertTriangle, CheckCircle, X, Activity, TrendingUp, Info, ScanText, Copy } from 'lucide-react'
import { createWorker } from 'tesseract.js'
import { saveMedicalReport, getMedicalReports, updateMedicalReport, MedicalReport, logActivity } from '@/lib/firestoreService'
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
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!ready || !user?.uid) return
    loadReports()
  }, [ready, user?.uid])

  const loadReports = async () => {
    if (!user?.uid) return
    try {
      const reports = await getMedicalReports(user.uid)
      const formattedReports: RecentReport[] = reports.map(r => ({
        id: r.id || '',
        name: r.fileName,
        date: r.uploadDate,
        status: r.status,
        analysis: r.analysis
      }))
      setRecentReports(formattedReports)
    } catch (error) {
      console.error('Error loading reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
      if (validTypes.includes(file.type) && file.size <= 50 * 1024 * 1024) {
        setUploadedFile(file)
        setAnalysisResult(null)
      } else {
        alert('Please upload a valid PDF or image file (max 50MB)')
      }
    }
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  const performOCR = async (file: File): Promise<string> => {
    try {
      const worker = await createWorker('eng', 1, {
        logger: (m: any) => {
          if (m.status === 'recognizing text') {
            setOcrProgress(Math.round(m.progress * 100))
          }
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
      
      // Perform OCR for images
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
      if (textContent) {
        formData.append('extractedText', textContent)
      }
      
      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Analysis failed')
      }
      
      setAnalysisResult(result)
      
      // Save to Firestore
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
        
        const reportId = await saveMedicalReport(user.uid, reportData)
        await logActivity(user.uid, {
          type: 'report_upload',
          title: 'Uploaded Medical Report',
          description: `${uploadedFile.name} analyzed successfully`
        })
        await pushReportReadyNotification(user.uid, uploadedFile.name, user.email)
        
        // Reload reports
        await loadReports()
        
        toast({
          title: 'Success',
          description: 'Report saved to Firestore'
        })
      } catch (firestoreError) {
        console.error('Firestore save error:', firestoreError)
        toast({
          title: 'Warning',
          description: 'Report analyzed but not saved to database',
          variant: 'destructive'
        })
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      alert(`Failed to analyze: ${errorMessage}`)
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
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleViewReport = (report: RecentReport) => {
    setSelectedReport(report)
    setAnalysisResult(report.analysis || null)
  }

  const generateParagraphSummary = (result: AnalysisResult): string => {
    const findingsText = (result.findings ?? []).map(f => {
      if (typeof f === 'object' && f.label && f.value && f.status) {
        return `${f.label}: ${f.value} (${f.status})`
      }
      return ''
    }).filter(Boolean).join(', ')
    
    const recommendationsText = (result.recommendations ?? []).map(rec => {
      if (typeof rec === 'string') {
        return rec
      }
      return ''
    }).filter(Boolean).join('. ')
    
    return `${result.summary} The key findings include: ${findingsText}. Based on these results, the following recommendations are suggested: ${recommendationsText}. The overall risk assessment indicates a ${result.riskLevel} risk level.`
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('Summary copied to clipboard!')
  }

  return (
    <DashboardLayout title="My Medical Reports">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">My Medical Report Analyzer</h2>
            <p className="text-gray-500 mt-1">Upload and analyze your medical reports using AI</p>
          </div>
        </div>

        {/* Upload Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-dashed border-2">
            <CardContent className="p-8">
              {!uploadedFile ? (
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                    <Upload className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload My Report</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Drag and drop your medical report here, or click to browse
                  </p>
                  <p className="text-xs text-gray-400 mb-4">Supports: PDF, JPG, PNG (Max 50MB)</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Button onClick={handleButtonClick} className="bg-blue-600 hover:bg-blue-700">
                    <Upload className="w-4 h-4 mr-2" />
                    Select Files
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                    <FileText className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">File Uploaded</h3>
                  <p className="text-sm text-gray-700 font-medium mb-1">{uploadedFile.name}</p>
                  <p className="text-xs text-gray-500 mb-6">
                    Size: {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  {isAnalyzing && ocrProgress > 0 && (
                    <div className="w-full mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-600 flex items-center gap-1">
                          <ScanText className="w-4 h-4" />
                          Extracting text...
                        </span>
                        <span className="text-xs text-gray-600">{ocrProgress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${ocrProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                  <div className="flex gap-3">
                    <Button 
                      onClick={handleAnalyze} 
                      disabled={isAnalyzing}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300"
                    >
                      <Brain className="w-4 h-4 mr-2" />
                      {isAnalyzing ? 'Analyzing...' : 'Analyze'}
                    </Button>
                    <Button 
                      onClick={handleCancel} 
                      disabled={isAnalyzing}
                      variant="outline" 
                      className="border-red-300 text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>My Recent Reports</CardTitle>
              <CardDescription>Your uploaded medical reports</CardDescription>
            </CardHeader>
            <CardContent>
              {recentReports.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No reports yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentReports.map((report) => (
                    <div 
                      key={report.id} 
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                      onClick={() => handleViewReport(report)}
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{report.name}</p>
                          <p className="text-xs text-gray-500">{report.date}</p>
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        report.status === 'Analyzed' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {report.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* AI Analysis Results */}
        {analysisResult && (
          <Card className="border-blue-200 bg-blue-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-6 h-6 text-blue-600" />
                AI Analysis Results
              </CardTitle>
              <CardDescription>Generated analysis for {selectedReport?.name || uploadedFile?.name}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Paragraph Summary */}
              <div className="bg-white p-4 rounded-lg border-2 border-blue-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    Complete Summary
                  </h3>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => copyToClipboard(generateParagraphSummary(analysisResult))}
                    className="text-blue-600 border-blue-300 hover:bg-blue-50"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {generateParagraphSummary(analysisResult)}
                </p>
              </div>

              {/* Summary */}
              <div className="bg-white p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Info className="w-5 h-5 text-blue-600" />
                  Summary
                </h3>
                <p className="text-sm text-gray-700">{analysisResult.summary}</p>
              </div>

              {/* Key Findings */}
              <div className="bg-white p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-600" />
                  Key Findings
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {(analysisResult.findings ?? []).map((finding, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-xs text-gray-500">{finding.label}</p>
                        <p className="text-sm font-medium text-gray-900">{finding.value}</p>
                      </div>
                      {finding.status === 'normal' && (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      )}
                      {finding.status === 'warning' && (
                        <AlertTriangle className="w-5 h-5 text-yellow-600" />
                      )}
                      {finding.status === 'critical' && (
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              <div className="bg-white p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  Recommendations
                </h3>
                <ul className="space-y-2">
                  {(analysisResult.recommendations ?? []).map((rec, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-blue-600 mt-1">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Risk Level */}
              <div className="bg-white p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Overall Risk Level</h3>
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
                  analysisResult.riskLevel === 'low' ? 'bg-green-100 text-green-700' :
                  analysisResult.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  <span className="font-semibold uppercase text-sm">{analysisResult.riskLevel} Risk</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
