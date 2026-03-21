'use client'

import { useEffect, useState, useCallback } from 'react'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Bell, Shield, Palette, Globe, Database, HelpCircle, Mail, Smartphone, Moon, Lock, Trash2, AlertTriangle, Download, CheckCircle } from 'lucide-react'
import { useUser, clearUser } from '@/hooks/use-user'
import {
  getUserSettings, saveUserSettings, getMedicalReports, getUserProfile,
  defaultSettings, deleteAllUserData, type UserSettings
} from '@/lib/firestoreService'
import { auth } from '@/lib/firebase'
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential, deleteUser } from 'firebase/auth'

// ── tiny toast ──────────────────────────────────────────────────────────────
function Toast({ msg, ok }: { msg: string; ok: boolean }) {
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-white text-sm ${ok ? 'bg-green-600' : 'bg-red-600'}`}>
      {ok ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
      {msg}
    </div>
  )
}

// ── confirm dialog ───────────────────────────────────────────────────────────
function ConfirmDialog({ title, message, onConfirm, onCancel, danger = false, children }: {
  title: string; message: string; onConfirm: () => void; onCancel: () => void; danger?: boolean; children?: React.ReactNode
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-500 mb-4">{message}</p>
        {children}
        <div className="flex gap-3 justify-end mt-4">
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button variant={danger ? 'destructive' : 'default'} onClick={onConfirm}>Confirm</Button>
        </div>
      </div>
    </div>
  )
}

export default function SettingsPage() {
  const { user, ready } = useUser()
  const [settings, setSettings] = useState<UserSettings>(defaultSettings)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)

  // password change
  const [showPwDialog, setShowPwDialog] = useState(false)
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')

  // danger zone
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false)
  const [deleteConfirmPw, setDeleteConfirmPw] = useState('')

  // data stats
  const [reportCount, setReportCount] = useState(0)

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3000)
  }

  // Load settings + stats
  useEffect(() => {
    if (!ready || !user?.uid) return
    getUserSettings(user.uid).then(setSettings).catch(console.error)
    getMedicalReports(user.uid).then(r => setReportCount(r.length)).catch(console.error)
  }, [ready, user?.uid])

  // Apply dark mode to <html>
  useEffect(() => {
    document.documentElement.classList.toggle('dark', settings.appearance.darkMode)
  }, [settings.appearance.darkMode])

  // Apply font size to <html>
  useEffect(() => {
    const map: Record<string, string> = { small: '14px', medium: '16px', large: '18px' }
    document.documentElement.style.fontSize = map[settings.appearance.fontSize] ?? '16px'
  }, [settings.appearance.fontSize])

  const persist = useCallback(async (updated: UserSettings) => {
    if (!user?.uid) return
    setSaving(true)
    try {
      await saveUserSettings(user.uid, updated)
      showToast('Settings saved')
    } catch {
      showToast('Failed to save settings', false)
    } finally {
      setSaving(false)
    }
  }, [user?.uid])

  function update<S extends keyof UserSettings>(section: S, key: keyof UserSettings[S], value: unknown) {
    const updated = { ...settings, [section]: { ...settings[section], [key]: value } }
    setSettings(updated)
    persist(updated)
  }

  // ── Change Password ──────────────────────────────────────────────────────
  async function handleChangePassword() {
    if (newPw !== confirmPw) { showToast('Passwords do not match', false); return }
    if (newPw.length < 6) { showToast('Password must be at least 6 characters', false); return }
    const firebaseUser = auth.currentUser
    if (!firebaseUser?.email) { showToast('No authenticated user found', false); return }
    try {
      const cred = EmailAuthProvider.credential(firebaseUser.email, currentPw)
      await reauthenticateWithCredential(firebaseUser, cred)
      await updatePassword(firebaseUser, newPw)
      showToast('Password changed successfully')
      setShowPwDialog(false)
      setCurrentPw(''); setNewPw(''); setConfirmPw('')
    } catch (e: any) {
      showToast(e.code === 'auth/wrong-password' ? 'Current password is incorrect' : 'Failed to change password', false)
    }
  }

  // ── Download Data ────────────────────────────────────────────────────────
  async function handleDownloadData() {
    if (!user?.uid) return
    try {
      const [profile, reports] = await Promise.all([
        getUserProfile(user.uid),
        getMedicalReports(user.uid),
      ])
      const blob = new Blob([JSON.stringify({ profile, reports, exportedAt: new Date().toISOString() }, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a'); a.href = url; a.download = `carenova-data-${user.uid}.json`; a.click()
      URL.revokeObjectURL(url)
      showToast('Data downloaded')
    } catch {
      showToast('Failed to download data', false)
    }
  }

  // ── Delete Account ───────────────────────────────────────────────────────
  async function handleDeleteAccount() {
    const firebaseUser = auth.currentUser
    if (!firebaseUser?.email || !user?.uid) { showToast('No authenticated user', false); return }
    try {
      const cred = EmailAuthProvider.credential(firebaseUser.email, deleteConfirmPw)
      await reauthenticateWithCredential(firebaseUser, cred)
      await deleteAllUserData(user.uid)
      await deleteUser(firebaseUser)
      clearUser()
      window.location.href = process.env.NEXT_PUBLIC_LANDING_URL ?? 'http://localhost:8081'
    } catch (e: any) {
      showToast(e.code === 'auth/wrong-password' ? 'Incorrect password' : 'Failed to delete account', false)
    }
  }

  // ── Deactivate (clear local session + data, keep Firebase Auth) ──────────
  async function handleDeactivate() {
    if (!user?.uid) return
    try {
      await deleteAllUserData(user.uid)
      clearUser()
      window.location.href = process.env.NEXT_PUBLIC_LANDING_URL ?? 'http://localhost:8081'
    } catch {
      showToast('Failed to deactivate account', false)
    }
  }

  if (!ready) return <DashboardLayout title="Settings"><div className="flex items-center justify-center h-64 text-gray-400">Loading…</div></DashboardLayout>

  const themeColors = [
    { key: 'blue', cls: 'bg-blue-500' },
    { key: 'green', cls: 'bg-green-500' },
    { key: 'purple', cls: 'bg-purple-500' },
    { key: 'orange', cls: 'bg-orange-500' },
    { key: 'pink', cls: 'bg-pink-500' },
  ]

  return (
    <DashboardLayout title="Settings">
      {toast && <Toast msg={toast.msg} ok={toast.ok} />}

      {/* Change Password Dialog */}
      {showPwDialog && (
        <ConfirmDialog
          title="Change Password"
          message="Enter your current password and choose a new one."
          onConfirm={handleChangePassword}
          onCancel={() => { setShowPwDialog(false); setCurrentPw(''); setNewPw(''); setConfirmPw('') }}
        >
          <div className="space-y-3">
            <Input type="password" placeholder="Current password" value={currentPw} onChange={e => setCurrentPw(e.target.value)} />
            <Input type="password" placeholder="New password (min 6 chars)" value={newPw} onChange={e => setNewPw(e.target.value)} />
            <Input type="password" placeholder="Confirm new password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} />
          </div>
        </ConfirmDialog>
      )}

      {/* Deactivate Dialog */}
      {showDeactivateDialog && (
        <ConfirmDialog
          title="Deactivate Account"
          message="This will clear all your health data and log you out. Your login credentials will remain. This cannot be undone."
          onConfirm={handleDeactivate}
          onCancel={() => setShowDeactivateDialog(false)}
          danger
        />
      )}

      {/* Delete Account Dialog */}
      {showDeleteDialog && (
        <ConfirmDialog
          title="Delete Account & All Data"
          message="This permanently deletes your account and all data. Enter your password to confirm."
          onConfirm={handleDeleteAccount}
          onCancel={() => { setShowDeleteDialog(false); setDeleteConfirmPw('') }}
          danger
        >
          <Input type="password" placeholder="Your password" value={deleteConfirmPw} onChange={e => setDeleteConfirmPw(e.target.value)} />
        </ConfirmDialog>
      )}

      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Settings</h2>
          <p className="text-gray-500 mt-1">Manage your account settings and preferences {saving && <span className="text-blue-500 text-xs ml-2">Saving…</span>}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Bell className="w-5 h-5 text-blue-600" />Notifications</CardTitle>
              <CardDescription>Configure how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {([
                { key: 'email', icon: Mail, label: 'Email Notifications', desc: 'Report alerts, appointment reminders' },
                { key: 'push', icon: Smartphone, label: 'Push Notifications', desc: 'Medication reminders, health tips' },
                { key: 'reportReady', icon: Bell, label: 'Report Ready Alerts', desc: 'When your analysis is complete' },
                { key: 'weeklySummary', icon: Mail, label: 'Weekly Health Summary', desc: 'Your health progress every week' },
              ] as const).map(({ key, icon: Icon, label, desc }) => (
                <div key={key} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-gray-400" />
                    <div><p className="font-medium text-gray-900">{label}</p><p className="text-sm text-gray-500">{desc}</p></div>
                  </div>
                  <Switch checked={settings.notifications[key]} onCheckedChange={v => update('notifications', key, v)} />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Privacy & Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Shield className="w-5 h-5 text-green-600" />Privacy & Security</CardTitle>
              <CardDescription>Manage your security settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {([
                { key: 'twoFactor', label: 'Two-Factor Authentication', desc: 'Add extra security to your account' },
                { key: 'biometric', label: 'Biometric Login', desc: 'Use fingerprint or face ID' },
                { key: 'loginAlerts', label: 'Login Alerts', desc: 'Get notified of new logins' },
              ] as const).map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between">
                  <div><p className="font-medium text-gray-900">{label}</p><p className="text-sm text-gray-500">{desc}</p></div>
                  <Switch checked={settings.security[key]} onCheckedChange={v => update('security', key, v)} />
                </div>
              ))}
              <Button variant="outline" className="w-full mt-2" onClick={() => setShowPwDialog(true)}>
                <Lock className="w-4 h-4 mr-2" />Change Password
              </Button>
            </CardContent>
          </Card>

          {/* Appearance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Palette className="w-5 h-5 text-purple-600" />Appearance</CardTitle>
              <CardDescription>Customize your app experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Moon className="w-5 h-5 text-gray-400" />
                  <div><p className="font-medium text-gray-900">Dark Mode</p><p className="text-sm text-gray-500">Easier on your eyes at night</p></div>
                </div>
                <Switch checked={settings.appearance.darkMode} onCheckedChange={v => update('appearance', 'darkMode', v)} />
              </div>
              <div>
                <p className="font-medium text-gray-900 mb-3">Theme Color</p>
                <div className="flex gap-3">
                  {themeColors.map(({ key, cls }) => (
                    <button
                      key={key}
                      onClick={() => update('appearance', 'themeColor', key)}
                      className={`w-8 h-8 rounded-full ${cls} ${settings.appearance.themeColor === key ? 'ring-2 ring-offset-2 ring-gray-600' : ''}`}
                    />
                  ))}
                </div>
              </div>
              <div>
                <p className="font-medium text-gray-900 mb-2">Font Size</p>
                <select
                  className="w-full h-10 px-3 border rounded-lg text-sm bg-white"
                  value={settings.appearance.fontSize}
                  onChange={e => update('appearance', 'fontSize', e.target.value)}
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium (Default)</option>
                  <option value="large">Large</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Language & Region */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Globe className="w-5 h-5 text-orange-600" />Language & Region</CardTitle>
              <CardDescription>Set your language and regional preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Language</label>
                <select className="w-full h-10 px-3 border rounded-lg text-sm bg-white" value={settings.region.language} onChange={e => update('region', 'language', e.target.value)}>
                  {['English (US)', 'Spanish', 'French', 'German', 'Chinese'].map(l => <option key={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Timezone</label>
                <select className="w-full h-10 px-3 border rounded-lg text-sm bg-white" value={settings.region.timezone} onChange={e => update('region', 'timezone', e.target.value)}>
                  {['Pacific Time (PT)', 'Mountain Time (MT)', 'Central Time (CT)', 'Eastern Time (ET)'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Date Format</label>
                <select className="w-full h-10 px-3 border rounded-lg text-sm bg-white" value={settings.region.dateFormat} onChange={e => update('region', 'dateFormat', e.target.value)}>
                  {['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'].map(f => <option key={f}>{f}</option>)}
                </select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Data & Storage */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Database className="w-5 h-5 text-blue-600" />My Data & Storage</CardTitle>
            <CardDescription>Manage your health data and storage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Reports Stored</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{reportCount}</p>
                <p className="text-sm text-gray-500">documents</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Account</p>
                <p className="text-lg font-bold text-gray-900 mt-1 truncate">{user?.email || '—'}</p>
                <p className="text-sm text-gray-500">logged in</p>
              </div>
            </div>
            <Button variant="outline" onClick={handleDownloadData}>
              <Download className="w-4 h-4 mr-2" />Download My Data
            </Button>
          </CardContent>
        </Card>

        {/* Help & Support */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><HelpCircle className="w-5 h-5 text-green-600" />Help & Support</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {['User Guide', 'Contact Support', 'FAQ', 'Report an Issue', 'Privacy Policy', 'Terms of Service'].map(label => (
                <Button key={label} variant="outline" onClick={() => showToast(`${label} — coming soon`, true)}>{label}</Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center gap-2"><AlertTriangle className="w-5 h-5" />Danger Zone</CardTitle>
            <CardDescription>Irreversible actions for your account</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => setShowDeactivateDialog(true)}>
                Deactivate Account
              </Button>
              <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
                <Trash2 className="w-4 h-4 mr-2" />Delete Account & All Data
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
