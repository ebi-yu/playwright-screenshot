import { load } from "https://deno.land/std@0.208.0/dotenv/mod.ts";
import { chromium } from 'playwright';
import { login } from '../utils/loginUtils.js';

await load({ export: true });

/**
 * ブラウザを起動し、ログイン済みコンテキストを作成する
 * @param {Object} config - 設定オブジェクト
 * @param {Function} otpCallback - OTP取得コールバック
 * @returns {Promise<{browser: Browser, context: BrowserContext}>}
 */
async function createAuthenticatedBrowser(config, otpCallback) {
  console.log('\n=== ブラウザ起動 ===');
  const browser = await chromium.launch({ headless: false });
  
  // 共有コンテキストを作成（ログインセッション用）
  const context = await browser.newContext();
  
  // ログイン用ページを作成
  const loginPage = await context.newPage();
  const loginPath = process.env.LOGIN_PATH;
  
  // REQUIRE_LOGINがtrueで、LOGIN_USERNAME、LOGIN_PASSWORD、LOGIN_PATHが全て設定されている場合のみログイン処理を実行
  const requireLogin = process.env.REQUIRE_LOGIN === 'true';
  
  if (requireLogin && config.credentials.username && config.credentials.password && loginPath) {
    await loginPage.goto(`${config.baseURL}${loginPath}`);
    console.log('\n=== ログイン処理開始 ===');
    await login(loginPage, config.credentials.username, config.credentials.password, otpCallback);
    console.log('=== ログイン完了 ===');
  } else {
    if (requireLogin) {
      console.log('\n=== ログイン情報が不足しています。ログイン処理をスキップします ===');
    }
    // ログインパスが設定されている場合はそちらに、なければベースURLに移動
    await loginPage.goto(loginPath ? `${config.baseURL}${loginPath}` : config.baseURL);
  }
  
  return { browser, context };
}

/**
 * ブラウザとコンテキストを閉じる
 * @param {Browser} browser - ブラウザインスタンス
 * @param {BrowserContext} context - ブラウザコンテキスト
 */
async function closeBrowser(browser, context) {
  await context.close();
  await browser.close();
}

export {
  createAuthenticatedBrowser,
  closeBrowser
};