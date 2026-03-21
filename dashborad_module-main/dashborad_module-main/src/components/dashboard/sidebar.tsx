'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  FileText,
  Pill,
  DollarSign,
  Activity,
  MessageCircle,
  TrendingUp,
  QrCode,
  User,
  Settings,
  LogOut,
  Heart,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { useUser, clearUser } from '@/hooks/use-user'

const menuItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Medical Report Analyzer', href: '/report-analyzer', icon: FileText },
  { name: 'Drug Information', href: '/drug-info', icon: Pill },
  { name: 'Drug Price Detection', href: '/drug-pricing', icon: DollarSign },
  { name: 'Health Risk Prediction', href: '/risk-prediction', icon: Activity },
  { name: 'Mental Health Chatbot', href: '/chatbot', icon: MessageCircle },
  { name: 'Health Trends Analysis', href: '/health-trends', icon: TrendingUp },
  { name: 'Doctor Access', href: '/doctor-access', icon: QrCode },
]

const bottomMenuItems = [
  { name: 'My Profile', href: '/profile', icon: User },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const { user } = useUser()
  const initials = (user?.name || 'U').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  const handleLogout = () => {
    clearUser()
    window.location.href = 'http://localhost:8081'
  }

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-gradient-to-b from-blue-600 to-blue-800 text-white flex flex-col">
      {/* Logo Section */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-blue-500/30">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm">
          <Heart className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">CareNova</h1>
          <p className="text-xs text-blue-200">Your Health Companion</p>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-white/20 text-white shadow-lg'
                      : 'text-blue-100 hover:bg-white/10 hover:text-white'
                  )}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  <span className="truncate">{item.name}</span>
                </Link>
              </li>
            )
          })}
        </ul>

        <div className="mt-6 pt-6 border-t border-blue-500/30">
          <ul className="space-y-1">
            {bottomMenuItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                      isActive
                        ? 'bg-white/20 text-white shadow-lg'
                        : 'text-blue-100 hover:bg-white/10 hover:text-white'
                    )}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    <span>{item.name}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      </nav>

      {/* User Profile Section */}
      <div className="border-t border-blue-500/30 p-4">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10 border-2 border-white/30">
            <AvatarImage src={user?.photoURL || undefined} />
            <AvatarFallback className="bg-blue-400 text-white">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name || 'User'}</p>
            <p className="text-xs text-blue-200 truncate">{user?.email || ''}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10"
            onClick={handleLogout}
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </aside>
  )
}
