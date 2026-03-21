'use client'

import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { Charts } from '@/components/dashboard/charts'
import { getMedicalReports, getActivityLogs, getHealthMetrics, getUserProfile, MedicalReport, ActivityLog, DailyMetrics, UserProfile } from '@/lib/firestoreService'
import { useUser } from '@/hooks/use-user'
import { FileText, Brain, Activity, Shield, TrendingUp, TrendingDown, AlertCircle, ArrowRight, CheckCircle, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

const moduleLinks = [
  { name: 'Report Analyzer', href: '/report-analyzer', icon: FileText, color: 'bg-blue-500' },
  { name: 'Drug Info', href: '/drug-info', icon: Brain, color: 'bg-purple-500' },
  { name: 'Risk Prediction', href: '/risk-prediction', icon: Shield, color: 'bg-red-500' },
  { name: 'Health Trends', href: '/health-trends', icon: TrendingUp, color: 'bg-green-500' },
]

const statusStyles: Record<string, string> = {
  completed: 'bg-green-100 text-green-700',
  in_progress: 'bg-blue-100 text-blue-700',
  report_upload: 'bg-blue-100 text-blue-700',
  symptom_check: 'bg-purple-100 text-purple-700',
  health_metric: 'bg-green-100 text-green-700',
  chatbot_query: 'bg-orange-100 text-orange-700',
  profile_update: 'bg-gray-100 text-gray-700',
}

export default function DashboardPage() {
  const { user, ready } = useUser()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [reports, setReports] = useState<MedicalReport[]>([])
  const [activities, setActivities] = useState<ActivityLog[]>([])
  const [metrics, setMetrics] = useState<DailyMetrics[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!ready) return
    if (!user?.uid) { setLoading(false); return }
    Promise.all([
      getUserProfile(user.uid),
      getMedicalReports(user.uid),
      getActivityLogs(user.uid, 8),
      getHealthMetrics(user.uid),
    ]).then(([prof, reps, acts, mets]) => {
      setProfile(prof)
      setReports(reps)
      setActivities(acts)
      setMetrics(mets)
    }).finally(() => setLoading(false))
  }, [ready, user?.uid])

  const analyzedCount = reports.filter(r => r.status === 'Analyzed').length
  const latestMetric = metrics[metrics.length - 1]
  const prevMetric = metrics[metrics.length - 2]
  const riskReports = reports.filter(r => r.analysis?.riskLevel === 'high').length
  const normalReports = reports.filter(r => r.analysis?.riskLevel === 'low').length

  // Health score: 5 dimensions × 20 pts each
  const healthScore = latestMetric ? Math.min(100, Math.round(
    (latestMetric.steps >= 10000 ? 20 : latestMetric.steps >= 7000 ? 15 : latestMetric.steps >= 4000 ? 10 : 5) +
    (latestMetric.sleep >= 7 && latestMetric.sleep <= 9 ? 20 : latestMetric.sleep >= 6 ? 14 : 8) +
    (latestMetric.heartRate >= 60 && latestMetric.heartRate <= 80 ? 20 : latestMetric.heartRate <= 100 ? 12 : 5) +
    (latestMetric.bloodPressureSystolic < 120 ? 20 : latestMetric.bloodPressureSystolic < 130 ? 15 : latestMetric.bloodPressureSystolic < 140 ? 8 : 3) +
    (latestMetric.bloodSugar < 100 ? 20 : latestMetric.bloodSugar < 126 ? 13 : 5)
  )) : null

  const prevScore = prevMetric ? Math.min(100, Math.round(
    (prevMetric.steps >= 10000 ? 20 : prevMetric.steps >= 7000 ? 15 : prevMetric.steps >= 4000 ? 10 : 5) +
    (prevMetric.sleep >= 7 && prevMetric.sleep <= 9 ? 20 : prevMetric.sleep >= 6 ? 14 : 8) +
    (prevMetric.heartRate >= 60 && prevMetric.heartRate <= 80 ? 20 : prevMetric.heartRate <= 100 ? 12 : 5) +
    (prevMetric.bloodPressureSystolic < 120 ? 20 : prevMetric.bloodPressureSystolic < 130 ? 15 : prevMetric.bloodPressureSystolic < 140 ? 8 : 3) +
    (prevMetric.bloodSugar < 100 ? 20 : prevMetric.bloodSugar < 126 ? 13 : 5)
  )) : null

  const scoreDelta = healthScore !== null && prevScore !== null ? healthScore - prevScore : null

  const stats = [
    {
      title: 'Reports Analyzed',
      value: analyzedCount,
      sub: `${reports.length} total uploaded`,
      icon: FileText,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      trend: reports.length > 0 ? `${normalReports} normal · ${riskReports} high risk` : 'No reports yet',
      trendIcon: riskReports > 0 ? AlertCircle : CheckCircle,
      trendColor: riskReports > 0 ? 'text-red-500' : 'text-green-500',
      href: '/report-analyzer',
    },
    {
      title: 'Health Score',
      value: healthScore !== null ? `${healthScore}/100` : '—',
      sub: latestMetric ? `Updated ${latestMetric.date}` : 'No metrics yet',
      icon: Activity,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      trend: healthScore !== null
        ? scoreDelta !== null
          ? scoreDelta > 0 ? `+${scoreDelta} vs last entry` : scoreDelta < 0 ? `${scoreDelta} vs last entry` : 'No change'
          : healthScore >= 70 ? 'Good condition' : healthScore >= 40 ? 'Moderate' : 'Needs attention'
        : 'Log health metrics',
      trendIcon: scoreDelta !== null ? (scoreDelta >= 0 ? TrendingUp : TrendingDown) : (healthScore !== null && healthScore >= 70 ? TrendingUp : TrendingDown),
      trendColor: scoreDelta !== null ? (scoreDelta >= 0 ? 'text-green-500' : 'text-red-500') : (healthScore !== null && healthScore >= 70 ? 'text-green-500' : 'text-orange-500'),
      href: '/health-trends',
    },
    {
      title: 'Heart Rate',
      value: latestMetric ? `${latestMetric.heartRate} bpm` : '—',
      sub: prevMetric ? `Was ${prevMetric.heartRate} bpm` : 'No previous data',
      icon: Activity,
      iconBg: 'bg-red-100',
      iconColor: 'text-red-500',
      trend: latestMetric && prevMetric
        ? latestMetric.heartRate < prevMetric.heartRate ? `↓ ${prevMetric.heartRate - latestMetric.heartRate} bpm` : latestMetric.heartRate > prevMetric.heartRate ? `↑ ${latestMetric.heartRate - prevMetric.heartRate} bpm` : 'No change'
        : 'Track vitals',
      trendIcon: latestMetric && prevMetric && latestMetric.heartRate <= prevMetric.heartRate ? TrendingDown : TrendingUp,
      trendColor: latestMetric && prevMetric && latestMetric.heartRate < prevMetric.heartRate ? 'text-green-500' : 'text-orange-500',
      href: '/health-trends',
    },
    {
      title: 'Blood Sugar',
      value: latestMetric ? `${latestMetric.bloodSugar} mg/dL` : '—',
      sub: prevMetric ? `Was ${prevMetric.bloodSugar} mg/dL` : 'No previous data',
      icon: Brain,
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      trend: latestMetric && prevMetric
        ? latestMetric.bloodSugar < prevMetric.bloodSugar ? `↓ ${prevMetric.bloodSugar - latestMetric.bloodSugar}` : latestMetric.bloodSugar > prevMetric.bloodSugar ? `↑ ${latestMetric.bloodSugar - prevMetric.bloodSugar}` : 'No change'
        : latestMetric ? (latestMetric.bloodSugar < 100 ? 'Normal range' : 'Above normal') : 'Log metrics',
      trendIcon: latestMetric && prevMetric && latestMetric.bloodSugar <= prevMetric.bloodSugar ? TrendingDown : TrendingUp,
      trendColor: latestMetric && prevMetric && latestMetric.bloodSugar < prevMetric.bloodSugar ? 'text-green-500' : 'text-orange-500',
      href: '/health-trends',
    },
  ]

  return (
    <DashboardLayout title="My Dashboard">
      <div className="space-y-6">
        {/* Welcome */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Welcome back, {profile?.fullName?.split(' ')[0] || user?.name?.split(' ')[0] || 'User'}! 👋
            </h2>
            <p className="text-gray-500 mt-1">Here's your real-time health overview.</p>
          </div>
          <div className="flex gap-2">
            {moduleLinks.map(m => (
              <Link key={m.href} href={m.href}>
                <Button variant="outline" size="sm" className="gap-2 text-xs">
                  <m.icon className="w-3.5 h-3.5" />
                  {m.name}
                </Button>
              </Link>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map(s => (
            <Link key={s.title} href={s.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-500 mb-1">{s.title}</p>
                      <p className="text-2xl font-bold text-gray-900">{loading ? '...' : s.value}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>
                      <div className="flex items-center gap-1 mt-2">
                        <s.trendIcon className={`w-3.5 h-3.5 ${s.trendColor}`} />
                        <span className={`text-xs font-medium ${s.trendColor}`}>{s.trend}</span>
                      </div>
                    </div>
                    <div className={`p-3 rounded-xl ${s.iconBg}`}>
                      <s.icon className={`w-6 h-6 ${s.iconColor}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Health Condition Summary */}
        {latestMetric && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">My Current Health Condition</CardTitle>
              <p className="text-sm text-gray-500">Based on your latest logged metrics — {latestMetric.date}</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                {[
                  { label: 'Heart Rate', value: `${latestMetric.heartRate} bpm`, ok: latestMetric.heartRate >= 60 && latestMetric.heartRate <= 100, delta: prevMetric ? latestMetric.heartRate - prevMetric.heartRate : null, lowerIsBetter: true },
                  { label: 'Blood Pressure', value: `${latestMetric.bloodPressureSystolic}/${latestMetric.bloodPressureDiastolic}`, ok: latestMetric.bloodPressureSystolic < 130, delta: prevMetric ? latestMetric.bloodPressureSystolic - prevMetric.bloodPressureSystolic : null, lowerIsBetter: true },
                  { label: 'Blood Sugar', value: `${latestMetric.bloodSugar} mg/dL`, ok: latestMetric.bloodSugar < 100, delta: prevMetric ? latestMetric.bloodSugar - prevMetric.bloodSugar : null, lowerIsBetter: true },
                  { label: 'Weight', value: `${latestMetric.weight} kg`, ok: true, delta: prevMetric ? latestMetric.weight - prevMetric.weight : null, lowerIsBetter: true },
                  { label: 'Steps Today', value: latestMetric.steps.toLocaleString(), ok: latestMetric.steps >= 7000, delta: prevMetric ? latestMetric.steps - prevMetric.steps : null, lowerIsBetter: false },
                  { label: 'Sleep', value: `${latestMetric.sleep} hrs`, ok: latestMetric.sleep >= 7, delta: prevMetric ? latestMetric.sleep - prevMetric.sleep : null, lowerIsBetter: false },
                  { label: 'Calories', value: `${latestMetric.calories} kcal`, ok: true, delta: prevMetric ? latestMetric.calories - prevMetric.calories : null, lowerIsBetter: false },
                ].map(item => {
                  const improved = item.delta !== null ? (item.lowerIsBetter ? item.delta < 0 : item.delta > 0) : null
                  return (
                    <div key={item.label} className={`p-3 rounded-xl border-2 ${item.ok ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'}`}>
                      <p className="text-xs text-gray-500 mb-1">{item.label}</p>
                      <p className="text-sm font-bold text-gray-900">{item.value}</p>
                      <div className="flex items-center justify-between mt-1">
                        <div className={`flex items-center gap-1 text-xs ${item.ok ? 'text-green-600' : 'text-orange-600'}`}>
                          {item.ok ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                          {item.ok ? 'Normal' : 'Watch'}
                        </div>
                        {item.delta !== null && item.delta !== 0 && (
                          <span className={`text-xs font-medium ${improved ? 'text-green-600' : 'text-red-500'}`}>
                            {item.delta > 0 ? '+' : ''}{typeof item.delta === 'number' && !Number.isInteger(item.delta) ? item.delta.toFixed(1) : item.delta}
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Report Risk Breakdown */}
        {reports.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: 'Low Risk Reports', count: normalReports, color: 'bg-green-500', light: 'bg-green-50 border-green-200', text: 'text-green-700' },
              { label: 'Medium Risk Reports', count: reports.filter(r => r.analysis?.riskLevel === 'medium').length, color: 'bg-yellow-500', light: 'bg-yellow-50 border-yellow-200', text: 'text-yellow-700' },
              { label: 'High Risk Reports', count: riskReports, color: 'bg-red-500', light: 'bg-red-50 border-red-200', text: 'text-red-700' },
            ].map(item => (
              <Card key={item.label} className={`border-2 ${item.light}`}>
                <CardContent className="p-6 flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full ${item.color} flex items-center justify-center text-white text-xl font-bold`}>
                    {item.count}
                  </div>
                  <div>
                    <p className={`font-semibold ${item.text}`}>{item.label}</p>
                    <p className="text-xs text-gray-500">out of {reports.length} total</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Charts */}
        <Charts metrics={metrics} />

        {/* Recent Activity */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">My Recent Activity</CardTitle>
              <p className="text-sm text-gray-500">Your latest actions across all modules</p>
            </div>
            <Link href="/report-analyzer">
              <Button variant="outline" size="sm" className="gap-1 text-xs">
                View All <ArrowRight className="w-3 h-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-gray-400 text-center py-6">Loading activity...</p>
            ) : activities.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Clock className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No activity yet. Start using the modules!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activities.map((act, i) => (
                  <div key={act.id || i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${statusStyles[act.type]?.includes('blue') ? 'bg-blue-500' : statusStyles[act.type]?.includes('purple') ? 'bg-purple-500' : statusStyles[act.type]?.includes('green') ? 'bg-green-500' : 'bg-orange-500'}`} />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{act.title}</p>
                        <p className="text-xs text-gray-500">{act.description}</p>
                      </div>
                    </div>
                    <Badge className={`text-xs ${statusStyles[act.type] || 'bg-gray-100 text-gray-600'}`}>
                      {act.type.replace('_', ' ')}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
