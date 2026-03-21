import {
  collection,
  addDoc,
  getDocs,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
} from 'firebase/firestore'
import { db } from './firebase'

// ── helpers ──────────────────────────────────────────────────────────────────
const userDoc = (uid: string) => doc(db, 'userProfiles', uid)
const userCol = (uid: string, col: string) => collection(db, 'userProfiles', uid, col)

// ==================== USER PROFILE ====================
export interface UserProfile {
  userId: string
  fullName: string
  email: string
  phone: string
  dateOfBirth: string
  address: string
  bloodType?: string
  conditions?: string[]
  allergies?: string[]
  photoURL?: string
  emergencyContact?: { name: string; phone: string; relationship: string }
  createdAt?: Timestamp
  updatedAt?: Timestamp
}

export const saveUserProfile = async (
  userId: string,
  profile: Omit<UserProfile, 'userId' | 'createdAt' | 'updatedAt'>
) => {
  const ref = userDoc(userId)
  const existing = await getDoc(ref)
  await setDoc(ref, {
    ...profile,
    userId,
    updatedAt: Timestamp.now(),
    ...(existing.exists() ? {} : { createdAt: Timestamp.now() }),
  }, { merge: true })
  return userId
}

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  const snap = await getDoc(userDoc(userId))
  return snap.exists() ? (snap.data() as UserProfile) : null
}

// ==================== HEALTH METRICS ====================
export interface DailyMetrics {
  id?: string
  date: string
  heartRate: number
  bloodPressureSystolic: number
  bloodPressureDiastolic: number
  bloodSugar: number
  weight: number
  steps: number
  sleep: number
  calories: number
  timestamp?: Timestamp
}

export const addHealthMetric = async (userId: string, data: DailyMetrics) => {
  const ref = await addDoc(userCol(userId, 'healthMetrics'), {
    ...data,
    timestamp: Timestamp.now(),
  })
  return ref.id
}

export const getHealthMetrics = async (userId: string): Promise<DailyMetrics[]> => {
  const snap = await getDocs(userCol(userId, 'healthMetrics'))
  return snap.docs
    .map(d => ({ ...d.data(), id: d.id } as DailyMetrics))
    .sort((a, b) => (a.timestamp?.seconds ?? 0) - (b.timestamp?.seconds ?? 0))
}

export const deleteHealthMetric = async (userId: string, metricId: string) => {
  await deleteDoc(doc(db, 'userProfiles', userId, 'healthMetrics', metricId))
}

// ==================== MEDICAL REPORTS ====================
export interface MedicalReport {
  id?: string
  fileName: string
  fileUrl?: string
  fileType: string
  fileSize: number
  uploadDate: string
  status: 'Analyzed' | 'Processing' | 'Failed'
  extractedText?: string
  analysis?: {
    summary: string
    findings: { label: string; value: string; status: 'normal' | 'warning' | 'critical' }[]
    recommendations: string[]
    riskLevel: 'low' | 'medium' | 'high'
  }
  timestamp?: Timestamp
}

export const saveMedicalReport = async (
  userId: string,
  report: Omit<MedicalReport, 'timestamp'>
) => {
  const ref = await addDoc(userCol(userId, 'medicalReports'), {
    ...report,
    timestamp: Timestamp.now(),
  })
  return ref.id
}

export const getMedicalReports = async (userId: string): Promise<MedicalReport[]> => {
  const snap = await getDocs(userCol(userId, 'medicalReports'))
  return snap.docs
    .map(d => ({ ...d.data(), id: d.id } as MedicalReport))
    .sort((a, b) => (b.timestamp?.seconds ?? 0) - (a.timestamp?.seconds ?? 0))
}

export const updateMedicalReport = async (userId: string, reportId: string, updates: Partial<MedicalReport>) => {
  await updateDoc(doc(db, 'userProfiles', userId, 'medicalReports', reportId), {
    ...updates,
    timestamp: Timestamp.now(),
  })
}

// ==================== ACTIVITY LOGS ====================
export interface ActivityLog {
  id?: string
  type: 'report_upload' | 'symptom_check' | 'health_metric' | 'profile_update' | 'chatbot_query'
  title: string
  description: string
  timestamp: Timestamp
  metadata?: Record<string, any>
}

export const logActivity = async (
  userId: string,
  activity: Omit<ActivityLog, 'timestamp'>
) => {
  const ref = await addDoc(userCol(userId, 'activityLogs'), {
    ...activity,
    timestamp: Timestamp.now(),
  })
  return ref.id
}

export const getActivityLogs = async (userId: string, limit = 20): Promise<ActivityLog[]> => {
  const snap = await getDocs(userCol(userId, 'activityLogs'))
  return snap.docs
    .map(d => ({ ...d.data(), id: d.id } as ActivityLog))
    .sort((a, b) => b.timestamp?.seconds - a.timestamp?.seconds)
    .slice(0, limit)
}

// ==================== USER SETTINGS ====================
export interface UserSettings {
  notifications: { email: boolean; push: boolean; reportReady: boolean; weeklySummary: boolean }
  security: { twoFactor: boolean; biometric: boolean; loginAlerts: boolean }
  appearance: { darkMode: boolean; themeColor: string; fontSize: string }
  region: { language: string; timezone: string; dateFormat: string }
}

