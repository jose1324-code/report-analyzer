'use client'

import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { QrCode, Download, Share2, Shield, Clock, Users, CheckCircle, AlertCircle } from 'lucide-react'

export default function DoctorAccessPage() {
  return (
    <DashboardLayout title="Doctor Access">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Share Your Health Records</h2>
          <p className="text-gray-500 mt-1">Generate secure QR codes to share your health information with healthcare providers</p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* QR Code Card */}
          <Card>
            <CardHeader>
              <CardTitle>My Access QR Code</CardTitle>
              <CardDescription>Show this to your healthcare provider</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center">
                <div className="w-64 h-64 bg-white border-2 border-gray-200 rounded-lg flex items-center justify-center mb-4 p-4">
                  <div className="w-full h-full bg-gray-100 rounded flex items-center justify-center">
                    <QrCode className="w-48 h-48 text-gray-800" />
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-4 h-4 text-orange-500" />
                  <span className="text-sm text-gray-500">Expires in 24 hours</span>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Access Settings */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-600" />
                  What I&apos;m Sharing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { label: 'Medical History', enabled: true },
                    { label: 'Lab Results', enabled: true },
                    { label: 'Current Medications', enabled: true },
                    { label: 'Allergies', enabled: true },
                    { label: 'Imaging Reports', enabled: false },
                    { label: 'Mental Health Records', enabled: false },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">{item.label}</span>
                      <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${
                        item.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {item.enabled && <CheckCircle className="w-3 h-3" />}
                        {item.enabled ? 'Shared' : 'Not Shared'}
                      </span>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4">
                  Customize Sharing
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Access History */}
        <Card>
          <CardHeader>
            <CardTitle>Who Has Accessed My Records</CardTitle>
            <CardDescription>History of healthcare providers who viewed your information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { doctor: 'Dr. Sarah Smith', specialty: 'Primary Care', date: 'Today, 10:30 AM', action: 'Viewed medical history and lab results', avatar: 'doctor1' },
                { doctor: 'Dr. Michael Park', specialty: 'Cardiology', date: 'Yesterday', action: 'Viewed medical history and medications', avatar: 'doctor2' },
                { doctor: 'Dr. Emily Wong', specialty: 'Endocrinology', date: 'Jan 12, 2024', action: 'Viewed lab results', avatar: 'doctor3' },
              ].map((entry, i) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{entry.doctor}</p>
                    <p className="text-sm text-gray-500">{entry.specialty}</p>
                    <p className="text-xs text-gray-400 mt-1">{entry.action}</p>
                  </div>
                  <span className="text-sm text-gray-500">{entry.date}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

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
