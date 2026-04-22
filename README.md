# hobby-dash

## このリポジトリの役割

`hobby-dash` は FEELCYCLE を中心に、趣味・体調・継続記録を気軽に見返すための個人用ダッシュボードです。  
仕事用の `signal-dash` とは分けて、習慣の積み上がりと振り返りを軽く確認することを優先します。

## 画面構成提案

MVP の画面は 3 つです。

1. `Overview`
   月次回数、直近記録、店舗別 / プログラム別集計を見る入口
2. `Records`
   FEELCYCLE 記録の一覧
3. `Record Detail`
   1件の記録について主観メモと体調メモを見返す詳細

## MVP ページ構成

```text
/
├── /               Overview
├── /records        記録一覧
└── /records/[id]   記録詳細
```

## ディレクトリ構成

```text
.
├── app
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx
│   └── records
│       ├── [id]
│       │   └── page.tsx
│       └── page.tsx
├── src
│   ├── components
│   │   ├── layout-shell.tsx
│   │   ├── record-list.tsx
│   │   └── stat-block.tsx
│   ├── data
│   │   └── sampleRecords.ts
│   ├── lib
│   │   └── records.ts
│   └── types
│       └── record.ts
├── next.config.ts
├── tsconfig.json
└── package.json
```

## MVP 実装内容

- FEELCYCLE 記録の一覧表示
- 月ごとの実施回数表示
- 直近の記録表示
- 店舗別、プログラム別の簡単な集計
- 主観メモと体調メモを見返せる記録詳細

グラフは入れず、文字情報と数の積み上がりが見える構成にしています。

## 採用技術

- Next.js App Router
- TypeScript
- React
- Supabase

読み出しは `src/lib/records.ts` に寄せていて、`feelcycle_workouts` テーブルを参照します。

## 環境変数

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

サーバーコンポーネントから Supabase を読むため、MVP では `SUPABASE_SERVICE_ROLE_KEY` を使います。

## 開発開始

依存インストール:

```bash
npm install
```

開発サーバ:

```bash
npm run dev
```

型チェック:

```bash
npm run check
```

Lint:

```bash
npm run lint
```

Build:

```bash
npm run build
```

## 今後の拡張ポイント

- 体調、睡眠、食事メモの追加
- 月ごとの振り返りメモ
- RLS 前提の読み取り構成への移行
