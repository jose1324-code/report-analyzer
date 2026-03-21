'use client'

import { Search, Bell, ChevronDown, LogOut, User, Settings, Pill, Lightbulb, FileCheck, BarChart2, ShieldAlert, CheckCheck } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { useUser, clearUser } from '@/hooks/use-user'
import { useNotifications, type NotifType } from '@/hooks/use-notifications'
import Link from 'next/link'

interface NavbarProps { title: string }

function timeAgo(ts: any): string {
  if (!ts?.seconds) return ''
  const diff = Math.floor((Date.now() / 1000) - ts.seconds)
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

const notifIcon: Record<NotifType, { icon: any; color: string; bg: string }> = {
  medication:     { icon: Pill,        color: 'text-blue-600',   bg: 'bg-blue-100' },
  health_tip:     { icon: Lightbulb,   color: 'text-yellow-600', bg: 'bg-yellow-100' },
  report_ready:   { icon: FileCheck,   color: 'text-green-600',  bg: 'bg-green-100' },
  weekly_summary: { icon: BarChart2,   color: 'text-purple-600', bg: 'bg-purple-100' },
  login_alert:    { icon: ShieldAlert, color: 'text-red-600',    bg: 'bg-red-100' },
}

export function Navbar({ title }: NavbarProps) {
  const { user } = useUser()
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications(user?.uid)

  const handleLogout = () => {
    clearUser()
    window.location.href = process.env.NEXT_PUBLIC_LANDING_URL ?? 'http://localhost:8081'
  }

  const initials = (user?.name || 'U').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  return (
    <header className="fixed top-0 right-0 left-64 h-16 bg-white border-b border-gray-200 z-30 flex items-center px-6 shadow-sm">
      <div className="flex-1">
        <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
      </div>

      <div className="flex-1 max-w mx-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w- h-4 text-gray-400 padding-right: 100px;" />
          <Input
            type="search"
            placeholder="Search reports, medications..."
            className="pl-10 bg-gray-50 border-gray-200 focus:bg-white"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications Bell */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5 text-gray-600" />
              {unreadCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500 text-white border-0">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-96 p-0" onCloseAutoFocus={e => e.preventDefault()}>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <span className="font-semibold text-gray-900">Notifications</span>
              {unreadCount > 0 && (
                <button
                  onClick={e => { e.preventDefault(); markAllAsRead() }}
                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                >
                  <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                  <Bell className="w-8 h-8 mb-2 opacity-30" />
                  <p className="text-sm">No notifications yet</p>
                </div>
              ) : (
                notifications.map(n => {
                  const meta = notifIcon[n.type]
                  const Icon = meta.icon
                  return (
                    <div
                      key={n.id}
                      onClick={() => n.id && !n.read && markAsRead(n.id)}
                      className={`flex items-start gap-3 px-4 py-3 border-b last:border-0 cursor-pointer transition-colors hover:bg-gray-50 ${!n.read ? 'bg-blue-50/50' : ''}`}
                    >
                      <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${meta.bg}`}>
                        <Icon className={`w-4 h-4 ${meta.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className={`text-sm font-medium text-gray-900 truncate ${!n.read ? 'font-semibold' : ''}`}>
                            {n.title}
                          </p>
                          {!n.read && <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{n.message}</p>
                        <p className="text-xs text-gray-400 mt-1">{timeAgo(n.timestamp)}</p>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="px-4 py-2 border-t text-center">
                <Link href="/settings" className="text-xs text-blue-600 hover:underline">
                  Manage notification settings →
                </Link>
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 hover:bg-gray-100">
              <Avatar className="w-8 h-8">
                <AvatarImage src={user?.photoURL || undefined} />
                <AvatarFallback className="bg-blue-100 text-blue-600">{initials}</AvatarFallback>
              </Avatar>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-900">{user?.name || 'User'}</p>
                <p className="text-xs text-gray-500">{user?.email || ''}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile" className="flex items-center gap-2 cursor-pointer">
                <User className="w-4 h-4" /> My Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings" className="flex items-center gap-2 cursor-pointer">
                <Settings className="w-4 h-4" /> Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
              <LogOut className="w-4 h-4 mr-2" /> Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
