import React, { useState } from 'react'
import {
  Cloud, Trash2, Bell, Tag, BarChart3, Moon, Sun, Monitor, ChevronRight, Shield, BookOpen, User,
} from 'lucide-react'
import { cn } from '../lib/utils'

export default function ProfileView({
  settings, notes, reminders, onChangeSettings, onNavigate, onReplayOnboarding,
}) {
  const [nickname, setNickname] = useState(settings.nickname || '记事人')
  const activeNotes = notes.filter((n) => !n.deletedAt).length
  const encryptedCount = notes.filter((n) => !n.deletedAt && n.encrypted).length

  const setTheme = (theme) => {
    onChangeSettings?.({ theme })
    if (theme === 'dark') document.documentElement.classList.add('dark')
    else if (theme === 'system') {
      document.documentElement.classList.toggle('dark', window.matchMedia('(prefers-color-scheme: dark)').matches)
    } else document.documentElement.classList.remove('dark')
  }

  const saveNickname = () => {
    onChangeSettings?.({ nickname: nickname.trim() || '记事人' })
  }

  const shortcuts = [
    { id: 'sync', icon: Cloud, label: '同步管理' },
    { id: 'privacy', icon: Shield, label: '隐私保护' },
    { id: 'trash', icon: Trash2, label: '回收站' },
    { id: 'tags', icon: Tag, label: '标签管理' },
    { id: 'reminders', icon: Bell, label: '提醒管理' },
  ]

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="shrink-0 px-4 pb-4 app-top-bar border-b border-note-line">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-note-ink text-note-paper flex items-center justify-center text-2xl font-bold">
            {(settings.nickname || '记事人')[0]}
          </div>
          <div>
            <h1 className="text-xl font-serif font-bold">{settings.nickname || '记事人'}</h1>
            <p className="text-[11px] text-note-muted">单机本地 · 数据保存在本机</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-hide">
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: '记事', value: activeNotes },
            { label: '提醒', value: reminders.filter((r) => r.status === 'pending').length },
            { label: '加密', value: encryptedCount },
          ].map((s) => (
            <div key={s.label} className="p-3 rounded-2xl border border-note-line bg-surface text-center">
              <p className="text-lg font-black">{s.value}</p>
              <p className="text-[10px] text-note-muted font-bold">{s.label}</p>
            </div>
          ))}
        </div>

        <section className="p-4 rounded-2xl border border-note-line bg-surface space-y-2">
          <p className="text-sm font-bold flex items-center gap-2"><User className="w-4 h-4" />昵称</p>
          <div className="flex gap-2">
            <input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="你的昵称"
              className="flex-1 px-3 py-2 rounded-xl border border-note-line bg-input text-sm outline-none"
            />
            <button type="button" onClick={saveNickname} className="px-4 py-2 rounded-xl bg-note-ink text-note-paper text-xs font-bold">保存</button>
          </div>
        </section>

        <section>
          <p className="text-[10px] font-black tracking-wider text-note-muted uppercase mb-2">快捷入口</p>
          <div className="space-y-1">
            {shortcuts.map((item) => {
              const Icon = item.icon
              return (
                <button key={item.id} type="button" onClick={() => onNavigate?.(item.id)} className="w-full flex items-center gap-3 p-3 rounded-xl border border-note-line bg-surface text-left active:opacity-80">
                  <Icon className="w-4 h-4 text-note-muted" />
                  <span className="flex-1 text-sm font-bold">{item.label}</span>
                  <ChevronRight className="w-4 h-4 text-note-muted/50" />
                </button>
              )
            })}
          </div>
        </section>

        <section>
          <p className="text-[10px] font-black tracking-wider text-note-muted uppercase mb-2">主题</p>
          <div className="flex gap-2">
            {[
              { id: 'light', icon: Sun, label: '浅色' },
              { id: 'dark', icon: Moon, label: '深色' },
              { id: 'system', icon: Monitor, label: '跟随系统' },
            ].map((t) => {
              const Icon = t.icon
              return (
                <button key={t.id} type="button" onClick={() => setTheme(t.id)} className={cn('flex-1 py-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1', settings.theme === t.id ? 'bg-note-ink text-note-paper border-note-ink' : 'border-note-line bg-surface')}>
                  <Icon className="w-4 h-4" />{t.label}
                </button>
              )
            })}
          </div>
        </section>

        <section className="p-4 rounded-2xl border border-note-line bg-surface">
          <p className="text-sm font-bold flex items-center gap-2 mb-2"><BookOpen className="w-4 h-4" />使用引导</p>
          <p className="text-xs text-note-muted leading-relaxed mb-3">重新查看首次使用的功能介绍。</p>
          <button type="button" onClick={onReplayOnboarding} className="w-full py-2.5 rounded-xl border border-note-line text-xs font-bold">
            重新查看引导
          </button>
        </section>

        <section className="p-4 rounded-2xl border border-note-line bg-surface">
          <p className="text-sm font-bold flex items-center gap-2 mb-2"><BarChart3 className="w-4 h-4" />使用统计</p>
          <p className="text-xs text-note-muted leading-relaxed">已创建 {activeNotes} 条记事，{reminders.filter((r) => r.status === 'pending').length} 条待提醒。所有数据保存在浏览器本地。</p>
        </section>
      </div>
    </div>
  )
}
