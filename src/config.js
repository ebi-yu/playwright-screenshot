import { load } from "https://deno.land/std@0.208.0/dotenv/mod.ts";
await load({ export: true });

/**
 * アプリケーション設定
 */
function parsePageSizes(pageSizesStr) {
  // 空文字列または未設定の場合は動的サイズを使用
  if (!pageSizesStr || pageSizesStr.trim() === '') {
    return [{ width: 0, height: 0, name: 'auto' }];
  }
  
  const sizeStr = pageSizesStr.trim();
  
  // 'auto'キーワードの場合
  if (sizeStr.toLowerCase() === 'auto') {
    return [{ width: 0, height: 0, name: 'auto' }];
  }
  
  // カンマ区切りの横幅を処理
  const widths = sizeStr.split(',').map(w => w.trim());
  const sizes = [];
  
  for (const widthStr of widths) {
    const width = parseInt(widthStr, 10);
    if (!isNaN(width)) {
      // 高さは幅に基づいて適切な値を設定（16:9比率を基準）
      const height = Math.max(Math.round(width * 9 / 16), 800);
      sizes.push({ width, height, name: `${width}w` });
    }
  }
  
  // 有効な横幅が一つもない場合は自動サイズを使用
  if (sizes.length === 0) {
    return [{ width: 0, height: 0, name: 'auto' }];
  }
  
  return sizes;
}

const CONFIG = {
  baseURL: Deno.env.get('BASE_URL'),
  screenSizes: parsePageSizes(Deno.env.get('PAGE_SIZES')),
  credentials: {
    username: Deno.env.get('LOGIN_USERNAME'),
    password: Deno.env.get('LOGIN_PASSWORD')
  },
  screenshotDir: `./screenshots/${new Date().toISOString()}/`,
  pageListPath: './pageList.json',
  // スクロール設定
  enableScrolling: Deno.env.get('ENABLE_SCROLLING') !== 'false', // デフォルトはtrue
  scrollOptions: {
    scrollStep: parseInt(Deno.env.get('SCROLL_STEP') || '500', 10),
    scrollDelay: parseInt(Deno.env.get('SCROLL_DELAY') || '300', 10),
    maxScrolls: parseInt(Deno.env.get('MAX_SCROLLS') || '5', 10)
  },
  // 固定要素非表示設定
  hideFixedElements: Deno.env.get('HIDE_FIXED_ELEMENTS') === 'true' // デフォルトはfalse
};

export { CONFIG };