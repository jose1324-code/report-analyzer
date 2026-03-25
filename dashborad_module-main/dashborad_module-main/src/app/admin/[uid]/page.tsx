'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  getUserProfile, getMedicalReports, getHealthMetrics, getActivityLogs,
  UserProfile, MedicalReport, DailyMetrics, ActivityLog
} from '@/lib/firestoreService'
import { Charts } from '@/components/dashboard/charts'
import { Mail, Phone, MapPin, Calendar, ArrowLeft, Activity, FileText, AlertCircle, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function AdminUserDetailPage() {
  const { uid } = useParams<{ uid: string }>()

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [reports, setReports] = useState<MedicalReport[]>([])
  const [metrics, setMetrics] = useState<DailyMetrics[]>([])
  const [activities, setActivities] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!uid) return
    Promise.all([
      getUserProfile(uid),
      getMedicalReports(uid),
      getHealthMetrics(uid),
      getActivityLogs(uid, 10),
    ]).then(([prof, reps, mets, acts]) => {
      setProfile(prof)
      setReports(reps)
      setMetrics(mets)
      setActivities(acts)
    }).finally(() => setLoading(false))
  }, [uid])

  const latestMetric = metrics[metrics.length - 1]
  const analyzedCount = reports.filter(r => r.status === 'Analyzed').length
  const highRisk = reports.filter(r => r.analysis?.riskLevel === 'high').length

  const initials = (profile?.fullName || 'U').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  if (loading) {
    return (
      <DashboardLayout title="User Details">
        <p className="text-sm text-gray-400 text-center py-20">Loading user data...</p>
      </DashboardLayout>
    )
  }

  if (!profile) {
    return (
      <DashboardLayout title="User Details">
        <p className="text-sm text-red-400 text-center py-20">User not found.</p>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title={`${profile.fullName}'s Dashboard`}>
      <div className="space-y-6">

        {/* Back */}
        <Link href="/admin">
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Users
          </Button>
        </Link>

        {/* Profile Header */}
        <Card>
          <CardContent className="p-6 flex flex-col md:flex-row items-center gap-6">
            <Avatar className="w-20 h-20">
              <AvatarImage src={profile.photoURL || undefined} />
              <AvatarFallback className="bg-blue-100 text-blue-600 text-2xl font-bold">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1 text-center md:text-left">
              <h2 className="text-2xl font-bold text-gray-900">{profile.fullName}</h2>
              <p className="text-sm text-gray-500 flex items-center justify-center md:justify-start gap-1">
                <Mail className="w-4 h-4" /> {profile.email}
              </p>
              {profile.phone && (
                <p className="text-sm text-gray-500 flex items-center justify-center md:justify-start gap-1">
                  <Phone className="w-4 h-4" /> {profile.phone}
                </p>
              )}
              {profile.address && (
                <p className="text-sm text-gray-500 flex items-center justify-center md:justify-start gap-1">
                  <MapPin className="w-4 h-4" /> {profile.address}
                </p>
              )}
              {profile.dateOfBirth && (
                <p className="text-sm text-gray-500 flex items-center justify-center md:justify-start gap-1">
                  <Calendar className="w-4 h-4" /> {profile.dateOfBirth}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2 items-end">
              {profile.bloodType && <Badge className="bg-red-100 text-red-700">Blood: {profile.bloodType}</Badge>}
              <Badge className="bg-green-100 text-green-700">Active Member</Badge>
              <p className="text-xs text-gray-400">ID: {uid.slice(0, 12).toUpperCase()}</p>
            </div>
          </CardContent>
        </Card>

        {/* Health + Conditions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Known Conditions</CardTitle></CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {profile.conditions?.length
                ? profile.conditions.map((c, i) => <Badge key={i} variant="outline">{c}</Badge>)
                : <p className="text-sm text-gray-400">None recorded</p>}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">Allergies</CardTitle></CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {profile.allergies?.length
                ? profile.allergies.map((a, i) => <Badge key={i} variant="outline" className="border-red-200 text-red-700">{a}</Badge>)
                : <p className="text-sm text-gray-400">None recorded</p>}
            </CardContent>
          </Card>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Reports Uploaded', value: reports.length, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Analyzed', value: analyzedCount, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'High Risk', value: highRisk, icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
            { label: 'Metrics Logged', value: metrics.length, icon: Activity, color: 'text-purple-600', bg: 'bg-purple-50' },
          ].map(s => (
            <Card key={s.label}>
              <CardContent className={`p-5 flex items-center gap-3 ${s.bg}`}>
                <s.icon className={`w-6 h-6 ${s.color}`} />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                  <p className="text-xs text-gray-500">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Latest Vitals */}
        {latestMetric && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Latest Vitals — {latestMetric.date}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                {[
                  { label: 'Heart Rate', value: `${latestMetric.heartRate} bpm`, ok: latestMetric.heartRate >= 60 && latestMetric.heartRate <= 100 },
                  { label: 'BP', value: `${latestMetric.bloodPressureSystolic}/${latestMetric.bloodPressureDiastolic}`, ok: latestMetric.bloodPressureSystolic < 130 },
                  { label: 'Blood Sugar', value: `${latestMetric.bloodSugar} mg/dL`, ok: latestMetric.bloodSugar < 100 },
                  { label: 'Weight', value: `${latestMetric.weight} kg`, ok: true },
                  { label: 'Steps', value: latestMetric.steps.toLocaleString(), ok: latestMetric.steps >= 7000 },
                  { label: 'Sleep', value: `${latestMetric.sleep} hrs`, ok: latestMetric.sleep >= 7 },
                  { label: 'Calories', value: `${latestMetric.calories} kcal`, ok: true },
                ].map(item => (
                  <div key={item.label} className={`p-3 rounded-xl border-2 ${item.ok ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'}`}>
                    <p className="text-xs text-gray-500">{item.label}</p>
                    <p className="text-sm font-bold text-gray-900 mt-1">{item.value}</p>
                    <p className={`text-xs mt-1 ${item.ok ? 'text-green-600' : 'text-orange-600'}`}>
                      {item.ok ? '✓ Normal' : '⚠ Watch'}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Charts */}
        {metrics.length > 0 && <Charts metrics={metrics} />}

        {/* Medical Reports */}
        {reports.length > 0 && (
          <Card>
            <CardHeader><CardTitle className="text-base">Medical Reports</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {reports.map(r => (
                <div key={r.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{r.fileName}</p>
                    <p className="text-xs text-gray-500">{r.uploadDate} · {(r.fileSize / 1024).toFixed(1)} KB</p>
                    {r.analysis?.summary && <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{r.analysis.summary}</p>}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge className={r.status === 'Analyzed' ? 'bg-green-100 text-green-700' : r.status === 'Failed' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}>
                      {r.status}
                    </Badge>
                    {r.analysis?.riskLevel && (
                      <Badge className={r.analysis.riskLevel === 'high' ? 'bg-red-100 text-red-700' : r.analysis.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}>
                        {r.analysis.riskLevel} risk
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Recent Activity */}
        {activities.length > 0 && (
          <Card>
            <CardHeader><CardTitle className="text-base">Recent Activity</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {activities.map((act, i) => (
                <div key={act.id || i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{act.title}</p>
                    <p className="text-xs text-gray-500">{act.description}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">{act.type.replace('_', ' ')}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Emergency Contact */}
        {profile.emergencyContact?.name && (
          <Card>
            <CardHeader><CardTitle className="text-base">Emergency Contact</CardTitle></CardHeader>
            <CardContent className="flex gap-4 text-sm text-gray-700">
              <span className="font-medium">{profile.emergencyContact.name}</span>
              {profile.emergencyContact.relationship && <span className="text-gray-400">({profile.emergencyContact.relationship})</span>}
              {profile.emergencyContact.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{profile.emergencyContact.phone}</span>}
            </CardContent>
          </Card>
        )}

      </div>
    </DashboardLayout>
  )
}
