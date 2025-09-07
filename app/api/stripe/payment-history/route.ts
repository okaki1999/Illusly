import { NextRequest, NextResponse } from 'next/server'
import { getStackServerApp } from '@/lib/stack'
import { stripe } from '@/lib/stripe'
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

    // ユーザーのサブスクリプションを取得
    const subscription = await prisma.subscription.findFirst({
      where: { userId: user.id },
      select: { stripeCustomerId: true }
    })

    if (!subscription?.stripeCustomerId) {
      return NextResponse.json({ payments: [] })
    }

    // Stripeから支払い履歴を取得
    const charges = await stripe.charges.list({
      customer: subscription.stripeCustomerId,
      limit: 20,
      expand: ['data.invoice']
    })

    // データを整形
    const payments = charges.data.map(charge => ({
      id: charge.id,
      amount: charge.amount,
      currency: charge.currency,
      status: charge.status,
      description: charge.description || 'サブスクリプション料金',
      createdAt: new Date(charge.created * 1000).toISOString(),
      receiptUrl: charge.receipt_url || undefined
    }))

    return NextResponse.json({ payments })
  } catch (error) {
    console.error('Error fetching payment history:', error)
    return NextResponse.json(
      { error: '支払い履歴の取得に失敗しました' },
      { status: 500 }
    )
  }
}
