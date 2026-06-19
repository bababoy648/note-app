import React, { useState } from 'react'
import { Plus, Trash2, ChevronRight, ChevronLeft } from 'lucide-react'
import { cn, uid } from '../lib/utils'

const COLORS = ['#E07A5F', '#81B29A', '#F2CC8F', '#6B8CAE', '#9B7E9E', '#C4A574']

export default function TagView({ tagGroups, notes, onChange, onFilterTag, onClose }) {
  const [groupName, setGroupName] = useState('')
  const [newTag, setNewTag] = useState({ groupId: '', name: '', color: COLORS[0] })

  const countTag = (id) => notes.filter((n) => !n.deletedAt && n.tagIds?.includes(id)).length

  const addGroup = () => {
    if (!groupName.trim()) return
    onChange?.([...tagGroups, { id: uid('tg'), name: groupName.trim(), order: tagGroups.length, tags: [] }])
    setGroupName('')
  }

  const addTag = () => {
    if (!newTag.name.trim() || !newTag.groupId) return
    onChange?.(tagGroups.map((g) => (
      g.id === newTag.groupId
        ? { ...g, tags: [...g.tags, { id: uid('tag'), name: newTag.name.trim(), color: newTag.color, note: '', pinned: false, order: g.tags.length }] }
        : g
    )))
    setNewTag({ groupId: newTag.groupId, name: '', color: COLORS[0] })
  }

  const removeTag = (gid, tid) => {
    onChange?.(tagGroups.map((g) => (g.id === gid ? { ...g, tags: g.tags.filter((t) => t.id !== tid) } : g)))
  }

  const togglePin = (gid, tid) => {
    onChange?.(tagGroups.map((g) => (
      g.id === gid ? { ...g, tags: g.tags.map((t) => (t.id === tid ? { ...t, pinned: !t.pinned } : t)) } : g
    )))
  }

  const sortedTags = (tags) => [...tags].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || a.order - b.order)

  return (
    <div className="absolute inset-0 z-[90] flex flex-col bg-note-paper">
      <div className="shrink-0 px-4 pb-3 app-top-bar border-b border-note-line flex items-center gap-3">
        <button type="button" onClick={onClose} className="p-2 rounded-full bg-note-cream"><ChevronLeft className="w-5 h-5" /></button>
        <div>
          <h1 className="text-lg font-bold">标签管理</h1>
          <p className="text-[11px] text-note-muted">分组管理 · 置顶常用标签</p>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-hide">
        {tagGroups.map((group) => (
          <div key={group.id}>
            <p className="text-[10px] font-black tracking-wider text-note-muted uppercase mb-2">{group.name}</p>
            <div className="space-y-2">
              {sortedTags(group.tags).map((tag) => (
                <div key={tag.id} className="flex items-center gap-2 p-3 rounded-xl border border-note-line bg-surface">
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: tag.color }} />
                  <button type="button" onClick={() => onFilterTag?.(tag.id)} className="flex-1 text-left">
                    <p className="font-bold text-sm">{tag.name} {tag.pinned && <span className="text-[9px] text-note-accent">置顶</span>}</p>
                    <p className="text-[10px] text-note-muted">{countTag(tag.id)} 条关联</p>
                  </button>
                  <button type="button" onClick={() => togglePin(group.id, tag.id)} className="text-[10px] font-bold text-note-muted">置顶</button>
                  <button type="button" onClick={() => removeTag(group.id, tag.id)} className="p-1.5 text-status-red"><Trash2 className="w-4 h-4" /></button>
                  <button type="button" onClick={() => onFilterTag?.(tag.id)} className="p-1.5"><ChevronRight className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              <input
                value={newTag.groupId === group.id ? newTag.name : ''}
                onChange={(e) => setNewTag({ groupId: group.id, name: e.target.value, color: newTag.color })}
                placeholder={`添加到 ${group.name}`}
                className="flex-1 px-3 py-2 rounded-xl border border-note-line bg-input text-xs"
              />
              <button type="button" onClick={() => { setNewTag({ groupId: group.id, name: newTag.groupId === group.id ? newTag.name : '', color: COLORS[0] }); addTag() }} className="px-3 py-2 rounded-xl bg-note-ink text-note-paper text-xs font-bold">添加</button>
            </div>
          </div>
        ))}
        <div className="flex gap-2">
          <input value={groupName} onChange={(e) => setGroupName(e.target.value)} placeholder="新标签组名称" className="flex-1 px-3 py-2 rounded-xl border border-note-line bg-input text-sm" />
          <button type="button" onClick={addGroup} className="px-4 py-2 rounded-xl border border-note-line text-xs font-bold flex items-center gap-1"><Plus className="w-4 h-4" />组</button>
        </div>
      </div>
    </div>
  )
}
