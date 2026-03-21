require('dotenv').config()
const admin = require('firebase-admin')
const path = require('path')
const fs = require('fs')

const serviceAccountPath = path.resolve(process.env.FIREBASE_SERVICE_ACCOUNT_PATH)

if (!fs.existsSync(serviceAccountPath)) {
  console.error(`❌ Service account key not found at: ${serviceAccountPath}`)
  console.error('Download it from: Firebase Console → Project Settings → Service Accounts → Generate new private key')
  process.exit(1)
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(require(serviceAccountPath)),
    projectId: process.env.FIREBASE_PROJECT_ID,
  })
}

const db = admin.firestore()

// ── helpers using subcollection structure ─────────────────────────────────────
const userDoc = (uid) => db.collection('userProfiles').doc(uid)
const userCol = (uid, col) => db.collection('userProfiles').doc(uid).collection(col)

async function getAllUsersWithEmailEnabled() {
  // Read settings subcollection: userProfiles/{uid}/settings/preferences
  const profilesSnap = await db.collection('userProfiles').get()
  const targets = []
  for (const profileDoc of profilesSnap.docs) {
    const uid = profileDoc.id
    const settingsSnap = await userCol(uid, 'settings').doc('preferences').get()
    if (settingsSnap.exists && settingsSnap.data()?.notifications?.email === true) {
      targets.push({ uid, ...profileDoc.data() })
    }
  }
  return targets
}

async function getLatestMetric(uid) {
  const snap = await userCol(uid, 'healthMetrics').get()
  if (snap.empty) return null
  const docs = snap.docs.map(d => d.data())
  docs.sort((a, b) => (b.timestamp?.seconds ?? 0) - (a.timestamp?.seconds ?? 0))
  return docs[0]
}

async function getReportCount(uid) {
  const snap = await userCol(uid, 'medicalReports').get()
  return snap.size
}

module.exports = { db, admin, getAllUsersWithEmailEnabled, getLatestMetric, getReportCount }
