import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Bell, Clock, Repeat, MapPin, Timer } from 'lucide-react'
import { uid } from '../lib/utils'

const TYPES = [
  { id: 'once', label: '定时', icon: Clock },
  { id: 'repeat', label: '重复', icon: Repeat },
  { id: 'countdown', label: '倒计时', icon: Timer },
  { id: 'location', label: '位置', icon: MapPin },
]

export default function ReminderModal({ open, onClose, onSave, initial, notes = [] }) {
  const [type, setType] = useState('once')
  const [title, setTitle] = useState('')
  const [noteId, setNoteId] = useState('')
  const [datetime, setDatetime] = useState('')
  const [repeat, setRepeat] = useState('daily')
  const [advance, setAdvance] = useState('10')
  const [countdownMin, setCountdownMin] = useState('30')
  const [location, setLocation] = useState('')

  useEffect(() => {
    if (initial) {
      setType(initial.type || 'once')
      setTitle(initial.title || '')
      setNoteId(initial.noteId || '')
      setDatetime(initial.datetime ? new Date(initial.datetime).toISOString().slice(0, 16) : '')
      setRepeat(initial.repeatRule || 'daily')
      setAdvance(String(initial.advanceMinutes ?? 10))
      setCountdownMin(String(initial.countdownMinutes || 30))
      setLocation(initial.location || '')
    } else {
      const d = new Date(Date.now() + 3600000)
      setDatetime(d.toISOString().slice(0, 16))
      setTitle('')
      setNoteId('')
    }
  }, [initial, open])

  if (!open) return null

  const save = () => {
    if (!title.trim() && !noteId) {
      alert('请填写提醒标题或关联记事')
      return
    }
    let triggerAt = Date.now() + 3600000
    if (type === 'once' && datetime) triggerAt = new Date(datetime).getTime()
    if (type === 'countdown') triggerAt = Date.now() + Number(countdownMin) * 60000
    onSave?.({
      id: initial?.id || uid('rem'),
      title: title.trim(),
      noteId: noteId || null,
      type,
      datetime: triggerAt,
      repeatRule: type === 'repeat' ? repeat : null,
      advanceMinutes: Number(advance) || 0,
      countdownMinutes: type === 'countdown' ? Number(countdownMin) : null,
      location: type === 'location' ? location : '',
      status: 'pending',
      createdAt: initial?.createdAt || Date.now(),
    })
    onClose?.()
  }

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[100] bg-black/35 flex items-end">
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          className="w-full bg-note-paper rounded-t-3xl p-5 pb-8 border-t border-note-line max-h-[80dvh] overflow-y-auto"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2"><Bell className="w-5 h-5" /><h3 className="font-bold">{initial?.createdAt ? '编辑提醒' : '新建提醒'}</h3></div>
            <button type="button" onClick={onClose} className="p-2 rounded-full bg-note-cream"><X className="w-4 h-4" /></button>
          </div>

          <label className="block mb-3">
            <span className="text-[11px] font-bold text-note-muted">提醒标题</span>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="如：开会、取快递" className="w-full mt-1 px-3 py-2.5 rounded-xl border border-note-line bg-input text-sm outline-none" />
          </label>

          <label className="block mb-3">
            <span className="text-[11px] font-bold text-note-muted">关联记事（可选）</span>
            <select value={noteId} onChange={(e) => setNoteId(e.target.value)} className="w-full mt-1 px-3 py-2.5 rounded-xl border border-note-line bg-input text-sm">
              <option value="">不关联记事</option>
              {notes.map((n) => (
                <option key={n.id} value={n.id}>{n.title || '无标题'}</option>
              ))}
            </select>
          </label>

          <div className="flex gap-2 mb-4 flex-wrap">
            {TYPES.map((t) => {
              const Icon = t.icon
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setType(t.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border ${type === t.id ? 'bg-note-ink text-note-paper border-note-ink' : 'border-note-line text-note-muted bg-surface'}`}
                >
                  <Icon className="w-3.5 h-3.5" />{t.label}
                </button>
              )
            })}
          </div>
          {type === 'once' && (
            <label className="block mb-3">
              <span className="text-[11px] font-bold text-note-muted">提醒时间</span>
              <input type="datetime-local" value={datetime} onChange={(e) => setDatetime(e.target.value)} className="w-full mt-1 px-3 py-2.5 rounded-xl border border-note-line bg-input text-sm" />
            </label>
          )}
          {type === 'repeat' && (
            <label className="block mb-3">
              <span className="text-[11px] font-bold text-note-muted">重复规则</span>
              <select value={repeat} onChange={(e) => setRepeat(e.target.value)} className="w-full mt-1 px-3 py-2.5 rounded-xl border border-note-line bg-input text-sm">
                <option value="daily">每天</option>
                <option value="weekly">每周</option>
                <option value="monthly">每月</option>
              </select>
            </label>
          )}
          {type === 'countdown' && (
            <label className="block mb-3">
              <span className="text-[11px] font-bold text-note-muted">倒计时（分钟）</span>
              <input type="number" min="1" value={countdownMin} onChange={(e) => setCountdownMin(e.target.value)} className="w-full mt-1 px-3 py-2.5 rounded-xl border border-note-line bg-input text-sm" />
            </label>
          )}
          {type === 'location' && (
            <label className="block mb-3">
              <span className="text-[11px] font-bold text-note-muted">到达位置</span>
              <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="如：公司楼下" className="w-full mt-1 px-3 py-2.5 rounded-xl border border-note-line bg-input text-sm" />
            </label>
          )}
          <label className="block mb-4">
            <span className="text-[11px] font-bold text-note-muted">提前提醒</span>
            <select value={advance} onChange={(e) => setAdvance(e.target.value)} className="w-full mt-1 px-3 py-2.5 rounded-xl border border-note-line bg-input text-sm">
              <option value="0">不提前</option>
              <option value="10">提前 10 分钟</option>
              <option value="30">提前 30 分钟</option>
            </select>
          </label>
          <button type="button" onClick={save} className="w-full py-3.5 rounded-2xl bg-note-ink text-note-paper font-bold">确认保存</button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
