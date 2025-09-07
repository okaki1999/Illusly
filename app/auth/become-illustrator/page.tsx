'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { getStackClientApp } from '@/lib/stack'

export default function BecomeIllustratorPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleBecomeIllustrator = async () => {
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: 'illustrator' }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to register as illustrator')
      }

      // 成功時はダッシュボードにリダイレクト
      router.push('/dashboard?registered=illustrator')
    } catch (error) {
      console.error('Error registering as illustrator:', error)
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            イラストレーター登録
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            作品を投稿して収益を得るために、イラストレーターとして登録しましょう
          </p>
        </div>

        <div className="mt-8 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              イラストレーターの特典
            </h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                作品の投稿・管理が可能
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                サブスクリプション収益の獲得
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                作品の統計データ確認
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                プロフィールページのカスタマイズ
              </li>
            </ul>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="flex space-x-4">
            <Button
              onClick={handleBecomeIllustrator}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? '登録中...' : 'イラストレーターとして登録'}
            </Button>
            <Button
              variant="outline"
              onClick={() => router.back()}
              disabled={isLoading}
            >
              キャンセル
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