export const defaultSettings: UserSettings = {
  notifications: { email: true, push: true, reportReady: true, weeklySummary: true },
  security: { twoFactor: false, biometric: true, loginAlerts: true },
  appearance: { darkMode: false, themeColor: 'blue', fontSize: 'medium' },
  region: { language: 'English (US)', timezone: 'Eastern Time (ET)', dateFormat: 'MM/DD/YYYY' },
}

export const saveUserSettings = async (userId: string, settings: UserSettings) => {
  await setDoc(
    doc(db, 'userProfiles', userId, 'settings', 'preferences'),
    { ...settings, updatedAt: Timestamp.now() },
    { merge: true }
  )
}

export const getUserSettings = async (userId: string): Promise<UserSettings> => {
  const snap = await getDoc(doc(db, 'userProfiles', userId, 'settings', 'preferences'))
  if (!snap.exists()) return defaultSettings
  const data = snap.data()
  return {
    notifications: { ...defaultSettings.notifications, ...data.notifications },
    security: { ...defaultSettings.security, ...data.security },
    appearance: { ...defaultSettings.appearance, ...data.appearance },
    region: { ...defaultSettings.region, ...data.region },
  }
}

// ==================== CHAT CONVERSATIONS ====================
export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: Timestamp
}

export interface ChatConversation {
  id?: string
  sessionId: string
  messages: ChatMessage[]
  topic?: string
  startDate: string
  lastUpdated?: Timestamp
}

export const saveChatConversation = async (
  userId: string,
  conversation: Omit<ChatConversation, 'lastUpdated'>
) => {
  const ref = await addDoc(userCol(userId, 'chatConversations'), {
    ...conversation,
    lastUpdated: Timestamp.now(),
  })
  return ref.id
}

export const getChatConversations = async (userId: string): Promise<ChatConversation[]> => {
  const snap = await getDocs(userCol(userId, 'chatConversations'))
  return snap.docs
    .map(d => ({ ...d.data(), id: d.id } as ChatConversation))
    .sort((a, b) => (b.lastUpdated?.seconds ?? 0) - (a.lastUpdated?.seconds ?? 0))
}

// ==================== SYMPTOM CHECKS ====================
export interface SymptomMessage {
  role: 'user' | 'ai'
  content: string
  timestamp: Timestamp
}

export interface SymptomCheck {
  id?: string
  sessionId: string
  messages: SymptomMessage[]
  possibleConditions?: { name: string; probability: string }[]
  suggestedActions?: string[]
  startDate: string
  lastUpdated?: Timestamp
}

export const saveSymptomCheck = async (
  userId: string,
  symptomData: Omit<SymptomCheck, 'lastUpdated'>
) => {
  const ref = await addDoc(userCol(userId, 'symptomChecks'), {
    ...symptomData,
    lastUpdated: Timestamp.now(),
  })
  return ref.id
}

export const getSymptomChecks = async (userId: string): Promise<SymptomCheck[]> => {
  const snap = await getDocs(userCol(userId, 'symptomChecks'))
  return snap.docs
    .map(d => ({ ...d.data(), id: d.id } as SymptomCheck))
    .sort((a, b) => (b.lastUpdated?.seconds ?? 0) - (a.lastUpdated?.seconds ?? 0))
}

// ==================== CARE TEAM ====================
export interface CareTeamMember {
  id?: string
  name: string
  role: string
  specialty?: string
  phone: string
  email?: string
  hospital?: string
  addedDate: string
  timestamp?: Timestamp
}

export const addCareTeamMember = async (
  userId: string,
  member: Omit<CareTeamMember, 'timestamp'>
) => {
  const ref = await addDoc(userCol(userId, 'careTeam'), {
    ...member,
    timestamp: Timestamp.now(),
  })
  return ref.id
}

export const getCareTeam = async (userId: string): Promise<CareTeamMember[]> => {
  const snap = await getDocs(userCol(userId, 'careTeam'))
  return snap.docs
    .map(d => ({ ...d.data(), id: d.id } as CareTeamMember))
    .sort((a, b) => (b.timestamp?.seconds ?? 0) - (a.timestamp?.seconds ?? 0))
}

export const deleteCareTeamMember = async (userId: string, memberId: string) => {
  await deleteDoc(doc(db, 'userProfiles', userId, 'careTeam', memberId))
}

// ==================== SHARE TOKENS ====================
export interface ShareToken {
  userId: string
  reportId: string
  createdAt: Timestamp
  expiresAt: Timestamp
}

export const saveShareToken = async (token: string, data: Omit<ShareToken, 'createdAt' | 'expiresAt'>) => {
  const now = Timestamp.now()
  await setDoc(doc(db, 'shareTokens', token), {
    ...data,
    createdAt: now,
    expiresAt: Timestamp.fromMillis(Date.now() + 24 * 60 * 60 * 1000),
  })
}

export const getShareToken = async (token: string): Promise<ShareToken | null> => {
  const snap = await getDoc(doc(db, 'shareTokens', token))
  if (!snap.exists()) return null
  const data = snap.data() as ShareToken
  if (data.expiresAt.toMillis() < Date.now()) return null
  return data
}

// ==================== DELETE ALL USER DATA ====================
export const deleteAllUserData = async (userId: string) => {
  const subcollections = ['healthMetrics', 'medicalReports', 'activityLogs', 'settings', 'chatConversations', 'symptomChecks', 'careTeam']
  for (const col of subcollections) {
    const snap = await getDocs(userCol(userId, col))
    await Promise.all(snap.docs.map(d => deleteDoc(d.ref)))
  }
  await deleteDoc(userDoc(userId))
}
