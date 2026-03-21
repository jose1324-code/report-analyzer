'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
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

const fallbackBP = [
  { name: 'Mon', systolic: 120, diastolic: 80 },
  { name: 'Tue', systolic: 118, diastolic: 78 },
  { name: 'Wed', systolic: 122, diastolic: 82 },
  { name: 'Thu', systolic: 119, diastolic: 79 },
  { name: 'Fri', systolic: 121, diastolic: 81 },
  { name: 'Sat', systolic: 117, diastolic: 77 },
  { name: 'Sun', systolic: 120, diastolic: 80 },
]

const fallbackSugar = [
  { date: 'Mon', bloodSugar: 92 },
  { date: 'Tue', bloodSugar: 95 },
  { date: 'Wed', bloodSugar: 98 },
  { date: 'Thu', bloodSugar: 94 },
  { date: 'Fri', bloodSugar: 96 },
  { date: 'Sat', bloodSugar: 91 },
  { date: 'Sun', bloodSugar: 93 },
]

const fallbackLifestyle = [
  { date: 'Mon', sleep: 7, calories: 1900 },
  { date: 'Tue', sleep: 6.5, calories: 2100 },
  { date: 'Wed', sleep: 8, calories: 1800 },
  { date: 'Thu', sleep: 7.5, calories: 2000 },
  { date: 'Fri', sleep: 7, calories: 2200 },
  { date: 'Sat', sleep: 8.5, calories: 1950 },
  { date: 'Sun', sleep: 7, calories: 2050 },
]

export function Charts({ metrics = [] }: ChartsProps) {
  const hasData = metrics.length >= 2
  const slice = metrics.slice(-7)

  const trendData = hasData
    ? slice.map(m => ({ month: m.date, weight: m.weight, heartRate: m.heartRate, steps: Math.round(m.steps / 100) }))
    : fallbackTrend

  const bpData = hasData
    ? slice.map(m => ({ name: m.date, systolic: m.bloodPressureSystolic, diastolic: m.bloodPressureDiastolic }))
    : fallbackBP

  const sugarData = hasData
    ? slice.map(m => ({ date: m.date, bloodSugar: m.bloodSugar }))
    : fallbackSugar

  const lifestyleData = hasData
    ? slice.map(m => ({ date: m.date, sleep: m.sleep, calories: Math.round(m.calories / 100) }))
    : fallbackLifestyle.map(d => ({ ...d, calories: Math.round(d.calories / 100) }))

  const label = hasData ? '' : ' (sample)'

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Vitals Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Vitals Trend{label}</CardTitle>
          <p className="text-sm text-gray-500">Weight · Heart Rate · Steps (×100)</p>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend />
                <Line type="monotone" dataKey="weight" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} name="Weight (kg)" />
                <Line type="monotone" dataKey="heartRate" stroke="#ef4444" strokeWidth={2} dot={{ fill: '#ef4444' }} name="Heart Rate" />
                <Line type="monotone" dataKey="steps" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981' }} name="Steps (×100)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Blood Pressure */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Blood Pressure{label}</CardTitle>
          <p className="text-sm text-gray-500">Systolic vs Diastolic (mmHg)</p>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bpData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} domain={[40, 160]} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend />
                <Bar dataKey="systolic" fill="#f87171" name="Systolic" radius={[4, 4, 0, 0]} />
                <Bar dataKey="diastolic" fill="#60a5fa" name="Diastolic" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Blood Sugar */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Blood Sugar{label}</CardTitle>
          <p className="text-sm text-gray-500">mg/dL over time</p>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sugarData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="bloodSugar" stroke="#a855f7" fill="#e9d5ff" strokeWidth={2} name="Blood Sugar (mg/dL)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Sleep & Calories */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Sleep & Calories{label}</CardTitle>
          <p className="text-sm text-gray-500">Sleep (hrs) · Calories (×100 kcal)</p>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lifestyleData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend />
                <Line type="monotone" dataKey="sleep" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1' }} name="Sleep (hrs)" />
                <Line type="monotone" dataKey="calories" stroke="#f97316" strokeWidth={2} dot={{ fill: '#f97316' }} name="Calories (×100)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
