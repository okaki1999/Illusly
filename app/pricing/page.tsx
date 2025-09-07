'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/ui/icons'
import Link from 'next/link'

interface StripeProduct {
  id: string
  name: string
  description: string | null
  images: string[]
  price: {
    id: string
    amount: number | null
    currency: string
    interval: string | undefined
    intervalCount: number | undefined
  } | null
}

export default function PricingPage() {
  const [products, setProducts] = useState<StripeProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/stripe/products')
        const data = await response.json()

        if (response.ok) {
          setProducts(data.products || [])
        } else {
          console.error('Failed to fetch products:', data.error)
        }
      } catch (error) {
        console.error('Error fetching products:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [])

  const handleSelectPlan = async (priceId: string) => {
    try {
      setSelectedPlan(priceId)

      // Stripe Checkoutにリダイレクト
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: priceId,
        }),
      })

      const data = await response.json()

      if (response.ok && data.url) {
        window.location.href = data.url
      } else {
        console.error('Checkout failed:', data.error)
        alert(`決済処理でエラーが発生しました: ${data.error || '不明なエラー'}`)
      }
    } catch (error) {
      console.error('Error creating checkout session:', error)
      alert('ネットワークエラーが発生しました。インターネット接続を確認してからもう一度お試しください。')
    } finally {
      setSelectedPlan(null)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ヘッダー */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            料金プラン
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            あなたに最適なプランを選んで、高品質なイラストをお楽しみください
          </p>
        </div>

        {/* プラン一覧 */}
        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* 無料プラン */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 hover:shadow-md transition-shadow">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">無料プラン</h3>
              <p className="text-gray-600 mb-6">お試しや個人利用に最適</p>
              <div className="flex items-baseline justify-center">
                <span className="text-5xl font-bold text-gray-900">¥0</span>
                <span className="text-gray-500 ml-2">/月</span>
              </div>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-center text-gray-700">
                <Icons.check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                月5作品までダウンロード
              </li>
              <li className="flex items-center text-gray-700">
                <Icons.check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                基本検索・フィルター機能
              </li>
              <li className="flex items-center text-gray-700">
                <Icons.check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                お気に入り機能
              </li>
              <li className="flex items-center text-gray-700">
                <Icons.check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                個人利用のみ
              </li>
              <li className="flex items-center text-gray-400">
                <Icons.x className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
                商用利用は不可
              </li>
            </ul>

            <Link href="/auth/signup">
              <Button variant="outline" size="lg" className="w-full border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white">
                無料で始める
              </Button>
            </Link>

            <p className="text-sm text-gray-500 mt-4 text-center">
              クレジットカード不要
            </p>
          </div>

          {/* プレミアムプラン */}
          {products.map((product, index) => {
            if (!product.price) return null

            const amount = product.price.amount ? product.price.amount : 0
            const interval = product.price.interval === 'month' ? '月' :
              product.price.interval === 'year' ? '年' :
                product.price.interval || ''

            return (
              <div key={product.id} className={`bg-white rounded-xl shadow-sm border-2 p-8 hover:shadow-md transition-shadow relative ${index === 0 ? 'border-blue-500' : 'border-gray-200'
                }`}>
                {index === 0 && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                      おすすめ
                    </span>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h3>
                  <p className="text-gray-600 mb-6">
                    {product.description || 'クリエイター・ビジネス利用に最適'}
                  </p>
                  <div className="flex items-baseline justify-center">
                    <span className="text-5xl font-bold text-gray-900">¥{amount.toLocaleString()}</span>
                    <span className="text-gray-500 ml-2">/{interval}</span>
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  <li className="flex items-center text-gray-700">
                    <Icons.check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    無制限ダウンロード
                  </li>
                  <li className="flex items-center text-gray-700">
                    <Icons.check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    商用利用可能
                  </li>
                  <li className="flex items-center text-gray-700">
                    <Icons.check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    高解像度画像
                  </li>
                  <li className="flex items-center text-gray-700">
                    <Icons.check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    優先サポート
                  </li>
                  <li className="flex items-center text-gray-700">
                    <Icons.check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    イラストレーター登録可能
                  </li>
                </ul>

                <Button
                  size="lg"
                  className={`w-full ${index === 0
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-gray-900 hover:bg-gray-800 text-white'
                    }`}
                  onClick={() => handleSelectPlan(product.price!.id)}
                  disabled={selectedPlan === product.price!.id}
                >
                  {selectedPlan === product.price!.id ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      処理中...
                    </>
                  ) : (
                    '今すぐ始める'
                  )}
                </Button>

                <p className="text-sm text-gray-500 mt-4 text-center">
                  いつでもキャンセル可能
                </p>
              </div>
            )
          })}
        </div>

        {/* FAQ */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              よくある質問
            </h2>
            <p className="text-lg text-gray-600">
              お客様からよく寄せられる質問にお答えします
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                商用利用はできますか？
              </h3>
              <p className="text-gray-700">
                プレミアムプランでは商用利用が可能です。無料プランは個人利用のみとなります。
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                イラストレーターとして登録できますか？
              </h3>
              <p className="text-gray-700">
                はい、プレミアムプランではイラストレーターとして作品を投稿・販売できます。
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                プランの変更やキャンセルはできますか？
              </h3>
              <p className="text-gray-700">
                いつでもプランの変更やキャンセルが可能です。設定画面から簡単に操作していただけます。
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                料金はいつ請求されますか？
              </h3>
              <p className="text-gray-700">
                月額プランの場合、毎月同じ日に自動的に請求されます。年額プランは1年ごとに請求されます。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
