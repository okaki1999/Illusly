'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@stackframe/stack'
import { UserRole } from '@prisma/client'
import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const user = useUser()
  const [userInfo, setUserInfo] = useState<{
    role: UserRole
    isIllustrator: boolean
    isAdmin: boolean
  } | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const res = await fetch('/api/auth/role', { cache: 'no-store' })
        if (res.ok) {
          const data = await res.json()
          setUserInfo(data)
        }
      } catch (error) {
        console.error('Error fetching user info:', error)
      }
    }

    if (user) {
      fetchUserInfo()
    }
  }, [user])

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">認証が必要です</h1>
          <p className="text-gray-600">ログインしてください。</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* サイドバー */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        userRole={userInfo?.role}
        isIllustrator={userInfo?.isIllustrator}
        isAdmin={userInfo?.isAdmin}
      />

      {/* メインコンテンツ */}
      <div className="lg:pl-64">
        {/* ヘッダー */}
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          user={user}
          userRole={userInfo?.role}
        />

        {/* ページコンテンツ */}
        <main className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>

      {/* モバイル用オーバーレイ */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}