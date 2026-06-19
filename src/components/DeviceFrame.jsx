import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ChefHat } from 'lucide-react'

const PANEL_COPY = {
  home: {
    title: '首页 · 记事列表',
    lead: '分类浏览、多维搜索筛选、星标收藏与列表/卡片视图，快速找到每一条记录。',
  },
  categories: {
    title: '分类管理',
    lead: '自定义图标与颜色，支持多级分类、拖拽排序与批量整理。',
  },
  reminders: {
    title: '提醒管理',
    lead: '定时、重复与倒计时提醒，待处理与过期状态一目了然。',
  },
  profile: {
    title: '我的',
    lead: '主题切换、同步备份、隐私保护与数据统计。',
  },
}

export default function DeviceFrame({ children, activeTab }) {
  const [desktop, setDesktop] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(min-width: 768px)').matches,
  )

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)')
    const onChange = (e) => setDesktop(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  if (!desktop) {
    return (
      <div className="h-[100dvh] w-full overflow-hidden">
        <div className="app-shell app-shell--full h-full w-full">{children}</div>
      </div>
    )
  }

  const copy = PANEL_COPY[activeTab] || PANEL_COPY.home

  return (
    <div className="demo-showcase h-[100dvh] overflow-hidden">
      <div className="device-stage shrink-0">
        <div className="device-phone">
          <div className="device-screen">
            <div className="device-island" aria-hidden><span className="device-island-lens" /></div>
            <div className="h-full w-full overflow-hidden app-shell app-shell--device">{children}</div>
            <div className="device-home-bar" aria-hidden />
          </div>
        </div>
      </div>
      <aside className="demo-side-panel">
        <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-note-muted">记事簿 · 课程演示</span>
        <h2 className="mt-3">{copy.title}</h2>
        <p>{copy.lead}</p>
        <div className="mt-6 flex items-center gap-3 text-note-muted">
          <div className="w-10 h-10 rounded-2xl bg-note-ink text-note-paper flex items-center justify-center">
            <ChefHat className="w-5 h-5" />
          </div>
          <p className="text-sm">双端适配 · 本地存储 · 自动保存</p>
        </div>
      </aside>
    </div>
  )
}
