'use client'

import { Icons } from './icons'

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  text?: string
  className?: string
  fullScreen?: boolean
}

export function Loading({
  size = 'md',
  text,
  className = '',
  fullScreen = false
}: LoadingProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  }

  const content = (
    <div className={`flex flex-col items-center justify-center space-y-2 ${className}`}>
      <Icons.loader className={`${sizeClasses[size]} animate-spin text-blue-600`} />
      {text && (
        <p className="text-sm text-gray-600">{text}</p>
      )}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
        {content}
      </div>
    )
  }

  return content
}

// スケルトンローディング用のコンポーネント
interface SkeletonProps {
  className?: string
  lines?: number
}

export function Skeleton({ className = '', lines = 1 }: SkeletonProps) {
  if (lines === 1) {
    return (
      <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
    )
  }

  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={`animate-pulse bg-gray-200 rounded ${
            index === lines - 1 ? 'w-3/4' : 'w-full'
          } ${className}`}
        />
      ))}
    </div>
  )
}

// カード用のスケルトンローディング
export function CardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden ${className}`}>
      {/* 画像部分 */}
      <div className="aspect-square bg-gray-200 animate-pulse" />
      
      {/* コンテンツ部分 */}
      <div className="p-4 space-y-3">
        {/* タイトル */}
        <Skeleton className="h-4 w-3/4" />
        
        {/* 説明 */}
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
        
        {/* 作者情報 */}
        <div className="flex items-center space-x-2">
          <Skeleton className="w-6 h-6 rounded-full" />
          <Skeleton className="h-3 w-20" />
        </div>
        
        {/* タグ */}
        <div className="flex space-x-2">
          <Skeleton className="h-6 w-12 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-10 rounded-full" />
        </div>
        
        {/* 統計情報 */}
        <div className="flex justify-between">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    </div>
  )
}

// グリッド用のスケルトンローディング
interface GridSkeletonProps {
  count?: number
  className?: string
}

export function GridSkeleton({ count = 6, className = '' }: GridSkeletonProps) {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <CardSkeleton key={index} />
      ))}
    </div>
  )
}

// テーブル用のスケルトンローディング
interface TableSkeletonProps {
  rows?: number
  columns?: number
  className?: string
}

export function TableSkeleton({ rows = 5, columns = 4, className = '' }: TableSkeletonProps) {
  return (
    <div className={`overflow-hidden ${className}`}>
      <div className="animate-pulse">
        {/* ヘッダー */}
        <div className="grid gap-4 py-3 border-b border-gray-200" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, index) => (
            <Skeleton key={index} className="h-4" />
          ))}
        </div>
        
        {/* 行 */}
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="grid gap-4 py-3 border-b border-gray-100" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton key={colIndex} className="h-4" />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
