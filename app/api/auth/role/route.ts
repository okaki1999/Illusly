import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getCurrentUser, updateUserRole, requireAuth } from '@/lib/auth'
import { hasStackEnv } from '@/lib/stack'
import { UserRole } from '@prisma/client'

// 認証が必要なAPIルートは動的にする
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Debug at module load
try {
  if (process.env.VERCEL) {
    console.log('[api/auth/role] module loaded', {
      vercel: true,
      nodeEnv: process.env.NODE_ENV,
      hasDb: Boolean(process.env.DATABASE_URL),
      hasStackEnv: hasStackEnv(),
    })
  }
} catch {}

/**
 * 現在のユーザーのロールを取得
 */
export async function GET() {
  try {
    if (process.env.VERCEL) {
      console.log('[api/auth/role] GET invoked')
    }
    // ビルド時や未認証コンテキストで cookies が無い場合は即 401 を返す
    try {
      const all = cookies().getAll()
      if (!all || all.length === 0) {
        if (process.env.VERCEL) {
          console.log('[api/auth/role] no cookies detected -> 401')
        }
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    } catch {
      // cookies() が利用できない環境（ビルド時など）は 401 を返す
      if (process.env.VERCEL) {
        console.log('[api/auth/role] cookies() unavailable -> 401')
      }
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const user = await getCurrentUser()
    if (process.env.VERCEL) {
      console.log('[api/auth/role] getCurrentUser result', { hasUser: Boolean(user) })
    }

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json({
      role: user.role,
      isIllustrator: user.role === UserRole.illustrator,
      isAdmin: user.role === UserRole.admin
    })
  } catch (error) {
    console.error('Error getting user role:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * ユーザーのロールを更新（イラストレーター登録）
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const { role } = await request.json()

    // 有効なロールかチェック
    if (!Object.values(UserRole).includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    // 一般ユーザーからイラストレーターへの変更のみ許可
    if (user.role !== UserRole.user && role === UserRole.illustrator) {
      return NextResponse.json({ error: 'Already registered as illustrator' }, { status: 400 })
    }

    // 管理者権限は直接変更できない
    if (role === UserRole.admin) {
      return NextResponse.json({ error: 'Cannot set admin role directly' }, { status: 403 })
    }

    const updatedUser = await updateUserRole(user.id, role)

    if (!updatedUser) {
      return NextResponse.json({ error: 'Failed to update role' }, { status: 500 })
    }

    return NextResponse.json({
      message: 'Role updated successfully',
      role: updatedUser.role
    })
  } catch (error) {
    console.error('Error updating user role:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
