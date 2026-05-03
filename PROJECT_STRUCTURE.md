# プロジェクト構造

## ディレクトリ構成

```
task-calendar/
├── app/
│   ├── components/
│   │   ├── dnd/
│   │   │   └── DragDropProvider.tsx     # ドラッグアンドドロップ context provider
│   │   ├── Calendar.tsx                 # カレンダーコンポーネント
│   │   ├── TaskList.tsx                 # タスクリストコンポーネント
│   │   └── TaskItem.tsx                 # 個別タスクアイテムコンポーネント
│   ├── context/
│   │   └── TaskContext.ts               # Zustand による状態管理
│   ├── types/
│   │   └── index.ts                     # TypeScript型定義
│   ├── globals.css                      # グローバルスタイル
│   ├── layout.tsx                       # ルートレイアウト
│   └── page.tsx                         # メインページ
├── public/                              # 静的アセット
├── .eslintrc.json                       # ESLint設定
├── .gitignore                           # Git無視リスト
├── next.config.ts                       # Next.js設定
├── package.json                         # 依存関係とスクリプト
├── postcss.config.mjs                   # PostCSS設定
├── tailwind.config.ts                   # Tailwind CSS設定
└── tsconfig.json                        # TypeScript設定
```

## 主な機能

### 1. タスク管理 (`app/context/TaskContext.ts`)
- Zustandによる状態管理
- タスク追加・編集・削除
- タスクのスケジュール登録

### 2. UI コンポーネント
- **TaskList**: 未スケジュール状態のタスク一覧表示
- **Calendar**: 月単位のカレンダービュー
- **TaskItem**: 個別タスクの表示（ドラッグ対応）

### 3. ドラッグアンドドロップ
- react-beautiful-dnd を使用
- タスクをカレンダーの日付にドロップしてスケジュール登録
- スムーズなUX実装

### 4. スタイリング
- Tailwind CSS による高速スタイリング
- レスポンシブデザイン対応

## 開発コマンド

```bash
# 依存関係インストール
npm install

# 開発サーバー起動
npm run dev

# プロダクションビルド
npm run build

# ビルド成果物起動
npm start

# ESLint実行
npm run lint
```

## 次のステップ

1. **API ルートの実装**: `app/api/` に API エンドポイントを追加
2. **データベース連携**: タスクデータの永続化
3. **認証機能**: ユーザー認証の実装
4. **テスト**: Jest/React Testing Library によるテスト実装
5. **UX改善**: 通知機能、リマインダー、タスク優先度の複数表示など
