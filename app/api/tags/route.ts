import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// このAPIルートを動的にする
export const dynamic = 'force-dynamic'

/**
 * タグ一覧を取得
 */
export async function GET() {
  try {
    const tags = await prisma.tag.findMany({
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(tags)
  } catch (error) {
    console.error('Error fetching tags:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
