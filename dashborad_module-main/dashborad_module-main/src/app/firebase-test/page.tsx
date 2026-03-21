'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react'
import { addHealthMetric } from '@/lib/healthService'

export default function FirebaseTestPage() {
  const [testResults, setTestResults] = useState<any[]>([])
  const [testing, setTesting] = useState(false)

  const runTests = async () => {
    setTesting(true)
    const results: any[] = []

    // Test 1: Check environment variables
    results.push({
      name: 'Environment Variables',
      status: process.env.NEXT_PUBLIC_FIREBASE_API_KEY && 
              process.env.NEXT_PUBLIC_FIREBASE_API_KEY !== 'your_api_key_here' ? 'pass' : 'fail',
      message: process.env.NEXT_PUBLIC_FIREBASE_API_KEY === 'your_api_key_here' 
        ? 'Please update .env.local with your actual Firebase config'
        : 'Environment variables are set',
      details: {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? '✓ Set' : '✗ Missing',
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? '✓ Set' : '✗ Missing',
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? '✓ Set' : '✗ Missing',
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ? '✓ Set' : '✗ Missing',
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ? '✓ Set' : '✗ Missing',
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? '✓ Set' : '✗ Missing',
      }
    })

    // Test 2: Try to write to Firestore
    try {
      const testData = {
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        heartRate: 75,
        bloodPressureSystolic: 120,
        bloodPressureDiastolic: 80,
        bloodSugar: 95,
        weight: 70,
        steps: 5000,
        sleep: 7,
        calories: 2000
      }
      
      const docId = await addHealthMetric('test_user', testData)
      results.push({
        name: 'Firestore Write Test',
        status: 'pass',
        message: `Successfully wrote test data to Firestore!`,
        details: { documentId: docId }
      })
    } catch (error: any) {
      results.push({
        name: 'Firestore Write Test',
        status: 'fail',
        message: 'Failed to write to Firestore',
        details: { error: error.message }
      })
    }

    setTestResults(results)
    setTesting(false)
  }

  return (
    <DashboardLayout title="Firebase Test">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Firebase Connection Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              This page will help you diagnose Firebase connection issues.
            </p>
            
            <Button 
              onClick={runTests} 
              disabled={testing}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {testing ? 'Testing...' : 'Run Tests'}
            </Button>

            {testResults.length > 0 && (
              <div className="space-y-4 mt-6">
                {testResults.map((result, index) => (
                  <Card key={index} className={
                    result.status === 'pass' ? 'border-green-200 bg-green-50' :
                    result.status === 'fail' ? 'border-red-200 bg-red-50' :
                    'border-yellow-200 bg-yellow-50'
                  }>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        {result.status === 'pass' && <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />}
                        {result.status === 'fail' && <XCircle className="w-5 h-5 text-red-600 mt-0.5" />}
                        {result.status === 'warning' && <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />}
                        
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{result.name}</h3>
                          <p className="text-sm text-gray-700 mt-1">{result.message}</p>
                          
                          {result.details && (
                            <div className="mt-2 p-3 bg-white rounded border">
                              <pre className="text-xs overflow-auto">
                                {JSON.stringify(result.details, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {testResults.length > 0 && testResults[0].status === 'fail' && (
              <Card className="border-blue-200 bg-blue-50 mt-6">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">How to Fix:</h3>
                  <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
                    <li>Go to <a href="https://console.firebase.google.com/" target="_blank" className="underline">Firebase Console</a></li>
                    <li>Select your project</li>
                    <li>Click the gear icon ⚙️ → Project settings</li>
                    <li>Scroll to "Your apps" section</li>
                    <li>Copy the firebaseConfig values</li>
                    <li>Update your <code className="bg-blue-100 px-1 rounded">.env.local</code> file</li>
                    <li>Restart your dev server</li>
                  </ol>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Current Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between p-2 bg-gray-50 rounded">
                <span className="text-gray-600">API Key:</span>
                <span className="font-mono text-xs">
                  {process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.substring(0, 20)}...
                </span>
              </div>
              <div className="flex justify-between p-2 bg-gray-50 rounded">
                <span className="text-gray-600">Project ID:</span>
                <span className="font-mono text-xs">
                  {process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}
                </span>
              </div>
              <div className="flex justify-between p-2 bg-gray-50 rounded">
                <span className="text-gray-600">Auth Domain:</span>
                <span className="font-mono text-xs">
                  {process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
