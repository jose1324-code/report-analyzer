'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts'
import { DailyMetrics } from '@/lib/firestoreService'

const tooltipStyle = {
  backgroundColor: 'white',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
}

interface ChartsProps {
  metrics?: DailyMetrics[]
}

const fallbackTrend = [
  { month: 'Aug', weight: 78, heartRate: 75, steps: 65 },
  { month: 'Sep', weight: 77, heartRate: 72, steps: 72 },
  { month: 'Oct', weight: 76, heartRate: 70, steps: 80 },
  { month: 'Nov', weight: 75.5, heartRate: 72, steps: 75 },
  { month: 'Dec', weight: 75, heartRate: 68, steps: 85 },
  { month: 'Jan', weight: 74, heartRate: 68, steps: 92 },
]

const fallbackAdherence = [
  { name: 'Mon', taken: 3, scheduled: 3 },
  { name: 'Tue', taken: 3, scheduled: 3 },
  { name: 'Wed', taken: 2, scheduled: 3 },
  { name: 'Thu', taken: 3, scheduled: 3 },
  { name: 'Fri', taken: 3, scheduled: 3 },
  { name: 'Sat', taken: 3, scheduled: 3 },
  { name: 'Sun', taken: 2, scheduled: 3 },
]

export function Charts({ metrics = [] }: ChartsProps) {
  const trendData = metrics.length >= 2
    ? metrics.slice(-6).map(m => ({
        month: m.date,
        weight: m.weight,
        heartRate: m.heartRate,
        steps: Math.round(m.steps / 100),
      }))
    : fallbackTrend

  const bpData = metrics.length >= 2
    ? metrics.slice(-7).map(m => ({
        name: m.date,
        systolic: m.bloodPressureSystolic,
        diastolic: m.bloodPressureDiastolic,
      }))
    : fallbackAdherence.map(d => ({ name: d.name, systolic: 120, diastolic: 80 }))

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">My Health Progress</CardTitle>
          <p className="text-sm text-gray-500">
            {metrics.length >= 2 ? 'Based on your logged health metrics' : 'Sample data — log metrics to see yours'}
          </p>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend />
                <Line type="monotone" dataKey="weight" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} name="Weight (kg)" />
                <Line type="monotone" dataKey="heartRate" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981' }} name="Heart Rate (bpm)" />
                <Line type="monotone" dataKey="steps" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b' }} name="Steps (×100)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Blood Pressure Trend</CardTitle>
          <p className="text-sm text-gray-500">
            {metrics.length >= 2 ? 'Systolic vs Diastolic over time' : 'Sample data — log metrics to see yours'}
          </p>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bpData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend />
                <Bar dataKey="systolic" fill="#f87171" name="Systolic" radius={[4, 4, 0, 0]} />
                <Bar dataKey="diastolic" fill="#60a5fa" name="Diastolic" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
