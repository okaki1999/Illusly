import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 シードデータの作成を開始...')

  // カテゴリの作成
  const categories = [
    { name: 'イラスト', slug: 'illustration', description: '一般的なイラスト作品', color: '#3B82F6' },
    { name: 'キャラクター', slug: 'character', description: 'キャラクターデザイン', color: '#EF4444' },
    { name: '風景', slug: 'landscape', description: '風景画・背景画', color: '#10B981' },
    { name: 'ファンタジー', slug: 'fantasy', description: 'ファンタジー系作品', color: '#8B5CF6' },
    { name: 'アニメ', slug: 'anime', description: 'アニメ風イラスト', color: '#F59E0B' },
    { name: 'リアル', slug: 'realistic', description: 'リアルな描写', color: '#6B7280' },
    { name: 'ミニマル', slug: 'minimal', description: 'ミニマルデザイン', color: '#374151' },
    { name: '抽象', slug: 'abstract', description: '抽象的な作品', color: '#EC4899' }
  ]

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category
    })
  }

  console.log('✅ カテゴリを作成しました')

  // タグの作成
  const tags = [
    { name: '可愛い', slug: 'cute' },
    { name: 'かっこいい', slug: 'cool' },
    { name: '美しい', slug: 'beautiful' },
    { name: '幻想的', slug: 'fantasy' },
    { name: '癒し', slug: 'healing' },
    { name: 'ポップ', slug: 'pop' },
    { name: 'シンプル', slug: 'simple' },
    { name: 'カラフル', slug: 'colorful' },
    { name: 'モノクロ', slug: 'monochrome' },
    { name: '水彩', slug: 'watercolor' },
    { name: 'デジタル', slug: 'digital' },
    { name: '手描き', slug: 'hand-drawn' },
    { name: '背景', slug: 'background' },
    { name: '人物', slug: 'character' },
    { name: '動物', slug: 'animal' },
    { name: '植物', slug: 'plant' },
    { name: '建物', slug: 'building' },
    { name: '自然', slug: 'nature' },
    { name: '都市', slug: 'city' },
    { name: '空', slug: 'sky' }
  ]

  for (const tag of tags) {
    await prisma.tag.upsert({
      where: { slug: tag.slug },
      update: {},
      create: tag
    })
  }

  console.log('✅ タグを作成しました')
  console.log('🎉 シードデータの作成が完了しました！')
}

main()
  .catch((e) => {
    console.error('❌ シードデータの作成に失敗しました:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
