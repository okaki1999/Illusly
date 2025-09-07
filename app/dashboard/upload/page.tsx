'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ImageUpload } from '@/components/ui/image-upload'
import { Loading } from '@/components/ui/loading'
import { Icons } from '@/components/ui/icons'

interface Category {
  id: string
  name: string
  color?: string
}

interface Tag {
  id: string
  name: string
}

export default function UploadPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // フォームデータ
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryId: '',
    tags: [] as string[],
    isFree: false,
    status: 'draft' as 'draft' | 'published'
  })

  // 画像データ
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  // カテゴリとタグのデータ
  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [availableTags, setAvailableTags] = useState<Tag[]>([])
  const [newTag, setNewTag] = useState('')

  // カテゴリとタグの取得
  useEffect(() => {
    const fetchData = async () => {
      try {
        // カテゴリの取得
        const categoriesRes = await fetch('/api/categories')
        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json()
          setCategories(categoriesData)
        }

        // タグの取得
        const tagsRes = await fetch('/api/tags')
        if (tagsRes.ok) {
          const tagsData = await tagsRes.json()
          setAvailableTags(tagsData)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        setError('データの取得に失敗しました')
      }
    }

    fetchData()
  }, [])

  const handleImageSelect = (file: File) => {
    setSelectedImage(file)
    setPreviewUrl(URL.createObjectURL(file))
    setError('')
  }

  const handleImageRemove = () => {
    setSelectedImage(null)
    setPreviewUrl(null)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handleTagAdd = (tagId: string) => {
    if (!formData.tags.includes(tagId)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagId]
      }))
    }
  }

  const handleTagRemove = (tagId: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(id => id !== tagId)
    }))
  }

  const handleNewTagAdd = () => {
    if (newTag.trim() && !availableTags.some(tag => tag.name.toLowerCase() === newTag.toLowerCase())) {
      // 新しいタグを作成
      setAvailableTags(prev => [...prev, { id: `temp-${Date.now()}`, name: newTag.trim() }])
      setNewTag('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedImage) {
      setError('画像を選択してください')
      return
    }

    if (!formData.title.trim()) {
      setError('タイトルを入力してください')
      return
    }

    setIsSubmitting(true)
    setError('')
    setSuccess('')

    try {
      const submitData = new FormData()
      submitData.append('image', selectedImage)
      submitData.append('title', formData.title)
      submitData.append('description', formData.description)
      submitData.append('categoryId', formData.categoryId)
      submitData.append('tags', JSON.stringify(formData.tags))
      submitData.append('isFree', formData.isFree.toString())
      submitData.append('status', formData.status)

      const response = await fetch('/api/illustrations', {
        method: 'POST',
        body: submitData
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || '投稿に失敗しました')
      }

      setSuccess('作品を投稿しました！')

      // 3秒後にダッシュボードにリダイレクト
      setTimeout(() => {
        router.push('/dashboard/illustrator')
      }, 3000)

    } catch (error) {
      console.error('Upload error:', error)
      setError(error instanceof Error ? error.message : '投稿に失敗しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return <Loading text="読み込み中..." fullScreen />
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">作品投稿</h1>
        <p className="text-gray-600">新しい作品を投稿しましょう</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* 画像アップロード */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            作品画像 <span className="text-red-500">*</span>
          </label>
          <ImageUpload
            onImageSelect={handleImageSelect}
            onImageRemove={handleImageRemove}
            selectedImage={selectedImage}
            previewUrl={previewUrl}
            maxSize={20}
            acceptedFormats={['image/jpeg', 'image/png', 'image/webp']}
          />
        </div>

        {/* 基本情報 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              タイトル <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="作品のタイトルを入力"
              required
            />
          </div>

          <div>
            <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-2">
              カテゴリ
            </label>
            <select
              id="categoryId"
              name="categoryId"
              value={formData.categoryId}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">カテゴリを選択</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 説明 */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            説明
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="作品の説明を入力"
          />
        </div>

        {/* タグ */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            タグ
          </label>

          {/* 選択されたタグ */}
          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {formData.tags.map(tagId => {
                const tag = availableTags.find(t => t.id === tagId)
                return tag ? (
                  <span
                    key={tagId}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                  >
                    #{tag.name}
                    <button
                      type="button"
                      onClick={() => handleTagRemove(tagId)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      <Icons.x className="w-3 h-3" />
                    </button>
                  </span>
                ) : null
              })}
            </div>
          )}

          {/* タグ選択 */}
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {availableTags.map(tag => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => handleTagAdd(tag.id)}
                  disabled={formData.tags.includes(tag.id)}
                  className={`px-3 py-1 rounded-full text-sm border transition-colors ${formData.tags.includes(tag.id)
                      ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                >
                  #{tag.name}
                </button>
              ))}
            </div>

            {/* 新しいタグの追加 */}
            <div className="flex space-x-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="新しいタグを追加"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleNewTagAdd())}
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleNewTagAdd}
                disabled={!newTag.trim()}
              >
                追加
              </Button>
            </div>
          </div>
        </div>

        {/* 設定 */}
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isFree"
              name="isFree"
              checked={formData.isFree}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isFree" className="ml-2 block text-sm text-gray-700">
              無料で公開する
            </label>
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
              公開設定
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="draft">下書きとして保存</option>
              <option value="published">公開する</option>
            </select>
          </div>
        </div>

        {/* エラー・成功メッセージ */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {success && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-600">{success}</p>
          </div>
        )}

        {/* 送信ボタン */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            キャンセル
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || !selectedImage || !formData.title.trim()}
          >
            {isSubmitting ? (
              <>
                <Icons.loader className="w-4 h-4 mr-2 animate-spin" />
                投稿中...
              </>
            ) : (
              '作品を投稿'
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
