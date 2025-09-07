import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// このAPIルートを動的にする
export const dynamic = 'force-dynamic'

/**
 * 自分の作品の統計情報を取得
 */
export async function GET() {
  try {
    const user = await requireAuth()

    // 基本統計
    const [
      totalIllustrations,
      publishedIllustrations,
      draftIllustrations,
      privateIllustrations,
      totalViews,
      totalDownloads,
      totalFavorites
    ] = await Promise.all([
      prisma.illustration.count({
        where: { userId: user.id }
      }),
      prisma.illustration.count({
        where: { userId: user.id, status: 'published' }
      }),
      prisma.illustration.count({
        where: { userId: user.id, status: 'draft' }
      }),
      prisma.illustration.count({
        where: { userId: user.id, status: 'private' }
      }),
      prisma.illustration.aggregate({
        where: { userId: user.id },
        _sum: { viewCount: true }
      }),
      prisma.illustration.aggregate({
        where: { userId: user.id },
        _sum: { downloadCount: true }
      }),
      prisma.illustration.aggregate({
        where: { userId: user.id },
        _sum: { favoriteCount: true }
      })
    ])

    // 最近の投稿（過去30日）
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentIllustrations = await prisma.illustration.count({
      where: {
        userId: user.id,
        createdAt: {
          gte: thirtyDaysAgo
        }
      }
    })

    // 人気作品（上位5件）
    const popularIllustrations = await prisma.illustration.findMany({
      where: { userId: user.id },
      orderBy: { viewCount: 'desc' },
      take: 5,
      select: {
        id: true,
        title: true,
        viewCount: true,
        favoriteCount: true,
        downloadCount: true
      }
    })

    const stats = {
      totalIllustrations,
      publishedIllustrations,
      draftIllustrations,
      privateIllustrations,
      totalViews: totalViews._sum.viewCount || 0,
      totalDownloads: totalDownloads._sum.downloadCount || 0,
      totalFavorites: totalFavorites._sum.favoriteCount || 0,
      recentIllustrations,
      popularIllustrations
    }

    return NextResponse.json({ stats })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
