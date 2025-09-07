'use client'

import { useState, useRef, useCallback } from 'react'
import { Button } from './button'
import { Icons } from './icons'

interface ImageUploadProps {
  onImageSelect: (file: File) => void
  onImageRemove?: () => void
  selectedImage?: File | null
  previewUrl?: string | null
  maxSize?: number // MB
  acceptedFormats?: string[]
  className?: string
  disabled?: boolean
}

export function ImageUpload({
  onImageSelect,
  onImageRemove,
  selectedImage,
  previewUrl,
  maxSize = 10,
  acceptedFormats = ['image/jpeg', 'image/png', 'image/webp'],
  className = '',
  disabled = false
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = useCallback((file: File): string | null => {
    // ファイルサイズチェック
    if (file.size > maxSize * 1024 * 1024) {
      return `ファイルサイズは${maxSize}MB以下にしてください`
    }

    // ファイル形式チェック
    if (!acceptedFormats.includes(file.type)) {
      return `対応形式: ${acceptedFormats.map(format => format.split('/')[1].toUpperCase()).join(', ')}`
    }

    return null
  }, [maxSize, acceptedFormats])

  const handleFileSelect = useCallback((file: File) => {
    setError('')
    
    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      return
    }

    onImageSelect(file)
  }, [validateFile, onImageSelect])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    if (disabled) return

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }, [handleFileSelect, disabled])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled) {
      setIsDragging(true)
    }
  }, [disabled])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }, [handleFileSelect])

  const handleClick = useCallback(() => {
    if (!disabled) {
      fileInputRef.current?.click()
    }
  }, [disabled])

  const handleRemove = useCallback(() => {
    setError('')
    onImageRemove?.()
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [onImageRemove])

  const displayUrl = previewUrl || (selectedImage ? URL.createObjectURL(selectedImage) : null)

  return (
    <div className={`space-y-4 ${className}`}>
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center transition-colors
          ${isDragging ? 'border-blue-400 bg-blue-50' : 'border-gray-300'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-gray-400'}
          ${error ? 'border-red-300 bg-red-50' : ''}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedFormats.join(',')}
          onChange={handleFileInputChange}
          className="hidden"
          disabled={disabled}
        />

        {displayUrl ? (
          <div className="space-y-4">
            <div className="relative inline-block">
              <img
                src={displayUrl}
                alt="Preview"
                className="max-h-64 max-w-full rounded-lg object-contain"
              />
              {!disabled && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRemove()
                  }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                >
                  <Icons.x className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="text-sm text-gray-600">
              {selectedImage?.name || '画像が選択されています'}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="mx-auto w-12 h-12 text-gray-400">
              <Icons.upload className="w-full h-full" />
            </div>
            <div>
              <p className="text-lg font-medium text-gray-900">
                画像をアップロード
              </p>
              <p className="text-sm text-gray-500">
                ドラッグ&ドロップまたはクリックして選択
              </p>
              <p className="text-xs text-gray-400 mt-2">
                最大 {maxSize}MB • {acceptedFormats.map(format => format.split('/')[1].toUpperCase()).join(', ')}
              </p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
          {error}
        </div>
      )}

      {!displayUrl && !disabled && (
        <Button
          type="button"
          variant="outline"
          onClick={handleClick}
          className="w-full"
        >
          <Icons.upload className="w-4 h-4 mr-2" />
          ファイルを選択
        </Button>
      )}
    </div>
  )
}
