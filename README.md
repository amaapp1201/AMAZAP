# AMAZAP

健康づくりイベントの記録アプリです。参加者が日々の行動と歩数を記録してポイントを貯め、管理者がイベント・チーム・ユーザー・行動項目を管理します。

## 主な機能

- **デイリーレコード**: 参加者が、その日に行った行動と歩数を記録します。
- **イベント管理**: 期間、対象チーム、対象カテゴリを決めてイベントを作成・公開します。
- **アクション管理**: 行動項目とカテゴリ、ポイントを登録します。
- **ユーザー・チーム管理**: 参加者の登録、チームへの割り当て、パスワードの変更を行います。
- **レポート**: イベントごとに、チーム別・ユーザー別の集計を表示します。

## 使っている技術

- [Next.js](https://nextjs.org/) 15（App Router）、React 19、TypeScript
- [Supabase](https://supabase.com/)（PostgreSQL。行レベルセキュリティでアクセスを制御）
- [NextAuth.js](https://authjs.dev/) v5（名前とパスワードでログイン）
- Tailwind CSS と shadcn/ui

## セットアップ

Node.js 20 以上が必要です。

### 1. 依存パッケージを入れる

```bash
npm ci
```

### 2. Supabase のプロジェクトを用意する

1. Supabase で新しいプロジェクトを作ります。
2. SQL Editor に [`supabase/migrations/20261124000000_initial_schema.sql`](supabase/migrations/20261124000000_initial_schema.sql) の全文を貼り付けて、一度だけ実行します。
   - 「This query creates tables without enabling Row Level Security」という警告が出たら、「Run without RLS」を選びます。警告の対象は `next_auth` スキーマのテーブルで、こちらは RLS ではなく権限（サーバー用の鍵だけが読み書きできる）で保護しています。
3. Project Settings → Data API → Settings の「Exposed schemas」に `next_auth` を追加して保存します。

### 3. 最初の管理者を作る

SQL Editor で次を実行します。名前とパスワードは書き換えてください。

```sql
insert into next_auth.users (name, password, is_admin)
values (
  '管理者の名前',
  extensions.crypt('ここにパスワード', extensions.gen_salt('bf', 10)),
  true
);
```

2 人目以降は、ログイン後の管理画面（ユーザー）から追加できます。

### 4. 環境変数を設定する

`.env.example` を `.env.local` という名前でコピーし、値を記入します。`.env.local` は Git の管理対象外です。

```bash
cp .env.example .env.local
```

| 変数 | 値 |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase の Project URL（`https://<プロジェクトID>.supabase.co`） |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Project Settings → API Keys の Publishable key |
| `SUPABASE_SERVICE_ROLE` | Project Settings → API Keys の Secret key。公開しないでください |
| `SUPABASE_JWT_SECRET` | Project Settings → JWT Keys の Legacy JWT Secret。公開しないでください |
| `AUTH_SECRET` | NextAuth 用のランダムな文字列。`openssl rand -base64 32` で作れます |

### 5. 起動する

```bash
npm run dev
```

http://localhost:3000 を開き、手順 3 で作った管理者でログインします。

## コマンド

| コマンド | 内容 |
| --- | --- |
| `npm run dev` | 開発用サーバーを起動します |
| `npm run build` | 本番用にビルドします |
| `npm run start` | ビルドしたものを起動します |
| `npm run lint` | ESLint を実行します |
| `npm run storybook` | Storybook を起動します |
| `npm run test` | Vitest を実行します |

## フォルダ構成

| 場所 | 内容 |
| --- | --- |
| `app/` | 画面と API のルート定義 |
| `features/<画面名>-page/` | 各画面の部品と、データベースを読み書きする処理（`*-service.ts`） |
| `features/helpers/` | 認証の設定、型定義、共通の関数 |
| `features/supabase/` | Supabase クライアントの生成 |
| `features/ui/` | 共通の UI 部品 |
| `supabase/migrations/` | データベースの定義 |
| `middleware.ts` | 未ログインのアクセスをログイン画面へ戻す処理 |

## データベースへのアクセスの仕組み

- ログインすると、NextAuth のセッションの中に Supabase 用の JWT（`SUPABASE_JWT_SECRET` で署名）が作られます。サーバー側の処理はこの JWT を付けて Supabase を呼び、行レベルセキュリティが「管理者だけが登録できる」「本人の記録だけ更新できる」といった制御を行います。
- ユーザー情報（`next_auth` スキーマ）の読み書きと、一部の集計は、サーバー用の鍵（`SUPABASE_SERVICE_ROLE`）で行います。
- 未ログインの状態では、どのテーブルも読めません。

## データベースを変更するとき

テーブルや関数を変更する場合は、`supabase/migrations/` に新しい SQL ファイルを追加し、同じ内容を Supabase に適用してください。型定義（`features/helpers/database.types.ts`）は Supabase CLI で再生成できます。

```bash
npx supabase gen types typescript --project-id <プロジェクトID> --schema public,next_auth > features/helpers/database.types.ts
```
