'use client'

import { useUser, useStackApp } from '@stackframe/stack'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Icons } from '@/components/ui/icons'
import Link from 'next/link'
import { UserRole } from '@prisma/client'



interface SubscriptionInfo {
  status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'incomplete' | 'unpaid'
  cancelAtPeriodEnd: boolean
}

interface UserInfo {
  role: UserRole
  isIllustrator: boolean
  isAdmin: boolean
}

export default function DashboardPage() {
  const user = useUser()
  const app = useStackApp()
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)
  const [message, setMessage] = useState('')
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null)
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const hasActiveContract = subscription?.status != null && subscription.status !== 'canceled'
  const isCancelScheduled = subscription?.cancelAtPeriodEnd === true
  const isEmailUnverified = Boolean(user && user.primaryEmail && user.primaryEmailVerified === false)

  useEffect(() => {
    if (user === undefined) {
      // まだローディング中
      return
    }

    if (!user) {
      router.push('/auth/signup')
    } else {
      setIsLoading(false)
    }
  }, [user, router])

  // ユーザー情報の取得
  useEffect(() => {
    let mounted = true
      ; (async () => {
        try {
          const res = await fetch('/api/auth/role', { cache: 'no-store' })
          if (!mounted) return
          if (!res.ok) return
          const data = await res.json()
          if (!mounted) return
          setUserInfo(data)
        } catch { }
      })()
    return () => { mounted = false }
  }, [])

  // サブスクリプション詳細情報の取得
  useEffect(() => {
    let mounted = true
      ; (async () => {
        try {
          const res = await fetch('/api/stripe/subscription', { cache: 'no-store' })
          if (!mounted) return
          if (!res.ok) return
          const data = await res.json()
          if (!mounted) return
          if (data?.subscription) {
            setSubscription({
              status: data.subscription.status,
              cancelAtPeriodEnd: data.subscription.cancelAtPeriodEnd || false,
            })
          } else {
            setSubscription(null)
          }
        } catch { }
      })()
    return () => { mounted = false }
  }, [])



  // ローディング中またはユーザーが未認証の場合はローディング表示
  if (isLoading || !user) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 pt-16 pb-8">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-xl mx-auto p-6 bg-white rounded-2xl shadow-strong border border-gray-100">
            <div className="flex flex-col items-center justify-center space-y-4">
              <Icons.loader className="w-8 h-8 animate-spin text-blue-600" />
              <p className="text-gray-600">読み込み中...</p>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-xl mx-auto p-6 bg-white rounded-2xl shadow-strong border border-gray-100">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ようこそ、{user?.displayName || user?.primaryEmail?.split('@')[0] || 'ユーザー'} さん
          </h1>
          <p className="text-gray-600 mb-4">ダッシュボードへようこそ。</p>

          {/* ユーザーロール表示 */}
          {userInfo && (
            <div className="mb-6">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${userInfo.role === UserRole.admin
                ? 'bg-red-100 text-red-800'
                : userInfo.role === UserRole.illustrator
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-800'
                }`}>
                {userInfo.role === UserRole.admin && '管理者'}
                {userInfo.role === UserRole.illustrator && 'イラストレーター'}
                {userInfo.role === UserRole.user && '一般ユーザー'}
              </span>
            </div>
          )}

          {/* ユーザー共通のアクション */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">基本機能</h3>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/favorites">
                <button className="w-full bg-pink-100 text-pink-700 px-4 py-2 rounded-lg hover:bg-pink-200 transition-colors border border-pink-200">
                  <Icons.heart className="w-4 h-4 inline mr-2" />
                  お気に入り
                </button>
              </Link>
              <Link href="/downloads">
                <button className="w-full bg-green-100 text-green-700 px-4 py-2 rounded-lg hover:bg-green-200 transition-colors border border-green-200">
                  <Icons.download className="w-4 h-4 inline mr-2" />
                  ダウンロード履歴
                </button>
              </Link>
            </div>
          </div>

          {/* ロール別のアクションボタン */}
          <div className="mb-6">
            {userInfo?.role === UserRole.user && (
              <>
                <h3 className="text-sm font-medium text-gray-700 mb-3">アップグレード</h3>
                <Link href="/auth/become-illustrator">
                  <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    <Icons.user className="w-4 h-4 inline mr-2" />
                    イラストレーターとして登録
                  </button>
                </Link>
              </>
            )}

            {userInfo?.isIllustrator && (
              <>
                <h3 className="text-sm font-medium text-gray-700 mb-3">イラストレーター機能</h3>
                <div className="space-y-3">
                  <div className="flex space-x-3">
                    <Link href="/dashboard/illustrator" className="flex-1">
                      <button className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                        <Icons.image className="w-4 h-4 inline mr-2" />
                        作品管理
                      </button>
                    </Link>
                    <Link href="/dashboard/upload" className="flex-1">
                      <button className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                        <Icons.upload className="w-4 h-4 inline mr-2" />
                        作品投稿
                      </button>
                    </Link>
                  </div>
                  <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <p className="font-medium text-blue-800 mb-1">イラストレーターとして利用可能な機能：</p>
                    <ul className="text-blue-700 space-y-1">
                      <li>• 作品の投稿・編集・削除</li>
                      <li>• 作品の統計情報確認</li>
                      <li>• プロフィール管理</li>
                      <li>• 一般ユーザーの全機能</li>
                    </ul>
                  </div>
                </div>
              </>
            )}

            {userInfo?.isAdmin && (
              <>
                <h3 className="text-sm font-medium text-gray-700 mb-3">管理者機能</h3>
                <Link href="/dashboard/admin">
                  <button className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
                    <Icons.shield className="w-4 h-4 inline mr-2" />
                    管理者パネル
                  </button>
                </Link>
                <div className="text-xs text-gray-500 bg-red-50 p-3 rounded-lg border border-red-200 mt-3">
                  <p className="font-medium text-red-800 mb-1">管理者として利用可能な機能：</p>
                  <ul className="text-red-700 space-y-1">
                    <li>• 全ユーザーの管理</li>
                    <li>• 全作品の管理</li>
                    <li>• システム設定</li>
                    <li>• イラストレーター・一般ユーザーの全機能</li>
                  </ul>
                </div>
              </>
            )}
          </div>


          {isEmailUnverified && (
            <div className="mb-4 p-3 rounded-lg border text-xs bg-yellow-50 text-yellow-800 border-yellow-200">
              メールアドレスが未認証です。<a href="/auth/email-verified" className="underline">認証メールのリンク</a>を確認してください。
            </div>
          )}

          {message && (
            <div className="mb-6 p-3 rounded-lg border text-sm bg-gray-50 text-gray-700 border-gray-200">{message}</div>
          )}

          <div className="mt-8 pt-6 border-t border-gray-100">
            <details className="group">
              <summary className="cursor-pointer text-xs text-gray-400 hover:text-gray-500 transition-colors list-none flex items-center justify-between">
                <span>アカウント設定</span>
                <svg className="w-3 h-3 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="mt-3 space-y-3">
                {/* 退会ボタンを押したときだけエラーメッセージを出す。通常は説明のみ表示 */}
                <p className="text-xs text-gray-500">退会すると、アカウントと関連データは削除されます。</p>

                {/* キャンセル予定の場合は注意メッセージを表示 */}
                {hasActiveContract && isCancelScheduled && (
                  <div className="mb-3 p-2 rounded bg-yellow-50 border border-yellow-200">
                    <p className="text-xs text-yellow-700">プランはキャンセル予定です。<br />いま退会するとアカウントと関連データは削除され即時利用できなくなります。</p>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-2">
                  {/* 購読を管理ボタンは撤去 */}
                  <button
                    onClick={async () => {
                      if (!user || deleting) return

                      // 契約があるがキャンセル予定ではない場合
                      if (hasActiveContract && !isCancelScheduled) {
                        setMessage('プランの解約が必要です。購読を管理からプランをキャンセルしてください。')
                        return
                      }

                      // キャンセル予定の場合は即時削除の警告を表示
                      const confirmMessage = isCancelScheduled
                        ? '退会するとアカウントと関連データは即座に削除され、プランも即時終了します。本当に退会しますか？'
                        : '本当に退会しますか？この操作は取り消せません。'

                      const ok = window.confirm(confirmMessage)
                      if (!ok) return
                      setDeleting(true)
                      setMessage('退会処理を実行しています…')
                      try {
                        const res = await fetch('/api/account/delete', { method: 'POST' })
                        if (!res.ok) {
                          const data = await res.json().catch(() => ({}))
                          if (res.status === 409) {
                            setMessage(data.error || 'プランの解約が必要です。購読を管理からプランをキャンセルしてください。')
                          } else if (res.status === 401) {
                            setMessage('未ログインのため処理できません。')
                          } else {
                            setMessage(data.error || '退会に失敗しました。時間をおいて再度お試しください。')
                          }
                          return
                        }
                        router.push('/')
                      } catch (e: any) {
                        console.error('Account deletion failed:', e)
                        setMessage('退会に失敗しました。時間をおいて再度お試しください。')
                      } finally {
                        setDeleting(false)
                      }
                    }}
                    disabled={!user || deleting}
                    className={`text-xs px-3 py-1.5 rounded border transition-colors ${deleting
                      ? 'opacity-40 cursor-not-allowed border-gray-200 text-gray-400'
                      : 'border-gray-300 text-gray-500 hover:border-red-300 hover:text-red-600 hover:bg-red-50'
                      }`}
                  >
                    {deleting ? '処理中…' : '退会'}
                  </button>
                </div>
              </div>
            </details>
          </div>
        </div>
      </div>
    </main>
  )
}

function DashboardCard({ title, description, icon, href }: {
  title: string
  description: string
  icon: React.ReactNode
  href: string
}) {
  return (
    <Link href={href}>
      <div className="group bg-white rounded-xl p-6 shadow-soft border border-gray-100 hover:shadow-medium transition-all duration-300 hover:-translate-y-1 cursor-pointer">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center text-blue-600 mb-4 group-hover:from-blue-200 group-hover:to-blue-300 transition-colors">
          {icon}
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 text-sm">{description}</p>
        <div className="mt-4 flex items-center text-blue-600 text-sm font-medium">
          開く
          <Icons.arrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
  )
}
