import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, updateUserRole, requireAuth } from '@/lib/auth'
import { UserRole } from '@prisma/client'

/**
 * 現在のユーザーのロールを取得
 */
export async function GET() {
  try {
    const user = await getCurrentUser()

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
