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
- サンプル JSON データ

最初は `src/data/sampleRecords.ts` の静的データで動かし、後から DB に差し替えやすいように読み出しは `src/lib/records.ts` に寄せています。

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

- FEELCYCLE CLI リポジトリの JSON を読む
- 体調、睡眠、食事メモの追加
- 月ごとの振り返りメモ
- Supabase などへの保存差し替え
