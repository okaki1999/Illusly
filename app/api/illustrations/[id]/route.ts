import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// このAPIルートを動的にする
export const dynamic = 'force-dynamic'

/**
 * 作品詳細を取得
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const illustrationId = params.id
    const user = await getCurrentUser()

    // 作品を取得
    const illustration = await prisma.illustration.findUnique({
      where: {
        id: illustrationId,
        status: 'published' // 公開済みの作品のみ
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profileImage: true,
            bio: true,
            website: true
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
      }
    })

    if (!illustration) {
      return NextResponse.json({ error: '作品が見つかりません' }, { status: 404 })
    }

    // 閲覧数を増加
    await prisma.illustration.update({
      where: { id: illustrationId },
      data: { viewCount: { increment: 1 } }
    })

    // お気に入り状態を取得
    let isFavorited = false
    if (user) {
      const favorite = await prisma.favorite.findUnique({
        where: {
          userId_illustrationId: {
            userId: user.id,
            illustrationId: illustrationId
          }
        }
      })
      isFavorited = !!favorite
    }

    // レスポンス用にデータを整形
    const formattedIllustration = {
      ...illustration,
      tags: illustration.tags.map(t => t.tag)
    }

    return NextResponse.json({
      illustration: formattedIllustration,
      isFavorited
    })
  } catch (error) {
    console.error('Error fetching illustration:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * 作品を更新（イラストレーターのみ）
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const illustrationId = params.id
    const body = await request.json()

    // 作品の所有者かチェック
    const illustration = await prisma.illustration.findUnique({
      where: { id: illustrationId },
      select: { userId: true }
    })

    if (!illustration) {
      return NextResponse.json({ error: '作品が見つかりません' }, { status: 404 })
    }

    if (illustration.userId !== user.id && user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // 作品を更新
    const updatedIllustration = await prisma.illustration.update({
      where: { id: illustrationId },
      data: {
        title: body.title,
        description: body.description,
        categoryId: body.categoryId,
        isFree: body.isFree,
        status: body.status
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profileImage: true,
            bio: true,
            website: true
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
      }
    })

    // タグの更新
    if (body.tags) {
      // 既存のタグを削除
      await prisma.illustrationTag.deleteMany({
        where: { illustrationId }
      })

      // 新しいタグを追加
      if (body.tags.length > 0) {
        await prisma.illustrationTag.createMany({
          data: body.tags.map((tagId: string) => ({
            illustrationId,
            tagId
          }))
        })
      }
    }

    // レスポンス用にデータを整形
    const formattedIllustration = {
      ...updatedIllustration,
      tags: updatedIllustration.tags.map(t => t.tag)
    }

    return NextResponse.json({
      message: '作品を更新しました',
      illustration: formattedIllustration
    })
  } catch (error) {
    console.error('Error updating illustration:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * 作品を削除（イラストレーターのみ）
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const illustrationId = params.id

    // 作品の所有者かチェック
    const illustration = await prisma.illustration.findUnique({
      where: { id: illustrationId },
      select: { userId: true }
    })

    if (!illustration) {
      return NextResponse.json({ error: '作品が見つかりません' }, { status: 404 })
    }

    if (illustration.userId !== user.id && user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // 作品を削除（関連データも自動削除される）
    await prisma.illustration.delete({
      where: { id: illustrationId }
    })

    return NextResponse.json({
      message: '作品を削除しました'
    })
  } catch (error) {
    console.error('Error deleting illustration:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
