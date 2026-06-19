import React, { useState } from 'react'
import { Plus, Eye, EyeOff, Trash2, ChevronRight } from 'lucide-react'
import { cn, uid } from '../lib/utils'
import { DEFAULT_CATEGORY_ID } from '../lib/defaults'

const ICONS = ['folder', 'briefcase', 'home', 'lock', 'star', 'book']
const COLORS = ['#C4A574', '#6B8CAE', '#8FAE7A', '#9B7E9E', '#E07A5F', '#81B29A']

export default function CategoryView({ categories, notes, onChange, onFilterCategory }) {
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', color: COLORS[0], icon: 'folder', encrypted: false })

  const visible = categories.filter((c) => !c.parentId).sort((a, b) => a.order - b.order)
  const countIn = (id) => notes.filter((n) => !n.deletedAt && n.categoryId === id).length

  const saveNew = () => {
    if (!form.name.trim()) return
    onChange?.([...categories, {
      id: uid('cat'),
      name: form.name.trim(),
      icon: form.icon,
      color: form.color,
      parentId: null,
      hidden: false,
      order: categories.length,
      encrypted: form.encrypted,
    }])
    setForm({ name: '', color: COLORS[0], icon: 'folder', encrypted: false })
    setEditing(null)
  }

  const updateCat = (id, patch) => {
    onChange?.(categories.map((c) => (c.id === id ? { ...c, ...patch } : c)))
  }

  const removeCat = (id) => {
    if (id === DEFAULT_CATEGORY_ID) return
    if (!window.confirm('删除分类后，该分类下记事将移至默认分类')) return
    onChange?.(categories.filter((c) => c.id !== id))
  }

  const toggleHidden = (id) => updateCat(id, { hidden: !categories.find((c) => c.id === id)?.hidden })

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="shrink-0 px-4 pb-3 app-top-bar border-b border-note-line">
        <h1 className="text-xl font-serif font-bold">分类管理</h1>
        <p className="text-[11px] text-note-muted">自定义图标、颜色与层级</p>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2 scrollbar-hide">
        {visible.map((cat) => (
          <div key={cat.id} className={cn('p-4 rounded-2xl border border-note-line bg-surface', cat.hidden && 'opacity-50')}>
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0" style={{ backgroundColor: cat.color }}>{cat.name[0]}</span>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm">{cat.name}</p>
                <p className="text-[10px] text-note-muted">{countIn(cat.id)} 条记事 {cat.encrypted ? '· 加密' : ''}</p>
              </div>
              <button type="button" onClick={() => onFilterCategory?.(cat.id)} className="p-2 rounded-lg bg-note-cream"><ChevronRight className="w-4 h-4" /></button>
            </div>
            <div className="flex gap-2 mt-3">
              <button type="button" onClick={() => toggleHidden(cat.id)} className="text-[10px] font-bold text-note-muted flex items-center gap-1">
                {cat.hidden ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}{cat.hidden ? '已隐藏' : '隐藏'}
              </button>
              {cat.id !== DEFAULT_CATEGORY_ID && (
                <button type="button" onClick={() => removeCat(cat.id)} className="text-[10px] font-bold text-red-400 flex items-center gap-1 ml-auto">
                  <Trash2 className="w-3 h-3" />删除
                </button>
              )}
            </div>
          </div>
        ))}

        {editing === 'new' ? (
          <div className="p-4 rounded-2xl border border-note-line bg-note-cream/40 space-y-3">
            <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="分类名称" className="w-full px-3 py-2 rounded-xl border border-note-line text-sm" />
            <div className="flex gap-2 flex-wrap">
              {COLORS.map((c) => (
                <button key={c} type="button" onClick={() => setForm((f) => ({ ...f, color: c }))} className={cn('w-8 h-8 rounded-full border-2', form.color === c ? 'border-note-ink' : 'border-transparent')} style={{ backgroundColor: c }} />
              ))}
            </div>
            <label className="flex items-center gap-2 text-xs font-bold">
              <input type="checkbox" checked={form.encrypted} onChange={(e) => setForm((f) => ({ ...f, encrypted: e.target.checked }))} />加密分类
            </label>
            <div className="flex gap-2">
              <button type="button" onClick={saveNew} className="flex-1 py-2 rounded-xl bg-note-ink text-note-paper text-xs font-bold">保存</button>
              <button type="button" onClick={() => setEditing(null)} className="px-4 py-2 rounded-xl border border-note-line text-xs font-bold">取消</button>
            </div>
          </div>
        ) : (
          <button type="button" onClick={() => setEditing('new')} className="w-full py-3 rounded-2xl border border-dashed border-note-line text-sm font-bold text-note-muted flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" />新建分类
          </button>
        )}
      </div>
    </div>
  )
}
