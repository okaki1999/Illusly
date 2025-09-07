### 主な機能

- **認証**: Neon Auth（Stack Auth）を `@stackframe/stack` で実装。`/auth/*` ページ、`/handler/[...stack]` ハンドラー、`middleware.ts` による保護ルート（`/dashboard`, `/billing`）を同梱
- **決済**: Stripe のサブスクリプション（Checkout/Portal/Webhook 完備）。DB に購読状態を保存
- **メール**: Resend によるお問い合わせメール送信（レート制限付き）
- **DB/ORM**: Neon PostgreSQL + Prisma。`Subscription` モデルで購読状態を管理
- **UI**: Next.js App Router、Tailwind CSS、shadcn/ui コンポーネント
- **作品管理**: イラストレーター向けの作品投稿・管理機能
- **ユーザーロール**: 一般ユーザー・イラストレーター・管理者の役割分離

### ディレクトリ構成（抜粋）

```text
startpack/
├── app/
│   ├── api/
│   │   ├── auth/role/route.ts          # ユーザーロール管理
│   │   ├── categories/route.ts         # カテゴリ一覧
│   │   ├── contact/route.ts            # お問い合わせ送信
│   │   ├── illustrations/route.ts      # 作品投稿・一覧
│   │   ├── tags/route.ts               # タグ一覧
│   │   └── stripe/
│   │       ├── checkout/route.ts       # Checkout セッション作成
│   │       ├── portal/route.ts         # Customer Portal セッション
│   │       ├── webhook/route.ts        # Webhook 受信
│   │       └── subscription/route.ts    # 現在の購読状態取得
│   ├── auth/                            # サインイン/サインアップ等
│   │   └── become-illustrator/         # イラストレーター登録
│   ├── billing/                         # 請求・購読ページ
│   ├── contact/                         # お問い合わせページ
│   ├── dashboard/                       # ログイン必須ページ
│   │   └── upload/                      # 作品投稿ページ
│   ├── handler/                         # Stack Auth ハンドラー
│   ├── layout.tsx / page.tsx / providers.tsx
│   └── globals.css
├── components/                          # 共通 UI
│   ├── dashboard/                       # ダッシュボード用コンポーネント
│   └── ui/                              # 基本UIコンポーネント
├── lib/                                 # `stack`/`stripe`/`prisma` ラッパー
│   └── auth.ts                          # 認証・ロール管理
├── prisma/
│   ├── schema.prisma                    # データベーススキーマ
│   └── seed.ts                          # 初期データ（カテゴリ・タグ）
├── middleware.ts                        # `/dashboard` & `/billing` をガード
├── .env.example
└── package.json（dev: port 3002）
```

### クイックスタート

1. プロジェクトへ配置

```bash
unzip startpack.zip
cd startpack
```

2. 依存関係をインストール

```bash
npm install
```

3. 環境変数を作成

```bash
cp .env.example .env
```

4. データベース（Neon 推奨）の接続文字列を `.env` に設定
   - 例（Neon）: `DATABASE_URL="postgresql://user:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require"`
5. Prisma による初期化

```bash
npx prisma migrate dev
```

6. 初期データ（カテゴリ・タグ）を投入

```bash
npm run db:seed
```

7. 開発サーバーを起動（http://localhost:3002）

```bash
npm run dev
```

### 環境変数（概要）

`.env.example` を参照してください。主なもの:

```env
# アプリ
NEXT_PUBLIC_APP_URL=http://localhost:3002

# データベース
DATABASE_URL=postgresql://user:password@host/db?sslmode=require

# 認証（Neon Auth / Stack Auth）
NEXT_PUBLIC_STACK_PROJECT_ID=...
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY=...
STACK_SECRET_SERVER_KEY=...

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Resend（メール）
RESEND_API_KEY=re_...
# 開発: CONTACT_EMAIL は Resend アカウントのメール（例: you@example.com）
CONTACT_EMAIL=you@example.com
# 本番: ドメイン検証後に RESEND_FROM を独自ドメインに（任意）
RESEND_FROM=support@yourdomain.com
RESEND_DOMAIN=yourdomain.com        # 任意（本番で独自ドメイン送信）
```

任意の追加変数（レート制限や開発向け）:

