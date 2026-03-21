'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Activity, TrendingUp, AlertTriangle, Heart, Brain, Wind, Zap, Target, CheckCircle, Loader2 } from 'lucide-react'

interface HealthData {
  age: string
  gender: string
  weight: string
  height: string
  bloodPressureSystolic: string
  bloodPressureDiastolic: string
  cholesterol: string
  bloodSugar: string
  smokingStatus: string
  exerciseFrequency: string
  alcoholConsumption: string
  sleepHours: string
  stressLevel: string
  familyHistoryDiabetes: string
  familyHistoryHeart: string
}

interface RiskAnalysis {
  overallScore: number
  riskLevel: string
  categories: {
    name: string
    score: number
    level: string
    icon: string
  }[]
  recommendations: {
    category: string
    message: string
    emoji: string
  }[]
  positiveFactors: string[]
  improvementAreas: string[]
}

export default function RiskPredictionPage() {
  const [healthData, setHealthData] = useState<HealthData>({
    age: '',
    gender: '',
    weight: '',
    height: '',
    bloodPressureSystolic: '',
    bloodPressureDiastolic: '',
    cholesterol: '',
    bloodSugar: '',
    smokingStatus: '',
    exerciseFrequency: '',
    alcoholConsumption: '',
    sleepHours: '',
    stressLevel: '',
    familyHistoryDiabetes: '',
    familyHistoryHeart: ''
  })

  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<RiskAnalysis | null>(null)

  const handleInputChange = (field: keyof HealthData, value: string) => {
    setHealthData(prev => ({ ...prev, [field]: value }))
  }

  const handleAnalyze = async () => {
    if (!healthData.age || !healthData.gender || !healthData.weight || !healthData.height) {
      alert('Please fill in at least Age, Gender, Weight, and Height')
      return
    }

    setIsAnalyzing(true)

    try {
      const response = await fetch('/api/risk-prediction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(healthData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Analysis failed')
      }

      setAnalysis(data)
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getIconComponent = (iconName: string) => {
    const icons: any = { Heart, Activity, Wind, Brain, Zap }
    return icons[iconName] || Activity
  }

  return (
    <DashboardLayout title="Health Risk Prediction">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Health Risk Assessment</h2>
          <p className="text-gray-500 mt-1">AI-powered prediction based on your health data</p>
        </div>

        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle>Enter Your Health Information</CardTitle>
            <CardDescription>Provide accurate information for better risk assessment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Basic Info */}
              <div>
                <Label>Age *</Label>
                <Input 
                  type="number" 
                  placeholder="e.g., 35"
                  value={healthData.age}
                  onChange={(e) => handleInputChange('age', e.target.value)}
                />
              </div>
              <div>
                <Label>Gender *</Label>
                <select 
                  className="w-full h-10 px-3 rounded-md border border-gray-300"
                  value={healthData.gender}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                >
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <Label>Weight (kg) *</Label>
                <Input 
                  type="number" 
                  placeholder="e.g., 70"
                  value={healthData.weight}
                  onChange={(e) => handleInputChange('weight', e.target.value)}
                />
              </div>
              <div>
                <Label>Height (cm) *</Label>
                <Input 
                  type="number" 
                  placeholder="e.g., 170"
                  value={healthData.height}
                  onChange={(e) => handleInputChange('height', e.target.value)}
                />
              </div>

              {/* Vital Signs */}
              <div>
                <Label>Blood Pressure (Systolic)</Label>
                <Input 
                  type="number" 
                  placeholder="e.g., 120"
                  value={healthData.bloodPressureSystolic}
                  onChange={(e) => handleInputChange('bloodPressureSystolic', e.target.value)}
                />
              </div>
              <div>
                <Label>Blood Pressure (Diastolic)</Label>
                <Input 
                  type="number" 
                  placeholder="e.g., 80"
                  value={healthData.bloodPressureDiastolic}
                  onChange={(e) => handleInputChange('bloodPressureDiastolic', e.target.value)}
                />
              </div>
              <div>
                <Label>Cholesterol (mg/dL)</Label>
                <Input 
                  type="number" 
                  placeholder="e.g., 200"
                  value={healthData.cholesterol}
                  onChange={(e) => handleInputChange('cholesterol', e.target.value)}
                />
              </div>
              <div>
                <Label>Blood Sugar (mg/dL)</Label>
                <Input 
                  type="number" 
                  placeholder="e.g., 95"
                  value={healthData.bloodSugar}
                  onChange={(e) => handleInputChange('bloodSugar', e.target.value)}
                />
              </div>

              {/* Lifestyle */}
              <div>
                <Label>Smoking Status</Label>
                <select 
                  className="w-full h-10 px-3 rounded-md border border-gray-300"
                  value={healthData.smokingStatus}
                  onChange={(e) => handleInputChange('smokingStatus', e.target.value)}
                >
                  <option value="">Select</option>
                  <option value="never">Never</option>
                  <option value="former">Former</option>
                  <option value="current">Current</option>
                </select>
              </div>
              <div>
                <Label>Exercise (days/week)</Label>
                <Input 
                  type="number" 
                  placeholder="e.g., 3"
                  value={healthData.exerciseFrequency}
                  onChange={(e) => handleInputChange('exerciseFrequency', e.target.value)}
                />
              </div>
              <div>
                <Label>Alcohol (drinks/week)</Label>
                <Input 
                  type="number" 
                  placeholder="e.g., 2"
                  value={healthData.alcoholConsumption}
                  onChange={(e) => handleInputChange('alcoholConsumption', e.target.value)}
                />
              </div>
              <div>
                <Label>Sleep (hours/night)</Label>
                <Input 
                  type="number" 
                  placeholder="e.g., 7"
                  value={healthData.sleepHours}
                  onChange={(e) => handleInputChange('sleepHours', e.target.value)}
                />
              </div>
              <div>
                <Label>Stress Level (1-10)</Label>
                <Input 
                  type="number" 
                  placeholder="e.g., 5"
                  value={healthData.stressLevel}
                  onChange={(e) => handleInputChange('stressLevel', e.target.value)}
                />
              </div>

              {/* Family History */}
              <div>
                <Label>Family History: Diabetes</Label>
                <select 
                  className="w-full h-10 px-3 rounded-md border border-gray-300"
                  value={healthData.familyHistoryDiabetes}
                  onChange={(e) => handleInputChange('familyHistoryDiabetes', e.target.value)}
                >
                  <option value="">Select</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>
              <div>
                <Label>Family History: Heart Disease</Label>
                <select 
                  className="w-full h-10 px-3 rounded-md border border-gray-300"
                  value={healthData.familyHistoryHeart}
                  onChange={(e) => handleInputChange('familyHistoryHeart', e.target.value)}
                >
                  <option value="">Select</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>
            </div>

            <div className="mt-6">
              <Button 
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="w-full md:w-auto bg-blue-600 hover:bg-blue-700"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  'Analyze Risk'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {analysis && (
          <>
            {/* Overall Score */}
            <Card className={`${
              analysis.overallScore < 30 ? 'bg-gradient-to-r from-green-500 to-teal-500' :
              analysis.overallScore < 60 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
              'bg-gradient-to-r from-red-500 to-pink-500'
            } text-white`}>
              <CardContent className="p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-sm mb-1">Your Overall Risk Score</p>
                    <p className="text-5xl font-bold">{analysis.overallScore}<span className="text-2xl">/100</span></p>
                    <p className="text-white/90 mt-2">{analysis.riskLevel}</p>
                  </div>
                  <div className="w-32 h-32 rounded-full border-8 border-white/30 flex items-center justify-center">
                    <Target className="w-12 h-12" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Risk Categories */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {analysis.categories.map((category) => {
                const IconComponent = getIconComponent(category.icon)
                return (
                  <Card key={category.name}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg ${
                            category.level === 'Low' ? 'bg-green-100' :
                            category.level === 'Moderate' ? 'bg-yellow-100' : 'bg-red-100'
                          } flex items-center justify-center`}>
                            <IconComponent className={`w-5 h-5 ${
                              category.level === 'Low' ? 'text-green-600' :
                              category.level === 'Moderate' ? 'text-yellow-600' : 'text-red-600'
                            }`} />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{category.name}</h3>
                            <p className={`text-xs ${
                              category.level === 'Low' ? 'text-green-600' :
                              category.level === 'Moderate' ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                              {category.level} Risk
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Risk Level</span>
                          <span className="font-medium">{category.score}%</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${
                              category.score < 30 ? 'bg-green-500' :
                              category.score < 60 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${category.score}%` }}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Your Personalized Recommendations
                </CardTitle>
                <CardDescription>Actions to maintain and improve your health</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {analysis.recommendations.map((rec, i) => (
                    <div key={i} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="font-medium text-blue-800 mb-2">{rec.emoji} {rec.category}</p>
                      <p className="text-sm text-blue-700">{rec.message}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Factors */}
            <Card>
              <CardHeader>
                <CardTitle>What&apos;s Contributing to Your Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-green-600 mb-3">✓ Positive Factors</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      {analysis.positiveFactors.map((factor, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" /> {factor}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-orange-600 mb-3">⚠ Areas for Improvement</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      {analysis.improvementAreas.map((area, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-orange-500" /> {area}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
