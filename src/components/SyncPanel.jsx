import React, { useState } from 'react'
import { Cloud, RefreshCw, WifiOff, Check, X, ChevronLeft } from 'lucide-react'
import { formatDateTime, uid } from '../lib/utils'
import { saveJSON, STORAGE_KEYS } from '../lib/storage'

export default function SyncPanel({ settings, syncLog, onChangeSettings, onSync, onClose }) {
  const [syncing, setSyncing] = useState(false)

  const runSync = async () => {
    setSyncing(true)
    await new Promise((r) => setTimeout(r, 1200))
    const entry = { id: uid('sync'), at: Date.now(), status: 'success', count: Math.floor(Math.random() * 5) + 1 }
    const next = [entry, ...syncLog].slice(0, 30)
    saveJSON(STORAGE_KEYS.syncLog, next)
    onChangeSettings?.({ lastSyncAt: Date.now() })
    onSync?.(next)
    setSyncing(false)
  }

  return (
    <div className="absolute inset-0 z-[90] flex flex-col bg-note-paper">
      <div className="shrink-0 px-4 pb-3 app-top-bar border-b border-note-line flex items-center gap-3">
        <button type="button" onClick={onClose} className="p-2 rounded-full bg-note-cream"><ChevronLeft className="w-5 h-5" /></button>
        <h1 className="text-lg font-bold">同步管理</h1>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-hide">
        <div className="p-4 rounded-2xl border border-note-line bg-surface space-y-3">
          <label className="flex items-center justify-between text-sm font-bold">
            <span className="flex items-center gap-2"><Cloud className="w-4 h-4" />开启同步</span>
            <input type="checkbox" checked={settings.syncEnabled} onChange={(e) => onChangeSettings?.({ syncEnabled: e.target.checked })} />
          </label>
          <label className="flex items-center justify-between text-sm font-bold">
            <span className="flex items-center gap-2"><WifiOff className="w-4 h-4" />离线模式</span>
            <input type="checkbox" checked={settings.offlineMode} onChange={(e) => onChangeSettings?.({ offlineMode: e.target.checked })} />
          </label>
          {settings.lastSyncAt && <p className="text-[11px] text-note-muted">上次同步：{formatDateTime(settings.lastSyncAt)}</p>}
          <button type="button" onClick={runSync} disabled={syncing || !settings.syncEnabled} className="w-full py-3 rounded-2xl bg-note-ink text-note-paper font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-40">
            <RefreshCw className={syncing ? 'w-4 h-4 animate-spin' : 'w-4 h-4'} />{syncing ? '同步中…' : '手动同步'}
          </button>
        </div>

        <div>
          <p className="text-[10px] font-black tracking-wider text-note-muted uppercase mb-2">近 30 天同步记录</p>
          <div className="space-y-2">
            {syncLog.length === 0 ? (
              <p className="text-sm text-note-muted text-center py-8">暂无同步记录</p>
            ) : syncLog.map((log) => (
              <div key={log.id} className="flex items-center gap-3 p-3 rounded-xl border border-note-line bg-surface text-sm">
                {log.status === 'success' ? <Check className="w-4 h-4 text-green-600" /> : <X className="w-4 h-4 text-red-500" />}
                <div className="flex-1">
                  <p className="font-bold">{log.status === 'success' ? '同步成功' : '同步失败'}</p>
                  <p className="text-[10px] text-note-muted">{formatDateTime(log.at)} · {log.count || 0} 条</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