```env
# お問い合わせ API の簡易レート制限（任意）
CONTACT_RATE_LIMIT_WINDOW_MS=60000
CONTACT_RATE_LIMIT_MAX=5

# 開発中はメール送信をスキップしたい場合
SKIP_EMAIL_SEND=true
```

### 認証（Neon Auth / Stack Auth）

- Neon ダッシュボードで Auth を有効化 → Configuration から変数を `.env` へ
- 本番移行時は、Neon Auth / Stack Auth の「Authentication domain」を本番ドメインに更新してください
- 既定の保護ルートは `middleware.ts` で `/dashboard` と `/billing`。未ログイン時は `/auth/signup` へリダイレクト

### 決済（Stripe）

1. ダッシュボードで API キー取得 → `.env` に設定
2. 商品/価格（継続・毎月）を作成し、`STRIPE_PRICE_ID` を設定
3. Webhook を設定（エンドポイント: `/api/stripe/webhook`）
   - 利用イベント: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_succeeded`, `invoice.payment_failed`
4. ローカル開発（Stripe CLI）

```bash
stripe login
stripe listen --forward-to localhost:3002/api/stripe/webhook
# 表示されたシークレットを STRIPE_WEBHOOK_SECRET へ
```

#### Subscription テーブル構造

| フィールド | 型 | 説明 |
|---|---|---|
| `id` | String | プライマリキー（cuid） |
| `userId` | String | Neon Auth（Stack Auth）のユーザーID（unique） |
| `stripeCustomerId` | String | Stripe の Customer ID（unique） |
| `stripeSubscriptionId` | String | Stripe の Subscription ID（unique） |
| `status` | SubscriptionStatus | サブスクリプション状態（active/trialing/past_due/canceled/incomplete/unpaid） |
| `currentPeriodEnd` | DateTime? | 現在の請求期間終了日（次回請求日） |
| `cancelAt` | DateTime? | 特定日時でのキャンセル日時（即時キャンセル時は null） |
| `cancelAtPeriodEnd` | Boolean | 期間終了時にキャンセルするかどうか（デフォルト: false） |
| `createdAt` | DateTime | 作成日時 |
| `updatedAt` | DateTime | 更新日時 |

**ステータスの詳細:**
- `active`: アクティブなサブスクリプション
- `trialing`: トライアル期間中
- `past_due`: 支払い遅延
- `canceled`: キャンセル済み
- `incomplete`: 支払い未完了
- `unpaid`: 未払い

**キャンセル関連フィールド:**
- `cancelAtPeriodEnd = true`: ユーザーがキャンセルを予約している状態。期間終了時に自動的に `status = canceled` になる
- `cancelAt`: 特定の日時でキャンセルする場合の日時。即時キャンセルの場合は null で `status` が直接 `canceled` になる

### メール（Resend）

- `RESEND_API_KEY` を設定。受信先は `CONTACT_EMAIL`
- 本番は Resend でドメイン検証（SPF/DKIM）を行うと独自ドメイン送信が可能
- 開発（ローカル）では未検証ドメインの制約により、`onboarding@resend.dev` からアカウント所有者宛の送信のみ可
  - `CONTACT_EMAIL` は Resend アカウントのメール（例: you@example.com）を設定
  - 送信元はコード上 `onboarding@resend.dev` を使用（`RESEND_FROM` は設定しない）
- 実装は `app/api/contact/route.ts`。件名/本文/送信元/返信先などはコードで調整できます

### 画像アップロード

現在、作品投稿機能では画像アップロードが実装されていますが、**開発環境では仮のURLが設定されています**。

#### 開発環境での動作
- 作品投稿は正常に動作します
- データベースには仮のURLが保存されます
- 画像の表示はできません（仮URLのため）

#### 本番環境での設定

**Vercel Blob を使用する場合（推奨）:**

1. 依存関係をインストール
```bash
npm install @vercel/blob
```

2. 環境変数を設定
```env
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
```

3. Vercel ダッシュボードで Blob ストレージを有効化し、トークンを取得

**AWS S3 を使用する場合:**

1. 依存関係をインストール
```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

2. 環境変数を設定
```env
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=your_region
AWS_S3_BUCKET=your_bucket_name
```

3. S3 バケットを作成し、適切な権限を設定

