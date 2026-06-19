import React, { useState, useMemo } from 'react'
import { RotateCcw, Trash2, Search, ChevronLeft } from 'lucide-react'
import { formatRelative } from '../lib/utils'
import { noteSummary } from '../lib/defaults'

export default function TrashView({ notes, settings, onRestore, onPurge, onClearAll, onChangeSettings, onClose }) {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState([])

  const trashed = useMemo(() => {
    let list = notes.filter((n) => n.deletedAt)
    const q = search.trim().toLowerCase()
    if (q) list = list.filter((n) => (n.title || '').toLowerCase().includes(q) || (n.content || '').toLowerCase().includes(q))
    return list.sort((a, b) => b.deletedAt - a.deletedAt)
  }, [notes, search])

  const toggle = (id) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))

  return (
    <div className="absolute inset-0 z-[90] flex flex-col bg-note-paper">
      <div className="shrink-0 px-4 pb-3 app-top-bar border-b border-note-line">
        <div className="flex items-center gap-3 mb-2">
          <button type="button" onClick={onClose} className="p-2 rounded-full bg-note-cream shrink-0"><ChevronLeft className="w-5 h-5" /></button>
          <div>
            <h1 className="text-lg font-bold">回收站</h1>
            <p className="text-[11px] text-note-muted">自动清理 {settings.trashAutoDays} 天后 · 恢复或彻底删除</p>
          </div>
        </div>
        <div className="relative mt-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-note-muted/50" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="搜索回收站" className="w-full pl-10 py-2.5 rounded-xl border border-note-line bg-input text-sm outline-none" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 scrollbar-hide">
        {trashed.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-sm text-note-muted">回收站为空</p>
          </div>
        ) : (
          <div className="space-y-2">
            {trashed.map((note) => (
              <div key={note.id} className="p-3 rounded-xl border border-note-line bg-surface flex gap-3 items-center">
                <input type="checkbox" checked={selected.includes(note.id)} onChange={() => toggle(note.id)} />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate">{note.title || '无标题'}</p>
                  <p className="text-[10px] text-note-muted truncate">{noteSummary(note)}</p>
                  <p className="text-[9px] text-note-muted/60">删除于 {formatRelative(note.deletedAt)}</p>
                </div>
                <button type="button" onClick={() => onRestore?.([note.id])} className="p-2 text-status-green"><RotateCcw className="w-4 h-4" /></button>
                <button type="button" onClick={() => onPurge?.([note.id])} className="p-2 text-status-red"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
        )}
      </div>

      {trashed.length > 0 && (
        <div className="shrink-0 p-3 border-t border-note-line bg-surface space-y-2">
          <div className="flex gap-2">
            <button type="button" onClick={() => onRestore?.(selected.length ? selected : trashed.map((n) => n.id))} className="flex-1 py-2.5 rounded-xl border border-note-line text-status-green text-xs font-bold">恢复</button>
            <button type="button" onClick={() => onPurge?.(selected.length ? selected : trashed.map((n) => n.id))} className="flex-1 py-2.5 rounded-xl border border-note-line text-status-red text-xs font-bold">彻底删除</button>
          </div>
          <button type="button" onClick={() => { if (window.confirm('确定清空回收站？')) onClearAll?.() }} className="w-full py-2 text-[10px] font-bold text-note-muted">清空回收站</button>
          <label className="flex items-center justify-between text-[10px] text-note-muted">
            <span>自动清理天数</span>
            <select value={settings.trashAutoDays} onChange={(e) => onChangeSettings?.({ trashAutoDays: Number(e.target.value) })} className="px-2 py-1 rounded-lg border border-note-line bg-input">
              {[1, 7, 15, 30].map((d) => <option key={d} value={d}>{d} 天</option>)}
            </select>
          </label>
        </div>
      )}
    </div>
  )
}
