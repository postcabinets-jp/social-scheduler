# social-scheduler

**チャンネル課金を撲滅するSNS予約投稿SaaS**

Buffer の代替。X / Instagram / LinkedIn / Bluesky など複数SNSへの予約投稿を、チャンネル数に関係なくフラット $15/月で提供するオープンソース SaaS。

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)

---

## 機能

- **マルチチャンネル投稿** — X, Instagram, LinkedIn, Bluesky, Mastodon, Threads, Facebook に対応
- **予約投稿** — 日時指定でスケジュール管理、カレンダービュー付き
- **AI コンテンツ生成** — OpenAI / Anthropic / Groq の BYOK（自分の API キーを持ち込む）
- **承認フロー** — editor → admin の承認ワークフロー
- **チャンネル別テキスト** — 同一投稿でプラットフォームごとに文章を調整
- **アナリティクス** — フォロワー数・エンゲージメント推移を可視化
- **チームコラボ** — ワークスペース単位でメンバー招待・権限管理
- **フラット料金** — チャンネル数いくつでも $15/月（Buffer の課金構造を撲滅）

## スタック

| レイヤー | 技術 |
|----------|------|
| フレームワーク | Next.js 15 (App Router, TypeScript strict) |
| データベース | Supabase (PostgreSQL + RLS + Auth + Storage) |
| スタイリング | Tailwind CSS v4 + shadcn/ui (Base UI) |
| AI 生成 | OpenAI / Anthropic / Groq (BYOK) |
| メール | Resend (招待・通知) |
| 決済 | Stripe (サブスクリプション) |

## クイックスタート

### 前提条件

- Node.js 20+
- [Supabase CLI](https://supabase.com/docs/guides/cli)
- Supabase アカウント（または Docker でローカル起動）

### 1. クローン

```bash
git clone https://github.com/postcabinets-jp/social-scheduler.git
cd social-scheduler
npm install
```

### 2. 環境変数

```bash
cp .env.example .env.local
```

`.env.local` を編集:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Supabase セットアップ

```bash
# ローカル Supabase 起動
supabase start

# マイグレーション適用
supabase db push

# シードデータ投入（任意）
supabase db seed
```

### 4. 起動

```bash
npm run dev
```

`http://localhost:3000` にアクセス。

---

## Vercel へのデプロイ

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/postcabinets-jp/social-scheduler)

1. 上のボタンでリポジトリを fork してデプロイ
2. Supabase プロジェクトを作成して環境変数を設定
3. `supabase db push` でスキーマを本番 DB に適用

---

## データベーススキーマ

```
profiles            ← auth.users に紐づくプロフィール
workspaces          ← マルチテナント単位
workspace_members   ← 役割: admin / editor / viewer
social_accounts     ← 各 SNS アカウント情報
posts               ← 投稿（draft / scheduled / pending_approval / published）
post_channels       ← 投稿 × チャンネルのマッピング（チャンネル別テキスト含む）
media_assets        ← Storage に保存した画像・動画
analytics_snapshots ← フォロワー数等の日次スナップショット
post_analytics      ← 投稿ごとのエンゲージメント
approval_requests   ← 承認フローのリクエスト
post_templates      ← 再利用可能なテンプレート
```

全テーブルに Row Level Security (RLS) を適用済み。ユーザーは自分が所属するワークスペースのデータのみ参照・更新可能。

---

## 権限モデル

| 権限 | admin | editor | viewer |
|------|-------|--------|--------|
| 投稿作成・編集 | ✓ | ✓ | — |
| 投稿を直接予約 | ✓ | — | — |
| 承認申請 | ✓ | ✓ | — |
| 承認・却下 | ✓ | — | — |
| メンバー招待 | ✓ | — | — |
| 請求管理 | ✓ | — | — |
| アカウント接続 | ✓ | — | — |

---

## ディレクトリ構成

```
src/
├── app/
│   ├── (dashboard)/       # 認証済みレイアウト
│   │   ├── dashboard/
│   │   ├── compose/
│   │   ├── posts/
│   │   ├── queue/
│   │   ├── calendar/
│   │   ├── analytics/
│   │   ├── approvals/
│   │   ├── templates/
│   │   └── settings/
│   ├── actions/           # Server Actions
│   ├── api/ai/generate/   # AI 生成エンドポイント
│   ├── auth/              # Supabase Auth コールバック
│   ├── login/
│   ├── register/
│   └── forgot-password/
├── components/
│   ├── ui/               # shadcn/ui コンポーネント
│   ├── layout/           # AppSidebar, AppHeader
│   ├── compose/          # 投稿エディタ
│   ├── calendar/         # カレンダービュー
│   ├── analytics/        # アナリティクスチャート
│   └── settings/         # 設定フォーム群
├── lib/
│   └── supabase/         # client / server / middleware
└── types/
    └── database.ts       # Supabase 型定義
supabase/
├── migrations/           # DB マイグレーション
├── seed.sql
└── config.toml
```

---

## AI コンテンツ生成の設定

ワークスペース設定 → 「AI 設定」から API キーを登録:

| プロバイダー | 推奨モデル |
|------------|-----------|
| OpenAI | gpt-4o |
| Anthropic | claude-sonnet-4-6 |
| Groq | llama-3.3-70b-versatile |

API キーはサーバー側でのみ利用（クライアントに露出しない）。

---

## 開発

```bash
# 開発サーバー
npm run dev

# TypeScript チェック
npx tsc --noEmit

# Supabase ローカル確認
supabase studio   # http://localhost:54323
supabase db diff  # スキーマ差分確認
```

---

## ライセンス

[AGPL-3.0](./LICENSE) — セルフホストは自由。修正を配布する場合はソースコードの公開が必要。

SaaS として提供する場合は商用ライセンスをご相談ください: [postcabinets.co.jp](https://postcabinets.co.jp)

---

## Contributing

Issue・PR 歓迎。大きな変更の場合は Issue で先に議論してください。

---

Made with coffee by [POST CABINETS](https://postcabinets.co.jp)
