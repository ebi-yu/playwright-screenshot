import { join, dirname } from 'node:path';
import { ensureDirectoryExists } from '../utils/fileUtils.js';
import { setPageViewport } from '../utils/pageActions.js';

/**
 * ページの動的サイズを取得する（スクロール可能要素も含む）
 * @param {import('@playwright/test').Page} page - Playwrightページオブジェクト
 * @returns {Promise<{width: number, height: number}>} ページサイズ
 */
async function getDynamicPageSize(page) {
  return await page.evaluate(() => {
    const body = document.body;
    const html = document.documentElement;
    
    // 基本的なページサイズを取得
    let maxWidth = Math.max(
      body.scrollWidth,
      body.offsetWidth,
      html.clientWidth,
      html.scrollWidth,
      html.offsetWidth,
      window.innerWidth
    );
    
    let maxHeight = Math.max(
      body.scrollHeight,
      body.offsetHeight,
      html.clientHeight,
      html.scrollHeight,
      html.offsetHeight,
      window.innerHeight
    );
    
    // スクロール可能な要素を検索して、それらのサイズも考慮
    const scrollableElements = document.querySelectorAll('*');
    
    scrollableElements.forEach(element => {
      const computedStyle = window.getComputedStyle(element);
      const overflow = computedStyle.overflow;
      const overflowX = computedStyle.overflowX;
      const overflowY = computedStyle.overflowY;
      
      // スクロール可能な要素を判定
      if (
        overflow === 'auto' || overflow === 'scroll' ||
        overflowX === 'auto' || overflowX === 'scroll' ||
        overflowY === 'auto' || overflowY === 'scroll'
      ) {
        const rect = element.getBoundingClientRect();
        const elementRight = rect.left + element.scrollWidth;
        const elementBottom = rect.top + element.scrollHeight;
        
        if (elementRight > maxWidth) {
          maxWidth = elementRight;
        }
        if (elementBottom > maxHeight) {
          maxHeight = elementBottom;
        }
      }
    });
    
    // 最小サイズを保証
    maxWidth = Math.max(maxWidth, 1200);
    maxHeight = Math.max(maxHeight, 800);
    
    return { width: Math.ceil(maxWidth), height: Math.ceil(maxHeight) };
  });
}

/**
 * スクリーンショットのパスを生成する（動的サイズ用）
 * @param {string} screenshotDir - スクリーンショットディレクトリ
 * @param {string} pageName - ページ名
 * @returns {string} スクリーンショットファイルパス
 */
function generateDynamicScreenshotPath(screenshotDir, pageName) {
  const dynamicDir = screenshotDir.replace(/\/$/, '') + '/auto/';
  return join(dynamicDir, `${pageName}.png`);
}

/**
 * 動的サイズでスクリーンショットを取得する
 * @param {import('@playwright/test').Page} page - Playwrightページオブジェクト
 * @param {Object} pageInfo - ページ情報
 * @param {Object} config - 設定オブジェクト
 * @returns {Promise<{screenSize: Object, screenshotPath: string}>} 結果
 */
async function captureDynamicScreenshot(page, pageInfo, config) {
  // ページの実際のサイズを取得
  const pageSize = await getDynamicPageSize(page);
  
  const finalScreenSize = {
    width: pageSize.width,
    height: pageSize.height,
    name: 'auto'
  };
  
  console.log(`動的サイズを検出: ${finalScreenSize.width}x${finalScreenSize.height}`);
  
  // ビューポートサイズを設定
  await setPageViewport(page, finalScreenSize);
  
  // スクリーンショット撮影パス生成
  const screenshotPath = generateDynamicScreenshotPath(config.screenshotDir, pageInfo.pageName);
  
  // ディレクトリを作成
  ensureDirectoryExists(dirname(screenshotPath));
  
  return { screenSize: finalScreenSize, screenshotPath };
}

export {
  getDynamicPageSize,
  captureDynamicScreenshot
};