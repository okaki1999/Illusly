import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// このAPIルートを動的にする
export const dynamic = 'force-dynamic'

/**
 * 自分の作品一覧を取得
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status') as 'draft' | 'published' | 'private' | null
    const sortBy = searchParams.get('sortBy') || 'updatedAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    const skip = (page - 1) * limit

    // 検索条件を構築
    const where: any = {
      userId: user.id
    }

    if (status) {
      where.status = status
    }

    // ソート条件を構築
    const orderBy: any = {}
    orderBy[sortBy] = sortOrder

    const [illustrations, total] = await Promise.all([
      prisma.illustration.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              profileImage: true
            }
          },
          category: {
            select: {
              id: true,
              name: true,
              color: true
            }
          },
          tags: {
            include: {
              tag: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          }
        },
        orderBy,
        skip,
        take: limit
      }),
      prisma.illustration.count({ where })
    ])

    // レスポンス用にデータを整形
    const formattedIllustrations = illustrations.map(illustration => ({
      ...illustration,
      tags: illustration.tags.map(t => t.tag)
    }))

    return NextResponse.json({
      illustrations: formattedIllustrations,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching my illustrations:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
