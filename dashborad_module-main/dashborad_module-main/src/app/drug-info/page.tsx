'use client'

import { useState, useEffect, useRef } from 'react'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Pill, Search, AlertCircle, CheckCircle, Info, ShieldAlert,
  X, Loader2, Package, IndianRupee, FlaskConical, Sparkles,
  Stethoscope, Activity, Clock, TriangleAlert, HeartPulse, Thermometer
} from 'lucide-react'

type Medicine = {
  id: string
  name: string
  'price(₹)': string
  Is_discontinued: string
  manufacturer_name: string
  type: string
  pack_size_label: string
  short_composition1: string
  short_composition2: string
  llmAvailable?: boolean
  llmError?: string
  llm?: {
    overview: string
    indications: string
    mechanism: string
    dosage: string
    sideEffects: { common: string; serious: string }
    warnings: string
    contraindications: string
    interactions: string
    storage: string
    pregnancy: string
    overdose: string
  }
}

type InteractionResult = {
  found: boolean
  drug1?: string
  drug2?: string
  compatible?: boolean | null
  severity?: string
  summary?: string
  details?: string
  recommendation?: string
  monitoring?: string
  composition1?: string
  composition2?: string
  llmAvailable?: boolean
  source?: string
  message?: string
}

function BulletText({ text }: { text: string }) {
  if (!text) return <p className="text-sm text-gray-500 italic">Not available</p>
  return (
    <div className="space-y-1">
      {text.split('\n').filter(Boolean).map((line, i) => (
        <p key={i} className="text-sm text-gray-700 leading-relaxed">{line}</p>
      ))}
    </div>
  )
}

function InfoSection({ icon, title, content, color = 'blue' }: {
  icon: React.ReactNode; title: string; content: string; color?: string
}) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 border-blue-100',
    green: 'bg-green-50 border-green-100',
    orange: 'bg-orange-50 border-orange-100',
    red: 'bg-red-50 border-red-100',
    purple: 'bg-purple-50 border-purple-100',
    gray: 'bg-gray-50 border-gray-100',
  }
  return (
    <div className={`rounded-xl border p-4 ${colors[color] || colors.blue}`}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <p className="text-sm font-semibold text-gray-800">{title}</p>
      </div>
      <BulletText text={content} />
    </div>
  )
}

