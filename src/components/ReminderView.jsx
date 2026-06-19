import React, { useMemo, useState } from 'react'
import { Bell, Clock, CheckCircle, XCircle, AlertCircle, Edit3, Plus } from 'lucide-react'
import { cn, formatDateTime } from '../lib/utils'

const STATUS = {
  pending: { label: '待提醒', icon: Clock, cls: 'text-status-blue bg-status-blue' },
  fired: { label: '已提醒', icon: Bell, cls: 'text-status-amber bg-status-amber' },
  done: { label: '已处理', icon: CheckCircle, cls: 'text-status-green bg-status-green' },
  cancelled: { label: '已取消', icon: XCircle, cls: 'text-note-muted bg-surface' },
  expired: { label: '已过期', icon: AlertCircle, cls: 'text-status-red bg-status-red' },
}

export default function ReminderView({ reminders, notes, onAdd, onEdit, onDelete, onMarkDone, onReschedule, onOpenNote, onOpenDetail }) {
  const [tab, setTab] = useState('all')
  const now = Date.now()

  const enriched = useMemo(() => reminders.map((r) => {
    const note = notes.find((n) => n.id === r.noteId)
    let status = r.status
    if (status === 'pending' && r.datetime < now) status = 'expired'
    return { ...r, note, status }
  }).sort((a, b) => b.datetime - a.datetime), [reminders, notes, now])

  const filtered = tab === 'all' ? enriched : enriched.filter((r) => r.status === tab)

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="shrink-0 px-4 pb-3 app-top-bar border-b border-note-line">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-serif font-bold">提醒管理</h1>
            <p className="text-[11px] text-note-muted">{enriched.filter((r) => r.status === 'pending').length} 条待提醒</p>
          </div>
          <button type="button" onClick={onAdd} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-note-ink text-note-paper text-xs font-bold shrink-0">
            <Plus className="w-4 h-4" />新建
          </button>
        </div>
        <div className="flex gap-1.5 mt-3 overflow-x-auto scrollbar-hide">
          {[{ id: 'all', label: '全部' }, ...Object.entries(STATUS).map(([id, s]) => ({ id, label: s.label }))].map((t) => (
            <button key={t.id} type="button" onClick={() => setTab(t.id)} className={cn('shrink-0 px-3 py-1.5 rounded-full text-[10px] font-bold border', tab === t.id ? 'bg-note-ink text-note-paper border-note-ink' : 'border-note-line text-note-muted bg-surface')}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 scrollbar-hide">
        {filtered.length === 0 ? (
          <div className="py-20 text-center text-sm text-note-muted">
            暂无提醒<br />
            <button type="button" onClick={onAdd} className="mt-4 px-4 py-2 rounded-xl bg-note-ink text-note-paper text-xs font-bold">添加提醒</button>
          </div>
        ) : filtered.map((r) => {
          const st = STATUS[r.status] || STATUS.pending
          const Icon = st.icon
          const left = r.datetime - now
          const label = r.title || r.note?.title || '未命名提醒'
          return (
            <button key={r.id} type="button" onClick={() => onOpenDetail?.(r)} className="w-full text-left p-4 rounded-2xl border border-note-line bg-surface">
              <div className="flex items-start gap-3">
                <span className={cn('p-2 rounded-xl shrink-0', st.cls)}><Icon className="w-4 h-4" /></span>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate">{label}</p>
                  <p className="text-[11px] text-note-muted mt-0.5">{formatDateTime(r.datetime)} · {r.type}</p>
                  <p className="text-[10px] text-note-muted/70 mt-1">
                    {r.status === 'pending' && left > 0 ? `还有 ${Math.ceil(left / 60000)} 分钟` : st.label}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                {r.status === 'expired' && (
                  <button type="button" onClick={(e) => { e.stopPropagation(); onReschedule?.(r) }} className="text-[10px] font-bold text-note-accent">重新设置</button>
                )}
                {r.status === 'pending' && (
                  <>
                    <button type="button" onClick={(e) => { e.stopPropagation(); onMarkDone?.(r.id) }} className="text-[10px] font-bold text-status-green">已处理</button>
                    <button type="button" onClick={(e) => { e.stopPropagation(); onDelete?.(r.id) }} className="text-[10px] font-bold text-status-red">取消</button>
                  </>
                )}
                {r.note && (
                  <button type="button" onClick={(e) => { e.stopPropagation(); onOpenNote?.(r.note) }} className="text-[10px] font-bold text-note-muted ml-auto">查看记事</button>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function ReminderDetailSheet({ reminder, note, onClose, onEdit, onMarkDone, onDelete, onOpenNote, onReschedule }) {
  if (!reminder) return null
  const st = STATUS[reminder.status] || STATUS.pending
  const label = reminder.title || note?.title || '未命名提醒'
  return (
    <div className="absolute inset-0 z-[95] bg-black/30 flex items-end">
      <div className="w-full bg-note-paper rounded-t-3xl p-5 pb-8 border-t border-note-line">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold">提醒详情</h3>
          <button type="button" onClick={onClose} className="text-sm text-note-muted">关闭</button>
        </div>
        <p className="text-sm font-bold">{label}</p>
        <p className="text-xs text-note-muted mt-2">时间：{formatDateTime(reminder.datetime)}</p>
        <p className="text-xs text-note-muted">类型：{reminder.type} · 状态：{st.label}</p>
        {reminder.advanceMinutes > 0 && <p className="text-xs text-note-muted">提前 {reminder.advanceMinutes} 分钟</p>}
        <div className="flex flex-wrap gap-2 mt-5">
          <button type="button" onClick={() => onEdit?.(reminder)} className="flex items-center gap-1 px-3 py-2 rounded-xl bg-note-ink text-note-paper text-xs font-bold"><Edit3 className="w-3.5 h-3.5" />编辑</button>
          <button type="button" onClick={() => onMarkDone?.(reminder.id)} className="px-3 py-2 rounded-xl border border-note-line text-status-green text-xs font-bold">已处理</button>
          {note && (
            <button type="button" onClick={() => onOpenNote?.(note)} className="px-3 py-2 rounded-xl border border-note-line text-xs font-bold">查看记事</button>
          )}
          {reminder.status === 'expired' && (
            <button type="button" onClick={() => onReschedule?.(reminder)} className="px-3 py-2 rounded-xl border border-note-accent text-note-accent text-xs font-bold">重新设置</button>
          )}
          <button type="button" onClick={() => onDelete?.(reminder.id)} className="px-3 py-2 rounded-xl border border-note-line text-status-red text-xs font-bold">取消提醒</button>
        </div>
      </div>
    </div>
  )
}
