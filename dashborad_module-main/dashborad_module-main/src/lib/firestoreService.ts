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
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  writeBatch,
} from 'firebase/firestore'
import { db } from './firebase'

// ── path helpers ──────────────────────────────────────────────────────────────
const userDoc  = (uid: string) => doc(db, 'users', uid)
const userCol  = (uid: string, col: string) => collection(db, 'users', uid, col)
const chatCol  = (uid: string, sessionId: string) =>
  collection(db, 'users', uid, 'chatSessions', sessionId, 'messages')

// =============================================================================
// USER PROFILE
// =============================================================================
export interface UserProfile {
  uid: string
  fullName: string
  email: string
  phone: string
  dateOfBirth: string
  gender?: string
  address: string
  bloodType?: string
  height?: number
  weight?: number
  conditions?: string[]
  allergies?: string[]
  medications?: string[]
  photoURL?: string
  emergencyContact?: { name: string; phone: string; relationship: string }
  provider?: string
  role?: 'patient' | 'doctor' | 'admin'
  isActive?: boolean
  createdAt?: Timestamp
  updatedAt?: Timestamp
}

export const saveUserProfile = async (
  uid: string,
  profile: Omit<UserProfile, 'uid' | 'createdAt' | 'updatedAt'>
) => {
  const ref = userDoc(uid)
  const existing = await getDoc(ref)
  await setDoc(ref, {
    ...profile,
    uid,
    updatedAt: Timestamp.now(),
    ...(existing.exists() ? {} : { createdAt: Timestamp.now() }),
  }, { merge: true })
  return uid
}

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  const snap = await getDoc(userDoc(uid))
  return snap.exists() ? (snap.data() as UserProfile) : null
}

// =============================================================================
// HEALTH METRICS  (Dashboard + Health Trends)
// =============================================================================
export interface DailyMetrics {
  id?: string
  date: string
  heartRate: number
  bloodPressureSystolic: number
  bloodPressureDiastolic: number
  bloodSugar: number
  weight: number
  height?: number
  bmi?: number
  steps: number
  sleep: number
  calories: number
  oxygenSaturation?: number
  temperature?: number
  source?: 'manual' | 'device'
  timestamp?: Timestamp
}

export const addHealthMetric = async (uid: string, data: Omit<DailyMetrics, 'id'>) => {
  const ref = await addDoc(userCol(uid, 'healthMetrics'), {
    ...data,
    timestamp: Timestamp.now(),
  })
  return ref.id
}

export const getHealthMetrics = async (uid: string): Promise<DailyMetrics[]> => {
  const snap = await getDocs(userCol(uid, 'healthMetrics'))
  return snap.docs
    .map(d => ({ ...d.data(), id: d.id } as DailyMetrics))
    .sort((a, b) => (a.timestamp?.seconds ?? 0) - (b.timestamp?.seconds ?? 0))
}

export const deleteHealthMetric = async (uid: string, metricId: string) => {
  await deleteDoc(doc(db, 'users', uid, 'healthMetrics', metricId))
}

// =============================================================================
// MEDICAL REPORTS  (Report Analyzer)
// =============================================================================
export interface MedicalReport {
  id?: string
  fileName: string
  fileURL?: string
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
    aiModel?: string
  }
  sharedWith?: string[]
  timestamp?: Timestamp
}

export const saveMedicalReport = async (
  uid: string,
  report: Omit<MedicalReport, 'id' | 'timestamp'>
) => {
  const ref = await addDoc(userCol(uid, 'medicalReports'), {
    ...report,
    timestamp: Timestamp.now(),
  })
  return ref.id
}

export const getMedicalReports = async (uid: string): Promise<MedicalReport[]> => {
  const snap = await getDocs(userCol(uid, 'medicalReports'))
  return snap.docs
    .map(d => ({ ...d.data(), id: d.id } as MedicalReport))
    .sort((a, b) => (b.timestamp?.seconds ?? 0) - (a.timestamp?.seconds ?? 0))
}

export const updateMedicalReport = async (
  uid: string,
  reportId: string,
  updates: Partial<MedicalReport>
) => {
  await updateDoc(doc(db, 'users', uid, 'medicalReports', reportId), {
    ...updates,
    timestamp: Timestamp.now(),
  })
}

// =============================================================================
// RISK PREDICTIONS  (Health Risk Prediction)
// =============================================================================
export interface RiskPrediction {
  id?: string
  inputData: {
    age?: number
    bmi?: number
    bloodSugar?: number
    bloodPressure?: string
    cholesterol?: number
    smokingStatus?: string
    familyHistory?: string[]
    symptoms?: string[]
  }
  predictions: { disease: string; probability: number; risk: 'low' | 'medium' | 'high' }[]
  recommendations: string[]
  aiModel?: string
  timestamp?: Timestamp
}

