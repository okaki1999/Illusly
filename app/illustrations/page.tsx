'use client'

import { useState, useEffect } from 'react'
import { IllustrationCard } from '@/components/ui/illustration-card'
import { SearchBar } from '@/components/ui/search-bar'
import { Pagination, PaginationInfo } from '@/components/ui/pagination'
import { Loading, GridSkeleton } from '@/components/ui/loading'
import { Button } from '@/components/ui/button'
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

interface Category {
  id: string
  name: string
  color?: string
}

interface PaginationData {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function IllustrationsPage() {
  const [illustrations, setIllustrations] = useState<Illustration[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState('')

  // フィルター・検索状態
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState('desc')

  // ページネーション
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  })

  // 作品一覧の取得
  const fetchIllustrations = async (page = 1, search = '', category = '', sort = 'createdAt', order = 'desc') => {
    try {
      setIsSearching(true)
      setError('')

      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        status: 'published'
      })

      if (search) params.append('search', search)
      if (category) params.append('categoryId', category)
      if (sort) params.append('sortBy', sort)
      if (order) params.append('sortOrder', order)

      console.log('Fetching illustrations with params:', params.toString())
      const response = await fetch(`/api/illustrations?${params}`)
      console.log('Response status:', response.status)

      const data = await response.json()
      console.log('Response data:', data)

      if (!response.ok) {
        throw new Error(data.error || '作品の取得に失敗しました')
      }

      console.log('Setting illustrations:', data.illustrations)
      setIllustrations(data.illustrations || [])
      setPagination(data.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 })
    } catch (error) {
      console.error('Error fetching illustrations:', error)
      setError(error instanceof Error ? error.message : '作品の取得に失敗しました')
      setIllustrations([])
      setPagination({ page: 1, limit: 20, total: 0, totalPages: 0 })
    } finally {
      setIsLoading(false)
      setIsSearching(false)
    }
  }

  // カテゴリの取得
  const fetchCategories = async () => {
    try {
      console.log('Fetching categories...')
      const response = await fetch('/api/categories')
      console.log('Categories response status:', response.status)

      const data = await response.json()
      console.log('Categories data:', data)

      if (response.ok) {
        setCategories(data || [])
      } else {
        console.error('Failed to fetch categories:', data.error)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
      setCategories([])
    }
  }

  // 初期データの取得
  useEffect(() => {
    fetchCategories()
    fetchIllustrations()
  }, [])

  // 検索・フィルター変更時の処理
  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setPagination(prev => ({ ...prev, page: 1 }))
    fetchIllustrations(1, query, selectedCategory, sortBy, sortOrder)
  }

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId)
    setPagination(prev => ({ ...prev, page: 1 }))
    fetchIllustrations(1, searchQuery, categoryId, sortBy, sortOrder)
  }

  const handleSortChange = (newSortBy: string) => {
    const newSortOrder = sortBy === newSortBy && sortOrder === 'desc' ? 'asc' : 'desc'
    setSortBy(newSortBy)
    setSortOrder(newSortOrder)
    setPagination(prev => ({ ...prev, page: 1 }))
    fetchIllustrations(1, searchQuery, selectedCategory, newSortBy, newSortOrder)
  }

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }))
    fetchIllustrations(page, searchQuery, selectedCategory, sortBy, sortOrder)
  }

  const handleFavorite = async (illustrationId: string) => {
    // TODO: お気に入り機能の実装
    console.log('Favorite:', illustrationId)
  }

  const handleDownload = async (illustrationId: string) => {
    // TODO: ダウンロード機能の実装
    console.log('Download:', illustrationId)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">作品一覧</h1>
            <p className="text-gray-600">素晴らしい作品を発見しましょう</p>
          </div>
          <GridSkeleton count={12} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">作品一覧</h1>
          <p className="text-gray-600">素晴らしい作品を発見しましょう</p>
        </div>

        {/* 検索・フィルター */}
        <div className="mb-8 space-y-6">
          {/* 検索バー */}
          <div className="max-w-2xl">
            <SearchBar
              placeholder="作品を検索..."
              onSearch={handleSearch}
              onClear={() => handleSearch('')}
              className="w-full"
            />
          </div>

          {/* フィルター・ソート */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-wrap gap-4">
              {/* カテゴリフィルター */}
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">カテゴリ:</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">すべて</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* ソート */}
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">並び順:</label>
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [newSortBy, newSortOrder] = e.target.value.split('-')
                    handleSortChange(newSortBy)
                    setSortOrder(newSortOrder)
                  }}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="createdAt-desc">新着順</option>
                  <option value="createdAt-asc">古い順</option>
                  <option value="viewCount-desc">閲覧数順</option>
                  <option value="favoriteCount-desc">お気に入り順</option>
                  <option value="downloadCount-desc">ダウンロード順</option>
                </select>
              </div>
            </div>

            {/* 結果数表示 */}
            {pagination.total > 0 && (
              <PaginationInfo
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                totalItems={pagination.total}
                itemsPerPage={pagination.limit}
              />
            )}
          </div>
        </div>

        {/* エラー表示 */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* 作品一覧 */}
        {isSearching ? (
          <GridSkeleton count={12} />
        ) : illustrations.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {illustrations.map(illustration => {
                console.log('Rendering illustration:', illustration)
                return (
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
                )
              })}
            </div>

            {/* ページネーション */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center">
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                  onPageChange={handlePageChange}
                  maxVisiblePages={5}
                />
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <Icons.image className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">作品が見つかりません</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery || selectedCategory
                ? '検索条件を変更してお試しください'
                : 'まだ作品が投稿されていません'}
            </p>
            {(searchQuery || selectedCategory) && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('')
                  setSelectedCategory('')
                  setSortBy('createdAt')
                  setSortOrder('desc')
                  fetchIllustrations(1, '', '', 'createdAt', 'desc')
                }}
              >
                フィルターをクリア
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
