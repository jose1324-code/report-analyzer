'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DollarSign, Search, MapPin, TrendingDown, Store, Loader2 } from 'lucide-react'

interface DrugPrice {
  pharmacy: string
  price: string
  distance: string
  address: string
  savings?: string
}

export default function DrugPricingPage() {
  const [drugName, setDrugName] = useState('')
  const [pincode, setPincode] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [prices, setPrices] = useState<DrugPrice[]>([])
  const [searchPerformed, setSearchPerformed] = useState(false)

  const handleSearch = async () => {
    if (!drugName.trim() || !pincode.trim()) {
      alert('Please enter both drug name and pincode')
      return
    }

    setIsSearching(true)
    setSearchPerformed(true)

    try {
      const response = await fetch('/api/drug-pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ drugName, pincode })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch prices')
      }

      setPrices(data.prices)
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setPrices([])
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <DashboardLayout title="Drug Price Detection">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Drug Price Detection</h2>
          <p className="text-gray-500 mt-1">Compare medication prices at pharmacies near you</p>
        </div>

        {/* Search Section */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input 
                  placeholder="Enter medication name" 
                  className="pl-10 h-12" 
                  value={drugName}
                  onChange={(e) => setDrugName(e.target.value)}
                />
              </div>
              <div className="relative flex-1">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input 
                  placeholder="Enter your pincode" 
                  className="pl-10 h-12" 
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                />
              </div>
              <Button 
                className="h-12 px-6 bg-blue-600 hover:bg-blue-700"
                onClick={handleSearch}
                disabled={isSearching}
              >
                {isSearching ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Searching...
                  </>
                ) : (
                  'Compare Prices'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Price Comparison */}
        {searchPerformed && (
          <div className=" w-296">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  Price Comparison: {drugName}
                </CardTitle>
                <CardDescription>Prices near pincode {pincode}</CardDescription>
              </CardHeader>
              <CardContent>
                {prices.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Store className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No prices found for this location</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {prices.map((item, i) => (
                      <div key={i} className="flex flex-col p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <Store className="w-5 h-5 text-gray-600" />
                            <span className="font-medium text-gray-900">{item.pharmacy}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-lg font-bold text-gray-900">{item.price}</span>
                            {item.savings && (
                              <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                                {item.savings}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <MapPin className="w-3 h-3" />
                          <span>{item.address} • {item.distance}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
