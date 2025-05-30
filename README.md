# 🎯 sai-tom-lint

> 🚀 **美しいコード整列のためのESLintプラグイン**  
> TypeScriptで書かれた、変数宣言・代入文・オブジェクトプロパティを自動で整列させるローカル開発ツール

## ✨ 特徴

- 🎨 **美しい整列**: 変数宣言、代入文、オブジェクトプロパティを自動で整列
- ⚡ **自動修正**: `--fix` オプションで一発修正
- 🔧 **TypeScript対応**: 最新のTypeScript/ES2022構文に完全対応
- 📦 **軽量**: 依存関係が少なく、高速動作
- 🎯 **柔軟性**: 空行でグループ分けして整列

## 📦 セットアップ

このプロジェクトをクローンして使用します：

```bash
# リポジトリをクローン
git clone <repository-url>
cd sai-tom-lint

# 依存関係をインストール
npm install

# ビルド
npm run build
```

## 🚀 使用方法

### 1. プロジェクトでの使用

ESLintの設定ファイル（`eslint.config.js`）で、ローカルプラグインとして使用：

```javascript
import alignAssignment from "./path/to/sai-tom-lint/dist/index.js";

export default [
  {
    plugins: { 
      "align-assignment": alignAssignment 
    },
    rules: {
      "align-assignment/align-assignments": "error",
      "align-assignment/align-object-properties": "error",
    },
  },
];
```

### 2. このプロジェクト内での開発・テスト

```bash
# テスト実行
npm test

# サンプルファイルでテスト
npx eslint examples/ --fix
```

## ルール

### align-assignments

変数宣言や代入文の`=`記号を整列させます。

#### 📝 例

```javascript
// 修正前
const A = require('a');
const ABC = require('abc');
let foo = 'bar';

// ↓ 修正後
const A   = require('a');
const ABC = require('abc');
let foo   = 'bar';
```

```javascript
// クラスプロパティの例
// 修正前
class Example {
  private users = [];
  private nextId = 1;
}

// ↓ 修正後
class Example {
  private users  = [];
  private nextId = 1;
}
```

---

### align-object-properties

オブジェクトリテラルやインターフェースのプロパティのコロンを整列させます。

#### 📝 例

```javascript
// 修正前
const ENDPOINTS = {
  users: '/users',
  posts: '/posts',
  comments: '/comments',
  notifications: '/notifications'
};

// ↓ 修正後
const ENDPOINTS = {
  users         : '/users',
  posts         : '/posts',
  comments      : '/comments',
  notifications : '/notifications'
};
```

```javascript
// インターフェースの例
// 修正前
interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

// ↓ 修正後
interface User {
  id    : number;
  name  : string;
  email : string;
  role  : string;
}
```

---

## 📋 対応構文

| 構文 | `align-assignments` | `align-object-properties` |
|------|:-------------------:|:-------------------------:|
| 変数宣言 (`const`, `let`, `var`) | ✅ | - |
| 代入文 | ✅ | - |
| クラスプロパティ | ✅ | - |
| 静的プロパティ | ✅ | - |
| オブジェクトリテラル | - | ✅ |
| TypeScriptインターフェース | - | ✅ |
| 型リテラル | - | ✅ |

---

## 開発

### ビルド

```bash
npm run build
```

### テスト

```bash
npm test
```

### 新しいルールの追加

1. `src/rules/`にルールファイルを作成
2. `src/index.ts`にルールを追加
3. `tests/lib/rules/`にテストファイルを作成
4. ビルドとテストを実行

テンプレートファイル：
- ルール: `src/rules/rule-template.ts.example`
- テスト: `tests/lib/rules/rule-test-template.test.ts.example`

## ライセンス

MIT 