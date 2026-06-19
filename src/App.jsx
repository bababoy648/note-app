import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { AnimatePresence } from 'framer-motion'
import DeviceFrame from './components/DeviceFrame'
import OnboardingGuide from './components/OnboardingGuide'
import BottomNav from './components/BottomNav'
import NoteListView from './components/NoteListView'
import NoteEditor from './components/NoteEditor'
import NotePreview from './components/NotePreview'
import CategoryView from './components/CategoryView'
import TagView from './components/TagView'
import TrashView from './components/TrashView'
import ReminderView, { ReminderDetailSheet } from './components/ReminderView'
import ProfileView from './components/ProfileView'
import SyncPanel from './components/SyncPanel'
import PrivacyPanel from './components/PrivacyPanel'
import PrivacyGate from './components/PrivacyGate'
import ReminderModal from './components/ReminderModal'
import { loadJSON, saveJSON, STORAGE_KEYS } from './lib/storage'
import {
  loadNotes, loadCategories, loadTagGroups, loadReminders, loadSettings, saveSettings,
  createNote, pushVersion, DEFAULT_CATEGORY_ID,
} from './lib/defaults'
import { uid } from './lib/utils'

export default function App() {
  const [booting, setBooting] = useState(true)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [activeTab, setActiveTab] = useState('home')
  const [notes, setNotes] = useState(() => loadNotes())
  const [categories, setCategories] = useState(() => loadCategories())
  const [tagGroups, setTagGroups] = useState(() => loadTagGroups())
  const [reminders, setReminders] = useState(() => loadReminders())
  const [settings, setSettings] = useState(() => loadSettings())
  const [syncLog, setSyncLog] = useState(() => loadJSON(STORAGE_KEYS.syncLog, []))
  const [filter, setFilter] = useState({})
  const [selectedIds, setSelectedIds] = useState([])
  const [privacyMode, setPrivacyMode] = useState(false)
  const [privacyUnlocked, setPrivacyUnlocked] = useState(false)
  const [showPrivacyGate, setShowPrivacyGate] = useState(false)
  const [editorNote, setEditorNote] = useState(null)
  const [previewNote, setPreviewNote] = useState(null)
  const [minimalEdit, setMinimalEdit] = useState(false)
  const [subPage, setSubPage] = useState(null)
  const [reminderDetail, setReminderDetail] = useState(null)
  const [reminderModal, setReminderModal] = useState(null)
  const [toast, setToast] = useState('')

  useEffect(() => {
    const s = loadSettings()
    setShowOnboarding(!s.onboardingCompleted)
    const t = setTimeout(() => setBooting(false), 400)
    applyTheme(s.theme)
    return () => clearTimeout(t)
  }, [])

  const applyTheme = (theme) => {
    if (theme === 'dark') document.documentElement.classList.add('dark')
    else if (theme === 'system') {
      document.documentElement.classList.toggle('dark', window.matchMedia('(prefers-color-scheme: dark)').matches)
    } else document.documentElement.classList.remove('dark')
  }

  useEffect(() => { saveJSON(STORAGE_KEYS.notes, notes) }, [notes])
  useEffect(() => { saveJSON(STORAGE_KEYS.categories, categories) }, [categories])
  useEffect(() => { saveJSON(STORAGE_KEYS.tags, tagGroups) }, [tagGroups])
  useEffect(() => { saveJSON(STORAGE_KEYS.reminders, reminders) }, [reminders])

  const showToast = useCallback((msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2200)
  }, [])

  const patchSettings = (patch) => {
    setSettings((s) => {
      const next = { ...s, ...patch }
      saveSettings(next)
      if (patch.theme) applyTheme(patch.theme)
      return next
    })
  }

  const completeOnboarding = () => {
    patchSettings({ onboardingCompleted: true })
    setShowOnboarding(false)
  }

  const replayOnboarding = () => setShowOnboarding(true)

  const saveNote = (note) => {
    setNotes((list) => {
      const idx = list.findIndex((n) => n.id === note.id)
      const withVersion = pushVersion(note, { title: note.title, content: note.content })
      if (idx >= 0) {
        const next = [...list]
        next[idx] = { ...withVersion, updatedAt: Date.now() }
        return next
      }
      return [{ ...withVersion, updatedAt: Date.now() }, ...list]
    })
  }

  const openNewNote = (quick = false) => {
    const cat = privacyMode
      ? categories.find((c) => c.encrypted)?.id || 'cat-private'
      : DEFAULT_CATEGORY_ID
    const note = createNote({
      categoryId: cat,
      encrypted: privacyMode,
    })
    setNotes((list) => [note, ...list])
    setEditorNote(note)
    setMinimalEdit(quick)
  }

  const deleteNotes = (ids) => {
    setNotes((list) => list.map((n) => (ids.includes(n.id) ? { ...n, deletedAt: Date.now() } : n)))
    setSelectedIds([])
    showToast('已移入回收站')
  }

  const restoreNotes = (ids) => {
    setNotes((list) => list.map((n) => (ids.includes(n.id) ? { ...n, deletedAt: null } : n)))
    showToast('已恢复')
  }

  const purgeNotes = (ids) => {
    if (!window.confirm('彻底删除后无法恢复，确定吗？')) return
    setNotes((list) => list.filter((n) => !ids.includes(n.id)))
    showToast('已彻底删除')
  }

  const saveReminder = (reminder, noteId) => {
    const withNote = { ...reminder, noteId: noteId || reminder.noteId || null }
    setReminders((list) => {
      const idx = list.findIndex((r) => r.id === reminder.id)
      if (idx >= 0) {
        const next = [...list]
        next[idx] = withNote
        return next
      }
      return [withNote, ...list]
    })
    if (noteId) {
      setNotes((list) => list.map((n) => (n.id === noteId ? { ...n, reminderId: reminder.id } : n)))
    }
    showToast('提醒已保存')
  }

  const openNewReminder = () => {
    setReminderModal({
      id: uid('rem'),
      type: 'once',
      title: '',
      noteId: null,
      datetime: Date.now() + 3600000,
      status: 'pending',
      createdAt: Date.now(),
    })
  }

  const reminderFor = (note) => reminders.find((r) => r.id === note?.reminderId || r.noteId === note?.id)

  const handleEnterPrivacy = () => {
    if (!settings.privacyPassword) {
      setSubPage('privacy')
      showToast('请先设置隐私密码')
      return
    }
    setShowPrivacyGate(true)
  }

  const handlePrivacyUnlock = () => {
    setShowPrivacyGate(false)
    setPrivacyUnlocked(true)
    setPrivacyMode(true)
    setActiveTab('home')
    showToast('已进入隐私模式')
  }

  const exitPrivacy = () => {
    setShowPrivacyGate(true)
    setPrivacyUnlocked(false)
    setPrivacyMode(false)
    showToast('已退出隐私模式')
  }

  const navigateProfile = (id) => {
    if (id === 'reminders') { setActiveTab('reminders'); setSubPage(null); return }
    if (id === 'tags') { setSubPage('tags'); return }
    setSubPage(id)
  }

  const openNote = (note) => setPreviewNote(note)

  const toggleSelect = (id) => {
    setSelectedIds((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))
  }

  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now()
      reminders.forEach((r) => {
        if (r.status === 'pending' && r.datetime <= now) {
          setReminders((list) => list.map((x) => (x.id === r.id ? { ...x, status: 'fired' } : x)))
          showToast(`提醒：${r.title || notes.find((n) => n.id === r.noteId)?.title || '记事'}`)
        }
      })
    }, 30000)
    return () => clearInterval(timer)
  }, [reminders, notes, showToast])

  useEffect(() => {
    const days = settings.trashAutoDays || 7
    const cutoff = Date.now() - days * 86400000
    setNotes((list) => list.filter((n) => !n.deletedAt || n.deletedAt > cutoff))
  }, [settings.trashAutoDays])

  const content = useMemo(() => {
    if (subPage === 'sync') {
      return <SyncPanel settings={settings} syncLog={syncLog} onChangeSettings={patchSettings} onSync={setSyncLog} onClose={() => setSubPage(null)} />
    }
    if (subPage === 'privacy') {
      return <PrivacyPanel settings={settings} onChangeSettings={patchSettings} onClose={() => setSubPage(null)} onEnterPrivacy={handleEnterPrivacy} />
    }
    if (subPage === 'trash') {
      return (
        <TrashView
          notes={notes}
          settings={settings}
          onRestore={restoreNotes}
          onPurge={purgeNotes}
          onClearAll={() => setNotes((list) => list.filter((n) => !n.deletedAt))}
          onChangeSettings={patchSettings}
          onClose={() => setSubPage(null)}
        />
      )
    }
    if (subPage === 'tags') {
      return (
        <TagView
          tagGroups={tagGroups}
          notes={notes}
          onChange={setTagGroups}
          onFilterTag={(tagId) => { setFilter({ tagId }); setSubPage(null); setActiveTab('home') }}
          onClose={() => setSubPage(null)}
        />
      )
    }

    switch (activeTab) {
      case 'home':
        return (
          <NoteListView
            notes={notes}
            categories={categories}
            tagGroups={tagGroups}
            settings={settings}
            privacyMode={privacyMode}
            filter={filter}
            onFilterChange={setFilter}
            onOpenNote={openNote}
            onNewNote={() => openNewNote(false)}
            onQuickNote={() => openNewNote(true)}
            onEnterPrivacy={handleEnterPrivacy}
            onToggleViewMode={() => patchSettings({ viewMode: settings.viewMode === 'card' ? 'list' : 'card' })}
            selectedIds={selectedIds}
            onToggleSelect={toggleSelect}
            onBatchDelete={() => deleteNotes(selectedIds)}
            onBatchMove={() => {
              const cat = categories.find((c) => c.id !== DEFAULT_CATEGORY_ID)?.id || DEFAULT_CATEGORY_ID
              setNotes((list) => list.map((n) => (selectedIds.includes(n.id) ? { ...n, categoryId: cat } : n)))
              setSelectedIds([])
              showToast('已移动')
            }}
          />
        )
      case 'categories':
        return <CategoryView categories={categories} notes={notes} onChange={setCategories} onFilterCategory={(id) => { setFilter({ categoryId: id }); setActiveTab('home') }} />
      case 'reminders':
        return (
          <ReminderView
            reminders={reminders}
            notes={notes}
            onAdd={openNewReminder}
            onEdit={(r) => setReminderModal(r)}
            onDelete={(id) => { setReminders((list) => list.map((r) => (r.id === id ? { ...r, status: 'cancelled' } : r))); showToast('已取消提醒') }}
            onMarkDone={(id) => { setReminders((list) => list.map((r) => (r.id === id ? { ...r, status: 'done' } : r))); showToast('已标记处理') }}
            onReschedule={(r) => setReminderModal(r)}
            onOpenNote={(note) => note && setPreviewNote(note)}
            onOpenDetail={setReminderDetail}
          />
        )
      case 'profile':
        return (
          <ProfileView
            settings={settings}
            notes={notes}
            reminders={reminders}
            onChangeSettings={patchSettings}
            onNavigate={navigateProfile}
            onReplayOnboarding={replayOnboarding}
          />
        )
      default:
        return null
    }
  }, [activeTab, subPage, notes, categories, tagGroups, reminders, settings, syncLog, filter, selectedIds, privacyMode])

  if (booting) {
    return (
      <DeviceFrame activeTab="home">
        <div className="h-full flex items-center justify-center">
          <p className="font-serif text-lg animate-pulse">记事簿</p>
        </div>
      </DeviceFrame>
    )
  }

  return (
    <DeviceFrame activeTab={activeTab}>
      <div className="h-full flex flex-col relative overflow-hidden">
        {privacyMode && (
          <div className="shrink-0 px-4 py-2 bg-violet-900/40 border-b border-violet-800/50 flex items-center justify-between text-xs font-bold text-violet-200">
            <span>隐私模式</span>
            <button type="button" onClick={exitPrivacy}>退出</button>
          </div>
        )}

        <main className="flex-1 min-h-0 relative">
          {content}
        </main>

        {!subPage && !editorNote && !previewNote && !showOnboarding && (
          <BottomNav active={activeTab} onChange={(tab) => { setActiveTab(tab); setSubPage(null) }} />
        )}

        <AnimatePresence>
          {editorNote && (
            <NoteEditor
              key={editorNote.id}
              note={editorNote}
              categories={categories}
              tagGroups={tagGroups}
              minimal={minimalEdit}
              onToggleMinimal={() => setMinimalEdit((v) => !v)}
              reminder={reminderFor(editorNote)}
              onSave={(n) => { saveNote(n); setEditorNote(n) }}
              onSaveReminder={(r) => saveReminder(r, editorNote.id)}
              onClose={() => setEditorNote(null)}
              onToast={showToast}
            />
          )}
          {previewNote && (
            <NotePreview
              key={previewNote.id}
              note={previewNote}
              categories={categories}
              tagGroups={tagGroups}
              reminder={reminderFor(previewNote)}
              onClose={() => setPreviewNote(null)}
              onEdit={() => { setEditorNote(previewNote); setPreviewNote(null); setMinimalEdit(false) }}
              onToggleStar={() => {
                const next = { ...previewNote, starred: !previewNote.starred }
                saveNote(next)
                setPreviewNote(next)
              }}
              onToggleFavorite={() => {
                const next = { ...previewNote, favorite: !previewNote.favorite }
                saveNote(next)
                setPreviewNote(next)
              }}
              onDelete={() => { deleteNotes([previewNote.id]); setPreviewNote(null) }}
              onShare={() => {
                const text = `${previewNote.title}\n${previewNote.content || ''}`
                navigator.clipboard?.writeText(text)
                showToast('内容已复制')
              }}
            />
          )}
        </AnimatePresence>

        {showOnboarding && (
          <OnboardingGuide onComplete={completeOnboarding} replay={settings.onboardingCompleted} />
        )}

        {showPrivacyGate && (
          <PrivacyGate
            settings={settings}
            onUnlock={privacyUnlocked ? () => { setShowPrivacyGate(false); setPrivacyMode(false); setPrivacyUnlocked(false) } : handlePrivacyUnlock}
            onCancel={() => setShowPrivacyGate(false)}
            title={privacyUnlocked ? '退出隐私模式' : '进入隐私模式'}
          />
        )}

        {reminderDetail && (
          <ReminderDetailSheet
            reminder={reminderDetail}
            note={notes.find((n) => n.id === reminderDetail.noteId)}
            onClose={() => setReminderDetail(null)}
            onEdit={(r) => { setReminderModal(r); setReminderDetail(null) }}
            onMarkDone={(id) => { setReminders((list) => list.map((r) => (r.id === id ? { ...r, status: 'done' } : r))); setReminderDetail(null) }}
            onDelete={(id) => { setReminders((list) => list.map((r) => (r.id === id ? { ...r, status: 'cancelled' } : r))); setReminderDetail(null) }}
            onOpenNote={(note) => { setPreviewNote(note); setReminderDetail(null) }}
            onReschedule={(r) => { setReminderModal(r); setReminderDetail(null) }}
          />
        )}

        <ReminderModal
          open={!!reminderModal}
          onClose={() => setReminderModal(null)}
          initial={reminderModal}
          notes={notes.filter((n) => !n.deletedAt)}
          onSave={(r) => {
            saveReminder({ ...r, status: 'pending' }, r.noteId || reminderModal?.noteId)
            setReminderModal(null)
          }}
        />

        {toast && (
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-[200] px-4 py-2 rounded-full bg-note-ink text-note-paper text-xs font-bold shadow-lg">
            {toast}
          </div>
        )}
      </div>
    </DeviceFrame>
  )
}
