# Playwright Screenshot Tool

Playwrightを使用した汎用的なWebサイトスクリーンショット取得ツールです。

## 機能

- 🔐 **オプショナル認証** - ログイン不要のサイトにも対応
- 🔑 **OTP対応** - ファイルベースのOTP入力（オプション）
- 📱 **レスポンシブ対応** - 複数画面サイズでの自動スクリーンショット
- 🎯 **自動高さ調整** - 横幅指定で高さは自動計算（16:9比率基準）
- 🔍 **自動ボタン押下実行** - ボタンがあるページでのボタン押下実行
- 📜 **スクロール対応** - 遅延読み込み要素表示のための段階的スクロール
- 🚫 **固定要素対応** - 固定ヘッダー等の一時非表示機能
- 🛠️ **Code Generator** - Playwright Code Generatorの環境変数対応
- ⚙️ **環境変数設定** - 全設定を環境変数で管理

## セットアップ

### 1. Denoの準備

Denoがインストールされていることを確認してください。

### 2. Playwrightブラウザのインストール

初回セットアップ時はPlaywrightブラウザのインストールが必要です：

```bash
deno task install
```

### 3. 環境変数の設定

`.env`ファイルを作成し、以下の設定を行ってください：

```env
# ===================================================================
# 必須環境変数 (Required Environment Variables)
# ===================================================================

# Target website base URL
BASE_URL=https://example.com

# ===================================================================
# 任意環境変数 (Optional Environment Variables)
# ===================================================================

# --- 認証関連 (Authentication) ---
REQUIRE_LOGIN=false
LOGIN_USERNAME=
LOGIN_PASSWORD=
LOGIN_PATH=

# --- OTP認証関連 (OTP Authentication) ---
REQUIRE_OTP=false
USE_OTP_FILE=true
OTP_FILE_DIR=./otp

# --- スクリーンショット設定 (Screenshot Settings) ---
# Page width (height will be automatically adjusted)
PAGE_SIZES=1180,414

# --- スクロール設定 (Scroll Settings) ---
# SCROLL_STEP=500
# SCROLL_DELAY=300
# MAX_SCROLLS=5

# --- 固定要素非表示設定 (Fixed Elements Settings) ---
# HIDE_FIXED_ELEMENTS=false
```

### 4. ページリストの設定

`pageList.json`ファイルでスクリーンショットを取得するページを設定：

```json
[
    {
        "pageName": "ページ名",
        "url": "ページURL"
    }
]
```

## 使い方

### スクリーンショット取得

```bash
# 通常実行
deno task screenshot

# デバッグモード
deno task screenshot:debug
```

### Code Generator

```bash
# 環境変数のドメインとログインパスでCode Generatorを起動
deno task codegen
```

## 設定オプション

### 環境変数一覧

| 変数名 | 説明 | デフォルト値 | 例 |
|--------|------|-------------|-----|
| `BASE_URL` | **[必須]** ベースドメインURL | - | `https://example.com` |
| `REQUIRE_LOGIN` | ログインが必要か | `false` | `true/false` |
| `LOGIN_USERNAME` | ログインユーザー名 | - | `user@example.com` |
| `LOGIN_PASSWORD` | ログインパスワード | - | `password123` |
| `LOGIN_PATH` | ログインページのパス | - | `/login` |
| `REQUIRE_OTP` | OTP認証が必要か | `false` | `true/false` |
| `USE_OTP_FILE` | OTPファイル入力を使用するか | `true` | `true/false` |
| `OTP_FILE_DIR` | OTPファイルの保存ディレクトリ | `./otp` | `./temp` |
| `PAGE_SIZES` | 画面横幅（カンマ区切り） | - | `1180,414` |
| `ENABLE_SCROLLING` | 遅延読み込み要素対応のスクロール機能 | `true` | `true/false` |
| `SCROLL_STEP` | 1回のスクロール量（px） | `500` | `500` |
| `SCROLL_DELAY` | スクロール間の待機時間（ms） | `300` | `300` |
| `MAX_SCROLLS` | 最大スクロール回数 | `5` | `5` |
| `HIDE_FIXED_ELEMENTS` | 固定要素の一時非表示機能 | `false` | `true/false` |

### PAGE_SIZES設定例

```env
# 単一サイズ（横幅のみ指定、高さは自動計算）
PAGE_SIZES=1180

# 複数サイズ（カンマ区切り）
PAGE_SIZES=1180,768,414

# デスクトップとスマホサイズ
PAGE_SIZES=1180,414

# 動的サイズ（ページに合わせて自動調整）
PAGE_SIZES=auto
```

**注意**: 高さは横幅に基づいて16:9比率で自動計算されます（最小800px保証）

## ファイル構成

```
ui-test/
├── src/
│   ├── config.js              # 設定管理
│   ├── index.js               # メインエントリポイント
│   ├── handlers/
│   │   └── otpHandler.js      # OTP処理
│   ├── services/
│   │   ├── browserService.js  # ブラウザ管理
│   │   └── screenshotService.js # スクリーンショット処理
│   └── utils/
│       ├── fileUtils.js       # ファイル操作
│       ├── loginUtils.js     # ログイン処理
│       └── pageActions.js     # ページ操作
├── screenshots/               # スクリーンショット保存先
├── .env                       # 環境変数設定
├── pageList.json             # ページリスト
├── codegen.js                # Code Generator起動スクリプト
└── screenshot.js             # スクリーンショット実行スクリプト
```

## OTP認証の使用方法

OTP認証が必要な場合：

1. `.env`で`REQUIRE_OTP=true`に設定
2. `USE_OTP_FILE=true`でファイルベース入力を有効化
3. スクリプト実行時に表示される指示に従ってOTPファイルにコードを保存

```bash
# 実行中に表示される例
=== OTP入力画面が表示されました ===
認証アプリから現在のOTPコードを確認してください
OTPコードを以下のファイルに保存してください:
ファイル名: ./otp/.otp

ファイル作成後、このプロセスが自動的に続行されます...
```

## トラブルシューティング

### よくある問題

1. **ログインに失敗する**
   - `.env`ファイルの認証情報を確認
   - `LOGIN_PATH`が正しいか確認

2. **OTPエラー**
   - `REQUIRE_OTP`の設定を確認
   - OTPファイルのパスと権限を確認

3. **スクリーンショットが取得できない**
   - `pageList.json`のURL形式を確認
   - ネットワーク接続を確認

4. **画面サイズが正しくない**
   - `PAGE_SIZES`の形式を確認
   - `auto`モードを試してみる

### デバッグモード

デバッグ情報を表示する場合：

```bash
deno task screenshot:debug
```

## ライセンス

MIT License