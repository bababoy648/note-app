import React, { useMemo, useState } from 'react'
import { Search, Plus, Star, Heart, LayoutGrid, List, Filter, X, Lock } from 'lucide-react'
import { cn, formatRelative, matchPinyin } from '../lib/utils'
import { noteSummary } from '../lib/defaults'

export default function NoteListView({
  notes, categories, tagGroups, settings, privacyMode,
  filter, onFilterChange, onOpenNote, onNewNote, onQuickNote, onEnterPrivacy, onToggleViewMode,
  selectedIds, onToggleSelect, onBatchDelete, onBatchMove,
}) {
  const [search, setSearch] = useState(filter.search || '')
  const [filterOpen, setFilterOpen] = useState(false)

  const activeNotes = useMemo(() => {
    let list = notes.filter((n) => !n.deletedAt)
    if (privacyMode) list = list.filter((n) => n.encrypted)
    else list = list.filter((n) => !n.encrypted || filter.showEncrypted)
    if (filter.categoryId) list = list.filter((n) => n.categoryId === filter.categoryId)
    if (filter.tagId) list = list.filter((n) => n.tagIds?.includes(filter.tagId))
    if (filter.starred) list = list.filter((n) => n.starred)
    if (filter.favorite) list = list.filter((n) => n.favorite)
    if (filter.type) list = list.filter((n) => n.type === filter.type)
    if (filter.days) {
      const since = Date.now() - filter.days * 86400000
      list = list.filter((n) => n.updatedAt >= since)
    }
    const q = search.trim()
    if (q) {
      list = list.filter((n) =>
        matchPinyin(n.title, q) || matchPinyin(n.content, q) ||
        (n.checklist || []).some((c) => matchPinyin(c.text, q)) ||
        n.tagIds?.some((tid) => matchPinyin(tagGroups.flatMap((g) => g.tags).find((t) => t.id === tid)?.name, q)),
      )
    }
    if (filter.starredFirst) {
      list = [...list].sort((a, b) => (b.starred ? 1 : 0) - (a.starred ? 1 : 0) || b.updatedAt - a.updatedAt)
    } else {
      list = [...list].sort((a, b) => b.updatedAt - a.updatedAt)
    }
    return list
  }, [notes, filter, search, privacyMode, tagGroups])

  const catName = (id) => categories.find((c) => c.id === id)?.name || '默认'
  const viewMode = settings.viewMode || 'card'
  const batchMode = selectedIds.length > 0

  const applyFilter = (patch) => onFilterChange?.({ ...filter, ...patch })

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="shrink-0 px-4 pb-3 app-top-bar border-b border-note-line/60">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-xl font-serif font-bold">{privacyMode ? '隐私记事' : '我的记事'}</h1>
            <p className="text-[11px] text-note-muted">{activeNotes.length} 条记录</p>
          </div>
          <div className="flex gap-1">
            <button type="button" onClick={onToggleViewMode} className="p-2.5 rounded-xl border border-note-line bg-surface">
              {viewMode === 'card' ? <List className="w-4 h-4" /> : <LayoutGrid className="w-4 h-4" />}
            </button>
            {!privacyMode && (
              <button type="button" onClick={onEnterPrivacy} className="p-2.5 rounded-xl border border-note-line bg-surface">
                <Lock className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-note-muted/50" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); applyFilter({ search: e.target.value }) }}
            placeholder="搜索标题、正文、标签…"
            className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-note-line bg-surface text-sm outline-none"
          />
          <button type="button" onClick={() => setFilterOpen((v) => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg">
            <Filter className="w-4 h-4 text-note-muted" />
          </button>
        </div>
        {(filter.categoryId || filter.tagId || filter.starred || filter.favorite || filter.type || filter.days) && (
          <div className="flex flex-wrap gap-1.5 mt-2 items-center">
            <span className="text-[10px] text-note-muted">筛选中</span>
            <button type="button" onClick={() => onFilterChange?.({})} className="text-[10px] font-bold text-note-accent flex items-center gap-0.5">
              <X className="w-3 h-3" />清除
            </button>
          </div>
        )}
        {filterOpen && (
          <div className="mt-2 p-3 rounded-xl border border-note-line bg-surface space-y-2 text-xs">
            <div className="flex gap-2 flex-wrap">
              {[{ id: '', label: '全部' }, { id: 7, label: '近7天' }, { id: 30, label: '近30天' }].map((d) => (
                <button key={String(d.id)} type="button" onClick={() => applyFilter({ days: d.id || null })} className={cn('px-2.5 py-1 rounded-lg border font-bold', filter.days === d.id && d.id ? 'bg-note-ink text-note-paper' : 'border-note-line')}>{d.label}</button>
              ))}
            </div>
            <div className="flex gap-2 flex-wrap">
              {['text', 'checklist', 'media'].map((t) => (
                <button key={t} type="button" onClick={() => applyFilter({ type: filter.type === t ? null : t })} className={cn('px-2.5 py-1 rounded-lg border font-bold', filter.type === t ? 'bg-note-ink text-note-paper' : 'border-note-line')}>
                  {t === 'text' ? '文本' : t === 'checklist' ? '清单' : '多媒体'}
                </button>
              ))}
              <button type="button" onClick={() => applyFilter({ starred: !filter.starred })} className={cn('px-2.5 py-1 rounded-lg border font-bold flex items-center gap-1', filter.starred ? 'bg-amber-500 text-white border-amber-500' : 'border-note-line')}>
                <Star className="w-3 h-3" />星标
              </button>
              <button type="button" onClick={() => applyFilter({ favorite: !filter.favorite })} className={cn('px-2.5 py-1 rounded-lg border font-bold flex items-center gap-1', filter.favorite ? 'bg-rose-400 text-white border-rose-400' : 'border-note-line')}>
                <Heart className="w-3 h-3" />收藏
              </button>
            </div>
          </div>
        )}
        <div className="flex gap-2 mt-3 overflow-x-auto scrollbar-hide pb-1">
          <button type="button" onClick={() => applyFilter({ categoryId: null, tagId: null })} className={cn('shrink-0 px-3 py-1.5 rounded-full text-[10px] font-bold border', !filter.categoryId ? 'bg-note-ink text-note-paper' : 'border-note-line text-note-muted')}>全部</button>
          {categories.filter((c) => !c.hidden && (!privacyMode || c.encrypted)).map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => applyFilter({ categoryId: c.id })}
              className={cn('shrink-0 px-3 py-1.5 rounded-full text-[10px] font-bold border', filter.categoryId === c.id ? 'text-white border-transparent' : 'border-note-line text-note-muted')}
              style={filter.categoryId === c.id ? { backgroundColor: c.color } : undefined}
            >
              {c.name} ({notes.filter((n) => !n.deletedAt && n.categoryId === c.id).length})
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-3 scrollbar-hide">
        {activeNotes.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-sm text-note-muted mb-4">还没有记事</p>
            <button type="button" onClick={onQuickNote} className="px-5 py-2.5 rounded-2xl bg-note-ink text-note-paper text-sm font-bold">快速写一条</button>
          </div>
        ) : viewMode === 'card' ? (
          <div className="grid grid-cols-2 gap-2.5">
            {activeNotes.map((note) => (
              <NoteCard key={note.id} note={note} catName={catName(note.categoryId)} selected={selectedIds.includes(note.id)} onSelect={() => onToggleSelect?.(note.id)} onOpen={() => onOpenNote(note)} batchMode={batchMode} />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {activeNotes.map((note) => (
              <NoteRow key={note.id} note={note} catName={catName(note.categoryId)} selected={selectedIds.includes(note.id)} onSelect={() => onToggleSelect?.(note.id)} onOpen={() => onOpenNote(note)} batchMode={batchMode} />
            ))}
          </div>
        )}
      </div>

      {batchMode ? (
        <div className="shrink-0 p-3 border-t border-note-line bg-surface flex gap-2">
          <button type="button" onClick={onBatchDelete} className="flex-1 py-2.5 rounded-xl border border-red-200 text-red-500 text-xs font-bold">删除 ({selectedIds.length})</button>
          <button type="button" onClick={onBatchMove} className="flex-1 py-2.5 rounded-xl bg-note-ink text-note-paper text-xs font-bold">移动</button>
        </div>
      ) : (
        <button type="button" onClick={onNewNote} className="absolute right-5 bottom-[88px] w-14 h-14 rounded-full bg-note-ink text-note-paper shadow-xl flex items-center justify-center z-40 active:scale-95">
          <Plus className="w-7 h-7" />
        </button>
      )}
    </div>
  )
}

function NoteCard({ note, catName, onOpen, selected, onSelect, batchMode }) {
  return (
    <button
      type="button"
      onClick={batchMode ? onSelect : onOpen}
      className={cn('text-left p-3 rounded-2xl border border-note-line bg-surface active:scale-[0.98] transition-transform min-h-[120px] flex flex-col', selected && 'ring-2 ring-note-accent')}
    >
      <div className="flex items-start justify-between gap-1 mb-1">
        <p className="font-bold text-sm line-clamp-2 flex-1">{note.title || '无标题'}</p>
        {note.starred && <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500 shrink-0" />}
      </div>
      <p className="text-[11px] text-note-muted line-clamp-3 flex-1">{noteSummary(note)}</p>
      <p className="text-[9px] text-note-muted/70 mt-2">{catName} · {formatRelative(note.updatedAt)}</p>
    </button>
  )
}

function NoteRow({ note, catName, onOpen, selected, onSelect, batchMode }) {
  return (
    <button type="button" onClick={batchMode ? onSelect : onOpen} className={cn('w-full text-left p-3 rounded-xl border border-note-line bg-surface flex gap-3 items-center', selected && 'ring-2 ring-note-accent')}>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm truncate">{note.title || '无标题'}</p>
        <p className="text-[11px] text-note-muted truncate">{noteSummary(note)}</p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-[9px] text-note-muted">{formatRelative(note.updatedAt)}</p>
        <p className="text-[9px] text-note-muted/60">{catName}</p>
      </div>
    </button>
  )
}
