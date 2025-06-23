import { load } from "https://deno.land/std@0.208.0/dotenv/mod.ts";
import { expect } from '@playwright/test';

await load({ export: true });

/**
 * ログイン処理を実行する
 * @param {import('@playwright/test').Page} page - Playwrightのページオブジェクト
 * @param {string} username - ユーザー名
 * @param {string} password - パスワード
 * @param {string} otp - OTPコード
 */
async function login(page, username, password, otpCallback) {
  console.log('ログイン処理を開始します...');
  
  // ログインフォームの要素を待機
  await page.waitForLoadState('networkidle');
  
  try {
    // ユーザー名入力
    await page.getByRole('textbox', { name: 'ユーザー名またはメールアドレス' }).fill(username);
    console.log('ユーザー名を入力しました');
    
    // パスワード入力
    await page.getByRole('textbox', { name: 'パスワード' }).fill(password);
    console.log('パスワードを入力しました');
    
    // ログインボタンをクリック
    await page.getByRole('button', { name: 'ログイン' }).click();
    console.log('ログインボタンをクリックしました');
    
    // OTPが必要かどうかを環境変数で確認
    const requireOTP = process.env.REQUIRE_OTP === 'true';
    
    if (!requireOTP)   return;
    
    // OTP入力フィールドが表示されるまで待機
    await page.waitForSelector('input[aria-label="ワンタイムコード"], [name*="otp"], [placeholder*="ワンタイムコード"]', { timeout: 10000 });
    
    // OTP入力画面が表示されました
    console.log('\n=== OTP入力が必要です ===');
    
    let otp;
    if (typeof otpCallback === 'function') {
      console.log('OTPコールバック関数を実行中...');
      otp = await otpCallback();
      console.log('OTPを取得しました:', otp ? 'あり' : 'なし');
    } else {
      otp = otpCallback;
      console.log('OTP値を直接使用:', otp ? 'あり' : 'なし');
    }
    
    if (!otp) {
      throw new Error('OTPが提供されていません');
    }
    
    await page.getByRole('textbox', { name: 'ワンタイムコード' }).fill(otp);
    console.log('OTPを入力しました');
    
    await page.getByRole('button', { name: 'ログイン' }).click();
    console.log('ログインが完了しました');
    
  } catch (error) {
    console.error('ログイン処理中にエラーが発生しました:', error.message);
    
    // デバッグ情報を出力
    console.log('現在のURL:', page.url());
    console.log('ページタイトル:', await page.title());
    
    throw error;
  }
}


/**
 * ログイン状態を確認する
 * @param {import('@playwright/test').Page} page - Playwrightのページオブジェクト
 * @returns {Promise<boolean>} - ログイン状態
 */
async function isLoggedIn(page) {
  try {
    // ログイン状態を示す要素の存在を確認
    const loggedInIndicators = [
      'input[type="submit"][value="ログイン"]',
    ];
    
    for (const selector of loggedInIndicators) {
      const element = page.locator(selector).first();
      if (await element.isVisible({ timeout: 2000 })) {
        debugger; 
        return false;
      }
    }
    debugger; 
    // URLベースの確認
    const currentUrl = page.url();
    if (currentUrl.includes('/auth/realms') || currentUrl.endsWith('/')) {
      return false;
    }
    
    return true;
    
  } catch (error) {
    console.error('ログイン状態確認中にエラーが発生しました:', error.message);
    return false;
  }
}

export {
  login,
  isLoggedIn
};