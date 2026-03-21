'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { TrendingUp, TrendingDown, Activity, Heart, Droplet, Footprints, Moon, Flame, Plus, Trash2 } from 'lucide-react'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'
import { addHealthMetric, getHealthMetrics, deleteHealthMetric, DailyMetrics } from '@/lib/healthService'
import { useToast } from '@/hooks/use-toast'
import { useUser } from '@/hooks/use-user'

interface TodayInput {
  heartRate: string
  bloodPressureSystolic: string
  bloodPressureDiastolic: string
  bloodSugar: string
  weight: string
  steps: string
  sleep: string
  calories: string
}

export default function HealthTrendsPage() {
  const { toast } = useToast()
  const { user, ready } = useUser()
  const [weeklyData, setWeeklyData] = useState<DailyMetrics[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  const [todayInput, setTodayInput] = useState<TodayInput>({
    heartRate: '',
    bloodPressureSystolic: '',
    bloodPressureDiastolic: '',
    bloodSugar: '',
    weight: '',
    steps: '',
    sleep: '',
    calories: ''
  })

  const [showInput, setShowInput] = useState(false)

  useEffect(() => {
    if (!ready || !user?.uid) return
    loadHealthData()
  }, [ready, user?.uid])

  const loadHealthData = async () => {
    if (!user?.uid) return
    try {
      const data = await getHealthMetrics(user.uid)
      console.log('Loaded data:', data)
      setWeeklyData(data)
    } catch (error) {
      console.error('Error loading health data:', error)
      toast({
        title: 'Error',
        description: 'Failed to load health data: ' + (error as Error).message,
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof TodayInput, value: string) => {
    setTodayInput(prev => ({ ...prev, [field]: value }))
  }

  const handleDeleteRecord = async (metricId: string, date: string) => {
    if (!metricId) {
      toast({
        title: 'Error',
        description: 'Cannot delete record without ID',
        variant: 'destructive'
      })
      return
    }

    if (!confirm(`Are you sure you want to delete the record for ${date}?`)) {
      return
    }

    setDeleting(metricId)
    try {
      await deleteHealthMetric(user.uid, metricId)
      await loadHealthData()
      toast({
        title: 'Success',
        description: 'Record deleted successfully'
      })
    } catch (error) {
      console.error('Error deleting record:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete: ' + (error as Error).message,
        variant: 'destructive'
      })
    } finally {
      setDeleting(null)
    }
  }

  const handleAddToday = async () => {
    const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    
    const newEntry: DailyMetrics = {
      date: today,
      heartRate: parseFloat(todayInput.heartRate) || 0,
      bloodPressureSystolic: parseFloat(todayInput.bloodPressureSystolic) || 0,
      bloodPressureDiastolic: parseFloat(todayInput.bloodPressureDiastolic) || 0,
      bloodSugar: parseFloat(todayInput.bloodSugar) || 0,
      weight: parseFloat(todayInput.weight) || 0,
      steps: parseFloat(todayInput.steps) || 0,
      sleep: parseFloat(todayInput.sleep) || 0,
      calories: parseFloat(todayInput.calories) || 0
    }

    if (!user?.uid) return
    setSaving(true)
    try {
      await addHealthMetric(user.uid, newEntry)
      await loadHealthData()
      toast({
        title: 'Success',
        description: 'Health data saved successfully'
      })
      setTodayInput({
        heartRate: '',
        bloodPressureSystolic: '',
        bloodPressureDiastolic: '',
        bloodSugar: '',
        weight: '',
        steps: '',
        sleep: '',
        calories: ''
      })
      setShowInput(false)
    } catch (error) {
      console.error('Error saving health data:', error)
      toast({
        title: 'Error',
        description: 'Failed to save: ' + (error as Error).message,
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
    }
  }

  const avgHeartRate = Math.round(weeklyData.reduce((sum, d) => sum + d.heartRate, 0) / weeklyData.length)
  const avgBloodPressure = `${Math.round(weeklyData.reduce((sum, d) => sum + d.bloodPressureSystolic, 0) / weeklyData.length)}/${Math.round(weeklyData.reduce((sum, d) => sum + d.bloodPressureDiastolic, 0) / weeklyData.length)}`
  const avgBloodSugar = Math.round(weeklyData.reduce((sum, d) => sum + d.bloodSugar, 0) / weeklyData.length)
  const avgWeight = (weeklyData.reduce((sum, d) => sum + d.weight, 0) / weeklyData.length).toFixed(1)

  const vitals = [
    { name: 'Heart Rate', value: `${avgHeartRate} bpm`, icon: Heart, color: 'text-red-500', bg: 'bg-red-100' },
    { name: 'Blood Pressure', value: avgBloodPressure, icon: Activity, color: 'text-blue-500', bg: 'bg-blue-100' },
    { name: 'Blood Sugar', value: `${avgBloodSugar} mg/dL`, icon: Droplet, color: 'text-purple-500', bg: 'bg-purple-100' },
    { name: 'Weight', value: `${avgWeight} kg`, icon: TrendingDown, color: 'text-green-500', bg: 'bg-green-100' },
  ]

  return (
    <DashboardLayout title="Health Trends Analysis">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">My Health Trends</h2>
            <p className="text-gray-500 mt-1">Track your health metrics and see your progress over time</p>
          </div>
          <Button 
            onClick={() => setShowInput(!showInput)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Today's Data
          </Button>
        </div>

        {showInput && (
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle>Enter Today's Health Metrics</CardTitle>
              <CardDescription>Fill in your daily health measurements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label>Heart Rate (bpm)</Label>
                  <Input type="number" placeholder="e.g., 72" value={todayInput.heartRate} onChange={(e) => handleInputChange('heartRate', e.target.value)} />
                </div>
                <div>
                  <Label>BP Systolic</Label>
                  <Input type="number" placeholder="e.g., 120" value={todayInput.bloodPressureSystolic} onChange={(e) => handleInputChange('bloodPressureSystolic', e.target.value)} />
                </div>
                <div>
                  <Label>BP Diastolic</Label>
                  <Input type="number" placeholder="e.g., 80" value={todayInput.bloodPressureDiastolic} onChange={(e) => handleInputChange('bloodPressureDiastolic', e.target.value)} />
                </div>
                <div>
                  <Label>Blood Sugar (mg/dL)</Label>
                  <Input type="number" placeholder="e.g., 95" value={todayInput.bloodSugar} onChange={(e) => handleInputChange('bloodSugar', e.target.value)} />
                </div>
                <div>
                  <Label>Weight (kg)</Label>
                  <Input type="number" placeholder="e.g., 74" value={todayInput.weight} onChange={(e) => handleInputChange('weight', e.target.value)} />
                </div>
                <div>
                  <Label>Steps</Label>
                  <Input type="number" placeholder="e.g., 10000" value={todayInput.steps} onChange={(e) => handleInputChange('steps', e.target.value)} />
                </div>
                <div>
                  <Label>Sleep (hours)</Label>
                  <Input type="number" step="0.5" placeholder="e.g., 7.5" value={todayInput.sleep} onChange={(e) => handleInputChange('sleep', e.target.value)} />
                </div>
                <div>
                  <Label>Calories</Label>
                  <Input type="number" placeholder="e.g., 2000" value={todayInput.calories} onChange={(e) => handleInputChange('calories', e.target.value)} />
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <Button onClick={handleAddToday} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
                  {saving ? 'Saving...' : "Save Today's Data"}
                </Button>
                <Button onClick={() => setShowInput(false)} variant="outline">Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {vitals.map((vital) => (
                <Card key={vital.name}>
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 rounded-lg ${vital.bg} flex items-center justify-center mb-4`}>
                      <vital.icon className={`w-6 h-6 ${vital.color}`} />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{vital.value}</p>
                    <p className="text-sm text-gray-500 mt-1">{vital.name} (Avg)</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Heart Rate Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={weeklyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="heartRate" stroke="#ef4444" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Blood Pressure</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={weeklyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="bloodPressureSystolic" stroke="#3b82f6" name="Systolic" />
                        <Line type="monotone" dataKey="bloodPressureDiastolic" stroke="#8b5cf6" name="Diastolic" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Blood Sugar</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={weeklyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Area type="monotone" dataKey="bloodSugar" stroke="#a855f7" fill="#e9d5ff" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Daily Steps</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={weeklyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Area type="monotone" dataKey="steps" stroke="#10b981" fill="#86efac" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="text-base">Daily Records</CardTitle>
                <CardDescription>All entries ({weeklyData.length})</CardDescription>
              </CardHeader>
              <CardContent className="max-h-[800px] overflow-y-auto">
                <div className="space-y-3">
                  {weeklyData.slice().reverse().map((day, index) => (
                    <div key={day.id || index} className="p-3 bg-gray-50 rounded-lg border hover:border-blue-300 relative group">
                      <div className="flex justify-between mb-2">
                        <span className="font-semibold">{day.date}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">Entry #{weeklyData.length - index}</span>
                          <button
                            onClick={() => handleDeleteRecord(day.id!, day.date)}
                            disabled={deleting === day.id}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-100 rounded"
                            title="Delete record"
                          >
                            {deleting === day.id ? (
                              <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4 text-red-500" />
                            )}
                          </button>
                        </div>
                      </div>
                      <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-600 flex items-center gap-1">
                            <Heart className="w-3 h-3 text-red-500" />HR
                          </span>
                          <span className="font-medium">{day.heartRate} bpm</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 flex items-center gap-1">
                            <Activity className="w-3 h-3 text-blue-500" />BP
                          </span>
                          <span className="font-medium">{day.bloodPressureSystolic}/{day.bloodPressureDiastolic}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 flex items-center gap-1">
                            <Droplet className="w-3 h-3 text-purple-500" />Sugar
                          </span>
                          <span className="font-medium">{day.bloodSugar}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 flex items-center gap-1">
                            <TrendingDown className="w-3 h-3 text-green-500" />Weight
                          </span>
                          <span className="font-medium">{day.weight} kg</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 flex items-center gap-1">
                            <Footprints className="w-3 h-3 text-orange-500" />Steps
                          </span>
                          <span className="font-medium">{day.steps.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 flex items-center gap-1">
                            <Moon className="w-3 h-3 text-indigo-500" />Sleep
                          </span>
                          <span className="font-medium">{day.sleep}h</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 flex items-center gap-1">
                            <Flame className="w-3 h-3 text-red-500" />Cal
                          </span>
                          <span className="font-medium">{day.calories}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
