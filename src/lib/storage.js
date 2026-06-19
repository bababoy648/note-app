export const STORAGE_KEYS = {
  session: 'jishibu.session',
  notes: 'jishibu.notes',
  categories: 'jishibu.categories',
  tags: 'jishibu.tagGroups',
  reminders: 'jishibu.reminders',
  settings: 'jishibu.settings',
  syncLog: 'jishibu.syncLog',
  users: 'jishibu.users',
}

export function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

export function saveJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}