export const saveRiskPrediction = async (
  uid: string,
  prediction: Omit<RiskPrediction, 'id' | 'timestamp'>
) => {
  const ref = await addDoc(userCol(uid, 'riskPredictions'), {
    ...prediction,
    timestamp: Timestamp.now(),
  })
  return ref.id
}

export const getRiskPredictions = async (uid: string): Promise<RiskPrediction[]> => {
  const snap = await getDocs(userCol(uid, 'riskPredictions'))
  return snap.docs
    .map(d => ({ ...d.data(), id: d.id } as RiskPrediction))
    .sort((a, b) => (b.timestamp?.seconds ?? 0) - (a.timestamp?.seconds ?? 0))
}

// =============================================================================
// CHAT SESSIONS  (Mental Health Chatbot)
// =============================================================================
export interface ChatMessage {
  id?: string
  role: 'user' | 'assistant'
  content: string
  sentiment?: string
  timestamp: Timestamp
}

export interface ChatSession {
  id?: string
  topic?: string
  mood?: string
  startDate: string
  messageCount?: number
  summary?: string
  lastUpdated?: Timestamp
}

export const createChatSession = async (
  uid: string,
  session: Omit<ChatSession, 'id' | 'lastUpdated'>
) => {
  const ref = await addDoc(userCol(uid, 'chatSessions'), {
    ...session,
    messageCount: 0,
    lastUpdated: Timestamp.now(),
  })
  return ref.id
}

export const addChatMessage = async (
  uid: string,
  sessionId: string,
  message: Omit<ChatMessage, 'id' | 'timestamp'>
) => {
  const batch = writeBatch(db)
  const msgRef = doc(chatCol(uid, sessionId))
  batch.set(msgRef, { ...message, timestamp: Timestamp.now() })
  const sessionRef = doc(db, 'users', uid, 'chatSessions', sessionId)
  batch.update(sessionRef, { lastUpdated: Timestamp.now() })
  await batch.commit()
  return msgRef.id
}

export const getChatSessions = async (uid: string): Promise<ChatSession[]> => {
  const snap = await getDocs(userCol(uid, 'chatSessions'))
  return snap.docs
    .map(d => ({ ...d.data(), id: d.id } as ChatSession))
    .sort((a, b) => (b.lastUpdated?.seconds ?? 0) - (a.lastUpdated?.seconds ?? 0))
}

export const getChatMessages = async (uid: string, sessionId: string): Promise<ChatMessage[]> => {
  const snap = await getDocs(chatCol(uid, sessionId))
  return snap.docs
    .map(d => ({ ...d.data(), id: d.id } as ChatMessage))
    .sort((a, b) => a.timestamp?.seconds - b.timestamp?.seconds)
}

// legacy: save full conversation at once (kept for backward compat)
export const saveChatConversation = async (
  uid: string,
  conversation: { sessionId: string; messages: ChatMessage[]; topic?: string; startDate: string }
) => {
  const sessionId = await createChatSession(uid, {
    topic: conversation.topic,
    startDate: conversation.startDate,
  })
  for (const msg of conversation.messages) {
    await addChatMessage(uid, sessionId, { role: msg.role, content: msg.content })
  }
  return sessionId
}

export const getChatConversations = getChatSessions

// =============================================================================
// DRUG SEARCH HISTORY  (Drug Information)
// =============================================================================
export interface DrugSearch {
  id?: string
  query: string
  drugId?: string
  result?: {
    name: string
    category?: string
    uses?: string[]
    sideEffects?: string[]
    dosage?: string
    interactions?: string[]
  }
  timestamp?: Timestamp
}

export const saveDrugSearch = async (
  uid: string,
  search: Omit<DrugSearch, 'id' | 'timestamp'>
) => {
  const ref = await addDoc(userCol(uid, 'drugSearchHistory'), {
    ...search,
    timestamp: Timestamp.now(),
  })
  return ref.id
}

export const getDrugSearchHistory = async (uid: string): Promise<DrugSearch[]> => {
  const snap = await getDocs(userCol(uid, 'drugSearchHistory'))
  return snap.docs
    .map(d => ({ ...d.data(), id: d.id } as DrugSearch))
    .sort((a, b) => (b.timestamp?.seconds ?? 0) - (a.timestamp?.seconds ?? 0))
}

// =============================================================================
// DRUG SCANS  (Drug Price Detection)
// =============================================================================
export interface DrugScan {
  id?: string
  imageURL?: string
  detectedDrug?: string
  mrp?: number
  discountedPrice?: number
  pharmacy?: string
  location?: string
  confidence?: number
  timestamp?: Timestamp
}

