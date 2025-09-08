import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * カテゴリ一覧を取得
 */
export async function GET() {
  try {
    console.log('[api/categories] runtime', { vercel: !!process.env.VERCEL, nodeEnv: process.env.NODE_ENV, hasDb: !!process.env.DATABASE_URL })
    const categories = await prisma.category.findMany({
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error('Error fetching categories:', error)
    // Vercel のビルド時に静的収集で失敗しないようフォールバック
    if (process.env.VERCEL) {
      return NextResponse.json([], { status: 200 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
