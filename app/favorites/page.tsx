'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Loading, GridSkeleton } from '@/components/ui/loading'
import { IllustrationCard } from '@/components/ui/illustration-card'
import { Icons } from '@/components/ui/icons'

interface Illustration {
  id: string
  title: string
  description?: string
  imageUrl: string
  thumbnailUrl?: string
  user: {
    id: string
    name: string
    profileImage?: string | null
  }
  category?: {
    name: string
    color?: string
  }
  tags: Array<{
    name: string
  }>
  isFree: boolean
  downloadCount: number
  favoriteCount: number
  viewCount: number
  createdAt: string
}

export default function FavoritesPage() {
  const router = useRouter()
  const [illustrations, setIllustrations] = useState<Illustration[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  // お気に入り作品の取得
  const fetchFavorites = async () => {
    try {
      setIsLoading(true)
      setError('')

      const response = await fetch('/api/favorites')
      const data = await response.json()

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/auth/signin')
          return
        }
        throw new Error(data.error || 'お気に入り作品の取得に失敗しました')
      }

      setIllustrations(data.illustrations || [])
    } catch (error) {
      console.error('Error fetching favorites:', error)
      setError(error instanceof Error ? error.message : 'お気に入り作品の取得に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  // お気に入り切り替え
  const handleFavorite = async (illustrationId: string) => {
    try {
      const response = await fetch(`/api/illustrations/${illustrationId}/favorite`, {
        method: 'DELETE'
      })

      if (response.ok) {
        // お気に入りから削除
        setIllustrations(prev => prev.filter(ill => ill.id !== illustrationId))
      }
    } catch (error) {
      console.error('Error removing favorite:', error)
    }
  }

  // ダウンロード処理
  const handleDownload = async (illustrationId: string) => {
    try {
      const response = await fetch(`/api/illustrations/${illustrationId}/download`, {
        method: 'POST'
      })

      if (response.ok) {
        // ダウンロード数を更新
        setIllustrations(prev =>
          prev.map(ill =>
            ill.id === illustrationId
              ? { ...ill, downloadCount: ill.downloadCount + 1 }
              : ill
          )
        )
      }
    } catch (error) {
      console.error('Error downloading:', error)
    }
  }

  useEffect(() => {
    fetchFavorites()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">お気に入り作品</h1>
            <p className="text-gray-600">あなたがお気に入りに登録した作品一覧です</p>
          </div>
          <GridSkeleton count={12} />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Icons.heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">エラーが発生しました</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => router.push('/')}>
            ホームに戻る
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">お気に入り作品</h1>
              <p className="text-gray-600">
                あなたがお気に入りに登録した作品一覧です
                {illustrations.length > 0 && (
                  <span className="ml-2 text-blue-600 font-medium">
                    ({illustrations.length}件)
                  </span>
                )}
              </p>
            </div>
            <Link href="/illustrations">
              <Button variant="outline">
                <Icons.search className="w-4 h-4 mr-2" />
                作品を探す
              </Button>
            </Link>
          </div>
        </div>

        {/* 作品一覧 */}
        {illustrations.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {illustrations.map(illustration => (
              <IllustrationCard
                key={illustration.id}
                id={illustration.id}
                title={illustration.title}
                description={illustration.description}
                imageUrl={illustration.imageUrl}
                thumbnailUrl={illustration.thumbnailUrl}
                  author={{
                    id: illustration.user?.id || '',
                    name: illustration.user?.name || 'Unknown',
                    profileImage: illustration.user?.profileImage || undefined
                  }}
                category={illustration.category}
                tags={illustration.tags || []}
                isFree={illustration.isFree}
                downloadCount={illustration.downloadCount}
                favoriteCount={illustration.favoriteCount}
                viewCount={illustration.viewCount}
                onFavorite={handleFavorite}
                onDownload={handleDownload}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Icons.heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">お気に入り作品がありません</h2>
            <p className="text-gray-600 mb-6">
              気に入った作品をお気に入りに登録すると、<br />
              ここに表示されます。
            </p>
            <Link href="/illustrations">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Icons.search className="w-4 h-4 mr-2" />
                作品を探す
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
