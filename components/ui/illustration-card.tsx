'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from './button'
import { Icons } from './icons'

interface IllustrationCardProps {
  id: string
  title: string
  description?: string
  imageUrl: string
  thumbnailUrl?: string
  author: {
    id: string
    name: string
    profileImage?: string
  }
  category?: {
    name: string
    color?: string
  }
  tags?: Array<{
    name: string
  }>
  isFree: boolean
  downloadCount: number
  favoriteCount: number
  viewCount: number
  isFavorited?: boolean
  onFavorite?: (id: string) => void
  onDownload?: (id: string) => void
  className?: string
}

export function IllustrationCard({
  id,
  title,
  description,
  imageUrl,
  thumbnailUrl,
  author,
  category,
  tags,
  isFree,
  downloadCount,
  favoriteCount,
  viewCount,
  isFavorited = false,
  onFavorite,
  onDownload,
  className = ''
}: IllustrationCardProps) {
  const [imageLoading, setImageLoading] = useState(true)
  const [imageError, setImageError] = useState(false)

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onFavorite?.(id)
  }

  const handleDownload = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onDownload?.(id)
  }

  return (
    <div className={`group bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${className}`}>
      <Link href={`/illustrations/${id}`} className="block">
        {/* 画像部分 */}
        <div className="relative aspect-square bg-gray-100 overflow-hidden">
          {imageLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Icons.loader className="w-8 h-8 text-gray-400 animate-spin" />
            </div>
          )}
          
          {!imageError ? (
            <img
              src={thumbnailUrl || imageUrl}
              alt={title}
              className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${
                imageLoading ? 'opacity-0' : 'opacity-100'
              }`}
              onLoad={() => setImageLoading(false)}
              onError={() => {
                setImageLoading(false)
                setImageError(true)
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <Icons.image className="w-12 h-12 text-gray-400" />
            </div>
          )}

          {/* カテゴリバッジ */}
          {category && (
            <div className="absolute top-3 left-3">
              <span 
                className="px-2 py-1 text-xs font-medium text-white rounded-full"
                style={{ backgroundColor: category.color || '#6B7280' }}
              >
                {category.name}
              </span>
            </div>
          )}

          {/* 無料バッジ */}
          {isFree && (
            <div className="absolute top-3 right-3">
              <span className="px-2 py-1 text-xs font-medium text-white bg-green-500 rounded-full">
                無料
              </span>
            </div>
          )}

          {/* ホバー時のアクションボタン */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="flex space-x-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={handleFavorite}
                className="bg-white/90 hover:bg-white"
              >
                <Icons.heart className={`w-4 h-4 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>
              <Button
                size="sm"
                onClick={handleDownload}
                className="bg-white/90 hover:bg-white"
              >
                <Icons.download className="w-4 h-4 mr-1" />
                ダウンロード
              </Button>
            </div>
          </div>
        </div>

        {/* コンテンツ部分 */}
        <div className="p-4">
          {/* タイトル */}
          <h3 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2">
            {title}
          </h3>

          {/* 説明 */}
          {description && (
            <p className="text-xs text-gray-600 mb-3 line-clamp-2">
              {description}
            </p>
          )}

          {/* 作者情報 */}
          <div className="flex items-center space-x-2 mb-3">
            {author.profileImage ? (
              <img
                src={author.profileImage}
                alt={author.name}
                className="w-6 h-6 rounded-full object-cover"
              />
            ) : (
              <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                <Icons.user className="w-3 h-3 text-gray-600" />
              </div>
            )}
            <span className="text-xs text-gray-600 truncate">
              {author.name}
            </span>
          </div>

          {/* タグ */}
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 text-xs text-gray-500 bg-gray-100 rounded-full"
                >
                  #{tag.name}
                </span>
              ))}
              {tags.length > 3 && (
                <span className="px-2 py-1 text-xs text-gray-400">
                  +{tags.length - 3}
                </span>
              )}
            </div>
          )}

          {/* 統計情報 */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1">
                <Icons.eye className="w-3 h-3" />
                <span>{viewCount.toLocaleString()}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Icons.heart className="w-3 h-3" />
                <span>{favoriteCount.toLocaleString()}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Icons.download className="w-3 h-3" />
                <span>{downloadCount.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  )
}
