import { PrismaClient } from '@prisma/client'

/**
 * PrismaClient のシングルトン化
 * - Next.js の開発環境ではホットリロードによりインスタンスが複数生成されやすいため、
 *   `globalThis` に保存して再利用します。
 * - 本番環境では通常通り単一生成で問題ありません。
 */
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | any | undefined
}

// ビルド時でも落ちないように安全に生成（失敗時はフォールバッククライアント）
function createSafePrismaClient(): PrismaClient | any {
  const databaseUrl = process.env.DATABASE_URL || 'postgresql://dummy:dummy@localhost:5432/dummy'
  try {
    const client = new PrismaClient({
      datasources: {
        db: { url: databaseUrl },
      },
    })
    return client
  } catch (error) {
    // Vercel のビルド時など、PrismaClient 初期化で例外が出る場合のフォールバック
    if (process.env.VERCEL) {
      try {
        console.log('[lib/prisma] Using fallback prisma client (build-time safe)')
      } catch {}
      const noop = async (..._args: any[]) => ([] as any)
      const noopNull = async (..._args: any[]) => null as any
      const noopZero = async (..._args: any[]) => 0 as any
      return {
        category: { findMany: noop },
        tag: { findMany: noop },
        user: { findUnique: noopNull, create: noopNull, update: noopNull },
        illustration: { findMany: noop, count: noopZero, create: noopNull },
        favorite: { findMany: noop },
        downloadHistory: { findMany: noop },
        subscription: { findFirst: noopNull, update: noopNull },
      }
    }
    throw error
  }
}

export const prisma: PrismaClient | any = globalThis.prisma || createSafePrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma
}
