import { uid } from './utils'
import { loadJSON, saveJSON, STORAGE_KEYS } from './storage'

export const DEFAULT_CATEGORY_ID = 'cat-default'

export const NOTE_TYPES = [
  { id: 'text', label: '文本' },
  { id: 'checklist', label: '清单' },
  { id: 'media', label: '多媒体' },
]

export const NOTE_TEMPLATES = [
  { id: 'blank', label: '空白', title: '', content: '', type: 'text' },
  { id: 'diary', label: '日记', title: '今日日记', content: '天气：\n心情：\n记录：\n', type: 'text' },
  { id: 'meeting', label: '会议纪要', title: '会议纪要', content: '参会人：\n议题：\n1. \n2. \n结论：\n', type: 'text' },
  { id: 'todo', label: '待办清单', title: '待办事项', type: 'checklist', checklist: ['准备材料', '联系同事', '提交报告'] },
]

export const DEFAULT_CATEGORIES = [
  { id: DEFAULT_CATEGORY_ID, name: '默认', icon: 'folder', color: '#C4A574', parentId: null, hidden: false, order: 0, encrypted: false },
  { id: 'cat-work', name: '工作', icon: 'briefcase', color: '#6B8CAE', parentId: null, hidden: false, order: 1, encrypted: false },
  { id: 'cat-life', name: '生活', icon: 'home', color: '#8FAE7A', parentId: null, hidden: false, order: 2, encrypted: false },
  { id: 'cat-private', name: '隐私', icon: 'lock', color: '#9B7E9E', parentId: null, hidden: false, order: 3, encrypted: true },
]

export const DEFAULT_TAG_GROUPS = [
  {
    id: 'tg-common',
    name: '常用',
    order: 0,
    tags: [
      { id: 'tag-important', name: '重要', color: '#E07A5F', note: '', pinned: true, order: 0 },
      { id: 'tag-idea', name: '灵感', color: '#81B29A', note: '', pinned: true, order: 1 },
      { id: 'tag-todo', name: '待办', color: '#F2CC8F', note: '', pinned: false, order: 2 },
    ],
  },
]

export function seedNotes() {
  const now = Date.now()
  return [
    {
      id: uid('note'),
      title: '欢迎使用记事簿',
      content: '这是一份文本记事示例。支持自动保存、星标收藏与分类管理。',
      type: 'text',
      checklist: [],
      media: [],
      categoryId: DEFAULT_CATEGORY_ID,
      tagIds: ['tag-important'],
      starred: true,
      favorite: false,
      encrypted: false,
      priority: 'normal',
      reminderId: null,
      createdAt: now - 86400000,
      updatedAt: now - 3600000,
      deletedAt: null,
      versions: [],
    },
    {
      id: uid('note'),
      title: '周末采购清单',
      content: '',
      type: 'checklist',
      checklist: [
        { id: uid('item'), text: '牛奶', status: 'done', note: '' },
        { id: uid('item'), text: '鸡蛋', status: 'todo', note: '' },
        { id: uid('item'), text: '水果', status: 'todo', note: '苹果、香蕉' },
      ],
      media: [],
      categoryId: 'cat-life',
      tagIds: ['tag-todo'],
      starred: false,
      favorite: true,
      encrypted: false,
      priority: 'high',
      reminderId: null,
      createdAt: now - 172800000,
      updatedAt: now - 7200000,
      deletedAt: null,
      versions: [],
    },
  ]
}

export function loadNotes() {
  const saved = loadJSON(STORAGE_KEYS.notes, null)
  if (saved?.length) return saved
  const seeded = seedNotes()
  saveJSON(STORAGE_KEYS.notes, seeded)
  return seeded
}

export function loadCategories() {
  const saved = loadJSON(STORAGE_KEYS.categories, null)
  if (saved?.length) return saved
  saveJSON(STORAGE_KEYS.categories, DEFAULT_CATEGORIES)
  return DEFAULT_CATEGORIES
}

export function loadTagGroups() {
  const saved = loadJSON(STORAGE_KEYS.tags, null)
  if (saved?.length) return saved
  saveJSON(STORAGE_KEYS.tags, DEFAULT_TAG_GROUPS)
  return DEFAULT_TAG_GROUPS
}

export function loadReminders() {
  return loadJSON(STORAGE_KEYS.reminders, [])
}

export function loadSettings() {
  return loadJSON(STORAGE_KEYS.settings, {
    theme: 'light',
    viewMode: 'card',
    trashAutoDays: 7,
    syncEnabled: true,
    offlineMode: false,
    privacyPassword: '',
    lastSyncAt: null,
    backupAuto: false,
    onboardingCompleted: false,
    nickname: '记事人',
  })
}

export function saveSettings(settings) {
  saveJSON(STORAGE_KEYS.settings, settings)
}

export function flattenTags(groups) {
  return (groups || []).flatMap((g) => (g.tags || []).map((t) => ({ ...t, groupId: g.id, groupName: g.name })))
}

export function noteSummary(note) {
  if (!note) return ''
  if (note.type === 'checklist') {
    const items = note.checklist || []
    const done = items.filter((i) => i.status === 'done').length
    return `${done}/${items.length} 已完成`
  }
  if (note.type === 'media') {
    return `${(note.media || []).length} 个附件`
  }
  return (note.content || '').replace(/\n/g, ' ').slice(0, 80)
}

export function createNote(partial = {}) {
  const now = Date.now()
  return {
    id: uid('note'),
    title: partial.title || '',
    content: partial.content || '',
    type: partial.type || 'text',
    checklist: partial.checklist || [],
    media: partial.media || [],
    categoryId: partial.categoryId || DEFAULT_CATEGORY_ID,
    tagIds: partial.tagIds || [],
    starred: !!partial.starred,
    favorite: !!partial.favorite,
    encrypted: !!partial.encrypted,
    priority: partial.priority || 'normal',
    reminderId: partial.reminderId || null,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    versions: [],
  }
}

export function pushVersion(note, snapshot) {
  const versions = [...(note.versions || []), { at: Date.now(), ...snapshot }].slice(-20)
  return { ...note, versions }
}
