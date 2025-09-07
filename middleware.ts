import { NextRequest, NextResponse } from 'next/server'
import { getStackServerApp } from '@/lib/stack'
import { prisma } from '@/lib/prisma'
import { UserRole } from '@prisma/client'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 認証が必要なパス
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/billing')) {
    try {
      const app = getStackServerApp()
      const stackUser = await app.getUser()

      if (!stackUser) {
        return NextResponse.redirect(new URL('/auth/signup', request.url))
      }

      // データベースからユーザー情報を取得（ミドルウェア用の簡易版）
      const user = await prisma.user.findUnique({
        where: { stackUserId: stackUser.id }
      })

      if (!user) {
        // ユーザーが存在しない場合は作成を試行
        try {
          await prisma.user.create({
            data: {
              stackUserId: stackUser.id,
              email: stackUser.primaryEmail || '',
              name: stackUser.displayName,
              role: UserRole.user,
              isVerified: false // デフォルト値
            }
          })
        } catch (createError) {
          console.error('Error creating user in middleware:', createError)
          return NextResponse.redirect(new URL('/auth/signup', request.url))
        }
      }

      // イラストレーター専用ページのチェック
      if (pathname.startsWith('/dashboard/illustrator') || pathname.startsWith('/dashboard/upload')) {
        if (user && user.role !== UserRole.illustrator && user.role !== UserRole.admin) {
          return NextResponse.redirect(new URL('/auth/become-illustrator', request.url))
        }
      }

      // 管理者専用ページのチェック
      if (pathname.startsWith('/dashboard/admin')) {
        if (user && user.role !== UserRole.admin) {
          return NextResponse.redirect(new URL('/dashboard', request.url))
        }
      }

    } catch (error) {
      console.error('Middleware auth error:', error)
      // Stack Auth未設定の場合はスキップ
      console.warn('Stack Auth not configured, skipping auth check')
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/billing/:path*',
  ]
}
