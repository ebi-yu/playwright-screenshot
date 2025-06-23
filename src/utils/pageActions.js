import { generateButtonSelectors } from '../constants/selectors.js';

/**
 * ページで指定されたボタンを押下する汎用関数
 * @param {import('@playwright/test').Page} page - Playwrightページオブジェクト
 * @param {string} pageName - ページ名（ログ用）
 * @param {string} screenSize - 画面サイズ名（ログ用）
 * @param {string} actionName - アクション名（ログ用）
 */
async function executeButtonAction(page, pageName, screenSize, actionName = 'ボタン押下') {
  try {
    // 環境変数からボタンテキストを取得
    const buttonTexts = Deno.env.get('BUTTON_TEXTS')?.split(',').map(text => text.trim()) || [];
    
    if (!buttonTexts || buttonTexts.length === 0) {
      return;
    }

    let foundButton = null;
    let usedSelector = null;
    
    // ボタンテキストからセレクターを生成
    const allSelectors = generateButtonSelectors(buttonTexts);
    
    // 各セレクターを試す
    for (const selector of allSelectors) {
      try {
        const button = page.locator(selector).first();
        if (await button.isVisible({ timeout: 1000 })) {
          foundButton = button;
          usedSelector = selector;
          break;
        }
      } catch (error) {
        // このセレクターでは見つからなかった
        continue;
      }
    }
    
    if (!foundButton) return;
    
    console.log(`${screenSize}: ${pageName} で${actionName}を実行中...`);
    
    // ボタンをクリック
    await foundButton.click();
    
    // 読み込み完了を待機
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // Vue3のローディング状態も確認
    await waitForVueLoading(page);
    
    console.log(`${screenSize}: ${pageName} ${actionName}の読み込み完了`);
    
  } catch (error) {
    // ボタンがない場合やエラーの場合は無視して続行
    console.log(`${screenSize}: ${pageName} ${actionName}でエラーが発生: ${error.message}`);
  }
}


/**
 * Vue3のv-loadingが終了するまで待機する
 * @param {import('@playwright/test').Page} page - Playwrightページオブジェクト
 */
async function waitForVueLoading(page) {
  try {
    // v-loading属性またはel-loadingクラスを持つ要素を探す
    const loadingSelectors = [
      '[v-loading="true"]',
      '.el-loading-mask',
      '.el-loading-spinner',
      '[data-loading="true"]',
      '.loading'
    ];
    
    for (const selector of loadingSelectors) {
      try {
        // ローディング要素が存在するか確認
        const loadingElement = page.locator(selector).first();
        
        if (await loadingElement.isVisible({ timeout: 1000 })) {
          console.log('Vue3ローディングを検出しました。完了まで待機中...');
          
          // ローディングが消えるまで待機
          await loadingElement.waitFor({ 
            state: 'hidden', 
            timeout: 30000 
          });
          
          console.log('Vue3ローディングが完了しました');
          break;
        }
      } catch (error) {
        // このセレクターでは見つからなかった場合は次のセレクターを試す
        continue;
      }
    }
    
    // 追加の待機時間
    await page.waitForTimeout(500);
    
  } catch (error) {
    // ローディング要素が見つからない場合は通常の処理を続行
    console.log('Vue3ローディング要素が見つからないか、エラーが発生しました:', error.message);
  }
}

/**
 * ページの読み込みを待機する
 * @param {import('@playwright/test').Page} page - Playwrightページオブジェクト
 */
async function waitForPageLoad(page) {
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  
  // Vue3のローディング状態も確認
  await waitForVueLoading(page);
}


/**
 * ページのビューポートサイズを設定する
 * @param {import('@playwright/test').Page} page - Playwrightページオブジェクト
 * @param {Object} screenSize - 画面サイズ設定
 */
async function setPageViewport(page, screenSize) {
  // ビューポートサイズを設定
  await page.setViewportSize({ width: screenSize.width, height: screenSize.height });
  
}

/**
 * 完全なURLを生成する
 * @param {string} url - 相対または絶対URL
 * @param {string} baseURL - ベースURL
 * @returns {string} 完全なURL
 */
function buildFullUrl(url, baseURL) {
  return url.startsWith('http') ? url : baseURL + url;
}

/**
 * ページを段階的にスクロールして遅延読み込み要素を表示する
 * @param {import('@playwright/test').Page} page - Playwrightページオブジェクト
 * @param {Object} options - スクロールオプション
 */
async function scrollToRevealContent(page, options = {}) {
  const {
    scrollStep = 500,        // 1回のスクロール量（px）
    scrollDelay = 800,       // スクロール間の待機時間（ms）
    maxScrolls = 20,         // 最大スクロール回数
    waitForContent = true    // コンテンツ読み込み待機
  } = options;

  try {
    
    // ページの全体の高さを取得
    let lastHeight = await page.evaluate(() => document.body.scrollHeight);
    let scrollCount = 0;
    
    while (scrollCount < maxScrolls) {
      // 段階的にスクロール
      await page.evaluate((step) => {
        window.scrollBy(0, step);
      }, scrollStep);
      
      // スクロール後の待機
      await page.waitForTimeout(scrollDelay);
      
      // 遅延読み込みコンテンツの読み込み待機
      if (waitForContent) {
        try {
          await page.waitForLoadState('networkidle', { timeout: 3000 });
        } catch (error) {
          // networkidle待機がタイムアウトしても続行
        }
      }
      
      // 新しいコンテンツが読み込まれたかチェック
      const newHeight = await page.evaluate(() => document.body.scrollHeight);
      
      if (newHeight === lastHeight) {
        // 高さが変わらない場合、さらに少しスクロールして確認
        scrollCount++;
      } else {
        // 新しいコンテンツが読み込まれた場合、カウンターをリセット
        lastHeight = newHeight;
        scrollCount = 0;
        }
    }
    
    // 最後にページトップに戻る（複数の方法で確実に）
    await page.evaluate(() => {
      // CSSのスムーススクロールを一時的に無効化
      const originalScrollBehavior = document.documentElement.style.scrollBehavior;
      document.documentElement.style.scrollBehavior = 'auto';
      document.body.style.scrollBehavior = 'auto';
      
      // 複数の方法でトップに戻る
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      
      // スムーススクロールが有効になっている場合の対処
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      
      // 元の設定に戻す
      document.documentElement.style.scrollBehavior = originalScrollBehavior;
      document.body.style.scrollBehavior = '';
    });
    
    // スクロール完了後の最終待機
    await page.waitForTimeout(1000);
    
    // スクロール位置が0でない場合は再度調整
    const scrollPosition = await page.evaluate(() => {
      return {
        windowY: window.scrollY || window.pageYOffset,
        documentY: document.documentElement.scrollTop,
        bodyY: document.body.scrollTop
      };
    });
    
    if (scrollPosition.windowY > 0 || scrollPosition.documentY > 0 || scrollPosition.bodyY > 0) {
      await page.evaluate(() => {
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
        window.dispatchEvent(new Event('scroll'));
      });
      await page.waitForTimeout(500);
    }
    
    
  } catch (error) {
    console.warn('スクロール中にエラーが発生:', error.message);
    // エラーが発生してもページトップに戻る
    try {
      await page.evaluate(() => window.scrollTo(0, 0));
    } catch (scrollError) {
      // スクロールエラーは無視
    }
  }
}

export {
  executeButtonAction,
  waitForPageLoad,
  setPageViewport,
  buildFullUrl,
  scrollToRevealContent
};