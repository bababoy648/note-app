import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Star, Heart, Edit3, Trash2, Share2, CheckSquare, Paperclip, Download } from 'lucide-react'
import { cn, formatDateTime, formatRelative } from '../lib/utils'
import { noteSummary } from '../lib/defaults'

export default function NotePreview({
  note, categories, tagGroups, reminder, onClose, onEdit, onToggleStar, onToggleFavorite, onDelete, onShare,
}) {
  const [imgIdx, setImgIdx] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)
  const cat = categories.find((c) => c.id === note.categoryId)
  const tags = tagGroups.flatMap((g) => g.tags).filter((t) => note.tagIds?.includes(t.id))
  const images = (note.media || []).filter((m) => m.type === 'image' && m.url)
  const audios = (note.media || []).filter((m) => m.type === 'audio' && m.url)
  const files = (note.media || []).filter((m) => m.type === 'file' && m.url)

  const statusLabel = { todo: '未完成', done: '已完成', cancelled: '已取消' }
  const statusCls = { todo: '', done: 'line-through text-note-muted', cancelled: 'line-through text-note-muted/50' }

  return (
    <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="absolute inset-0 z-[88] flex flex-col bg-note-paper">
      <div className="shrink-0 flex items-center justify-between px-4 pb-3 border-b border-note-line app-top-bar">
        <button type="button" onClick={onClose} className="p-2 rounded-full bg-note-cream"><X className="w-5 h-5" /></button>
        <p className="text-xs font-bold text-note-muted">预览</p>
        <button type="button" onClick={onEdit} className="p-2 rounded-full bg-note-cream"><Edit3 className="w-4 h-4" /></button>
      </div>

      <div
        className="flex-1 overflow-y-auto px-5 py-5 scrollbar-hide"
        onContextMenu={(e) => { e.preventDefault(); setMenuOpen(true) }}
      >
        <div className="flex items-start justify-between gap-3 mb-2">
          <h1 className="text-2xl font-serif font-bold flex-1">{note.title || '无标题'}</h1>
          <div className="flex gap-1 shrink-0">
            <button type="button" onClick={onToggleStar} className="p-2"><Star className={cn('w-5 h-5', note.starred && 'fill-amber-400 text-amber-500')} /></button>
            <button type="button" onClick={onToggleFavorite} className="p-2"><Heart className={cn('w-5 h-5', note.favorite && 'fill-rose-400 text-rose-500')} /></button>
          </div>
        </div>
        <p className="text-[11px] text-note-muted mb-4">
          {cat?.name} · {formatRelative(note.updatedAt)} · {formatDateTime(note.updatedAt)}
        </p>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {tags.map((t) => (
              <span key={t.id} className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white" style={{ backgroundColor: t.color }}>{t.name}</span>
            ))}
          </div>
        )}

        {note.type === 'checklist' ? (
          <div className="space-y-2">
            {(note.checklist || []).map((item) => (
              <div key={item.id} className={cn('p-3 rounded-xl border border-note-line bg-surface', statusCls[item.status])}>
                <div className="flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-note-accent" />
                  <span className="text-sm font-medium">{item.text}</span>
                  <span className="text-[10px] text-note-muted ml-auto">{statusLabel[item.status]}</span>
                </div>
                {item.note && <p className="text-xs text-note-muted mt-1 pl-6">{item.note}</p>}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{note.content || noteSummary(note)}</p>
        )}

        {(note.media || []).length > 0 && (
          <div className="mt-4 space-y-3">
            {images.length > 0 && (
              <div>
                {images.length > 1 ? (
                  <button type="button" onClick={() => setImgIdx((i) => (i + 1) % images.length)} className="w-full">
                    <img src={images[imgIdx].url} alt={images[imgIdx].name} className="w-full rounded-2xl border border-note-line object-cover max-h-64" />
                    <p className="text-[10px] text-note-muted text-center mt-1">{imgIdx + 1}/{images.length}</p>
                  </button>
                ) : (
                  <img src={images[0].url} alt={images[0].name} className="w-full rounded-2xl border border-note-line object-cover max-h-64" />
                )}
              </div>
            )}
            {audios.map((m) => (
              <div key={m.id} className="p-3 rounded-xl border border-note-line bg-surface">
                <p className="text-xs font-bold mb-2">{m.name}</p>
                <audio controls src={m.url} className="w-full" />
              </div>
            ))}
            {files.map((m) => (
              <div key={m.id} className="flex items-center gap-2 p-3 rounded-xl border border-note-line bg-surface text-sm">
                <Paperclip className="w-4 h-4 shrink-0" />
                <span className="flex-1 truncate">{m.name}</span>
                <a href={m.url} download={m.name} className="p-1.5 text-note-accent"><Download className="w-4 h-4" /></a>
              </div>
            ))}
          </div>
        )}

        {reminder && (
          <div className="mt-4 p-3 rounded-xl bg-status-amber border border-note-line text-xs">
            <p className="font-bold text-status-amber">关联提醒</p>
            <p className="text-note-muted mt-1">{formatDateTime(reminder.datetime)} · {reminder.type}</p>
          </div>
        )}
      </div>

      <div className="shrink-0 p-4 border-t border-note-line flex gap-2 bg-surface">
        <button type="button" onClick={onShare} className="flex items-center gap-1 px-4 py-3 rounded-2xl border border-note-line text-xs font-bold"><Share2 className="w-4 h-4" />分享</button>
        <button type="button" onClick={onDelete} className="flex items-center gap-1 px-4 py-3 rounded-2xl border border-note-line text-status-red text-xs font-bold"><Trash2 className="w-4 h-4" />删除</button>
      </div>

      {menuOpen && (
        <div className="absolute inset-0 z-10 bg-black/20 flex items-center justify-center p-6" onClick={() => setMenuOpen(false)}>
          <div className="bg-surface-solid rounded-2xl p-2 shadow-xl w-full max-w-xs border border-note-line" onClick={(e) => e.stopPropagation()}>
            {[
              { label: note.starred ? '取消星标' : '加星标', action: onToggleStar },
              { label: note.favorite ? '取消收藏' : '收藏', action: onToggleFavorite },
              { label: '删除', action: onDelete },
            ].map((item) => (
              <button key={item.label} type="button" onClick={() => { item.action?.(); setMenuOpen(false) }} className="w-full text-left px-4 py-3 rounded-xl text-sm font-bold active:bg-note-cream">
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}
