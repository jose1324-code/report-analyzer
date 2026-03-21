'use client'

import { Upload, Stethoscope, Pill, MessageCircle, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const actions = [
  {
    title: 'Upload My Report',
    description: 'Upload medical reports for AI analysis',
    icon: Upload,
    color: 'bg-blue-500',
    hoverColor: 'hover:bg-blue-600',
  },
  {
    title: 'Check My Symptoms',
    description: 'Get AI-powered symptom analysis',
    icon: Stethoscope,
    color: 'bg-green-500',
    hoverColor: 'hover:bg-green-600',
  },
  {
    title: 'Search Medications',
    description: 'Check drug info and interactions',
    icon: Pill,
    color: 'bg-purple-500',
    hoverColor: 'hover:bg-purple-600',
  },
  {
    title: 'Talk to AI Assistant',
    description: 'Chat with mental health companion',
    icon: MessageCircle,
    color: 'bg-orange-500',
    hoverColor: 'hover:bg-orange-600',
  },
]

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">Quick Actions</CardTitle>
        <p className="text-sm text-gray-500">Manage your health quickly</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
          {actions.map((action) => (
            <Button
              key={action.title}
              variant="outline"
              className="h-auto p-4 flex flex-col items-start gap-3 hover:shadow-md transition-all group"
            >
              <div className={`p-2.5 rounded-lg ${action.color} ${action.hoverColor} transition-colors`}>
                <action.icon className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                  {action.title}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{action.description}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 ml-auto group-hover:translate-x-1 transition-transform" />
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
