import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// 認証が必要なAPIルートは動的にする
export const dynamic = 'force-dynamic'

/**
 * お気に入りに追加
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    const illustrationId = params.id

    // 作品が存在するかチェック
    const illustration = await prisma.illustration.findUnique({
      where: {
        id: illustrationId,
        status: 'published'
      }
    })

    if (!illustration) {
      return NextResponse.json({ error: '作品が見つかりません' }, { status: 404 })
    }

    // 既にお気に入りに追加されているかチェック
    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_illustrationId: {
          userId: user.id,
          illustrationId: illustrationId
        }
      }
    })

    if (existingFavorite) {
      return NextResponse.json({ error: '既にお気に入りに追加されています' }, { status: 400 })
    }

    // お気に入りに追加
    await prisma.favorite.create({
      data: {
        userId: user.id,
        illustrationId: illustrationId
      }
    })

    // お気に入り数を増加
    await prisma.illustration.update({
      where: { id: illustrationId },
      data: { favoriteCount: { increment: 1 } }
    })

    return NextResponse.json({
      message: 'お気に入りに追加しました'
    })
  } catch (error) {
    console.error('Error adding favorite:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * お気に入りから削除
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    const illustrationId = params.id

    // お気に入りを削除
    const deletedFavorite = await prisma.favorite.deleteMany({
      where: {
        userId: user.id,
        illustrationId: illustrationId
      }
    })

    if (deletedFavorite.count === 0) {
      return NextResponse.json({ error: 'お気に入りに追加されていません' }, { status: 400 })
    }

    // お気に入り数を減少
    await prisma.illustration.update({
      where: { id: illustrationId },
      data: { favoriteCount: { decrement: 1 } }
    })

    return NextResponse.json({
      message: 'お気に入りから削除しました'
    })
  } catch (error) {
    console.error('Error removing favorite:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