export const saveDrugScan = async (
  uid: string,
  scan: Omit<DrugScan, 'id' | 'timestamp'>
) => {
  const ref = await addDoc(userCol(uid, 'drugScans'), {
    ...scan,
    timestamp: Timestamp.now(),
  })
  return ref.id
}

export const getDrugScans = async (uid: string): Promise<DrugScan[]> => {
  const snap = await getDocs(userCol(uid, 'drugScans'))
  return snap.docs
    .map(d => ({ ...d.data(), id: d.id } as DrugScan))
    .sort((a, b) => (b.timestamp?.seconds ?? 0) - (a.timestamp?.seconds ?? 0))
}

// =============================================================================
// APPOINTMENTS  (Doctor Access)
// =============================================================================
export interface Appointment {
  id?: string
  doctorId: string
  doctorName: string
  specialty?: string
  date: string
  timeSlot: string
  mode: 'video' | 'in-person' | 'chat'
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  reason?: string
  meetLink?: string
  notes?: string
  reportIds?: string[]
  timestamp?: Timestamp
}

export const bookAppointment = async (
  uid: string,
  appointment: Omit<Appointment, 'id' | 'timestamp'>
) => {
  const batch = writeBatch(db)
  const apptRef = doc(userCol(uid, 'appointments'))
  batch.set(apptRef, { ...appointment, timestamp: Timestamp.now() })
  // mark slot as booked in doctors collection
  const slotRef = doc(db, 'doctors', appointment.doctorId, 'availability', `${appointment.date}_${appointment.timeSlot}`)
  batch.update(slotRef, { isBooked: true, bookedBy: uid })
  await batch.commit()
  return apptRef.id
}

export const getAppointments = async (uid: string): Promise<Appointment[]> => {
  const snap = await getDocs(userCol(uid, 'appointments'))
  return snap.docs
    .map(d => ({ ...d.data(), id: d.id } as Appointment))
    .sort((a, b) => (b.timestamp?.seconds ?? 0) - (a.timestamp?.seconds ?? 0))
}

export const updateAppointment = async (
  uid: string,
  appointmentId: string,
  updates: Partial<Appointment>
) => {
  await updateDoc(doc(db, 'users', uid, 'appointments', appointmentId), updates)
}

// =============================================================================
// ACTIVITY LOGS
// =============================================================================
export interface ActivityLog {
  id?: string
  type: 'report_upload' | 'symptom_check' | 'health_metric' | 'profile_update' |
        'chatbot_query' | 'drug_search' | 'drug_scan' | 'appointment_booked' | 'risk_prediction'
  title: string
  description: string
  metadata?: Record<string, any>
  timestamp?: Timestamp
}

export const logActivity = async (
  uid: string,
  activity: Omit<ActivityLog, 'id' | 'timestamp'>
) => {
  const ref = await addDoc(userCol(uid, 'activityLogs'), {
    ...activity,
    timestamp: Timestamp.now(),
  })
  return ref.id
}

export const getActivityLogs = async (uid: string, limitCount = 20): Promise<ActivityLog[]> => {
  const snap = await getDocs(userCol(uid, 'activityLogs'))
  return snap.docs
    .map(d => ({ ...d.data(), id: d.id } as ActivityLog))
    .sort((a, b) => (b.timestamp?.seconds ?? 0) - (a.timestamp?.seconds ?? 0))
    .slice(0, limitCount)
}

// =============================================================================
// USER SETTINGS
// =============================================================================
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

export const saveUserSettings = async (uid: string, settings: UserSettings) => {
  await setDoc(
    doc(db, 'users', uid, 'settings', 'preferences'),
    { ...settings, updatedAt: Timestamp.now() },
    { merge: true }
  )
}

export const getUserSettings = async (uid: string): Promise<UserSettings> => {
  const snap = await getDoc(doc(db, 'users', uid, 'settings', 'preferences'))
  if (!snap.exists()) return defaultSettings
  const data = snap.data()
  return {
    notifications: { ...defaultSettings.notifications, ...data.notifications },
    security: { ...defaultSettings.security, ...data.security },
    appearance: { ...defaultSettings.appearance, ...data.appearance },
    region: { ...defaultSettings.region, ...data.region },
  }
}

// =============================================================================
// DOCTORS  (global collection)
// =============================================================================
export interface Doctor {
  id?: string
  name: string
  specialty: string
  hospital?: string
  email?: string
  phone?: string
  photoURL?: string
  rating?: number
  experience?: number
  languages?: string[]
  consultationFee?: number
  isAvailable?: boolean
}

export interface DoctorSlot {
  id?: string
  date: string
  timeSlot: string
  isBooked: boolean
  bookedBy?: string | null
}

