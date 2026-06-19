import React, { useState } from 'react'
import { Shield, Lock, Download, Upload, ChevronLeft } from 'lucide-react'

export default function PrivacyPanel({ settings, onChangeSettings, onClose, onEnterPrivacy }) {
  const [pwd, setPwd] = useState(settings.privacyPassword || '')
  const [backupPwd, setBackupPwd] = useState('')

  const savePrivacyPwd = () => {
    onChangeSettings?.({ privacyPassword: pwd })
  }

  const exportBackup = () => {
    const data = {
      exportedAt: Date.now(),
      notes: localStorage.getItem('jishibu.notes'),
      categories: localStorage.getItem('jishibu.categories'),
    }
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `记事簿备份-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="absolute inset-0 z-[90] flex flex-col bg-note-paper">
      <div className="shrink-0 px-4 pb-3 app-top-bar border-b border-note-line flex items-center gap-3">
        <button type="button" onClick={onClose} className="p-2 rounded-full bg-note-cream"><ChevronLeft className="w-5 h-5" /></button>
        <h1 className="text-lg font-bold">隐私保护</h1>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-hide">
        <div className="p-4 rounded-2xl border border-note-line bg-surface space-y-3">
          <p className="text-sm font-bold flex items-center gap-2"><Lock className="w-4 h-4" />隐私密码</p>
          <input type="password" value={pwd} onChange={(e) => setPwd(e.target.value)} placeholder="设置隐私模式密码" className="w-full px-3 py-2.5 rounded-xl border border-note-line text-sm" />
          <button type="button" onClick={savePrivacyPwd} className="w-full py-2.5 rounded-xl bg-note-ink text-note-paper text-xs font-bold">保存密码</button>
          <button type="button" onClick={onEnterPrivacy} className="w-full py-2.5 rounded-xl border border-note-line text-xs font-bold flex items-center justify-center gap-2">
            <Shield className="w-4 h-4" />进入隐私模式
          </button>
        </div>

        <div className="p-4 rounded-2xl border border-note-line bg-surface space-y-3">
          <p className="text-sm font-bold">数据备份</p>
          <label className="flex items-center justify-between text-xs font-bold">
            自动备份
            <input type="checkbox" checked={settings.backupAuto} onChange={(e) => onChangeSettings?.({ backupAuto: e.target.checked })} />
          </label>
          <input type="password" value={backupPwd} onChange={(e) => setBackupPwd(e.target.value)} placeholder="备份密码（可选）" className="w-full px-3 py-2.5 rounded-xl border border-note-line text-sm" />
          <div className="flex gap-2">
            <button type="button" onClick={exportBackup} className="flex-1 py-2.5 rounded-xl border border-note-line text-xs font-bold flex items-center justify-center gap-1"><Download className="w-4 h-4" />导出备份</button>
            <label className="flex-1 py-2.5 rounded-xl border border-note-line text-xs font-bold flex items-center justify-center gap-1 cursor-pointer">
              <Upload className="w-4 h-4" />导入备份
              <input type="file" accept=".json" className="hidden" onChange={(e) => {
                const file = e.target.files?.[0]
                if (!file) return
                const reader = new FileReader()
                reader.onload = (ev) => {
                  try {
                    const data = JSON.parse(ev.target.result)
                    if (data.notes) localStorage.setItem('jishibu.notes', data.notes)
                    if (data.categories) localStorage.setItem('jishibu.categories', data.categories)
                    window.location.reload()
                  } catch { alert('备份文件无效') }
                }
                reader.readAsText(file)
              }} />
            </label>
          </div>
        </div>

        <p className="text-[11px] text-note-muted leading-relaxed px-1">
          加密记事与加密分类仅在验证隐私密码后可见。隐私模式下新建的记事默认加密保存。
        </p>
      </div>
    </div>
  )
}
