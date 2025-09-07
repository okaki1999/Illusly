'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { IllustrationCard } from '@/components/ui/illustration-card'
import { Loading, GridSkeleton } from '@/components/ui/loading'
import { Icons } from '@/components/ui/icons'

interface Illustration {
  id: string
  title: string
  description?: string
  imageUrl: string
  thumbnailUrl?: string
  status: 'draft' | 'published' | 'private'
  isFree: boolean
  downloadCount: number
  favoriteCount: number
  viewCount: number
  createdAt: string
  updatedAt: string
  category?: {
    name: string
    color?: string
  }
  tags: Array<{
    name: string
  }>
}

interface Stats {
  totalIllustrations: number
  publishedIllustrations: number
  draftIllustrations: number
  totalViews: number
  totalDownloads: number
  totalFavorites: number
}

export default function IllustratorDashboardPage() {
  const [illustrations, setIllustrations] = useState<Illustration[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'all' | 'published' | 'draft'>('all')

  // 作品一覧の取得
  const fetchIllustrations = async (status?: string) => {
    try {
      setIsLoading(true)
      setError('')

      const params = new URLSearchParams({
        page: '1',
        limit: '20',
        sortBy: 'updatedAt',
        sortOrder: 'desc'
      })

      if (status) {
        params.append('status', status)
      }

      const response = await fetch(`/api/illustrations/my?${params}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '作品の取得に失敗しました')
      }

      setIllustrations(data.illustrations)
    } catch (error) {
      console.error('Error fetching illustrations:', error)
      setError(error instanceof Error ? error.message : '作品の取得に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  // 統計情報の取得
  const fetchStats = async () => {
    try {
      const response = await fetch('/api/illustrations/my/stats')
      const data = await response.json()

      if (response.ok) {
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  // 作品の削除
  const handleDelete = async (illustrationId: string) => {
    if (!confirm('この作品を削除しますか？この操作は取り消せません。')) {
      return
    }

    try {
      const response = await fetch(`/api/illustrations/${illustrationId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || '削除に失敗しました')
      }

      // 一覧から削除
      setIllustrations(prev => prev.filter(ill => ill.id !== illustrationId))

      // 統計を更新
      if (stats) {
        setStats({
          ...stats,
          totalIllustrations: stats.totalIllustrations - 1,
          publishedIllustrations: illustrations.find(ill => ill.id === illustrationId)?.status === 'published'
            ? stats.publishedIllustrations - 1
            : stats.publishedIllustrations,
          draftIllustrations: illustrations.find(ill => ill.id === illustrationId)?.status === 'draft'
            ? stats.draftIllustrations - 1
            : stats.draftIllustrations
        })
      }
    } catch (error) {
      console.error('Error deleting illustration:', error)
      alert(error instanceof Error ? error.message : '削除に失敗しました')
    }
  }

  // タブ変更時の処理
  const handleTabChange = (tab: 'all' | 'published' | 'draft') => {
    setActiveTab(tab)
    const status = tab === 'all' ? undefined : tab
    fetchIllustrations(status)
  }

  useEffect(() => {
    fetchIllustrations()
    fetchStats()
  }, [])

  if (isLoading && !illustrations.length) {
    return <Loading text="作品を読み込み中..." fullScreen />
  }

  return (
    <div className="space-y-8">
      {/* ヘッダー */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">作品管理</h1>
          <p className="text-gray-600 mt-1">あなたの作品を管理しましょう</p>
        </div>
        <Link href="/dashboard/upload">
          <Button className="mt-4 sm:mt-0">
            <Icons.upload className="w-4 h-4 mr-2" />
            新しい作品を投稿
          </Button>
        </Link>
      </div>

      {/* 統計カード */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Icons.image className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">総作品数</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalIllustrations}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Icons.check className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">公開中</p>
                <p className="text-2xl font-bold text-gray-900">{stats.publishedIllustrations}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Icons.eye className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">総閲覧数</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalViews.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Icons.download className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">総ダウンロード数</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalDownloads.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* タブ */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'all', label: 'すべて', count: stats?.totalIllustrations || 0 },
            { key: 'published', label: '公開中', count: stats?.publishedIllustrations || 0 },
            { key: 'draft', label: '下書き', count: stats?.draftIllustrations || 0 }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key as 'all' | 'published' | 'draft')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              {tab.label}
              <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${activeTab === tab.key
                  ? 'bg-blue-100 text-blue-600'
                  : 'bg-gray-100 text-gray-600'
                }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* エラー表示 */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* 作品一覧 */}
      {isLoading ? (
        <GridSkeleton count={8} />
      ) : illustrations.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {illustrations.map(illustration => (
            <div key={illustration.id} className="relative group">
              <IllustrationCard
                id={illustration.id}
                title={illustration.title}
                description={illustration.description}
                imageUrl={illustration.imageUrl}
                thumbnailUrl={illustration.thumbnailUrl}
                author={{
                  id: '',
                  name: 'あなた',
                  profileImage: undefined
                }}
                category={illustration.category}
                tags={illustration.tags}
                isFree={illustration.isFree}
                downloadCount={illustration.downloadCount}
                favoriteCount={illustration.favoriteCount}
                viewCount={illustration.viewCount}
                onFavorite={() => { }}
                onDownload={() => { }}
              />

              {/* 管理メニュー */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex space-x-1">
                  <Link href={`/dashboard/illustrator/${illustration.id}/edit`}>
                    <Button size="sm" variant="secondary" className="bg-white/90 hover:bg-white">
                      <Icons.settings className="w-3 h-3" />
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="bg-white/90 hover:bg-white text-red-600 hover:text-red-700"
                    onClick={() => handleDelete(illustration.id)}
                  >
                    <Icons.x className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              {/* ステータスバッジ */}
              <div className="absolute top-2 left-2">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${illustration.status === 'published'
                    ? 'bg-green-100 text-green-800'
                    : illustration.status === 'draft'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                  {illustration.status === 'published' && '公開中'}
                  {illustration.status === 'draft' && '下書き'}
                  {illustration.status === 'private' && '非公開'}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Icons.image className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {activeTab === 'all' && 'まだ作品がありません'}
            {activeTab === 'published' && '公開中の作品がありません'}
            {activeTab === 'draft' && '下書きの作品がありません'}
          </h3>
          <p className="text-gray-600 mb-4">
            {activeTab === 'all' && '最初の作品を投稿してみましょう'}
            {activeTab === 'published' && '作品を公開してユーザーに届けましょう'}
            {activeTab === 'draft' && '下書きとして保存された作品が表示されます'}
          </p>
          <Link href="/dashboard/upload">
            <Button>
              <Icons.upload className="w-4 h-4 mr-2" />
              作品を投稿
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}
