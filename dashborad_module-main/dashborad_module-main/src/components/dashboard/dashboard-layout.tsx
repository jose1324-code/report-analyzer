'use client'

import { Sidebar } from '@/components/dashboard/sidebar'
import { Navbar } from '@/components/dashboard/navbar'

interface DashboardLayoutProps {
  children: React.ReactNode
  title?: string
}

export function DashboardLayout({ children, title = 'Dashboard' }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <Navbar title={title} />
      <main className="pt-16 min-h-screen md:ml-16 lg:ml-64">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
