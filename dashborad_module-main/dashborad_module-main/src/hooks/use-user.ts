'use client'

import { useState, useEffect } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export interface UserSession {
  uid: string
  name: string
  email: string
  photoURL?: string
  fullName?: string
}

function getStoredUser(): UserSession | null {
  try {
    const raw = localStorage.getItem('carenova_user')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function storeUser(user: UserSession) {
  localStorage.setItem('carenova_user', JSON.stringify(user))
}

export function clearUser() {
  localStorage.removeItem('carenova_user')
}

export function useUser() {
  const [user, setUser] = useState<UserSession | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // 1. Check URL params first (redirect from landing module)
    const params = new URLSearchParams(window.location.search)
    const urlUid = params.get('uid')
    const urlName = params.get('name')
    const urlEmail = params.get('email')

    if (urlUid) {
      const fromUrl: UserSession = { uid: urlUid, name: urlName || '', email: urlEmail || '' }
      storeUser(fromUrl)
      window.history.replaceState({}, '', window.location.pathname)
    }

    // 2. Read from localStorage
    const stored = getStoredUser()
    if (!stored?.uid) { setReady(true); return }

    setUser(stored)

    // 3. Enrich with Firestore profile (name, photoURL)
    getDoc(doc(db, 'users', stored.uid))
      .then(snap => {
        if (snap.exists()) {
          const data = snap.data()
          const enriched: UserSession = {
            ...stored,
            fullName: data.fullName || stored.name,
            name: data.fullName || stored.name,
            email: data.email || stored.email,
            photoURL: data.photoURL || '',
          }
          setUser(enriched)
          storeUser(enriched)
        }
      })
      .catch(console.error)
      .finally(() => setReady(true))
  }, [])

  return { user, ready }
}
