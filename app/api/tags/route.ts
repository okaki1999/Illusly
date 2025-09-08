import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * タグ一覧を取得
 */
export async function GET() {
  try {
    console.log('[api/tags] runtime', { vercel: !!process.env.VERCEL, nodeEnv: process.env.NODE_ENV, hasDb: !!process.env.DATABASE_URL })
    const tags = await prisma.tag.findMany({
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(tags)
  } catch (error) {
    console.error('Error fetching tags:', error)
    if (process.env.VERCEL) {
      return NextResponse.json([], { status: 200 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
