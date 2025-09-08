'use client'

import { useState } from 'react'
import { UserRole } from '@prisma/client'
import { Icons } from '@/components/ui/icons'
import { Button } from '@/components/ui/button'
import { SearchBar } from '@/components/ui/search-bar'

interface DashboardHeaderProps {
  onMenuClick: () => void
  user: any
  userRole?: UserRole
}

export function Header({ onMenuClick, user, userRole }: DashboardHeaderProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    // TODO: 検索機能の実装
    console.log('Search query:', query)
  }

  const handleSearchClear = () => {
    setSearchQuery('')
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* 左側: メニューボタンとロゴ */}
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={onMenuClick}
              className="lg:hidden mr-2"
            >
              <Icons.menu className="w-5 h-5" />
            </Button>

            <div className="hidden lg:block">
              <h1 className="text-lg font-semibold text-gray-900">
                ダッシュボード
              </h1>
            </div>
          </div>

          {/* 中央: 検索バー */}
          <div className="flex-1 max-w-lg mx-4">
            <SearchBar
              placeholder="作品を検索..."
              onSearch={handleSearch}
              onClear={handleSearchClear}
              className="w-full"
            />
          </div>

          {/* 右側: ユーザーメニュー */}
          <div className="flex items-center space-x-4">
            {/* ユーザーロール表示 */}
            {userRole && (
              <span className={`hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${userRole === UserRole.admin
                ? 'bg-red-100 text-red-800'
                : userRole === UserRole.illustrator
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-800'
                }`}>
                {userRole === UserRole.admin && '管理者'}
                {userRole === UserRole.illustrator && 'イラストレーター'}
                {userRole === UserRole.user && '一般ユーザー'}
              </span>
            )}

            {/* ユーザーアバター */}
            <div className="flex items-center space-x-2">
              {user?.profileImageUrl ? (
                <img
                  src={user.profileImageUrl}
                  alt={user.displayName || user.primaryEmail}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <Icons.user className="w-4 h-4 text-gray-600" />
                </div>
              )}

              <div className="hidden sm:block">
                <p className="text-sm font-medium text-gray-900">
                  {user?.displayName || user?.primaryEmail?.split('@')[0] || 'ユーザー'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
