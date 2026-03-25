'use client'

import { useState, useRef } from 'react'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ScanLine, Upload, Download, FileText, CheckCircle,
  AlertCircle, RefreshCw, Eye, X, Camera
} from 'lucide-react'

interface ScannedDoc {
  id: string
  name: string
  scannedAt: string
  pages: number
  status: 'ready' | 'scanning' | 'failed'
  previewUrl: string | null
  size: string
}

const DUMMY_DOCS: ScannedDoc[] = [
  {
    id: '1',
    name: 'Blood_Test_Report.pdf',
    scannedAt: 'Jan 20, 2025 · 10:32 AM',
    pages: 2,
    status: 'ready',
    previewUrl: null,
    size: '1.2 MB',
  },
  {
    id: '2',
    name: 'Prescription_Dr_Sharma.pdf',
    scannedAt: 'Jan 18, 2025 · 3:15 PM',
    pages: 1,
    status: 'ready',
    previewUrl: null,
    size: '0.8 MB',
  },
  {
    id: '3',
    name: 'X-Ray_Chest_Scan.pdf',
    scannedAt: 'Jan 15, 2025 · 9:00 AM',
    pages: 3,
    status: 'ready',
    previewUrl: null,
    size: '3.4 MB',
  },
]

export default function ScanDownloadPage() {
  const [docs, setDocs] = useState<ScannedDoc[]>(DUMMY_DOCS)
  const [scanning, setScanning] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)
  const [previewDoc, setPreviewDoc] = useState<ScannedDoc | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleScan = () => {
    setScanning(true)
    setScanProgress(0)
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setScanning(false)
          const newDoc: ScannedDoc = {
            id: Date.now().toString(),
            name: `Scanned_Document_${Date.now()}.pdf`,
            scannedAt: new Date().toLocaleString('en-US', {
              month: 'short', day: 'numeric', year: 'numeric',
              hour: 'numeric', minute: '2-digit'
            }),
            pages: Math.floor(Math.random() * 3) + 1,
            status: 'ready',
            previewUrl: null,
            size: `${(Math.random() * 3 + 0.5).toFixed(1)} MB`,
          }
          setDocs(prev => [newDoc, ...prev])
          return 100
        }
        return prev + 10
      })
    }, 200)
  }

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const newDoc: ScannedDoc = {
      id: Date.now().toString(),
      name: file.name,
      scannedAt: new Date().toLocaleString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
        hour: 'numeric', minute: '2-digit'
      }),
      pages: 1,
      status: 'ready',
      previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
      size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
    }
    setDocs(prev => [newDoc, ...prev])
    e.target.value = ''
  }

  const handleDownload = (d: ScannedDoc) => {
    const content = `CARENOVA - SCANNED DOCUMENT\n\nFile: ${d.name}\nScanned: ${d.scannedAt}\nPages: ${d.pages}\nSize: ${d.size}\n\n[Dummy document for demonstration]`
    const blob = new Blob([content], { type: 'application/octet-stream' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = d.name
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleDelete = (id: string) => {
    setDocs(prev => prev.filter(d => d.id !== id))
    if (previewDoc?.id === id) setPreviewDoc(null)
  }

  return (
    <DashboardLayout title="Scan & Download">
      <div className="space-y-6">

        <div>
          <h2 className="text-2xl font-bold text-gray-900">Scan & Download Documents</h2>
          <p className="text-gray-500 mt-1">Scan physical documents or upload files and download them</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Scan Panel */}
          <Card className="border-2 border-dashed border-blue-200 bg-blue-50/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <Camera className="w-5 h-5" /> Scan Document
              </CardTitle>
              <CardDescription>Simulate scanning a physical document</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4 py-4">
              <div className="relative w-48 h-56 bg-white border-2 border-blue-300 rounded-lg overflow-hidden shadow-inner flex items-center justify-center">
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-gray-300">
                  <FileText className="w-16 h-16" />
                  <p className="text-xs">Document Area</p>
                </div>
                {scanning && (
                  <div
                    className="absolute left-0 right-0 h-1 bg-blue-500 opacity-80 shadow-lg shadow-blue-400 transition-all duration-200"
                    style={{ top: `${scanProgress}%` }}
                  />
                )}
                <div className="absolute top-1 left-1 w-4 h-4 border-t-2 border-l-2 border-blue-500" />
                <div className="absolute top-1 right-1 w-4 h-4 border-t-2 border-r-2 border-blue-500" />
                <div className="absolute bottom-1 left-1 w-4 h-4 border-b-2 border-l-2 border-blue-500" />
                <div className="absolute bottom-1 right-1 w-4 h-4 border-b-2 border-r-2 border-blue-500" />
              </div>

              {scanning ? (
                <div className="w-full space-y-2">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span className="flex items-center gap-1"><ScanLine className="w-3 h-3" /> Scanning...</span>
                    <span>{scanProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full transition-all duration-200" style={{ width: `${scanProgress}%` }} />
                  </div>
                </div>
              ) : (
                <Button onClick={handleScan} className="w-full bg-blue-600 hover:bg-blue-700 gap-2">
                  <ScanLine className="w-4 h-4" /> Start Scan
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Upload Panel */}
          <Card className="border-2 border-dashed border-green-200 bg-green-50/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <Upload className="w-5 h-5" /> Upload Document
              </CardTitle>
              <CardDescription>Upload an existing file to add to your documents</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4 py-4">
              <div
                className="w-48 h-56 bg-white border-2 border-dashed border-green-300 rounded-lg flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-green-50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-12 h-12 text-green-300" />
                <p className="text-xs text-gray-400 text-center px-4">Click to upload PDF, JPG, PNG</p>
              </div>
              <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={handleUpload} />
              <Button
                variant="outline"
                className="w-full border-green-400 text-green-700 hover:bg-green-50 gap-2"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-4 h-4" /> Choose File
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Documents List */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Scanned Documents</CardTitle>
              <CardDescription>{docs.length} document{docs.length !== 1 ? 's' : ''} available</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => { setDocs(DUMMY_DOCS); setPreviewDoc(null) }} className="gap-1 text-xs">
              <RefreshCw className="w-3 h-3" /> Reset
            </Button>
          </CardHeader>
          <CardContent>
            {docs.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <FileText className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No documents yet. Scan or upload one.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {docs.map(d => (
                  <div key={d.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{d.name}</p>
                        <p className="text-xs text-gray-400">{d.scannedAt} · {d.pages} page{d.pages > 1 ? 's' : ''} · {d.size}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={d.status === 'ready' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                        {d.status === 'ready' ? <CheckCircle className="w-3 h-3 mr-1 inline" /> : <AlertCircle className="w-3 h-3 mr-1 inline" />}
                        {d.status}
                      </Badge>
                      <Button size="sm" variant="outline" className="gap-1 text-xs h-8" onClick={() => setPreviewDoc(previewDoc?.id === d.id ? null : d)}>
                        <Eye className="w-3 h-3" /> Preview
                      </Button>
                      <Button size="sm" className="gap-1 text-xs h-8 bg-blue-600 hover:bg-blue-700" onClick={() => handleDownload(d)} disabled={d.status !== 'ready'}>
                        <Download className="w-3 h-3" /> Download
                      </Button>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-400 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(d.id)}>
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Preview Panel */}
        {previewDoc && (
          <Card className="border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <Eye className="w-4 h-4 text-blue-600" /> Preview — {previewDoc.name}
                </CardTitle>
                <CardDescription>{previewDoc.scannedAt} · {previewDoc.pages} page{previewDoc.pages > 1 ? 's' : ''}</CardDescription>
              </div>
              <Button size="sm" variant="ghost" onClick={() => setPreviewDoc(null)}>
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent>
              {previewDoc.previewUrl ? (
                <img src={previewDoc.previewUrl} alt="preview" className="max-h-96 rounded-lg border mx-auto" />
              ) : (
                <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl h-64 flex flex-col items-center justify-center gap-3 text-gray-400">
                  <FileText className="w-16 h-16 opacity-30" />
                  <p className="text-sm font-medium">{previewDoc.name}</p>
                  <p className="text-xs">{previewDoc.pages} page{previewDoc.pages > 1 ? 's' : ''} · {previewDoc.size}</p>
                  <Button size="sm" className="mt-2 bg-blue-600 hover:bg-blue-700 gap-2" onClick={() => handleDownload(previewDoc)}>
                    <Download className="w-3 h-3" /> Download to View
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

      </div>
    </DashboardLayout>
  )
}
