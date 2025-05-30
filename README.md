# align-assignment

TypeScriptで書かれたESLintプラグイン。コード内の変数宣言、代入文、オブジェクトプロパティを美しく整列させます。

## インストール

```bash
npm install --save-dev align-assignment
```

## 使用方法

ESLintの設定ファイルに以下を追加します：

```javascript
import alignAssignment from "align-assignment";

export default [
  {
    plugins: { "align-assignment": alignAssignment },
  },
  {
    rules: {
      "align-assignment/align-assignments": ["error"],
      "align-assignment/align-object-properties": ["error"],
    },
  },
];
```

## ルール

### align-assignments

変数宣言や代入文の`=`記号を整列させます。

**修正前：**
```javascript
const A = require('a');
const ABC = require('abc');
let foo = 'bar';

// クラスプロパティも対応
class Example {
  private users = [];
  private nextId = 1;
}
```

**修正後：**
```javascript
const A   = require('a');
const ABC = require('abc');
let foo   = 'bar';

// クラスプロパティも対応
class Example {
  private users  = [];
  private nextId = 1;
}
```

### align-object-properties

オブジェクトリテラルやインターフェースのプロパティのコロンを整列させます。

**修正前：**
```javascript
const ENDPOINTS = {
  users: '/users',
  posts: '/posts',
  comments: '/comments',
  notifications: '/notifications'
};

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}
```

**修正後：**
```javascript
const ENDPOINTS = {
  users         : '/users',
  posts         : '/posts',
  comments      : '/comments',
  notifications : '/notifications'
};

interface User {
  id    : number;
  name  : string;
  email : string;
  role  : string;
}
```

## 特徴

- ✅ TypeScript/ES2022の最新構文に対応
- ✅ 自動修正機能（`--fix`）対応
- ✅ 空行でグループを分けて整列
- ✅ クラスプロパティ、静的プロパティにも対応
- ✅ オブジェクトリテラル、インターフェース、型リテラルに対応

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