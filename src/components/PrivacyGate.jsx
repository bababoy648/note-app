import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Lock, X } from 'lucide-react'
import { verifyPrivacyPassword, isPrivacyLocked, privacyLockMinutesLeft } from '../lib/auth'
import { cn } from '../lib/utils'

export default function PrivacyGate({ settings, onUnlock, onCancel, title = '隐私模式' }) {
  const [pwd, setPwd] = useState('')
  const [error, setError] = useState('')
  const locked = isPrivacyLocked()

  const submit = (e) => {
    e.preventDefault()
    if (locked) {
      setError(`已锁定，请 ${privacyLockMinutesLeft()} 分钟后再试`)
      return
    }
    if (!settings.privacyPassword) {
      onUnlock?.()
      return
    }
    if (verifyPrivacyPassword(settings, pwd)) {
      setError('')
      onUnlock?.()
    } else {
      setError(locked ? `已锁定 ${privacyLockMinutesLeft()} 分钟` : '密码错误')
      setPwd('')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-[120] bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
    >
      <motion.form
        initial={{ y: 40 }}
        animate={{ y: 0 }}
        onSubmit={submit}
        className="w-full max-w-sm bg-note-paper rounded-3xl p-6 shadow-2xl border border-note-line"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-note-accent" />
            <h3 className="font-bold">{title}</h3>
          </div>
          {onCancel && (
            <button type="button" onClick={onCancel} className="p-2 rounded-full bg-note-cream"><X className="w-4 h-4" /></button>
          )}
        </div>
        <p className="text-xs text-note-muted mb-4">验证密码后查看加密内容</p>
        <input
          type="password"
          value={pwd}
          onChange={(e) => setPwd(e.target.value)}
          placeholder="隐私密码"
          autoFocus
          className="w-full px-4 py-3 rounded-xl border border-note-line bg-input text-sm outline-none focus:ring-2 focus:ring-note-accent/30"
        />
        {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
        <button type="submit" className={cn('w-full mt-4 py-3 rounded-2xl bg-note-ink text-note-paper font-bold text-sm')}>
          进入
        </button>
      </motion.form>
    </motion.div>
  )
}
