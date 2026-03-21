'use client'

import { useState, useEffect, useRef } from 'react'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { User, Mail, Phone, MapPin, Calendar, Edit, Camera, Activity, Save, X, Plus } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from '@/lib/firebase'
import { useUser } from '@/hooks/use-user'

async function loadProfile(uid: string) {
  const snap = await getDoc(doc(db, 'userProfiles', uid))
  return snap.exists() ? snap.data() : null
}

async function persistProfile(uid: string, data: Record<string, any>) {
  const ref2 = doc(db, 'userProfiles', uid)
  const snap = await getDoc(ref2)
  await setDoc(ref2, {
    ...data,
    userId: uid,
    updatedAt: Timestamp.now(),
    ...(snap.exists() ? {} : { createdAt: Timestamp.now() }),
  }, { merge: true })
}

export default function ProfilePage() {
  const { toast } = useToast()
  const { user, ready } = useUser()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [profile, setProfile] = useState<Record<string, any>>({})
  const [careTeam] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [form, setForm] = useState<Record<string, any>>({})
  const [newCondition, setNewCondition] = useState('')
  const [newAllergy, setNewAllergy] = useState('')

  useEffect(() => {
    if (!ready) return
    if (!user?.uid) { setLoading(false); return }
    loadProfile(user.uid)
      .then(prof => {
        if (prof) {
          setProfile(prof)
        } else {
          const seed = {
            fullName: user.name || '',
            email: user.email || '',
            phone: '', dateOfBirth: '', address: '', bloodType: '',
            conditions: [], allergies: [],
            emergencyContact: { name: '', phone: '', relationship: '' },
            photoURL: ''
          }
          setProfile(seed)
          persistProfile(user.uid, seed).catch(console.error)
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [ready, user?.uid])

  const startEdit = () => {
    setForm({
      fullName: profile.fullName || '',
      email: profile.email || '',
      phone: profile.phone || '',
      dateOfBirth: profile.dateOfBirth || '',
      address: profile.address || '',
      bloodType: profile.bloodType || '',
      conditions: [...(profile.conditions || [])],
      allergies: [...(profile.allergies || [])],
      emergencyContact: { ...(profile.emergencyContact || { name: '', phone: '', relationship: '' }) },
    })
    setEditing(true)
  }

  const cancelEdit = () => { setEditing(false); setNewCondition(''); setNewAllergy('') }

  const handleSave = async () => {
    if (!user?.uid) {
      toast({ title: 'Not logged in', description: 'Please log in again.', variant: 'destructive' })
      return
    }
    setSaving(true)
    try {
      const payload = {
        fullName: form.fullName || '',
        email: form.email || '',
        phone: form.phone || '',
        dateOfBirth: form.dateOfBirth || '',
        address: form.address || '',
        bloodType: form.bloodType || '',
        conditions: form.conditions || [],
        allergies: form.allergies || [],
        emergencyContact: form.emergencyContact || { name: '', phone: '', relationship: '' },
        photoURL: profile.photoURL || '',
      }
      await persistProfile(user.uid, payload)
      setProfile(prev => ({ ...prev, ...payload }))
      setEditing(false)
      setNewCondition('')
      setNewAllergy('')
      toast({ title: 'Saved!', description: 'Profile updated successfully.' })
    } catch (err: any) {
      console.error('Save error:', err)
      toast({ title: 'Save failed', description: err?.message || 'Check console for details.', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user?.uid) return
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Invalid file', description: 'Please select an image.', variant: 'destructive' })
      return
    }
    setUploading(true)
    try {
      const storageRef = ref(storage, `profilePhotos/${user.uid}`)
      await uploadBytes(storageRef, file)
      const url = await getDownloadURL(storageRef)
      await persistProfile(user.uid, { ...profile, photoURL: url })
      setProfile(prev => ({ ...prev, photoURL: url }))
      toast({ title: 'Photo updated!' })
    } catch (err: any) {
      console.error('Upload error:', err)
      toast({ title: 'Upload failed', description: err?.message, variant: 'destructive' })
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const f = (key: string) => form[key] || ''
  const setF = (key: string, val: string) => setForm(prev => ({ ...prev, [key]: val }))

  const addCondition = () => {
    if (!newCondition.trim()) return
    setForm(prev => ({ ...prev, conditions: [...prev.conditions, newCondition.trim()] }))
    setNewCondition('')
  }
  const removeCondition = (i: number) =>
    setForm(prev => ({ ...prev, conditions: prev.conditions.filter((_: any, idx: number) => idx !== i) }))

  const addAllergy = () => {
    if (!newAllergy.trim()) return
    setForm(prev => ({ ...prev, allergies: [...prev.allergies, newAllergy.trim()] }))
    setNewAllergy('')
  }
  const removeAllergy = (i: number) =>
    setForm(prev => ({ ...prev, allergies: prev.allergies.filter((_: any, idx: number) => idx !== i) }))

  const initials = (profile.fullName || user?.name || 'U').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
  const displayConditions = editing ? form.conditions : profile.conditions
  const displayAllergies = editing ? form.allergies : profile.allergies

  if (loading) {
    return (
      <DashboardLayout title="My Profile">
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Loading profile...</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="My Profile">
      <div className="space-y-6">

        {/* Header Card */}
        <Card>
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="relative">
                <Avatar className="w-28 h-28 border-4 border-blue-100">
                  <AvatarImage src={profile.photoURL || undefined} />
                  <AvatarFallback className="bg-blue-100 text-blue-600 text-2xl">{initials}</AvatarFallback>
                </Avatar>
                <Button size="icon" disabled={uploading} onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 rounded-full w-8 h-8 bg-blue-600 hover:bg-blue-700">
                  <Camera className="w-4 h-4" />
                </Button>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
              </div>
              <div className="text-center md:text-left flex-1">
                <h2 className="text-2xl font-bold text-gray-900">{profile.fullName || user?.name || 'New User'}</h2>
                <p className="text-gray-500 mt-1">Patient ID: {user?.uid?.slice(0, 12).toUpperCase()}</p>
                <Badge className="mt-3 bg-green-100 text-green-700 hover:bg-green-100">Active Member</Badge>
              </div>
              {!editing ? (
                <Button onClick={startEdit} className="bg-blue-600 hover:bg-blue-700">
                  <Edit className="w-4 h-4 mr-2" /> Edit Profile
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button onClick={handleSave} disabled={saving} className="bg-green-600 hover:bg-green-700">
                    <Save className="w-4 h-4 mr-2" />{saving ? 'Saving...' : 'Save'}
                  </Button>
                  <Button onClick={cancelEdit} variant="outline">
                    <X className="w-4 h-4 mr-2" />Cancel
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Personal Info */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Your personal details and contact information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {([
                { icon: User, label: 'Full Name', key: 'fullName' },
                { icon: Calendar, label: 'Date of Birth', key: 'dateOfBirth', placeholder: 'e.g. March 15, 1990' },
                { icon: Mail, label: 'Email', key: 'email', type: 'email' },
                { icon: Phone, label: 'Phone', key: 'phone', placeholder: '+91 00000 00000' },
                { icon: MapPin, label: 'Address', key: 'address' },
              ] as { icon: any; label: string; key: string; type?: string; placeholder?: string }[]).map(({ icon: Icon, label, key, type, placeholder }) => (
                <div key={key} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Icon className="w-5 h-5 text-gray-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500">{label}</p>
                    {editing ? (
                      <Input type={type || 'text'} value={f(key)} placeholder={placeholder}
                        onChange={e => setF(key, e.target.value)} className="mt-1 h-8 text-sm" />
                    ) : (
                      <p className="font-medium text-gray-900 truncate">{profile[key] || '—'}</p>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Health Info */}
          <Card>
            <CardHeader>
              <CardTitle>Health Information</CardTitle>
              <CardDescription>Your health profile and conditions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">

              {/* Blood Type */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Activity className="w-5 h-5 text-gray-400 shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500">Blood Type</p>
                  {editing ? (
                    <Input value={f('bloodType')} placeholder="e.g. O+"
                      onChange={e => setF('bloodType', e.target.value)} className="mt-1 h-8 text-sm" />
                  ) : (
                    <p className="font-medium text-gray-900">{profile.bloodType || '—'}</p>
                  )}
                </div>
              </div>

              {/* Conditions */}
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-2">Known Conditions</p>
                <div className="flex flex-wrap gap-2">
                  {displayConditions?.length ? displayConditions.map((c: string, i: number) => (
                    <Badge key={i} variant="outline" className="gap-1">
                      {c}
                      {editing && <X className="w-3 h-3 cursor-pointer" onClick={() => removeCondition(i)} />}
                    </Badge>
                  )) : <span className="text-sm text-gray-400">None</span>}
                </div>
                {editing && (
                  <div className="flex gap-2 mt-2">
                    <Input value={newCondition} placeholder="Add condition"
                      onChange={e => setNewCondition(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && addCondition()} className="h-7 text-xs" />
                    <Button size="sm" variant="outline" onClick={addCondition} className="h-7 px-2"><Plus className="w-3 h-3" /></Button>
                  </div>
                )}
              </div>

              {/* Allergies */}
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-2">Allergies</p>
                <div className="flex flex-wrap gap-2">
                  {displayAllergies?.length ? displayAllergies.map((a: string, i: number) => (
                    <Badge key={i} variant="outline" className="border-red-200 text-red-700 gap-1">
                      {a}
                      {editing && <X className="w-3 h-3 cursor-pointer" onClick={() => removeAllergy(i)} />}
                    </Badge>
                  )) : <span className="text-sm text-gray-400">None</span>}
                </div>
                {editing && (
                  <div className="flex gap-2 mt-2">
                    <Input value={newAllergy} placeholder="Add allergy"
                      onChange={e => setNewAllergy(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && addAllergy()} className="h-7 text-xs" />
                    <Button size="sm" variant="outline" onClick={addAllergy} className="h-7 px-2"><Plus className="w-3 h-3" /></Button>
                  </div>
                )}
              </div>

              {/* Emergency Contact */}
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-2">Emergency Contact</p>
                {editing ? (
                  <div className="space-y-2">
                    <Input value={form.emergencyContact?.name || ''} placeholder="Name"
                      onChange={e => setForm(prev => ({ ...prev, emergencyContact: { ...prev.emergencyContact, name: e.target.value } }))}
                      className="h-8 text-sm" />
                    <Input value={form.emergencyContact?.relationship || ''} placeholder="Relationship"
                      onChange={e => setForm(prev => ({ ...prev, emergencyContact: { ...prev.emergencyContact, relationship: e.target.value } }))}
                      className="h-8 text-sm" />
                    <Input value={form.emergencyContact?.phone || ''} placeholder="Phone"
                      onChange={e => setForm(prev => ({ ...prev, emergencyContact: { ...prev.emergencyContact, phone: e.target.value } }))}
                      className="h-8 text-sm" />
                  </div>
                ) : (
                  <>
                    <p className="font-medium text-gray-900">
                      {profile.emergencyContact?.name || 'Not set'}
                      {profile.emergencyContact?.relationship ? ` (${profile.emergencyContact.relationship})` : ''}
                    </p>
                    <p className="text-sm text-gray-600">{profile.emergencyContact?.phone || ''}</p>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Care Team */}
        {careTeam.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Care Team</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {careTeam.map((member, i) => (
                  <div key={i} className="p-4 bg-gray-50 rounded-lg">
                    <p className="font-medium text-gray-900">{member.name}</p>
                    <p className="text-sm text-blue-600">{member.role}</p>
                    <p className="text-sm text-gray-500 mt-1">{member.phone}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
