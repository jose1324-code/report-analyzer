'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  collection, addDoc, getDocs, updateDoc, doc,
  Timestamp
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { getUserSettings } from '@/lib/firestoreService'

export type NotifType = 'medication' | 'health_tip' | 'report_ready' | 'weekly_summary' | 'login_alert'

export interface AppNotification {
  id?: string
  type: NotifType
  title: string
  message: string
  read: boolean
  timestamp: Timestamp
}

const userNotifCol = (uid: string) =>
  collection(db, 'userProfiles', uid, 'notifications')

const userNotifDoc = (uid: string, nid: string) =>
  doc(db, 'userProfiles', uid, 'notifications', nid)

// ── health tips pool ─────────────────────────────────────────────────────────
const HEALTH_TIPS = [
  'Drink at least 8 glasses of water today 💧',
  'Take a 10-minute walk after each meal 🚶',
  'Try to sleep 7–9 hours tonight 😴',
  'Do 5 minutes of deep breathing to reduce stress 🧘',
  'Eat a fruit or vegetable with every meal 🥦',
  'Stand up and stretch every hour ⏰',
  'Limit screen time 1 hour before bed 📵',
  'Log your health metrics to track your progress 📊',
]

const MEDICATION_REMINDERS = [
  'Time to take your morning medication 💊',
  'Afternoon medication reminder — stay on schedule 💊',
  'Evening medication reminder — don\'t forget! 💊',
]

// ── check if a notification of this type was already sent today ──────────────
async function alreadySentToday(uid: string, type: NotifType): Promise<boolean> {
  const startOfDay = new Date()
  startOfDay.setHours(0, 0, 0, 0)
  const snap = await getDocs(userNotifCol(uid))
  return snap.docs.some(d => {
    const data = d.data()
    return data.type === type && data.timestamp?.seconds >= Timestamp.fromDate(startOfDay).seconds
  })
}

// ── check if weekly summary was sent this week ───────────────────────────────
async function alreadySentThisWeek(uid: string): Promise<boolean> {
  const startOfWeek = new Date()
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
  startOfWeek.setHours(0, 0, 0, 0)
  const snap = await getDocs(userNotifCol(uid))
  return snap.docs.some(d => {
    const data = d.data()
    return data.type === 'weekly_summary' && data.timestamp?.seconds >= Timestamp.fromDate(startOfWeek).seconds
  })
}

// ── helper: send email via API route ─────────────────────────────────────────
async function sendEmail(to: string, subject: string, text: string) {
  try {
    await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, subject, text }),
    })
  } catch (error) {
    console.error('Email notification error:', error)
  }
}

// ── public: push a report-ready notification ─────────────────────────────────
export async function pushReportReadyNotification(uid: string, fileName: string, userEmail?: string) {
  const settings = await getUserSettings(uid)
  if (!settings.notifications.reportReady) return
  await addDoc(userNotifCol(uid), {
    type: 'report_ready',
    title: 'Report Analysis Complete ✅',
    message: `Your report "${fileName}" has been analyzed successfully.`,
    read: false,
    timestamp: Timestamp.now(),
  })
  if (settings.notifications.email && userEmail) {
    await sendEmail(
      userEmail,
      'Report Analysis Complete ✅',
      `Your report "${fileName}" has been analyzed successfully.\n\nLog in to CareNova to view the full results.`
    )
  }
}

// ── public: push a login alert notification ──────────────────────────────────
export async function pushLoginAlertNotification(uid: string, userEmail?: string) {
  const settings = await getUserSettings(uid)
  if (!settings.notifications.push) return
  const message = `A new login to your CareNova account was detected at ${new Date().toLocaleTimeString()}.`
  await addDoc(userNotifCol(uid), {
    type: 'login_alert',
    title: 'New Login Detected 🔐',
    message,
    read: false,
    timestamp: Timestamp.now(),
  })
  if (settings.notifications.email && userEmail) {
    await sendEmail(userEmail, 'New Login Detected 🔐', message)
  }
}

// ── hook ─────────────────────────────────────────────────────────────────────
export function useNotifications(uid: string | undefined) {
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [ready, setReady] = useState(false)

  const load = useCallback(async () => {
    if (!uid) return
    const snap = await getDocs(userNotifCol(uid))
    const all = snap.docs
      .map(d => ({ ...d.data(), id: d.id } as AppNotification))
      .sort((a, b) => b.timestamp?.seconds - a.timestamp?.seconds)
      .slice(0, 30)
    setNotifications(all)
    setReady(true)
  }, [uid])

  // Generate automatic notifications based on settings + time
  const generateAutoNotifications = useCallback(async () => {
    if (!uid) return
    const settings = await getUserSettings(uid)
    const now = new Date()
    const hour = now.getHours()
    const dayOfWeek = now.getDay() // 0 = Sunday

    const tasks: Promise<any>[] = []

    // Medication reminders — push notifications: 8am, 1pm, 8pm
    if (settings.notifications.push) {
      const medIndex = hour >= 8 && hour < 13 ? 0 : hour >= 13 && hour < 20 ? 1 : hour >= 20 ? 2 : -1
      if (medIndex >= 0) {
        const alreadySent = await alreadySentToday(uid, 'medication')
        if (!alreadySent) {
          tasks.push(addDoc(userNotifCol(uid), {
            type: 'medication',
            title: 'Medication Reminder 💊',
            message: MEDICATION_REMINDERS[medIndex],
            read: false,
            timestamp: Timestamp.now(),
          }))
        }
      }

      // Health tip — once per day
      const tipSent = await alreadySentToday(uid, 'health_tip')
      if (!tipSent) {
        tasks.push(addDoc(userNotifCol(uid), {
          type: 'health_tip',
          title: 'Daily Health Tip 💡',
          message: HEALTH_TIPS[now.getDay() % HEALTH_TIPS.length],
          read: false,
          timestamp: Timestamp.now(),
        }))
      }
    }

    // Weekly summary — every Monday
    if (settings.notifications.weeklySummary && dayOfWeek === 1) {
      const weeklySent = await alreadySentThisWeek(uid)
      if (!weeklySent) {
        tasks.push(addDoc(userNotifCol(uid), {
          type: 'weekly_summary',
          title: 'Weekly Health Summary 📊',
          message: 'Your weekly health progress is ready. Check your dashboard for insights!',
          read: false,
          timestamp: Timestamp.now(),
        }))
      }
    }

    if (tasks.length > 0) {
      await Promise.allSettled(tasks)
      await load()
    }
  }, [uid, load])

  useEffect(() => {
    if (!uid) return
    load().then(() => generateAutoNotifications())
  }, [uid, load, generateAutoNotifications])

  const markAsRead = useCallback(async (notifId: string) => {
    if (!uid) return
    await updateDoc(userNotifDoc(uid, notifId), { read: true })
    setNotifications(prev =>
      prev.map(n => n.id === notifId ? { ...n, read: true } : n)
    )
  }, [uid])

  const markAllAsRead = useCallback(async () => {
    if (!uid) return
    const unread = notifications.filter(n => !n.read)
    await Promise.all(unread.map(n => updateDoc(userNotifDoc(uid, n.id!), { read: true })))
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }, [uid, notifications])

  const unreadCount = notifications.filter(n => !n.read).length

  return { notifications, unreadCount, markAsRead, markAllAsRead, reload: load, ready }
}
