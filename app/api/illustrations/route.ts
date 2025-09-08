import { NextRequest, NextResponse } from 'next/server'
import { requireIllustrator } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { IllustrationStatus } from '@prisma/client'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * 作品一覧を取得
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const categoryId = searchParams.get('categoryId')
    const tagId = searchParams.get('tagId')
    const search = searchParams.get('search')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    const status = searchParams.get('status') as IllustrationStatus || 'published'

    const skip = (page - 1) * limit

    // 検索条件を構築
    const where: any = {
      status
    }

    if (categoryId) {
      where.categoryId = categoryId
    }

    if (tagId) {
      where.tags = {
        some: {
          tagId
        }
      }
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
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
    console.error('Error fetching illustrations:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * 新しい作品を投稿
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireIllustrator()

    const formData = await request.formData()
    const image = formData.get('image') as File
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const categoryId = formData.get('categoryId') as string
    const tagsData = formData.get('tags') as string
    const isFree = formData.get('isFree') === 'true'
    const status = formData.get('status') as IllustrationStatus

    // バリデーション
    if (!image) {
      return NextResponse.json({ error: '画像が必要です' }, { status: 400 })
    }

    if (!title?.trim()) {
      return NextResponse.json({ error: 'タイトルが必要です' }, { status: 400 })
    }

    // 画像のバリデーション
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(image.type)) {
      return NextResponse.json({ error: '対応していない画像形式です' }, { status: 400 })
    }

    const maxSize = 20 * 1024 * 1024 // 20MB
    if (image.size > maxSize) {
      return NextResponse.json({ error: '画像サイズが大きすぎます（最大20MB）' }, { status: 400 })
    }

    // TODO: 実際の画像アップロード処理（AWS S3やVercel Blobなど）
    // 現在は仮のURLを設定
    const imageUrl = `https://example.com/images/${Date.now()}-${image.name}`
    const thumbnailUrl = `https://example.com/thumbnails/${Date.now()}-${image.name}`

    // タグの処理
    let tagIds: string[] = []
    if (tagsData) {
      try {
        tagIds = JSON.parse(tagsData)
      } catch (error) {
        console.error('Error parsing tags:', error)
      }
    }

    // データベースに保存
    const illustration = await prisma.illustration.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        imageUrl,
        thumbnailUrl,
        width: null, // TODO: 画像の実際のサイズを取得
        height: null,
        fileSize: image.size,
        mimeType: image.type,
        status,
        isFree,
        userId: user.id,
        categoryId: categoryId || null,
        tags: {
          create: tagIds.map(tagId => ({
            tagId
          }))
        }
      },
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
      }
    })

    // レスポンス用にデータを整形
    const formattedIllustration = {
      ...illustration,
      tags: illustration.tags.map(t => t.tag)
    }

    return NextResponse.json({
      message: '作品を投稿しました',
      illustration: formattedIllustration
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating illustration:', error)

    if (error instanceof Error && error.message.includes('required')) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
