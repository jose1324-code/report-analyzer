'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, Loader2, Database, Zap } from 'lucide-react'
import { initializeFirestore, checkCollectionsExist } from '@/lib/initializeFirestore'

export default function FirestoreSetupPage() {
  const [status, setStatus] = useState<'idle' | 'checking' | 'initializing' | 'complete' | 'error'>('idle')
  const [results, setResults] = useState<any>(null)
  const [existingCollections, setExistingCollections] = useState<Record<string, boolean>>({})
  const userId = 'user123'

  const handleCheckCollections = async () => {
    setStatus('checking')
    try {
      const collections = await checkCollectionsExist()
      setExistingCollections(collections)
      setStatus('idle')
    } catch (error) {
      console.error('Check error:', error)
      setStatus('error')
    }
  }

  const handleAutoSetup = async () => {
    setStatus('initializing')
    try {
      const result = await initializeFirestore(userId)
      setResults(result)
      setStatus('complete')
      
      // Refresh collection status
      const collections = await checkCollectionsExist()
      setExistingCollections(collections)
    } catch (error: any) {
      console.error('Setup error:', error)
      setResults({ 
        success: [], 
        errors: [error.message || 'Unknown error'],
        collections: {}
      })
      setStatus('error')
    }
  }

  const totalCollections = 7
  const successCount = results?.success?.length || 0
  const errorCount = results?.errors?.length || 0

  return (
    <DashboardLayout title="Firestore Setup">
      <div className="space-y-6">
        {/* Header */}
        <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center">
                <Database className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Automatic Firestore Setup
                </h2>
                <p className="text-gray-600 mb-4">
                  Click the button below to automatically create all 7 Firestore collections with sample data.
                  This will set up your entire database structure in seconds!
                </p>
                <div className="flex gap-3">
                  <Button
                    onClick={handleAutoSetup}
                    disabled={status === 'initializing' || status === 'checking'}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {status === 'initializing' ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Setting up...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 mr-2" />
                        Auto-Setup All Collections
                      </>
                    )}
                  </Button>
                  
                  <Button
                    onClick={handleCheckCollections}
                    disabled={status === 'initializing' || status === 'checking'}
                    variant="outline"
                  >
                    {status === 'checking' ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Checking...
                      </>
                    ) : (
                      'Check Existing Collections'
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Existing Collections Status */}
        {Object.keys(existingCollections).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Current Collection Status</CardTitle>
              <CardDescription>Collections that already exist in your Firestore database</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(existingCollections).map(([name, exists]) => (
                  <div
                    key={name}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      exists ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'
                    }`}
                  >
                    <span className="font-medium text-gray-900">{name}</span>
                    {exists ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {status === 'complete' && results && (
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-900">
                <CheckCircle className="w-6 h-6" />
                Setup Complete!
              </CardTitle>
              <CardDescription className="text-green-700">
                Successfully created {successCount} out of {totalCollections} collections
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Success List */}
              {results.success.length > 0 && (
                <div>
                  <h3 className="font-semibold text-green-900 mb-2">✅ Successfully Created:</h3>
                  <div className="space-y-2">
                    {results.success.map((collection: string) => (
                      <div key={collection} className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-200">
                        <span className="font-medium text-gray-900">{collection}</span>
                        <span className="text-sm text-green-600">
                          {results.collections[collection]} document(s)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Error List */}
              {results.errors.length > 0 && (
                <div>
                  <h3 className="font-semibold text-red-900 mb-2">❌ Errors:</h3>
                  <div className="space-y-2">
                    {results.errors.map((error: string, index: number) => (
                      <div key={index} className="p-3 bg-red-50 rounded-lg border border-red-200">
                        <p className="text-sm text-red-700">{error}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Next Steps */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-2">🎉 What's Next?</h3>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li>✅ Go to Firebase Console to see your collections</li>
                  <li>✅ Visit <a href="/health-trends" className="underline font-medium">Health Trends</a> to see sample data</li>
                  <li>✅ Visit <a href="/profile" className="underline font-medium">Profile</a> to see your profile</li>
                  <li>✅ Visit <a href="/report-analyzer" className="underline font-medium">Report Analyzer</a> to see sample reports</li>
                  <li>✅ Start using the app - all data will be saved to Firestore!</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {status === 'error' && (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-900">
                <XCircle className="w-6 h-6" />
                Setup Failed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {results?.errors?.map((error: string, index: number) => (
                  <div key={index} className="p-3 bg-white rounded-lg border border-red-200">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                ))}
                
                <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <h3 className="font-semibold text-yellow-900 mb-2">Common Issues:</h3>
                  <ul className="space-y-2 text-sm text-yellow-800 list-disc list-inside">
                    <li>Check if your <code className="bg-yellow-100 px-1 rounded">.env.local</code> has correct Firebase config</li>
                    <li>Make sure Firestore rules allow read/write access</li>
                    <li>Verify your Firebase project is active</li>
                    <li>Check browser console for detailed error messages</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* What Will Be Created */}
        <Card>
          <CardHeader>
            <CardTitle>What Will Be Created</CardTitle>
            <CardDescription>7 collections with sample data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: 'healthMetrics', docs: '7 documents', desc: 'Sample health data for the past week' },
                { name: 'userProfiles', docs: '1 document', desc: 'Your user profile with personal information' },
                { name: 'medicalReports', docs: '2 documents', desc: 'Sample medical reports with AI analysis' },
                { name: 'careTeam', docs: '3 documents', desc: 'Sample healthcare providers' },
                { name: 'activityLogs', docs: '5 documents', desc: 'Sample activity history' },
                { name: 'symptomChecks', docs: '1 document', desc: 'Sample symptom checker conversation' },
                { name: 'chatConversations', docs: '1 document', desc: 'Sample chatbot conversation' }
              ].map((collection) => (
                <div key={collection.name} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <Database className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">{collection.name}</span>
                      <span className="text-xs text-gray-500">{collection.docs}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{collection.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Important Notes */}
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <h3 className="font-semibold text-yellow-900 mb-2">⚠️ Important Notes:</h3>
            <ul className="space-y-1 text-sm text-yellow-800 list-disc list-inside">
              <li>This will create sample data for userId: <code className="bg-yellow-100 px-1 rounded">user123</code></li>
              <li>If collections already exist, this will add more documents (won't delete existing data)</li>
              <li>You can run this multiple times safely</li>
              <li>Make sure your Firebase config is correct in <code className="bg-yellow-100 px-1 rounded">.env.local</code></li>
              <li>Firestore rules must allow read/write access</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
