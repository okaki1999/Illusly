import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// このAPIルートを動的にする
export const dynamic = 'force-dynamic'

/**
 * カテゴリ一覧を取得
 */
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
