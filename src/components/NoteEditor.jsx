import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { X, Star, Bell, ImagePlus, Mic, Paperclip, GripVertical, Trash2, Minimize2, Maximize2, Square } from 'lucide-react'
import { cn, uid, formatDateTime } from '../lib/utils'
import { NOTE_TEMPLATES } from '../lib/defaults'
import { readFileAsDataURL, createMediaItem } from '../lib/media'
import ReminderModal from './ReminderModal'

export default function NoteEditor({
  note, categories, tagGroups, onSave, onClose, minimal = false, onToggleMinimal, reminder, onSaveReminder, onToast,
}) {
  const [draft, setDraft] = useState(note)
  const [reminderOpen, setReminderOpen] = useState(false)
  const [savedAt, setSavedAt] = useState(null)
  const [recording, setRecording] = useState(false)
  const saveTimer = useRef(null)
  const imageInputRef = useRef(null)
  const fileInputRef = useRef(null)
  const recorderRef = useRef(null)
  const streamRef = useRef(null)

  useEffect(() => {
    setDraft(note)
  }, [note.id])

  useEffect(() => {
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      onSave?.({ ...draft, updatedAt: Date.now() })
      setSavedAt(Date.now())
    }, 600)
    return () => clearTimeout(saveTimer.current)
  }, [draft])

  useEffect(() => () => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
  }, [])

  const update = (patch) => setDraft((d) => ({ ...d, ...patch }))

  const applyTemplate = (tpl) => {
    const checklist = (tpl.checklist || []).map((text) => ({ id: uid('item'), text, status: 'todo', note: '' }))
    update({
      title: tpl.title,
      content: tpl.content || '',
      type: tpl.type,
      checklist,
    })
  }

  const addCheckItem = () => {
    update({ checklist: [...(draft.checklist || []), { id: uid('item'), text: '', status: 'todo', note: '' }] })
  }

  const toggleCheck = (id) => {
    const next = (draft.checklist || []).map((it) => {
      if (it.id !== id) return it
      const order = ['todo', 'done', 'cancelled']
      const idx = order.indexOf(it.status)
      return { ...it, status: order[(idx + 1) % order.length] }
    })
    update({ checklist: next })
  }

  const appendMedia = (item) => {
    update({
      media: [...(draft.media || []), { id: uid('media'), ...item }],
      type: draft.type === 'text' && !draft.content ? 'media' : draft.type,
    })
  }

  const handleImagePick = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    try {
      const url = await readFileAsDataURL(file)
      appendMedia(createMediaItem({ type: 'image', name: file.name, url, mimeType: file.type, size: file.size }))
      onToast?.('图片已添加')
    } catch (err) {
      onToast?.(err.message)
    }
  }

  const handleFilePick = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    try {
      const url = await readFileAsDataURL(file)
      appendMedia(createMediaItem({ type: 'file', name: file.name, url, mimeType: file.type, size: file.size }))
      onToast?.('文件已添加')
    } catch (err) {
      onToast?.(err.message)
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      const recorder = new MediaRecorder(stream)
      const chunks = []
      recorder.ondataavailable = (ev) => { if (ev.data.size) chunks.push(ev.data) }
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' })
        const reader = new FileReader()
        reader.onload = () => {
          appendMedia(createMediaItem({
            type: 'audio',
            name: `录音 ${formatDateTime(Date.now())}`,
            url: reader.result,
            mimeType: blob.type,
            size: blob.size,
          }))
          onToast?.('录音已保存')
        }
        reader.readAsDataURL(blob)
        stream.getTracks().forEach((t) => t.stop())
        streamRef.current = null
        setRecording(false)
      }
      recorderRef.current = recorder
      recorder.start()
      setRecording(true)
    } catch {
      onToast?.('无法访问麦克风，请检查权限')
    }
  }

  const stopRecording = () => {
    if (recorderRef.current?.state === 'recording') recorderRef.current.stop()
  }

  const insertTimestamp = () => {
    const stamp = `[${formatDateTime(Date.now())}] `
    update({ content: (draft.content || '') + stamp })
  }

  const statusColor = {
    todo: 'border-note-line',
    done: 'bg-status-green border-note-line line-through text-note-muted',
    cancelled: 'bg-status-red border-note-line line-through text-note-muted/60',
  }

  return (
    <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="absolute inset-0 z-[90] flex flex-col bg-note-paper">
      <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImagePick} />
      <input ref={fileInputRef} type="file" className="hidden" onChange={handleFilePick} />

      <div className="shrink-0 flex items-center justify-between px-4 pb-3 border-b border-note-line app-top-bar">
        <button type="button" onClick={onClose} className="p-2 rounded-full bg-note-cream"><X className="w-5 h-5" /></button>
        <div className="text-center">
          <p className="text-xs font-bold">{minimal ? '快速记事' : '完整编辑'}</p>
          {savedAt && <p className="text-[9px] text-note-muted">已自动保存</p>}
        </div>
        <div className="flex gap-1">
          <button type="button" onClick={() => update({ starred: !draft.starred })} className="p-2 rounded-full bg-note-cream">
            <Star className={cn('w-4 h-4', draft.starred && 'fill-amber-400 text-amber-500')} />
          </button>
          <button type="button" onClick={onToggleMinimal} className="p-2 rounded-full bg-note-cream">
            {minimal ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-4 scrollbar-hide">
        <input
          value={draft.title}
          onChange={(e) => update({ title: e.target.value })}
          placeholder="标题"
          className="w-full text-xl font-serif font-bold bg-transparent outline-none placeholder:text-note-muted/40"
        />

        {!minimal && (
          <div className="flex gap-2 flex-wrap">
            {NOTE_TEMPLATES.map((t) => (
              <button key={t.id} type="button" onClick={() => applyTemplate(t)} className="px-2.5 py-1 rounded-lg border border-note-line bg-surface text-[10px] font-bold text-note-muted">
                {t.label}
              </button>
            ))}
          </div>
        )}

        <div className="flex gap-2 flex-wrap text-[10px]">
          <select value={draft.type} onChange={(e) => update({ type: e.target.value })} className="px-2 py-1.5 rounded-lg border border-note-line bg-input font-bold">
            <option value="text">文本</option>
            <option value="checklist">清单</option>
            <option value="media">多媒体</option>
          </select>
          <select value={draft.categoryId} onChange={(e) => update({ categoryId: e.target.value })} className="px-2 py-1.5 rounded-lg border border-note-line bg-input font-bold">
            {categories.filter((c) => !c.hidden).map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select value={draft.priority} onChange={(e) => update({ priority: e.target.value })} className="px-2 py-1.5 rounded-lg border border-note-line bg-input font-bold">
            <option value="low">低优先级</option>
            <option value="normal">普通</option>
            <option value="high">高优先级</option>
          </select>
        </div>

        {(draft.type === 'text' || draft.type === 'media') && (
          <textarea
            value={draft.content}
            onChange={(e) => update({ content: e.target.value })}
            placeholder="开始记录…"
            className="w-full min-h-[200px] p-4 rounded-2xl border border-note-line bg-input text-sm leading-relaxed outline-none resize-none"
          />
        )}

        {draft.type === 'checklist' && (
          <div className="space-y-2">
            {(draft.checklist || []).map((item, idx) => (
              <div key={item.id} className={cn('flex items-start gap-2 p-3 rounded-xl border', statusColor[item.status] || statusColor.todo)}>
                <GripVertical className="w-4 h-4 text-note-muted/30 mt-1 shrink-0" />
                <button type="button" onClick={() => toggleCheck(item.id)} className="w-5 h-5 rounded-md border-2 border-note-accent shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <input
                    value={item.text}
                    onChange={(e) => {
                      const checklist = [...draft.checklist]
                      checklist[idx] = { ...item, text: e.target.value }
                      update({ checklist })
                    }}
                    placeholder="清单项"
                    className="w-full bg-transparent outline-none text-sm font-medium"
                  />
                  {!minimal && (
                    <input
                      value={item.note}
                      onChange={(e) => {
                        const checklist = [...draft.checklist]
                        checklist[idx] = { ...item, note: e.target.value }
                        update({ checklist })
                      }}
                      placeholder="备注"
                      className="w-full mt-1 bg-transparent outline-none text-[11px] text-note-muted"
                    />
                  )}
                </div>
                <button type="button" onClick={() => update({ checklist: draft.checklist.filter((c) => c.id !== item.id) })} className="text-note-muted/40">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button type="button" onClick={addCheckItem} className="w-full py-2.5 rounded-xl border border-dashed border-note-line text-xs font-bold text-note-muted">
              + 添加清单项
            </button>
          </div>
        )}

        {!minimal && (
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-note-muted uppercase tracking-wider">多媒体</p>
            <div className="flex gap-2 flex-wrap">
              <button type="button" onClick={() => imageInputRef.current?.click()} className="flex items-center gap-1 px-3 py-2 rounded-xl border border-note-line bg-surface text-xs font-bold">
                <ImagePlus className="w-4 h-4" />上传图片
              </button>
              {recording ? (
                <button type="button" onClick={stopRecording} className="flex items-center gap-1 px-3 py-2 rounded-xl border border-red-400 bg-status-red text-xs font-bold text-status-red animate-pulse">
                  <Square className="w-4 h-4" />停止录音
                </button>
              ) : (
                <button type="button" onClick={startRecording} className="flex items-center gap-1 px-3 py-2 rounded-xl border border-note-line bg-surface text-xs font-bold">
                  <Mic className="w-4 h-4" />录制语音
                </button>
              )}
              <button type="button" onClick={() => fileInputRef.current?.click()} className="flex items-center gap-1 px-3 py-2 rounded-xl border border-note-line bg-surface text-xs font-bold">
                <Paperclip className="w-4 h-4" />添加文件
              </button>
            </div>
            {(draft.media || []).map((m) => (
              <div key={m.id} className="p-3 rounded-xl bg-surface border border-note-line text-sm space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate font-medium">{m.name}</span>
                  <button type="button" onClick={() => update({ media: draft.media.filter((x) => x.id !== m.id) })} className="text-status-red text-xs font-bold shrink-0">删除</button>
                </div>
                {m.type === 'image' && m.url && (
                  <img src={m.url} alt={m.name} className="w-full max-h-40 object-cover rounded-lg border border-note-line" />
                )}
                {m.type === 'audio' && m.url && (
                  <audio controls src={m.url} className="w-full" />
                )}
                {m.type === 'file' && m.url && (
                  <a href={m.url} download={m.name} className="text-xs text-note-accent font-bold">下载附件</a>
                )}
              </div>
            ))}
          </div>
        )}

        {!minimal && (
          <div className="flex flex-wrap gap-1.5">
            {tagGroups.flatMap((g) => g.tags.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  const has = draft.tagIds.includes(t.id)
                  update({ tagIds: has ? draft.tagIds.filter((id) => id !== t.id) : [...draft.tagIds, t.id] })
                }}
                className={cn('px-2.5 py-1 rounded-full text-[10px] font-bold border', draft.tagIds.includes(t.id) ? 'text-white border-transparent' : 'border-note-line text-note-muted bg-surface')}
                style={draft.tagIds.includes(t.id) ? { backgroundColor: t.color } : undefined}
              >
                {t.name}
              </button>
            )))}
          </div>
        )}
      </div>

      <div className="shrink-0 p-4 border-t border-note-line flex gap-2 bg-surface">
        {!minimal && (
          <>
            <button type="button" onClick={insertTimestamp} className="px-3 py-2 rounded-xl border border-note-line text-xs font-bold">时间戳</button>
            <button type="button" onClick={() => setReminderOpen(true)} className="flex items-center gap-1 px-3 py-2 rounded-xl border border-note-line text-xs font-bold">
              <Bell className="w-4 h-4" />{reminder ? '已设提醒' : '提醒'}
            </button>
          </>
        )}
        <button type="button" onClick={onClose} className="flex-1 py-3 rounded-2xl bg-note-ink text-note-paper font-bold text-sm">完成</button>
      </div>

      <ReminderModal
        open={reminderOpen}
        onClose={() => setReminderOpen(false)}
        initial={reminder ? { ...reminder, title: reminder.title || draft.title, noteId: draft.id } : { title: draft.title, noteId: draft.id }}
        notes={[{ id: draft.id, title: draft.title || '当前记事' }]}
        onSave={(r) => { onSaveReminder?.({ ...r, noteId: draft.id }); setReminderOpen(false) }}
      />
    </motion.div>
  )
}
