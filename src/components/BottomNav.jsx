import React from 'react'
import { Home, FolderOpen, Bell, User } from 'lucide-react'
import { cn } from '../lib/utils'

const TABS = [
  { id: 'home', icon: Home, label: '首页' },
  { id: 'categories', icon: FolderOpen, label: '分类' },
  { id: 'reminders', icon: Bell, label: '提醒' },
  { id: 'profile', icon: User, label: '我的' },
]

export default function BottomNav({ active, onChange }) {
  return (
    <nav className="shrink-0 h-[72px] border-t border-note-line bg-note-paper/95 backdrop-blur-xl px-2 flex justify-around items-center z-50 app-bottom-nav">
      {TABS.map((tab) => {
        const Icon = tab.icon
        const on = active === tab.id
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn('flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-colors', on ? 'text-note-ink' : 'text-note-muted')}
          >
            <Icon className={cn('w-5 h-5', on && 'scale-110')} strokeWidth={on ? 2.4 : 2} />
            <span className="text-[10px] font-bold">{tab.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
