import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, PenLine, Bell, Shield, ChevronRight } from 'lucide-react'

const SLIDES = [
  {
    icon: BookOpen,
    title: '欢迎使用记事簿',
    desc: '单机本地记事，无需登录。文字、清单、图片与语音，灵感随时记录。',
  },
  {
    icon: PenLine,
    title: '灵活记录',
    desc: '支持模板、分类、标签与星标收藏。编辑时自动保存，不怕丢失。',
  },
  {
    icon: Bell,
    title: '提醒不漏',
    desc: '在记事里设提醒，或在提醒页直接新建。定时、重复、倒计时都支持。',
  },
  {
    icon: Shield,
    title: '隐私在本机',
    desc: '数据保存在浏览器本地。可设隐私密码、加密分类，备份导入导出。',
  },
]

export default function OnboardingGuide({ onComplete, replay = false }) {
  const [step, setStep] = useState(0)
  const slide = SLIDES[step]
  const Icon = slide.icon
  const isLast = step === SLIDES.length - 1

  return (
    <div className="absolute inset-0 z-[120] flex flex-col bg-note-paper">
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="max-w-xs"
          >
            <div className="w-20 h-20 rounded-[1.75rem] bg-note-ink text-note-paper flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Icon className="w-10 h-10" />
            </div>
            <h1 className="text-2xl font-serif font-bold mb-3">{slide.title}</h1>
            <p className="text-sm text-note-muted leading-relaxed">{slide.desc}</p>
          </motion.div>
        </AnimatePresence>
        <div className="flex gap-2 mt-10">
          {SLIDES.map((_, i) => (
            <span key={i} className={`h-1.5 rounded-full transition-all ${i === step ? 'w-6 bg-note-accent' : 'w-1.5 bg-note-line'}`} />
          ))}
        </div>
      </div>

      <div className="shrink-0 p-6 pb-10 space-y-3">
        {!isLast ? (
          <>
            <button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              className="w-full py-3.5 rounded-2xl bg-note-ink text-note-paper font-bold flex items-center justify-center gap-2"
            >
              下一步 <ChevronRight className="w-4 h-4" />
            </button>
            <button type="button" onClick={onComplete} className="w-full py-2 text-xs font-bold text-note-muted">
              跳过引导
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={onComplete}
            className="w-full py-3.5 rounded-2xl bg-note-ink text-note-paper font-bold"
          >
            {replay ? '完成' : '开始使用'}
          </button>
        )}
      </div>
    </div>
  )
}
