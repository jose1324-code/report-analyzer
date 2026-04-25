'use client'

import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Copy, Link, User, QrCode } from 'lucide-react'
import { useUser } from '@/hooks/use-user'
import { savePatientProfile, getPatientProfile, PatientProfile } from '@/lib/firestoreService'

// Dummy QR code rendered as SVG grid
function DummyQRCode({ value }: { value: string }) {
  const size = 10
  const cells = Array.from({ length: size * size }, (_, i) => {
    const char = value.charCodeAt(i % value.length)
    return (char + i) % 3 !== 0
  })
  return (
    <div className="border-4 border-white shadow bg-white p-2 inline-block">
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${size}, 16px)`, gap: 0 }}>
        {cells.map((filled, i) => (
          <div key={i} style={{ width: 16, height: 16, background: filled ? '#000' : '#fff' }} />
        ))}
      </div>
    </div>
  )
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between text-sm py-1 border-b last:border-0">
      <span className="text-gray-500">{label}</span>
      <span className={`font-medium text-gray-900 ${mono ? 'font-mono text-xs' : ''}`}>{value}</span>
    </div>
  )
}

export default function PatientDashboardPage() {
  const { user, ready } = useUser()
  const [profile, setProfile] = useState<PatientProfile | null>(null)
  const [accessLink, setAccessLink] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!ready || !user?.uid) return

    getPatientProfile(user.uid).then(async (p) => {
      if (p) {
        setProfile(p)
      } else {
        const dummy: Omit<PatientProfile, 'patientId'> = {
          name: user.fullName || user.name || 'Demo Patient',
          age: 32,
          condition: 'Hypertension, Type 2 Diabetes',
          bloodType: 'O+',
          email: user.email,
        }
        await savePatientProfile(user.uid, dummy)
        setProfile({ patientId: user.uid, ...dummy })
      }
    })

    setAccessLink(`${window.location.origin}/doctor-login?patientId=${user.uid}`)
  }, [ready, user?.uid])

  const handleCopy = () => {
    navigator.clipboard.writeText(accessLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!ready) {
    return (
      <DashboardLayout title="Patient Dashboard">
        <p className="p-6 text-gray-500">Loading...</p>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Patient Dashboard">
      <div className="space-y-6 max-w-3xl">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Patient Dashboard</h2>
          <p className="text-gray-500 mt-1">Share your health data securely with your doctor</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Patient Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" /> My Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              {profile ? (
                <>
                  <Row label="Name" value={profile.name} />
                  <Row label="Age" value={String(profile.age)} />
                  <Row label="Condition" value={profile.condition} />
                  <Row label="Blood Type" value={profile.bloodType || '—'} />
                  <Row label="Patient ID" value={profile.patientId} mono />
                </>
              ) : (
                <p className="text-gray-400 text-sm">Loading profile...</p>
              )}
            </CardContent>
          </Card>

          {/* QR Code */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="w-5 h-5" /> Access QR Code
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-3">
              {user?.uid
                ? <DummyQRCode value={user.uid} />
                : <div className="w-40 h-40 bg-gray-100 rounded animate-pulse" />
              }
              <p className="text-xs text-gray-400 text-center">
                Show this to your doctor or share the link below
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Doctor Access Link */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link className="w-5 h-5" /> Doctor Access Link
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-gray-500">
              Share this link with your doctor. They will log in and view your health data.
            </p>
            <div className="flex items-center gap-2 bg-gray-50 border rounded-lg px-3 py-2">
              <span className="text-sm text-gray-700 truncate flex-1">{accessLink}</span>
              <Button size="sm" variant="outline" onClick={handleCopy}>
                <Copy className="w-4 h-4 mr-1" />
                {copied ? 'Copied!' : 'Copy'}
              </Button>
            </div>
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700"
              onClick={() => window.open(accessLink, '_blank')}
            >
              Open Doctor Login Page
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
