import { NextRequest, NextResponse } from 'next/server'
import { getStackServerApp } from '@/lib/stack'
import { prisma } from '@/lib/prisma'

// このAPIルートを動的にする
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const app = getStackServerApp()
    const user = await app.getUser()

    if (!user) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    // ユーザーのお気に入り作品を取得
    const favorites = await prisma.favorite.findMany({
      where: {
        userId: user.id
      },
      include: {
        illustration: {
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
                name: true,
                color: true
              }
            },
            tags: {
              include: {
                tag: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // データを整形
    const illustrations = favorites.map(favorite => ({
      id: favorite.illustration.id,
      title: favorite.illustration.title,
      description: favorite.illustration.description,
      imageUrl: favorite.illustration.imageUrl,
      thumbnailUrl: favorite.illustration.thumbnailUrl,
      user: favorite.illustration.user,
      category: favorite.illustration.category,
      tags: favorite.illustration.tags.map(t => ({ name: t.tag.name })),
      isFree: favorite.illustration.isFree,
      downloadCount: favorite.illustration.downloadCount,
      favoriteCount: favorite.illustration.favoriteCount,
      viewCount: favorite.illustration.viewCount,
      createdAt: favorite.illustration.createdAt.toISOString()
    }))

    return NextResponse.json({ illustrations })
  } catch (error) {
    console.error('Error fetching favorites:', error)
    return NextResponse.json(
      { error: 'お気に入り作品の取得に失敗しました' },
      { status: 500 }
    )
  }
}
