'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/ui/icons'
import Link from 'next/link'
import type { Metadata } from 'next'

// メタデータは別ファイルで管理するか、layout.tsxで設定

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

export default function Page() {
  const [products, setProducts] = useState<StripeProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)

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
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 overflow-hidden">
        {/* Geometric background patterns */}
        <div className="absolute inset-0">
          <svg className="absolute w-full h-full" viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice">
            <defs>
              <radialGradient id="grad1" cx="50%" cy="50%" r="50%">
                <stop offset="0%" style={{ stopColor: 'rgba(59, 130, 246, 0.3)', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: 'rgba(59, 130, 246, 0)', stopOpacity: 0 }} />
              </radialGradient>
              <radialGradient id="grad2" cx="50%" cy="50%" r="40%">
                <stop offset="0%" style={{ stopColor: 'rgba(147, 51, 234, 0.2)', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: 'rgba(147, 51, 234, 0)', stopOpacity: 0 }} />
              </radialGradient>
            </defs>
            <circle cx="200" cy="300" r="300" fill="url(#grad1)" className="animate-pulse" />
            <circle cx="800" cy="200" r="250" fill="url(#grad2)" className="animate-bounce-subtle" />
            <circle cx="600" cy="700" r="200" fill="url(#grad1)" className="animate-pulse" style={{ animationDelay: '1s' }} />
          </svg>
        </div>

        {/* Subtle grid overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }}></div>
        </div>

        {/* Floating particles */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400 rounded-full animate-ping"></div>
          <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-purple-400 rounded-full animate-pulse"></div>
          <div className="absolute bottom-1/3 left-1/3 w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
          <div className="absolute top-2/3 right-1/4 w-1 h-1 bg-blue-300 rounded-full animate-ping" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center z-10">
          <div className="space-y-8 animate-fade-in">
            <div className="space-y-6">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white">
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400">
                  Illusly
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-blue-100 max-w-4xl mx-auto leading-relaxed">
                高品質なイラストを無制限にダウンロード
                <br />
                <strong className="text-white">クリエイターのためのイラスト配信サービス</strong>
              </p>
            </div>

            <div className="pt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/illustrations">
                <Button size="lg" className="text-lg px-12 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0 shadow-2xl">
                  <Icons.image className="w-5 h-5 mr-2" />
                  作品一覧を見る
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button size="lg" variant="outline" className="text-lg px-12 py-4 border-2 border-white text-white hover:bg-white hover:text-gray-900">
                  <Icons.user className="w-5 h-5 mr-2" />
                  無料で始める
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-gradient-to-b from-slate-900 via-blue-900 to-indigo-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              主な機能
            </h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Illuslyの特徴的な機能をご紹介します
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
            <Feature
              icon={<Icons.image className="w-8 h-8" />}
              title="高品質イラスト"
              desc="プロのイラストレーターが制作した高品質なイラストを豊富に取り揃えています"
            />
            <Feature
              icon={<Icons.download className="w-8 h-8" />}
              title="無制限ダウンロード"
              desc="サブスクリプションでイラストを無制限にダウンロードできます"
            />
            <Feature
              icon={<Icons.search className="w-8 h-8" />}
              title="検索・フィルター"
              desc="カテゴリやタグで簡単にイラストを検索・フィルタリングできます"
            />
            <Feature
              icon={<Icons.heart className="w-8 h-8" />}
              title="お気に入り機能"
              desc="気に入ったイラストをお気に入りに保存して、後で簡単にアクセスできます"
            />
            <Feature
              icon={<Icons.user className="w-8 h-8" />}
              title="イラストレーター登録"
              desc="あなたもイラストレーターとして作品を投稿・販売できます"
            />
            <Feature
              icon={<Icons.shield className="w-8 h-8" />}
              title="商用利用可能"
              desc="商用利用可能なライセンスで、ビジネスでも安心してご利用いただけます"
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              料金プラン
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              あなたに最適なプランを選んで、高品質なイラストをお楽しみください
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Free Plan */}
              <div className="bg-white rounded-lg border-2 border-gray-200 p-8 hover:border-gray-300 transition-colors">
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">無料プラン</h3>
                  <p className="text-gray-600 mb-6">お試しや個人利用に最適</p>
                  <div className="flex items-baseline">
                    <span className="text-5xl font-bold text-gray-900">¥0</span>
                    <span className="text-gray-500 ml-2">/月</span>
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  <li className="text-gray-700">• 月5作品までダウンロード</li>
                  <li className="text-gray-700">• 基本検索・フィルター機能</li>
                  <li className="text-gray-700">• お気に入り機能</li>
                  <li className="text-gray-700">• 個人利用のみ</li>
                  <li className="text-gray-400">• 商用利用は不可</li>
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

              {/* Premium Plans from Stripe */}
              {products.map((product, index) => {
                if (!product.price) return null

                const amount = product.price.amount ? product.price.amount : 0
                const interval = product.price.interval === 'month' ? '月' :
                  product.price.interval === 'year' ? '年' :
                    product.price.interval || ''

                return (
                  <div key={product.id} className="bg-gray-900 rounded-lg p-8 text-white relative overflow-hidden">
                    {index === 0 && (
                      <div className="absolute top-4 right-4">
                        <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                          おすすめ
                        </span>
                      </div>
                    )}

                    <div className="mb-8">
                      <h3 className="text-2xl font-bold mb-2">{product.name}</h3>
                      <p className="text-gray-300 mb-6">
                        {product.description || 'クリエイター・ビジネス利用に最適'}
                      </p>
                      <div className="flex items-baseline">
                        <span className="text-5xl font-bold">¥{amount.toLocaleString()}</span>
                        <span className="text-gray-400 ml-2">/{interval}</span>
                      </div>
                    </div>

                    <ul className="space-y-4 mb-8">
                      <li className="text-gray-100">• 無制限ダウンロード</li>
                      <li className="text-gray-100">• 商用利用可能</li>
                      <li className="text-gray-100">• 高解像度画像</li>
                      <li className="text-gray-100">• 優先サポート</li>
                      <li className="text-gray-100">• イラストレーター登録可能</li>
                    </ul>

                    <Link href="/pricing">
                      <Button size="lg" className="w-full bg-white text-gray-900 hover:bg-gray-100 font-semibold">
                        今すぐ始める
                      </Button>
                    </Link>

                    <p className="text-sm text-gray-400 mt-4 text-center">
                      いつでもキャンセル可能
                    </p>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
        {/* Geometric background patterns */}
        <div className="absolute inset-0">
          <svg className="absolute w-full h-full" viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice">
            <defs>
              <radialGradient id="ctaGrad1" cx="50%" cy="50%" r="50%">
                <stop offset="0%" style={{ stopColor: 'rgba(59, 130, 246, 0.3)', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: 'rgba(59, 130, 246, 0)', stopOpacity: 0 }} />
              </radialGradient>
              <radialGradient id="ctaGrad2" cx="50%" cy="50%" r="40%">
                <stop offset="0%" style={{ stopColor: 'rgba(147, 51, 234, 0.2)', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: 'rgba(147, 51, 234, 0)', stopOpacity: 0 }} />
              </radialGradient>
            </defs>
            <circle cx="300" cy="400" r="250" fill="url(#ctaGrad1)" className="animate-pulse" />
            <circle cx="700" cy="300" r="200" fill="url(#ctaGrad2)" className="animate-bounce-subtle" />
            <circle cx="500" cy="600" r="180" fill="url(#ctaGrad1)" className="animate-pulse" style={{ animationDelay: '1.5s' }} />
          </svg>
        </div>

        {/* Subtle grid overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }}></div>
        </div>

        {/* Floating particles */}
        <div className="absolute inset-0">
          <div className="absolute top-1/3 left-1/5 w-2 h-2 bg-blue-400 rounded-full animate-ping"></div>
          <div className="absolute top-1/4 right-1/3 w-1 h-1 bg-purple-400 rounded-full animate-pulse"></div>
          <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
          <div className="absolute top-3/4 right-1/5 w-1 h-1 bg-blue-300 rounded-full animate-ping" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              今すぐ始めませんか
            </h2>

            <p className="text-xl text-blue-100 mb-10 max-w-3xl mx-auto leading-relaxed">
              高品質なイラストを無制限にダウンロードして、<br />
              あなたのクリエイティブな活動を加速させましょう。
            </p>

            <div className="mb-8">
              <Link href="/auth/signup">
                <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100 text-lg px-10 py-4 font-semibold">
                  無料で始める
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-gradient-to-b from-blue-50 to-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              よくある質問
            </h2>
            <p className="text-xl text-gray-600">
              お客様からよく寄せられる質問にお答えします
            </p>
          </div>
          <div className="space-y-4">
            <FAQ
              q="商用利用はできますか？"
              a="プレミアムプランでは商用利用が可能です。無料プランは個人利用のみとなります。"
            />
            <FAQ
              q="イラストレーターとして登録できますか？"
              a="はい、プレミアムプランではイラストレーターとして作品を投稿・販売できます。"
            />
            <FAQ
              q="ダウンロードしたイラストの著作権はどうなりますか？"
              a="ダウンロードしたイラストは、プランに応じた利用規約に従ってご利用いただけます。"
            />
            <FAQ
              q="プランの変更やキャンセルはできますか？"
              a="いつでもプランの変更やキャンセルが可能です。設定画面から簡単に操作していただけます。"
            />
          </div>
        </div>
      </section>
    </main>
  )
}

function Feature({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="group bg-blue-900/30 backdrop-blur-sm rounded-xl p-8 border border-blue-800/30 hover:bg-blue-800/40 hover:border-blue-700/50 transition-all duration-300 hover:-translate-y-1">
      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white mb-6 group-hover:from-blue-400 group-hover:to-indigo-500 transition-colors shadow-lg">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-white mb-3">{title}</h3>
      <p className="text-blue-100 leading-relaxed">{desc}</p>
    </div>
  )
}

function FAQ({ q, a }: { q: string; a: string }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-soft border border-blue-100 hover:shadow-medium hover:border-blue-200 transition-all duration-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
        <Icons.chevronDown className="w-5 h-5 text-blue-600 mr-2" />
        {q}
      </h3>
      <p className="text-gray-700 leading-relaxed ml-7">{a}</p>
    </div>
  )
}
