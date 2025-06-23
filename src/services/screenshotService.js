import { join, dirname } from 'node:path';
import { ensureDirectoryExists } from '../utils/fileUtils.js';
import { 
  waitForPageLoad, 
  setPageViewport, 
  buildFullUrl,
  scrollToRevealContent,
  executeButtonAction
} from '../utils/pageActions.js';
import { captureDynamicScreenshot } from './dynamicSizeService.js';



/**
 * スクリーンショットのパスを生成する
 * @param {string} screenshotDir - スクリーンショットディレクトリ
 * @param {string} screenSizeName - 画面サイズ名
 * @param {string} pageName - ページ名
 * @returns {string} スクリーンショットファイルパス
 */
function generateScreenshotPath(screenshotDir, screenSizeName, pageName) {
  return join(screenshotDir, screenSizeName, `${pageName}.png`);
}


/**
 * 単一ページのスクリーンショットを取得する
 * @param {import('@playwright/test').BrowserContext} context - ブラウザコンテキスト
 * @param {Object} pageInfo - ページ情報
 * @param {Object} screenSize - 画面サイズ設定
 * @param {Object} config - 設定オブジェクト
 */
async function capturePageScreenshot(context, pageInfo, screenSize, config) {
  const page = await context.newPage();
  
  try {
    console.log(`${screenSize.name}: ${pageInfo.pageName} のスクリーンショット取得中...`);
    
    // ページにアクセス
    const fullUrl = buildFullUrl(pageInfo.url, config.baseURL);
    await page.goto(fullUrl, { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // ページの読み込み完了を待機
    await waitForPageLoad(page);
    
    await executeButtonAction(page, pageInfo.pageName, screenSize.name);

    
    // 遅延読み込み要素を表示するためのスクロール（設定で有効な場合のみ）
    if (config.enableScrolling) {
      await scrollToRevealContent(page, {
        scrollStep: config.scrollOptions.scrollStep,
        scrollDelay: config.scrollOptions.scrollDelay,
        maxScrolls: config.scrollOptions.maxScrolls,
        waitForContent: true
      });
    }

    // 動的サイズかどうかを判定（nameが'auto'の場合のみ）
    const isDynamicSize = screenSize.name === 'auto';
    
    let finalScreenSize = screenSize;
    let screenshotPath;
    
    if (isDynamicSize) {
      // 動的サイズでスクリーンショットを取得
      const result = await captureDynamicScreenshot(page, pageInfo, config);
      finalScreenSize = result.screenSize;
      screenshotPath = result.screenshotPath;
    } else {
      // 固定サイズの場合
      await setPageViewport(page, finalScreenSize);
      screenshotPath = generateScreenshotPath(
        config.screenshotDir, 
        finalScreenSize.name, 
        pageInfo.pageName
      );
    }
    
    // ディレクトリを作成
    ensureDirectoryExists(dirname(screenshotPath));
    
    // スクリーンショット取得直前の最終待機とスクロール位置確認
    await page.waitForTimeout(1000);
    await waitForPageLoad(page);
    
    // スクリーンショット取得直前にページトップに確実に戻る
    
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
      
      // 強制的にスクロールイベントを発火
      window.dispatchEvent(new Event('scroll'));
      
      // 元の設定に戻す
      document.documentElement.style.scrollBehavior = originalScrollBehavior;
      document.body.style.scrollBehavior = '';
    });
    
    // 最終的な位置調整後の待機
    await page.waitForTimeout(1000);
    
    // 最終スクロール位置確認と調整
    const finalScrollCheck = await page.evaluate(() => {
      return {
        scrollY: window.scrollY || window.pageYOffset,
        scrollTop: document.documentElement.scrollTop,
        bodyScrollTop: document.body.scrollTop
      };
    });
    
    if (finalScrollCheck.scrollY > 0 || finalScrollCheck.scrollTop > 0 || finalScrollCheck.bodyScrollTop > 0) {
      await page.evaluate(() => {
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      });
      await page.waitForTimeout(500);
    }
    
    
    // 固定要素による隠れを回避するため、一時的に非表示にする（設定で有効な場合のみ）
    let hiddenElements = 0;
    if (config.hideFixedElements) {
      hiddenElements = await page.evaluate(() => {
        const elementsToHide = [];
        
        // 固定・sticky要素を特定
        const allElements = document.querySelectorAll('*');
        for (const element of allElements) {
          const styles = window.getComputedStyle(element);
          if (styles.position === 'fixed' || styles.position === 'sticky') {
            const rect = element.getBoundingClientRect();
            // 上部に位置する要素のみ対象
            if (rect.top <= 100) {
              elementsToHide.push({
                element: element,
                originalDisplay: element.style.display,
                originalVisibility: element.style.visibility
              });
              element.style.display = 'none';
            }
          }
        }
        
        return elementsToHide.length;
      });
      
      if (hiddenElements > 0) {
        await page.waitForTimeout(500);
      }
    }
    
    // フルページスクリーンショットの取得
    await page.screenshot({
      path: screenshotPath,
      fullPage: true,
      // クリップ範囲を明示的に指定（念のため）
      clip: undefined
    });
    
    // 非表示にした要素を元に戻す
    if (config.hideFixedElements && hiddenElements > 0) {
      await page.evaluate(() => {
        const allElements = document.querySelectorAll('*');
        for (const element of allElements) {
          const styles = window.getComputedStyle(element);
          if (styles.position === 'fixed' || styles.position === 'sticky') {
            if (element.style.display === 'none') {
              element.style.display = '';
              element.style.visibility = '';
            }
          }
        }
      });
    }
    
    console.log(`✓ ${finalScreenSize.name}: ${pageInfo.pageName} 保存完了: ${screenshotPath}`);
    
  } catch (error) {
    console.error(`✗ ${screenSize.name}: ${pageInfo.pageName} エラー: ${error.message}`);
  } finally {
    await page.close();
  }
}

/**
 * 全ページのスクリーンショットを取得する
 * @param {import('@playwright/test').BrowserContext} context - ブラウザコンテキスト
 * @param {Array} pageList - ページリスト
 * @param {Array} screenSizes - 画面サイズリスト
 * @param {Object} config - 設定オブジェクト
 */
async function captureAllScreenshots(context, pageList, screenSizes, config) {
  for (const screenSize of screenSizes) {
    console.log(`\n=== ${screenSize.name}: スクリーンショット取得開始 ===`);
    
    for (const pageInfo of pageList) {
      await capturePageScreenshot(context, pageInfo, screenSize, config);
    }
    
    console.log(`=== ${screenSize.name}: 完了 ===`);
  }
}

export {
  captureAllScreenshots,
  capturePageScreenshot
};