export const getDoctors = async (): Promise<Doctor[]> => {
  const snap = await getDocs(collection(db, 'doctors'))
  return snap.docs.map(d => ({ ...d.data(), id: d.id } as Doctor))
}

export const getDoctorSlots = async (doctorId: string): Promise<DoctorSlot[]> => {
  const snap = await getDocs(collection(db, 'doctors', doctorId, 'availability'))
  return snap.docs
    .map(d => ({ ...d.data(), id: d.id } as DoctorSlot))
    .filter(s => !s.isBooked)
}

// =============================================================================
// DRUG DATABASE  (global collection — read only from client)
// =============================================================================
export interface DrugInfo {
  id?: string
  name: string
  brand?: string[]
  category?: string
  uses?: string[]
  sideEffects?: string[]
  interactions?: string[]
  dosage?: string
  prescription?: boolean
  lastUpdated?: Timestamp
}

export const getDrugInfo = async (drugId: string): Promise<DrugInfo | null> => {
  const snap = await getDoc(doc(db, 'drugDatabase', drugId))
  return snap.exists() ? ({ ...snap.data(), id: snap.id } as DrugInfo) : null
}

export const searchDrugDatabase = async (name: string): Promise<DrugInfo[]> => {
  const snap = await getDocs(collection(db, 'drugDatabase'))
  return snap.docs
    .map(d => ({ ...d.data(), id: d.id } as DrugInfo))
    .filter(d => d.name.toLowerCase().includes(name.toLowerCase()))
}

// =============================================================================
// SHARE TOKENS
// =============================================================================
export interface ShareToken {
  userId: string
  reportId: string
  createdAt: Timestamp
  expiresAt: Timestamp
  accessedBy?: string[]
}

export const saveShareToken = async (
  token: string,
  data: Pick<ShareToken, 'userId' | 'reportId'>
) => {
  await setDoc(doc(db, 'shareTokens', token), {
    ...data,
    accessedBy: [],
    createdAt: Timestamp.now(),
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

// =============================================================================
// ADMIN — get all users
// =============================================================================
export interface UserSummary {
  uid: string
  fullName: string
  email: string
  phone?: string
  photoURL?: string
  role?: string
  createdAt?: Timestamp
}

export const getAllUsers = async (): Promise<UserSummary[]> => {
  const snap = await getDocs(collection(db, 'users'))
  return snap.docs.map(d => {
    const data = d.data()
    return {
      uid: d.id,
      fullName: data.fullName || 'Unknown',
      email: data.email || '',
      phone: data.phone || '',
      photoURL: data.photoURL || '',
      role: data.role || 'patient',
      createdAt: data.createdAt,
    }
  })
}

// =============================================================================
// DELETE ALL USER DATA
// =============================================================================
export const deleteAllUserData = async (uid: string) => {
  const subcollections = [
    'healthMetrics', 'medicalReports', 'riskPredictions',
    'chatSessions', 'drugSearchHistory', 'drugScans',
    'appointments', 'activityLogs', 'settings',
  ]
  for (const col of subcollections) {
    const snap = await getDocs(userCol(uid, col))
    await Promise.all(snap.docs.map(d => deleteDoc(d.ref)))
  }
  await deleteDoc(userDoc(uid))
}

// =============================================================================
// LEGACY ALIASES  (keep old callers working)
// =============================================================================
export type { ChatSession as ChatConversation }
export { getChatSessions as getChatConversations }

// symptomChecks → now stored as chatSessions with mood field
export const saveSymptomCheck = async (
  uid: string,
  data: { sessionId: string; messages: any[]; startDate: string; possibleConditions?: any[]; suggestedActions?: string[] }
) => {
  return createChatSession(uid, { topic: 'Symptom Check', mood: 'symptom', startDate: data.startDate })
}
export const getSymptomChecks = getChatSessions

// careTeam → now stored as appointments with mode='in-person'
export interface CareTeamMember {
  id?: string; name: string; role: string; specialty?: string
  phone: string; email?: string; hospital?: string; addedDate: string; timestamp?: Timestamp
}
export const addCareTeamMember = async (uid: string, member: Omit<CareTeamMember, 'timestamp'>) => {
  const ref = await addDoc(userCol(uid, 'careTeam'), { ...member, timestamp: Timestamp.now() })
  return ref.id
}
export const getCareTeam = async (uid: string): Promise<CareTeamMember[]> => {
  const snap = await getDocs(userCol(uid, 'careTeam'))
  return snap.docs.map(d => ({ ...d.data(), id: d.id } as CareTeamMember))
}
export const deleteCareTeamMember = async (uid: string, memberId: string) => {
  await deleteDoc(doc(db, 'users', uid, 'careTeam', memberId))
}
