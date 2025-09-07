'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserRole } from '@prisma/client'
import { Icons } from '@/components/ui/icons'
import { Button } from '@/components/ui/button'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  userRole?: UserRole
  isIllustrator?: boolean
  isAdmin?: boolean
}

interface NavItem {
  name: string
  href: string
  icon: React.ComponentType<any>
  roles?: UserRole[]
  badge?: string
}

// 基本機能（全ユーザー共通）
const basicNavigation: NavItem[] = [
  {
    name: 'ダッシュボード',
    href: '/dashboard',
    icon: Icons.home,
    roles: [UserRole.user, UserRole.illustrator, UserRole.admin]
  },
  {
    name: '作品一覧',
    href: '/illustrations',
    icon: Icons.image,
    roles: [UserRole.user, UserRole.illustrator, UserRole.admin]
  },
  {
    name: 'お気に入り',
    href: '/favorites',
    icon: Icons.heart,
    roles: [UserRole.user, UserRole.illustrator, UserRole.admin]
  },
  {
    name: 'ダウンロード履歴',
    href: '/downloads',
    icon: Icons.download,
    roles: [UserRole.user, UserRole.illustrator, UserRole.admin]
  }
]

// イラストレーター機能
const illustratorNavigation: NavItem[] = [
  {
    name: '作品管理',
    href: '/dashboard/illustrator',
    icon: Icons.image,
    roles: [UserRole.illustrator, UserRole.admin]
  },
  {
    name: '作品投稿',
    href: '/dashboard/upload',
    icon: Icons.upload,
    roles: [UserRole.illustrator, UserRole.admin]
  },
  {
    name: '統計',
    href: '/dashboard/analytics',
    icon: Icons.chart,
    roles: [UserRole.illustrator, UserRole.admin]
  }
]

// 管理者機能
const adminNavigation: NavItem[] = [
  {
    name: '管理者パネル',
    href: '/dashboard/admin',
    icon: Icons.shield,
    roles: [UserRole.admin],
    badge: 'Admin'
  }
]

const secondaryNavigation = [
  {
    name: 'アカウント設定',
    href: '/dashboard/settings',
    icon: Icons.user
  },
  {
    name: 'サブスクリプション',
    href: '/billing',
    icon: Icons.creditCard
  }
]

