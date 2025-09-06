import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function GET(req: NextRequest) {
  try {

    // Stripeインスタンスの確認
    if (!stripe) {
      console.error('Stripe instance is not initialized');
      return NextResponse.json(
        { error: 'Stripeの初期化に失敗しました' },
        { status: 500 }
      );
    }

    // Stripeから商品と価格情報を取得
    console.log('Fetching products from Stripe...');
    const products = await stripe.products.list({
      active: true,
      expand: ['data.default_price']
    });

    console.log(`Found ${products.data.length} products`);

    // 価格情報も取得（商品に価格が含まれていない場合のフォールバック）
    console.log('Fetching prices from Stripe...');
    const prices = await stripe.prices.list({
      active: true,
      expand: ['data.product']
    });

    console.log(`Found ${prices.data.length} prices`);

    // 商品と価格を組み合わせて整理
    const productData = products.data.map(product => {
      const defaultPrice = product.default_price as any;
      const priceInfo = defaultPrice || prices.data.find(p => p.product === product.id);

      return {
        id: product.id,
        name: product.name,
        description: product.description,
        images: product.images,
        price: priceInfo ? {
          id: priceInfo.id,
          amount: priceInfo.unit_amount,
          currency: priceInfo.currency,
          interval: priceInfo.recurring?.interval,
          intervalCount: priceInfo.recurring?.interval_count
        } : null
      };
    }).filter(product => product.price); // 価格情報がある商品のみ

    console.log(`Returning ${productData.length} products with prices`);
    return NextResponse.json({ products: productData });
  } catch (error) {
    console.error('Stripe products fetch error:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json(
      { error: '商品情報の取得に失敗しました' },
      { status: 500 }
    );
  }
}