#### 実装の変更が必要な箇所
- `app/api/illustrations/route.ts` の画像アップロード処理
- 実際のストレージサービスへの画像保存
- サムネイル生成（オプション）

### スクリプト

- `npm run dev`: 開発サーバー起動（ポート 3002）
- `npm run build`: 本番ビルド
- `npm run start`: 本番起動
- `npm run db:seed`: 初期データ（カテゴリ・タグ）を投入
- `npx prisma migrate dev`: マイグレーション適用
- `npx prisma generate`: Prisma Client 再生成

### トラブルシューティング（抜粋）

- **DB 接続失敗**: `.env` の `DATABASE_URL` を確認。`?sslmode=require` を付与。`npx prisma migrate reset` で再作成
- **認証が機能しない**: Neon Auth の 3 変数を設定。ブラウザの Cookie を有効に
- **Stripe 失敗**: Price ID/キーのテスト/本番モード整合、Webhook 設定、`STRIPE_WEBHOOK_SECRET` を確認。ローカルは `stripe listen` を実行
- **メール未送信**: 開発はアカウント宛のみ送信可。`RESEND_API_KEY` とログを確認。必要なら `SKIP_EMAIL_SEND=true`
- **作品投稿ができない**: イラストレーター権限が必要。ダッシュボードで「イラストレーターとして登録」を実行
- **カテゴリ・タグが表示されない**: `npm run db:seed` で初期データを投入
- **画像が表示されない**: 開発環境では仮URLのため正常。本番環境では画像ストレージの設定が必要

## 🚀 本番環境へのデプロイ

### Vercelへのデプロイ

1. **Vercelアカウントの準備**
   - [Vercel](https://vercel.com)でアカウント作成
   - GitHubリポジトリを接続

2. **環境変数の設定**
   Vercelのダッシュボードで以下の環境変数を設定：

   ```bash
   # Database (必須)
   DATABASE_URL="postgresql://username:password@host:5432/database"

   # Stack Auth (必須)
   NEXT_PUBLIC_STACK_PROJECT_ID="your_stack_project_id"
   NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY="your_stack_publishable_client_key"
   STACK_SECRET_SERVER_KEY="your_stack_server_secret_key"

   # Stripe (必須)
   STRIPE_SECRET_KEY="sk_live_..."
   STRIPE_PUBLISHABLE_KEY="pk_live_..."
   STRIPE_PRICE_ID="price_..."
   STRIPE_WEBHOOK_SECRET="whsec_..."

   # App URL (必須)
   NEXT_PUBLIC_APP_URL="https://your-domain.vercel.app"

   # Email (必須)
   RESEND_API_KEY="re_..."
   ```

   **重要**: ビルドエラーを避けるため、**すべての環境変数を設定してからデプロイ**してください。

3. **データベースの準備**
   - [Neon](https://neon.tech)または[Supabase](https://supabase.com)でPostgreSQLデータベースを作成
   - 本番用の`DATABASE_URL`を取得

4. **Stripeの設定**
   - Stripeダッシュボードで本番用の商品・価格を作成
   - Webhookエンドポイントを設定: `https://your-domain.vercel.app/api/stripe/webhook`

5. **Stack Authの設定**
   - Stack Authダッシュボードで本番用の設定を完了
   - リダイレクトURLを設定

6. **デプロイ**
   ```bash
   # Vercel CLIを使用する場合
   npm i -g vercel
   vercel --prod

   # またはGitHubにプッシュして自動デプロイ
   git push origin main
   ```

7. **本番データベースの初期化**
   ```bash
   npx prisma migrate deploy
   npm run db:seed
   ```

### 必要な外部サービス

- **データベース**: Neon PostgreSQL または Supabase
- **認証**: Stack Auth
- **決済**: Stripe
- **メール**: Resend
- **画像ストレージ**: Vercel Blob または AWS S3（本番環境用）

### デプロイ前のチェックリスト

- [ ] 環境変数がすべて設定されている
- [ ] データベースが作成され、接続できる
- [ ] Stripeの本番用商品・価格が作成されている
- [ ] Stack Authの本番設定が完了している
- [ ] Webhookエンドポイントが設定されている
- [ ] 画像ストレージの設定が完了している（本番環境用）