export function Sidebar({
  isOpen,
  onClose,
  userRole = UserRole.user,
  isIllustrator = false,
  isAdmin = false
}: SidebarProps) {
  const pathname = usePathname()

  const filteredBasicNavigation = basicNavigation.filter(item => {
    if (!item.roles) return true
    return item.roles.includes(userRole)
  })

  const filteredIllustratorNavigation = illustratorNavigation.filter(item => {
    if (!item.roles) return true
    return item.roles.includes(userRole)
  })

  const filteredAdminNavigation = adminNavigation.filter(item => {
    if (!item.roles) return true
    return item.roles.includes(userRole)
  })

  const renderNavigationItems = (items: NavItem[]) => {
    return items.map((item) => {
      const isActive = pathname === item.href ||
        (item.href !== '/dashboard' && pathname.startsWith(item.href))

      return (
        <Link
          key={item.name}
          href={item.href}
          className={`
            group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors
            ${isActive
              ? 'bg-blue-100 text-blue-900'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }
          `}
        >
          <item.icon
            className={`
              mr-3 flex-shrink-0 h-5 w-5
              ${isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'}
            `}
          />
          {item.name}
          {item.badge && (
            <span className="ml-auto inline-block py-0.5 px-2 text-xs font-medium bg-red-100 text-red-800 rounded-full">
              {item.badge}
            </span>
          )}
        </Link>
      )
    })
  }

  return (
    <>
      {/* デスクトップ用サイドバー */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col lg:bg-white lg:border-r lg:border-gray-200">
        <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
          {/* ロゴ */}
          <div className="flex items-center flex-shrink-0 px-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Icons.image className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Illusly</span>
            </Link>
          </div>

          {/* ナビゲーション */}
          <nav className="mt-8 flex-1 px-2 space-y-6">
            {/* 基本機能 */}
            <div>
              <h3 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                基本機能
              </h3>
              <div className="space-y-1">
                {renderNavigationItems(filteredBasicNavigation)}
              </div>
            </div>

            {/* イラストレーター機能 */}
            {filteredIllustratorNavigation.length > 0 && (
              <div>
                <h3 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  イラストレーター機能
                </h3>
                <div className="space-y-1">
                  {renderNavigationItems(filteredIllustratorNavigation)}
                </div>
              </div>
            )}

            {/* 管理者機能 */}
            {filteredAdminNavigation.length > 0 && (
              <div>
                <h3 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  管理者機能
                </h3>
                <div className="space-y-1">
                  {renderNavigationItems(filteredAdminNavigation)}
                </div>
              </div>
            )}
          </nav>

          {/* セカンダリナビゲーション */}
          <div className="flex-shrink-0 px-2 py-4 border-t border-gray-200">
            <nav className="space-y-1">
              {secondaryNavigation.map((item) => {
                const isActive = pathname === item.href

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`
                      group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors
                      ${isActive
                        ? 'bg-blue-100 text-blue-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }
                    `}
                  >
                    <item.icon
                      className={`
                        mr-3 flex-shrink-0 h-5 w-5
                        ${isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'}
                      `}
                    />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* モバイル用サイドバー */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:hidden
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* ヘッダー */}
          <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Icons.image className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Illusly</span>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-2"
            >
              <Icons.close className="w-5 h-5" />
            </Button>
          </div>

          {/* ナビゲーション */}
          <div className="flex-1 overflow-y-auto py-4">
            <nav className="px-2 space-y-6">
              {/* 基本機能 */}
              <div>
                <h3 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  基本機能
                </h3>
                <div className="space-y-1">
                  {filteredBasicNavigation.map((item) => {
                    const isActive = pathname === item.href ||
                      (item.href !== '/dashboard' && pathname.startsWith(item.href))

                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={onClose}
                        className={`
                          group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors
                          ${isActive
                            ? 'bg-blue-100 text-blue-900'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                          }
                        `}
                      >
                        <item.icon
                          className={`
                            mr-3 flex-shrink-0 h-5 w-5
                            ${isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'}
                          `}
                        />
                        {item.name}
                        {item.badge && (
                          <span className="ml-auto inline-block py-0.5 px-2 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    )
                  })}
                </div>
              </div>

              {/* イラストレーター機能 */}
              {filteredIllustratorNavigation.length > 0 && (
                <div>
                  <h3 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    イラストレーター機能
                  </h3>
                  <div className="space-y-1">
                    {filteredIllustratorNavigation.map((item) => {
                      const isActive = pathname === item.href ||
                        (item.href !== '/dashboard' && pathname.startsWith(item.href))

                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={onClose}
                          className={`
                            group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors
                            ${isActive
                              ? 'bg-blue-100 text-blue-900'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }
                          `}
                        >
                          <item.icon
                            className={`
                              mr-3 flex-shrink-0 h-5 w-5
                              ${isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'}
                            `}
                          />
                          {item.name}
                          {item.badge && (
                            <span className="ml-auto inline-block py-0.5 px-2 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* 管理者機能 */}
              {filteredAdminNavigation.length > 0 && (
                <div>
                  <h3 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    管理者機能
                  </h3>
                  <div className="space-y-1">
                    {filteredAdminNavigation.map((item) => {
                      const isActive = pathname === item.href ||
                        (item.href !== '/dashboard' && pathname.startsWith(item.href))

                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={onClose}
                          className={`
                            group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors
                            ${isActive
                              ? 'bg-blue-100 text-blue-900'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }
                          `}
                        >
                          <item.icon
                            className={`
                              mr-3 flex-shrink-0 h-5 w-5
                              ${isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'}
                            `}
                          />
                          {item.name}
                          {item.badge && (
                            <span className="ml-auto inline-block py-0.5 px-2 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )}
            </nav>

            {/* セカンダリナビゲーション */}
            <div className="mt-8 px-2 py-4 border-t border-gray-200">
              <nav className="space-y-1">
                {secondaryNavigation.map((item) => {
                  const isActive = pathname === item.href

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={onClose}
                      className={`
                        group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors
                        ${isActive
                          ? 'bg-blue-100 text-blue-900'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }
                      `}
                    >
                      <item.icon
                        className={`
                          mr-3 flex-shrink-0 h-5 w-5
                          ${isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'}
                        `}
                      />
                      {item.name}
                    </Link>
                  )
                })}
              </nav>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
