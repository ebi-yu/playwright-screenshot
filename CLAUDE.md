# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 言語設定
- **すべての回答は日本語で行ってください**

## Project Overview

This is a UI testing project for automated responsive design testing using Playwright. The primary goal is to capture screenshots of websites across multiple screen sizes to verify layout consistency.

## Environment Configuration

### 必須環境変数 (Required Environment Variables)
- `BASE_URL`: 対象サイトのベースURL (例: https://ebi-yu.github.io)

### 任意環境変数 (Optional Environment Variables)

#### 認証関連 (Authentication)
- `REQUIRE_LOGIN`: ログインが必要かどうか (default: false)
- `LOGIN_USERNAME`: ログイン用ユーザー名
- `LOGIN_PASSWORD`: ログイン用パスワード  
- `LOGIN_PATH`: ログインエンドポイントパス

#### OTP認証関連 (OTP Authentication)
- `REQUIRE_OTP`: OTP認証が必要かどうか (default: false)
- `USE_OTP_FILE`: OTPをファイルから読み込むかどうか (default: true)
- `OTP_FILE_DIR`: OTPファイルのディレクトリ (default: ./otp)

#### スクリーンショット設定 (Screenshot Settings)
- `PAGE_SIZES`: 画面横幅の指定（数値のみ、高さは自動調整）

#### ボタン操作設定 (Button Action Settings)
- `BUTTON_TEXTS`: 押下するボタンのテキスト（カンマ区切りで複数指定可能）

#### スクロール設定 (Scroll Settings)
- `ENABLE_SCROLLING`: 遅延読み込み要素対応のスクロール機能 (default: true)
- `SCROLL_STEP`: 1回のスクロール量（px）(default: 500)
- `SCROLL_DELAY`: スクロール間の待機時間（ms）(default: 300)
- `MAX_SCROLLS`: 最大スクロール回数 (default: 5)
- `HIDE_FIXED_ELEMENTS`: 固定要素の一時非表示機能 (default: false)

## Key Project Constraints

- Focus on screenshot capture rather than direct responsive design validation
- Use Playwright as the testing framework
- Environment variables are used for configuration and sensitive data
- Support for optional login and OTP authentication

## Development Setup

The project has been migrated from Node.js to Deno and includes:
- Deno configuration for automated testing with Playwright
- Environment-based configuration system using Deno's standard library
- Optional authentication flow support
- Screenshot capture functionality

### Running the Project

```bash
# Take screenshots
deno task screenshot

# Take screenshots with debug mode
deno task screenshot:debug

# Run code generator
deno task codegen
```

### Requirements
- Deno runtime installed
- Playwright dependencies (managed through npm imports in deno.json)

### Initial Setup

初回セットアップ時はPlaywrightブラウザのインストールが必要です：

```bash
# Playwrightブラウザをインストール
deno task install
```
