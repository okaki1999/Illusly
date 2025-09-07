'use client'

import { Button } from './button'
import { Icons } from './icons'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  showFirstLast?: boolean
  showPrevNext?: boolean
  maxVisiblePages?: number
  className?: string
  disabled?: boolean
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  showFirstLast = true,
  showPrevNext = true,
  maxVisiblePages = 5,
  className = '',
  disabled = false
}: PaginationProps) {
  if (totalPages <= 1) {
    return null
  }

  // 表示するページ番号を計算
  const getVisiblePages = () => {
    const pages: number[] = []
    const half = Math.floor(maxVisiblePages / 2)
    
    let start = Math.max(1, currentPage - half)
    let end = Math.min(totalPages, start + maxVisiblePages - 1)
    
    // 最後のページが表示範囲に含まれない場合は調整
    if (end - start + 1 < maxVisiblePages) {
      start = Math.max(1, end - maxVisiblePages + 1)
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
    
    return pages
  }

  const visiblePages = getVisiblePages()
  const isFirstPage = currentPage === 1
  const isLastPage = currentPage === totalPages

  const handlePageChange = (page: number) => {
    if (disabled || page < 1 || page > totalPages || page === currentPage) {
      return
    }
    onPageChange(page)
  }

  return (
    <nav className={`flex items-center justify-center space-x-1 ${className}`}>
      {/* 最初のページ */}
      {showFirstLast && !isFirstPage && (
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(1)}
            disabled={disabled}
            className="px-2"
          >
            1
          </Button>
          {visiblePages[0] > 2 && (
            <span className="px-2 text-gray-500">...</span>
          )}
        </>
      )}

      {/* 前のページ */}
      {showPrevNext && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={disabled || isFirstPage}
          className="px-2"
        >
          <Icons.chevronLeft className="w-4 h-4" />
        </Button>
      )}

      {/* ページ番号 */}
      {visiblePages.map((page) => (
        <Button
          key={page}
          variant={page === currentPage ? "default" : "outline"}
          size="sm"
          onClick={() => handlePageChange(page)}
          disabled={disabled}
          className="px-3"
        >
          {page}
        </Button>
      ))}

      {/* 次のページ */}
      {showPrevNext && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={disabled || isLastPage}
          className="px-2"
        >
          <Icons.chevronRight className="w-4 h-4" />
        </Button>
      )}

      {/* 最後のページ */}
      {showFirstLast && !isLastPage && (
        <>
          {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
            <span className="px-2 text-gray-500">...</span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(totalPages)}
            disabled={disabled}
            className="px-2"
          >
            {totalPages}
          </Button>
        </>
      )}
    </nav>
  )
}

// ページネーション情報を表示するコンポーネント
interface PaginationInfoProps {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  className?: string
}

export function PaginationInfo({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  className = ''
}: PaginationInfoProps) {
  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  return (
    <div className={`text-sm text-gray-600 ${className}`}>
      {totalItems > 0 ? (
        <>
          {startItem.toLocaleString()} - {endItem.toLocaleString()} / {totalItems.toLocaleString()} 件
          {totalPages > 1 && (
            <span className="ml-2">
              （{currentPage} / {totalPages} ページ）
            </span>
          )}
        </>
      ) : (
        '0 件'
      )}
    </div>
  )
}