export default function DrugInfoPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [medicine, setMedicine] = useState<Medicine | null>(null)
  const [loadingDrug, setLoadingDrug] = useState(false)
  const [drugError, setDrugError] = useState('')

  const [drug1, setDrug1] = useState('')
  const [drug2, setDrug2] = useState('')
  const [interactionResult, setInteractionResult] = useState<InteractionResult | null>(null)
  const [loadingInteraction, setLoadingInteraction] = useState(false)

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const suggestRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (searchQuery.length < 2) { setSuggestions([]); return }
    debounceRef.current = setTimeout(async () => {
      const res = await fetch(`/api/drugbank?action=search&q=${encodeURIComponent(searchQuery)}`)
      const data = await res.json()
      setSuggestions(data.suggestions || [])
      setShowSuggestions(true)
    }, 300)
  }, [searchQuery])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (suggestRef.current && !suggestRef.current.contains(e.target as Node))
        setShowSuggestions(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const fetchMedicine = async (name: string) => {
    setLoadingDrug(true)
    setDrugError('')
    setMedicine(null)
    setShowSuggestions(false)
    try {
      const res = await fetch(`/api/drugbank?action=llm&name=${encodeURIComponent(name)}`)
      const data = await res.json()
      if (data.error) { setDrugError(data.error); return }
      setMedicine(data)
    } catch {
      setDrugError('Failed to fetch medicine details.')
    } finally {
      setLoadingDrug(false)
    }
  }

  const checkInteraction = async () => {
    if (!drug1 || !drug2) return
    setLoadingInteraction(true)
    setInteractionResult(null)
    try {
      const res = await fetch(`/api/drugbank?action=interaction&drug1=${encodeURIComponent(drug1)}&drug2=${encodeURIComponent(drug2)}`)
      const data = await res.json()
      setInteractionResult(data)
    } catch {
      setInteractionResult({ found: false, message: 'Failed to check interaction.' })
    } finally {
      setLoadingInteraction(false)
    }
  }

  const isDiscontinued = medicine?.Is_discontinued === 'TRUE'
  const compositions = medicine
    ? [medicine.short_composition1, medicine.short_composition2].filter(c => c?.trim())
    : []

  const severityColor = (s?: string) => {
    if (s === 'severe') return 'bg-red-100 text-red-700'
    if (s === 'moderate') return 'bg-orange-100 text-orange-700'
    if (s === 'mild') return 'bg-yellow-100 text-yellow-700'
    return 'bg-green-100 text-green-700'
  }

  return (
    <DashboardLayout title="Drug Information">
      <div className="space-y-6">

        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Drug Information</h2>
          <p className="text-gray-500 mt-1">
            Gemini AI-powered medicine details from Indian database — search any medicine for full clinical information
          </p>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="p-6">
            <div className="relative flex gap-4" ref={suggestRef}>
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Search medicine (e.g., Augmentin, Azithral, Allegra, Atorva...)"
                  className="pl-10 h-12"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && fetchMedicine(searchQuery)}
                  onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                />
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                    {suggestions.map((s, i) => (
                      <button
                        key={i}
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2 border-b last:border-0"
                        onClick={() => { setSearchQuery(s); fetchMedicine(s) }}
                      >
                        <Pill className="w-4 h-4 text-blue-400 shrink-0" />
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <Button
                className="h-12 px-6 bg-blue-600 hover:bg-blue-700"
                onClick={() => fetchMedicine(searchQuery)}
                disabled={loadingDrug || !searchQuery}
              >
                {loadingDrug
                  ? <Loader2 className="w-5 h-5 animate-spin" />
                  : <><Search className="w-5 h-5 mr-2" />Search</>
                }
              </Button>
            </div>
            <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-purple-500" />
              Powered by Gemini 1.5 Flash + Indian Medicine Database
            </p>
          </CardContent>
        </Card>

        {/* Loading */}
        {loadingDrug && (
          <Card>
            <CardContent className="p-12 flex flex-col items-center gap-3">
              <div className="relative">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                <Sparkles className="w-5 h-5 text-purple-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <p className="text-gray-700 font-medium">Gemini AI is analyzing this medicine...</p>
              <p className="text-gray-400 text-sm">Generating clinical information using Gemini 1.5 Flash</p>
            </CardContent>
          </Card>
        )}

        {/* Error */}
        {drugError && !loadingDrug && (
          <Card className="border-red-200">
            <CardContent className="p-6 flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-red-500 shrink-0" />
              <div>
                <p className="font-semibold text-red-700">Medicine Not Found</p>
                <p className="text-sm text-red-600">{drugError}. Try a partial name from the autocomplete.</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Medicine Detail */}
        {medicine && !loadingDrug && (
          <>
            {/* Status banner */}
            {!medicine.llmAvailable && (
              <div className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
                <TriangleAlert className="w-5 h-5 text-yellow-600 shrink-0" />
                <p className="text-sm text-yellow-800">
                  {medicine.llmError || 'Gemini API error. Showing basic medicine data only.'}
                </p>
              </div>
            )}
            {medicine.llmAvailable && (
              <div className="flex items-center gap-3 p-3 bg-purple-50 border border-purple-200 rounded-xl">
                <Sparkles className="w-5 h-5 text-purple-600 shrink-0" />
                <p className="text-sm text-purple-800">
                  AI-generated clinical information by <strong>Gemini 1.5 Flash</strong> — based on Indian medicine database
                </p>
              </div>
            )}

            {/* Medicine Header */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center shrink-0">
                    <Pill className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="text-xl font-bold text-gray-900">{medicine.name}</h3>
                      {isDiscontinued
                        ? <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Discontinued</Badge>
                        : <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Available</Badge>
                      }
                      {medicine.llmAvailable && (
                        <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> Gemini AI
                        </Badge>
                      )}
                    </div>
                    <p className="text-gray-500 text-sm mb-2">{medicine.manufacturer_name}</p>
                    <div className="flex gap-2 flex-wrap">
                      <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 capitalize">{medicine.type}</Badge>
                      <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100">{medicine.pack_size_label}</Badge>
                      {compositions.map((c, i) => (
                        <Badge key={i} className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100">{c.trim()}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="flex items-center gap-1 text-2xl font-bold text-green-700">
                      <IndianRupee className="w-5 h-5" />
                      {medicine['price(₹)']}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{medicine.pack_size_label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs defaultValue="overview">
              <TabsList className="flex-wrap h-auto gap-1 mb-2">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="dosage">Dosage</TabsTrigger>
                <TabsTrigger value="sideeffects">Side Effects</TabsTrigger>
                <TabsTrigger value="warnings">Warnings</TabsTrigger>
                <TabsTrigger value="interactions">Interactions</TabsTrigger>
                <TabsTrigger value="pharmacology">Pharmacology</TabsTrigger>
                <TabsTrigger value="storage">Storage & Safety</TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <InfoSection
                    icon={<Info className="w-4 h-4 text-blue-600" />}
                    title="What is this medicine?"
                    content={medicine.llm?.overview || 'Search a medicine to see AI-generated overview.'}
                    color="blue"
                  />
                  <InfoSection
                    icon={<Stethoscope className="w-4 h-4 text-green-600" />}
                    title="Indications & Uses"
                    content={medicine.llm?.indications || 'Not available'}
                    color="green"
                  />
                  <InfoSection
                    icon={<FlaskConical className="w-4 h-4 text-purple-600" />}
                    title="Active Composition"
                    content={compositions.join('\n')}
                    color="purple"
                  />
                  <InfoSection
                    icon={<Package className="w-4 h-4 text-gray-600" />}
                    title="Pack & Manufacturer"
                    content={`${medicine.pack_size_label}\n${medicine.manufacturer_name}`}
                    color="gray"
                  />
                </div>
              </TabsContent>

              <TabsContent value="dosage">
                <div className="grid grid-cols-1 gap-4">
                  <InfoSection
                    icon={<Clock className="w-4 h-4 text-blue-600" />}
                    title="Dosage & Administration"
                    content={medicine.llm?.dosage || 'Not available'}
                    color="blue"
                  />
                  <InfoSection
                    icon={<TriangleAlert className="w-4 h-4 text-red-600" />}
                    title="Overdose — What to do"
                    content={medicine.llm?.overdose || 'Not available'}
                    color="red"
                  />
                </div>
              </TabsContent>

              <TabsContent value="sideeffects">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoSection
                    icon={<AlertCircle className="w-4 h-4 text-yellow-600" />}
                    title="Common Side Effects"
                    content={medicine.llm?.sideEffects?.common || 'Not available'}
                    color="orange"
                  />
                  <InfoSection
                    icon={<AlertCircle className="w-4 h-4 text-red-600" />}
                    title="Serious Side Effects"
                    content={medicine.llm?.sideEffects?.serious || 'Not available'}
                    color="red"
                  />
                </div>
              </TabsContent>

              <TabsContent value="warnings">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoSection
                    icon={<ShieldAlert className="w-4 h-4 text-orange-600" />}
                    title="Warnings & Precautions"
                    content={medicine.llm?.warnings || 'Not available'}
                    color="orange"
                  />
                  <InfoSection
                    icon={<X className="w-4 h-4 text-red-600" />}
                    title="Contraindications"
                    content={medicine.llm?.contraindications || 'Not available'}
                    color="red"
                  />
                  <InfoSection
                    icon={<HeartPulse className="w-4 h-4 text-pink-600" />}
                    title="Pregnancy & Breastfeeding"
                    content={medicine.llm?.pregnancy || 'Not available'}
                    color="red"
                  />
                </div>
              </TabsContent>

              <TabsContent value="interactions">
                <InfoSection
                  icon={<Activity className="w-4 h-4 text-orange-600" />}
                  title={`Drug Interactions — ${medicine.name}`}
                  content={medicine.llm?.interactions || 'Not available'}
                  color="orange"
                />
              </TabsContent>

              <TabsContent value="pharmacology">
                <InfoSection
                  icon={<Sparkles className="w-4 h-4 text-purple-600" />}
                  title="Mechanism of Action"
                  content={medicine.llm?.mechanism || 'Not available'}
                  color="purple"
                />
              </TabsContent>

              <TabsContent value="storage">
                <InfoSection
                  icon={<Thermometer className="w-4 h-4 text-blue-600" />}
                  title="Storage & Handling"
                  content={medicine.llm?.storage || 'Not available'}
                  color="blue"
                />
              </TabsContent>
            </Tabs>
          </>
        )}

        {/* Interaction Checker */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-orange-500" />
              AI Interaction Checker
            </CardTitle>
            <CardDescription>
              Check if two medicines are safe to consume together — analyzed by Gemini AI
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Medicine 1</label>
                <Input placeholder="e.g., Augmentin 625 Duo Tablet" value={drug1} onChange={e => setDrug1(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Medicine 2</label>
                <Input placeholder="e.g., Aciloc 150 Tablet" value={drug2} onChange={e => setDrug2(e.target.value)} />
              </div>
            </div>
            <Button
              className="bg-orange-500 hover:bg-orange-600 text-white"
              onClick={checkInteraction}
              disabled={!drug1 || !drug2 || loadingInteraction}
            >
              {loadingInteraction
                ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Gemini is analyzing...</>
                : <><Sparkles className="w-4 h-4 mr-2" />Check Interaction</>
              }
            </Button>

            {interactionResult && (
              interactionResult.found ? (
                <div className={`rounded-xl border p-5 space-y-4 ${
                  interactionResult.compatible === true ? 'bg-green-50 border-green-300'
                  : interactionResult.compatible === false ? 'bg-red-50 border-red-300'
                  : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex items-center gap-3 flex-wrap">
                    {interactionResult.compatible === true
                      ? <CheckCircle className="w-6 h-6 text-green-600 shrink-0" />
                      : interactionResult.compatible === false
                        ? <X className="w-6 h-6 text-red-600 shrink-0" />
                        : <Info className="w-6 h-6 text-gray-400 shrink-0" />
                    }
                    <p className={`font-bold text-base ${
                      interactionResult.compatible === true ? 'text-green-800'
                      : interactionResult.compatible === false ? 'text-red-800'
                      : 'text-gray-700'
                    }`}>
                      {interactionResult.summary}
                    </p>
                    {interactionResult.severity && (
                      <Badge className={severityColor(interactionResult.severity)}>
                        {interactionResult.severity} severity
                      </Badge>
                    )}
                    {interactionResult.llmAvailable && (
                      <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Gemini AI
                      </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-white rounded-lg p-3 border">
                      <p className="text-xs font-semibold text-gray-500 mb-1">Clinical Details</p>
                      <p className="text-sm text-gray-700">{interactionResult.details}</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 border">
                      <p className="text-xs font-semibold text-gray-500 mb-1">Recommendation</p>
                      <p className="text-sm text-gray-700">{interactionResult.recommendation}</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 border">
                      <p className="text-xs font-semibold text-gray-500 mb-1">What to Monitor</p>
                      <p className="text-sm text-gray-700">{interactionResult.monitoring}</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 border space-y-2">
                      <div>
                        <p className="text-xs font-semibold text-gray-500">{interactionResult.drug1}</p>
                        <p className="text-xs text-gray-500">{interactionResult.composition1}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500">{interactionResult.drug2}</p>
                        <p className="text-xs text-gray-500">{interactionResult.composition2}</p>
                      </div>
                    </div>
                  </div>

                  {interactionResult.source && (
                    <p className="text-xs text-gray-400">Source: {interactionResult.source}</p>
                  )}
                </div>
              ) : (
                <div className="p-4 rounded-xl border bg-gray-50 border-gray-200 flex items-center gap-3">
                  <Info className="w-5 h-5 text-gray-400" />
                  <p className="text-sm text-gray-600">{interactionResult.message}</p>
                </div>
              )
            )}
          </CardContent>
        </Card>

        {/* Bottom Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <Sparkles className="w-8 h-8 text-purple-600 mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Gemini AI Powered</h3>
              <p className="text-sm text-gray-500">Gemini 1.5 Flash generates clinical information — dosage, side effects, warnings & more</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <IndianRupee className="w-8 h-8 text-green-600 mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Indian Medicine Data</h3>
              <p className="text-sm text-gray-500">500+ real Indian medicines with actual MRP pricing from top manufacturers</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <ShieldAlert className="w-8 h-8 text-orange-600 mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">AI Interaction Analysis</h3>
              <p className="text-sm text-gray-500">Gemini-powered drug interaction checker with severity, clinical details & monitoring advice</p>
            </CardContent>
          </Card>
        </div>

      </div>
    </DashboardLayout>
  )
}
