import { 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  getDocs,
  Timestamp 
} from 'firebase/firestore'
import { db } from './firebase'

export const initializeFirestore = async (userId: string = 'user123') => {
  const results = {
    success: [] as string[],
    errors: [] as string[],
    collections: {} as Record<string, number>
  }

  try {
    // 1. Create userProfiles collection
    try {
      await setDoc(doc(db, 'userProfiles', userId), {
        userId,
        fullName: 'John Doe',
        email: 'john.doe@email.com',
        phone: '+1 (555) 123-4567',
        dateOfBirth: 'March 15, 1985',
        address: '123 Health Street, San Francisco, CA 94102',
        bloodType: 'O+',
        conditions: ['Type 2 Diabetes', 'Hypertension'],
        allergies: ['Penicillin', 'Peanuts'],
        emergencyContact: {
          name: 'Jane Doe',
          phone: '+1 (555) 987-6543',
          relationship: 'Spouse'
        },
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      })
      results.success.push('userProfiles')
      results.collections.userProfiles = 1
    } catch (error) {
      results.errors.push(`userProfiles: ${error}`)
    }

    // 2. Create healthMetrics collection
    try {
      const healthData = [
        { date: 'Jan 10', heartRate: 72, bloodPressureSystolic: 120, bloodPressureDiastolic: 80, bloodSugar: 95, weight: 75, steps: 8500, sleep: 7.5, calories: 2100 },
        { date: 'Jan 11', heartRate: 68, bloodPressureSystolic: 118, bloodPressureDiastolic: 78, bloodSugar: 92, weight: 74.8, steps: 10200, sleep: 8.0, calories: 2300 },
        { date: 'Jan 12', heartRate: 75, bloodPressureSystolic: 122, bloodPressureDiastolic: 82, bloodSugar: 98, weight: 74.5, steps: 6500, sleep: 6.5, calories: 1900 },
        { date: 'Jan 13', heartRate: 70, bloodPressureSystolic: 119, bloodPressureDiastolic: 79, bloodSugar: 93, weight: 74.3, steps: 9800, sleep: 7.8, calories: 2200 },
        { date: 'Jan 14', heartRate: 73, bloodPressureSystolic: 121, bloodPressureDiastolic: 81, bloodSugar: 96, weight: 74.2, steps: 11000, sleep: 7.2, calories: 2400 },
        { date: 'Jan 15', heartRate: 65, bloodPressureSystolic: 117, bloodPressureDiastolic: 77, bloodSugar: 90, weight: 74.0, steps: 12000, sleep: 8.5, calories: 2500 },
        { date: 'Jan 16', heartRate: 70, bloodPressureSystolic: 118, bloodPressureDiastolic: 78, bloodSugar: 92, weight: 74.0, steps: 7500, sleep: 7.0, calories: 2000 },
      ]
      
      for (const data of healthData) {
        await addDoc(collection(db, 'healthMetrics'), {
          ...data,
          userId,
          timestamp: Timestamp.now()
        })
      }
      results.success.push('healthMetrics')
      results.collections.healthMetrics = healthData.length
    } catch (error) {
      results.errors.push(`healthMetrics: ${error}`)
    }

    // 3. Create medicalReports collection
    try {
      const reports = [
        {
          fileName: 'blood_test_jan_2024.pdf',
          fileType: 'application/pdf',
          fileSize: 1024000,
          uploadDate: 'Jan 10, 2024',
          status: 'Analyzed',
          extractedText: 'Blood test results showing normal hemoglobin levels',
          analysis: {
            summary: 'Blood test results are within normal range. All key indicators show healthy levels.',
            findings: [
              { label: 'Hemoglobin', value: '14.5 g/dL', status: 'normal' },
              { label: 'White Blood Cells', value: '7.2 K/uL', status: 'normal' },
              { label: 'Platelets', value: '250 K/uL', status: 'normal' },
              { label: 'Glucose', value: '95 mg/dL', status: 'normal' }
            ],
            recommendations: [
              'Continue current diet and exercise routine',
              'Schedule follow-up in 6 months',
              'Maintain hydration levels'
            ],
            riskLevel: 'low'
          }
        },
        {
          fileName: 'xray_chest_jan_2024.pdf',
          fileType: 'application/pdf',
          fileSize: 2048000,
          uploadDate: 'Jan 12, 2024',
          status: 'Analyzed',
          extractedText: 'Chest X-ray showing clear lungs',
          analysis: {
            summary: 'Chest X-ray shows no abnormalities. Lungs are clear.',
            findings: [
              { label: 'Lung Fields', value: 'Clear', status: 'normal' },
              { label: 'Heart Size', value: 'Normal', status: 'normal' }
            ],
            recommendations: [
              'No immediate action required',
              'Annual check-up recommended'
            ],
            riskLevel: 'low'
          }
        }
      ]
      
      for (const report of reports) {
        await addDoc(collection(db, 'medicalReports'), {
          ...report,
          userId,
          timestamp: Timestamp.now()
        })
      }
      results.success.push('medicalReports')
      results.collections.medicalReports = reports.length
    } catch (error) {
      results.errors.push(`medicalReports: ${error}`)
    }

    // 4. Create careTeam collection
    try {
      const doctors = [
        { name: 'Dr. Sarah Smith', role: 'Primary Care', phone: '(555) 111-2222', email: 'dr.smith@hospital.com', hospital: 'City Hospital', addedDate: 'Jan 1, 2024' },
        { name: 'Dr. Michael Park', role: 'Cardiologist', phone: '(555) 333-4444', email: 'dr.park@hospital.com', hospital: 'Heart Center', addedDate: 'Jan 5, 2024' },
        { name: 'Dr. Emily Wong', role: 'Endocrinologist', phone: '(555) 555-6666', email: 'dr.wong@hospital.com', hospital: 'Diabetes Clinic', addedDate: 'Jan 8, 2024' }
      ]
      
      for (const doctor of doctors) {
        await addDoc(collection(db, 'careTeam'), {
          ...doctor,
          userId,
          timestamp: Timestamp.now()
        })
      }
      results.success.push('careTeam')
      results.collections.careTeam = doctors.length
    } catch (error) {
      results.errors.push(`careTeam: ${error}`)
    }

    // 5. Create activityLogs collection
    try {
      const activities = [
        { type: 'health_metric', title: 'Added Health Data', description: 'Daily health metrics recorded for Jan 16' },
        { type: 'report_upload', title: 'Uploaded Blood Test', description: 'blood_test_jan_2024.pdf analyzed successfully' },
        { type: 'report_upload', title: 'Uploaded X-Ray', description: 'xray_chest_jan_2024.pdf analyzed successfully' },
        { type: 'profile_update', title: 'Updated Profile', description: 'Emergency contact information updated' },
        { type: 'symptom_check', title: 'Checked Symptoms', description: 'Headache symptoms analyzed' }
      ]
      
      for (const activity of activities) {
        await addDoc(collection(db, 'activityLogs'), {
          ...activity,
          userId,
          timestamp: Timestamp.now()
        })
      }
      results.success.push('activityLogs')
      results.collections.activityLogs = activities.length
    } catch (error) {
      results.errors.push(`activityLogs: ${error}`)
    }

    // 6. Create symptomChecks collection
    try {
      await addDoc(collection(db, 'symptomChecks'), {
        userId,
        sessionId: 'session_' + Date.now(),
        messages: [
          { role: 'user', content: 'I have been having headaches for the past 3 days', timestamp: Timestamp.now() },
          { role: 'ai', content: 'I understand you are experiencing headaches. Can you describe the pain level on a scale of 1-10?', timestamp: Timestamp.now() },
          { role: 'user', content: 'About a 6, mostly on the right side', timestamp: Timestamp.now() }
        ],
        possibleConditions: [
          { name: 'Tension Headache', probability: '45%' },
          { name: 'Migraine', probability: '30%' },
          { name: 'Eye Strain', probability: '20%' }
        ],
        suggestedActions: [
          'Take a 15-minute screen break',
          'Stay hydrated',
          'Consider an eye exam',
          'Track your symptoms'
        ],
        startDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        lastUpdated: Timestamp.now()
      })
      results.success.push('symptomChecks')
      results.collections.symptomChecks = 1
    } catch (error) {
      results.errors.push(`symptomChecks: ${error}`)
    }

    // 7. Create chatConversations collection
    try {
      await addDoc(collection(db, 'chatConversations'), {
        userId,
        sessionId: 'chat_' + Date.now(),
        messages: [
          { role: 'user', content: 'What is Type 2 Diabetes?', timestamp: Timestamp.now() },
          { role: 'assistant', content: 'Type 2 Diabetes is a chronic condition that affects how your body processes blood sugar (glucose). Would you like to know more about managing it?', timestamp: Timestamp.now() },
          { role: 'user', content: 'Yes, what are the best ways to manage it?', timestamp: Timestamp.now() }
        ],
        topic: 'Diabetes Information',
        startDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        lastUpdated: Timestamp.now()
      })
      results.success.push('chatConversations')
      results.collections.chatConversations = 1
    } catch (error) {
      results.errors.push(`chatConversations: ${error}`)
    }

    return results
  } catch (error) {
    console.error('Initialization error:', error)
    throw error
  }
}

export const checkCollectionsExist = async () => {
  const collections = [
    'userProfiles',
    'healthMetrics',
    'medicalReports',
    'careTeam',
    'activityLogs',
    'symptomChecks',
    'chatConversations'
  ]

  const status: Record<string, boolean> = {}

  for (const collectionName of collections) {
    try {
      const snapshot = await getDocs(collection(db, collectionName))
      status[collectionName] = !snapshot.empty
    } catch (error) {
      status[collectionName] = false
    }
  }

  return status
}
