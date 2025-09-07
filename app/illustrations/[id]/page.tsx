'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Loading } from '@/components/ui/loading'
import { Icons } from '@/components/ui/icons'

interface Illustration {
  id: string
  title: string
  description?: string
  imageUrl: string
  thumbnailUrl?: string
  width?: number
  height?: number
  fileSize?: number
  mimeType?: string
  isFree: boolean
  downloadCount: number
  favoriteCount: number
  viewCount: number
  createdAt: string
  updatedAt: string
  user: {
    id: string
    name: string
    profileImage?: string | null
    bio?: string | null
    website?: string | null
  }
  category?: {
    id: string
    name: string
    color?: string
  }
  tags: Array<{
    id: string
    name: string
  }>
}

export default function IllustrationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [illustration, setIllustration] = useState<Illustration | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isFavorited, setIsFavorited] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  const illustrationId = params.id as string

  // 作品詳細の取得
  const fetchIllustration = async () => {
    try {
      setIsLoading(true)
      setError('')

      const response = await fetch(`/api/illustrations/${illustrationId}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '作品の取得に失敗しました')
      }

      console.log('Setting illustration:', data.illustration)
      setIllustration(data.illustration)
      setIsFavorited(data.isFavorited || false)
    } catch (error) {
      console.error('Error fetching illustration:', error)
      setError(error instanceof Error ? error.message : '作品の取得に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  // お気に入り切り替え
  const handleFavorite = async () => {
    try {
      const response = await fetch(`/api/illustrations/${illustrationId}/favorite`, {
        method: isFavorited ? 'DELETE' : 'POST'
      })

      if (response.ok) {
        setIsFavorited(!isFavorited)
        if (illustration) {
          setIllustration({
            ...illustration,
            favoriteCount: isFavorited
              ? illustration.favoriteCount - 1
              : illustration.favoriteCount + 1
          })
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
    }
  }

  // ダウンロード
  const handleDownload = async () => {
    if (!illustration) return

    try {
      setIsDownloading(true)

      // TODO: 実際のダウンロード処理
      // 現在は仮の処理
      const response = await fetch(`/api/illustrations/${illustrationId}/download`, {
        method: 'POST'
      })

      if (response.ok) {
        // ダウンロード数を更新
        setIllustration({
          ...illustration,
          downloadCount: illustration.downloadCount + 1
        })
      }
    } catch (error) {
      console.error('Error downloading:', error)
    } finally {
      setIsDownloading(false)
    }
  }

  useEffect(() => {
    if (illustrationId) {
      fetchIllustration()
    }
  }, [illustrationId])

  if (isLoading) {
    return <Loading text="作品を読み込み中..." fullScreen />
  }

  if (error || !illustration) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Icons.image className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">作品が見つかりません</h1>
          <p className="text-gray-600 mb-4">{error || '指定された作品は存在しません'}</p>
          <Button onClick={() => router.push('/illustrations')}>
            作品一覧に戻る
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* パンくずリスト */}
        <nav className="mb-6">
          <ol className="flex items-center space-x-2 text-sm text-gray-600">
            <li>
              <Link href="/" className="hover:text-gray-900">ホーム</Link>
            </li>
            <li>
              <Icons.chevronRight className="w-4 h-4" />
            </li>
            <li>
              <Link href="/illustrations" className="hover:text-gray-900">作品一覧</Link>
            </li>
            <li>
              <Icons.chevronRight className="w-4 h-4" />
            </li>
            <li className="text-gray-900 truncate">{illustration.title}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* メインコンテンツ */}
          <div className="lg:col-span-2">
            {/* 作品画像 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
              <div className="aspect-square bg-gray-100 flex items-center justify-center">
                {illustration.imageUrl ? (
                  <img
                    src={illustration.imageUrl}
                    alt={illustration.title}
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <Icons.image className="w-24 h-24 text-gray-400" />
                )}
              </div>
            </div>

            {/* 作品情報 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">{illustration.title}</h1>

              {illustration.description && (
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">説明</h2>
                  <p className="text-gray-700 whitespace-pre-wrap">{illustration.description}</p>
                </div>
              )}

              {/* タグ */}
              {illustration.tags.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">タグ</h2>
                  <div className="flex flex-wrap gap-2">
                    {illustration.tags.map(tag => (
                      <Link
                        key={tag.id}
                        href={`/illustrations?tag=${tag.id}`}
                        className="px-3 py-1 text-sm text-blue-600 bg-blue-100 rounded-full hover:bg-blue-200 transition-colors"
                      >
                        #{tag.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* 作品詳細 */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">投稿日</span>
                  <p className="font-medium">
                    {new Date(illustration.createdAt).toLocaleDateString('ja-JP')}
                  </p>
                </div>
                {illustration.width && illustration.height && (
                  <div>
                    <span className="text-gray-500">サイズ</span>
                    <p className="font-medium">
                      {illustration.width} × {illustration.height}
                    </p>
                  </div>
                )}
                {illustration.fileSize && (
                  <div>
                    <span className="text-gray-500">ファイルサイズ</span>
                    <p className="font-medium">
                      {(illustration.fileSize / 1024 / 1024).toFixed(1)} MB
                    </p>
                  </div>
                )}
                {illustration.mimeType && (
                  <div>
                    <span className="text-gray-500">形式</span>
                    <p className="font-medium">
                      {illustration.mimeType.split('/')[1].toUpperCase()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* サイドバー */}
          <div className="space-y-6">
            {/* 作者情報 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">作者</h2>
              <div className="flex items-center space-x-3 mb-4">
                {illustration.user?.profileImage ? (
                  <img
                    src={illustration.user.profileImage}
                    alt={illustration.user?.name || 'Unknown'}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                    <Icons.user className="w-6 h-6 text-gray-600" />
                  </div>
                )}
                <div>
                  <h3 className="font-medium text-gray-900">{illustration.user?.name || 'Unknown'}</h3>
                  {illustration.user?.bio && (
                    <p className="text-sm text-gray-600">{illustration.user.bio}</p>
                  )}
                </div>
              </div>

              {illustration.user?.website && (
                <a
                  href={illustration.user.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  {illustration.user.website}
                </a>
              )}
            </div>

            {/* アクション */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="space-y-4">
                {/* 統計 */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="flex items-center justify-center space-x-1 text-gray-500 mb-1">
                      <Icons.eye className="w-4 h-4" />
                    </div>
                    <p className="text-lg font-semibold text-gray-900">
                      {illustration.viewCount.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">閲覧</p>
                  </div>
                  <div>
                    <div className="flex items-center justify-center space-x-1 text-gray-500 mb-1">
                      <Icons.heart className="w-4 h-4" />
                    </div>
                    <p className="text-lg font-semibold text-gray-900">
                      {illustration.favoriteCount.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">お気に入り</p>
                  </div>
                  <div>
                    <div className="flex items-center justify-center space-x-1 text-gray-500 mb-1">
                      <Icons.download className="w-4 h-4" />
                    </div>
                    <p className="text-lg font-semibold text-gray-900">
                      {illustration.downloadCount.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">ダウンロード</p>
                  </div>
                </div>

                {/* ボタン */}
                <div className="space-y-3">
                  <Button
                    onClick={handleFavorite}
                    variant={isFavorited ? "default" : "outline"}
                    className="w-full"
                  >
                    <Icons.heart className={`w-4 h-4 mr-2 ${isFavorited ? 'fill-current' : ''}`} />
                    {isFavorited ? 'お気に入り解除' : 'お気に入り'}
                  </Button>

                  <Button
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className="w-full"
                  >
                    <Icons.download className="w-4 h-4 mr-2" />
                    {isDownloading ? 'ダウンロード中...' : 'ダウンロード'}
                  </Button>
                </div>

                {/* 無料バッジ */}
                {illustration.isFree && (
                  <div className="text-center">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      無料
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* カテゴリ */}
            {illustration.category && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">カテゴリ</h2>
                <Link
                  href={`/illustrations?category=${illustration.category.id}`}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white"
                  style={{ backgroundColor: illustration.category.color || '#6B7280' }}
                >
                  {illustration.category.name}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
