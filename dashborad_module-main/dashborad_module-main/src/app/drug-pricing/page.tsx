'use client'

import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Search } from 'lucide-react'
import PriceSearch from '@/components/PriceSearch'

export default function DrugPricingPage() {
  return (
    <DashboardLayout title="Drug Price Detection">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Drug Price Detection</h2>
          <p className="text-gray-500 mt-1">Search real-time healthcare and medication prices from the web</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5 text-blue-600" />
              Healthcare Price Search
            </CardTitle>
            <CardDescription>Search real-time healthcare procedure prices from the web</CardDescription>
          </CardHeader>
          <CardContent>
            <PriceSearch />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
