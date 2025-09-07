import { getStackServerApp } from './stack'
import { prisma } from './prisma'
import { UserRole } from '@prisma/client'

export interface AuthUser {
  id: string
  stackUserId: string
  email: string
  name?: string | null
  role: UserRole
  profileImage?: string | null
  bio?: string | null
  website?: string | null
  socialLinks?: any
  isVerified: boolean
}

/**
 * 現在の認証されたユーザーを取得
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const app = getStackServerApp()
    const stackUser = await app.getUser()

    if (!stackUser) {
      return null
    }

    // データベースからユーザー情報を取得
    const user = await prisma.user.findUnique({
      where: { stackUserId: stackUser.id }
    })

    if (!user) {
      // 初回ログイン時はユーザーを作成
      return await createUserFromStack(stackUser)
    }

    return user
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

/**
 * Stack Authのユーザー情報からデータベースユーザーを作成
 */
async function createUserFromStack(stackUser: any): Promise<AuthUser | null> {
  try {
    const user = await prisma.user.create({
      data: {
        stackUserId: stackUser.id,
        email: stackUser.primaryEmail,
        name: stackUser.displayName,
        role: UserRole.user, // デフォルトは一般ユーザー
        isVerified: stackUser.emailVerified
      }
    })

    return user
  } catch (error) {
    console.error('Error creating user from Stack:', error)
    return null
  }
}

/**
 * ユーザーのロールを更新
 */
export async function updateUserRole(userId: string, role: UserRole): Promise<AuthUser | null> {
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { role }
    })

    return user
  } catch (error) {
    console.error('Error updating user role:', error)
    return null
  }
}

/**
 * ユーザーが特定のロールを持っているかチェック
 */
export function hasRole(user: AuthUser | null, requiredRole: UserRole): boolean {
  if (!user) return false

  const roleHierarchy = {
    [UserRole.user]: 0,
    [UserRole.illustrator]: 1,
    [UserRole.admin]: 2
  }

  return roleHierarchy[user.role] >= roleHierarchy[requiredRole]
}

/**
 * ユーザーがイラストレーターかチェック
 */
export function isIllustrator(user: AuthUser | null): boolean {
  return hasRole(user, UserRole.illustrator)
}

/**
 * ユーザーが管理者かチェック
 */
export function isAdmin(user: AuthUser | null): boolean {
  return hasRole(user, UserRole.admin)
}

/**
 * 認証が必要なページのミドルウェア用
 */
export async function requireAuth(): Promise<AuthUser> {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('Authentication required')
  }
  return user
}

/**
 * 特定のロールが必要なページのミドルウェア用
 */
export async function requireRole(requiredRole: UserRole): Promise<AuthUser> {
  const user = await requireAuth()
  if (!hasRole(user, requiredRole)) {
    throw new Error(`Role ${requiredRole} required`)
  }
  return user
}

/**
 * イラストレーター権限が必要なページのミドルウェア用
 */
export async function requireIllustrator(): Promise<AuthUser> {
  return requireRole(UserRole.illustrator)
}

/**
 * 管理者権限が必要なページのミドルウェア用
 */
export async function requireAdmin(): Promise<AuthUser> {
  return requireRole(UserRole.admin)
}
