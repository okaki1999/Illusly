import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// このAPIルートを動的にする
export const dynamic = 'force-dynamic'

/**
 * 作品をダウンロード
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

    // ダウンロード権限チェック
    if (!illustration.isFree) {
      // 有料作品の場合、サブスクリプションが必要
      const subscription = await prisma.subscription.findUnique({
        where: { userId: user.id }
      })

      if (!subscription || !['active', 'trialing'].includes(subscription.status)) {
        return NextResponse.json({
          error: 'この作品をダウンロードするにはサブスクリプションが必要です'
        }, { status: 403 })
      }
    }

    // ダウンロード履歴を記録
    await prisma.downloadHistory.create({
      data: {
        userId: user.id,
        illustrationId: illustrationId,
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    })

    // ダウンロード数を増加
    await prisma.illustration.update({
      where: { id: illustrationId },
      data: { downloadCount: { increment: 1 } }
    })

    // TODO: 実際のファイルダウンロード処理
    // 現在は仮のレスポンス
    return NextResponse.json({
      message: 'ダウンロードを開始しました',
      downloadUrl: illustration.imageUrl, // 仮のURL
      fileName: `${illustration.title}.${illustration.mimeType?.split('/')[1] || 'jpg'}`
    })
  } catch (error) {
    console.error('Error downloading illustration:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
