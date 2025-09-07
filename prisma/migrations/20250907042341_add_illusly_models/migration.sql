-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('user', 'illustrator', 'admin');

-- CreateEnum
CREATE TYPE "public"."IllustrationStatus" AS ENUM ('draft', 'published', 'private');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "stackUserId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "role" "public"."UserRole" NOT NULL DEFAULT 'user',
    "profileImage" TEXT,
    "bio" TEXT,
    "website" TEXT,
    "socialLinks" JSONB,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Tag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Illustration" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "width" INTEGER,
    "height" INTEGER,
    "fileSize" INTEGER,
    "mimeType" TEXT,
    "status" "public"."IllustrationStatus" NOT NULL DEFAULT 'draft',
    "isFree" BOOLEAN NOT NULL DEFAULT false,
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "favoriteCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "categoryId" TEXT,

    CONSTRAINT "Illustration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."IllustrationTag" (
    "id" TEXT NOT NULL,
    "illustrationId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "IllustrationTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Favorite" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "illustrationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Favorite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DownloadHistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "illustrationId" TEXT NOT NULL,
    "downloadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" TEXT,
    "userAgent" TEXT,

    CONSTRAINT "DownloadHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_stackUserId_key" ON "public"."User"("stackUserId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "public"."Category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "public"."Category"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_key" ON "public"."Tag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_slug_key" ON "public"."Tag"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "IllustrationTag_illustrationId_tagId_key" ON "public"."IllustrationTag"("illustrationId", "tagId");

-- CreateIndex
CREATE UNIQUE INDEX "Favorite_userId_illustrationId_key" ON "public"."Favorite"("userId", "illustrationId");

-- AddForeignKey
ALTER TABLE "public"."Illustration" ADD CONSTRAINT "Illustration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Illustration" ADD CONSTRAINT "Illustration_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."IllustrationTag" ADD CONSTRAINT "IllustrationTag_illustrationId_fkey" FOREIGN KEY ("illustrationId") REFERENCES "public"."Illustration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."IllustrationTag" ADD CONSTRAINT "IllustrationTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "public"."Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Favorite" ADD CONSTRAINT "Favorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Favorite" ADD CONSTRAINT "Favorite_illustrationId_fkey" FOREIGN KEY ("illustrationId") REFERENCES "public"."Illustration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DownloadHistory" ADD CONSTRAINT "DownloadHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DownloadHistory" ADD CONSTRAINT "DownloadHistory_illustrationId_fkey" FOREIGN KEY ("illustrationId") REFERENCES "public"."Illustration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
