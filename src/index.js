import { CONFIG } from './config.js';
import { loadPageList } from './utils/fileUtils.js';
import { getOTPFromFile } from './handlers/otpHandler.js';
import { createAuthenticatedBrowser, closeBrowser } from './services/browserService.js';
import { captureAllScreenshots } from './services/screenshotService.js';

/**
 * メイン処理
 */
async function main() {
  console.log('=== スクリーンショット取得開始 ===');
  
  // ページリストを読み込み
  const pageList = loadPageList(CONFIG.pageListPath);
  if (pageList.length === 0) {
    console.error('ページリストが空です。pageList.jsonを確認してください。');
    return;
  }
  
  let browser, context;
  
  try {
    // ブラウザ起動とログイン
    ({ browser, context } = await createAuthenticatedBrowser(CONFIG, getOTPFromFile));
    
    // 全スクリーンショット取得
    await captureAllScreenshots(context, pageList, CONFIG.screenSizes, CONFIG);
    
  } catch (error) {
    console.error('実行エラー:', error);
    throw error;
  } finally {
    // リソース解放
    if (browser && context) {
      await closeBrowser(browser, context);
    }
  }
  
  console.log('\n=== 全スクリーンショット取得完了 ===');
}

// スクリプト実行
if (import.meta.main) {
  main().catch((error) => {
    console.error('実行エラー:', error);
    Deno.exit(1);
  });
}

export { main };