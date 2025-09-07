import { NextRequest, NextResponse } from 'next/server'
import { getStackServerApp } from '@/lib/stack'
import { prisma } from '@/lib/prisma'

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

    // ユーザーのダウンロード履歴を取得
    const downloads = await prisma.downloadHistory.findMany({
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
        downloadedAt: 'desc'
      }
    })

    // データを整形
    const illustrations = downloads.map(download => ({
      id: download.illustration.id,
      title: download.illustration.title,
      description: download.illustration.description,
      imageUrl: download.illustration.imageUrl,
      thumbnailUrl: download.illustration.thumbnailUrl,
      user: download.illustration.user,
      category: download.illustration.category,
      tags: download.illustration.tags.map(t => ({ name: t.tag.name })),
      isFree: download.illustration.isFree,
      downloadCount: download.illustration.downloadCount,
      favoriteCount: download.illustration.favoriteCount,
      viewCount: download.illustration.viewCount,
      createdAt: download.illustration.createdAt.toISOString(),
      downloadedAt: download.downloadedAt.toISOString()
    }))

    return NextResponse.json({ illustrations })
  } catch (error) {
    console.error('Error fetching downloads:', error)
    return NextResponse.json(
      { error: 'ダウンロード履歴の取得に失敗しました' },
      { status: 500 }
    )
  }
}
