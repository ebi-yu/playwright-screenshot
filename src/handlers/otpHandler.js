import { load } from "https://deno.land/std@0.208.0/dotenv/mod.ts";
import { join } from 'node:path';
import { fileExists, readFile, resetFile, createFile } from '../utils/fileUtils.js';

await load({ export: true });

/**
 * otpファイルからOTPを取得する（リアルタイム）
 * @returns {Promise<string>} OTPコード
 */
function getOTPFromFile() {
  return new Promise((resolve) => {
    const useOtpFile = process.env.USE_OTP_FILE === 'true';
    const otpDir = process.env.OTP_FILE_DIR || './otp';
    
    if (!useOtpFile) {
      console.log('\n=== OTP入力モードが無効です ===');
      console.log('USE_OTP_FILE=true を .env に設定してください');
      return;
    }

    console.log('\n=== OTP入力画面が表示されました ===');
    console.log('認証アプリから現在のOTPコードを確認してください');
    console.log('OTPコードを以下のファイルに保存してください:');
    console.log(`ファイル名: ${join(otpDir, '.otp')}`);
    console.log('');
    console.log('ファイル作成後、このプロセスが自動的に続行されます...');

    const otpFile = join(Deno.cwd(), otpDir, '.otp');
    
    // ファイルの存在を定期的に確認
    const checkFile = () => {
      if (!fileExists(otpFile)) createFile(otpFile);

      try {
        const otp = readFile(otpFile).trim();
        if (otp.length === 6) {
            console.log(`OTP取得完了: ${otp}`);
            // ファイルを削除
            resetFile(otpFile);
            resolve(otp);
            return;
          }
        } catch (err) {
          console.error('OTPファイル読み込みエラー:', err.message);
        }
      
      
      // 1秒後に再チェック
      setTimeout(checkFile, 1000);
    };
    
    checkFile();
  });
}

export {
  getOTPFromFile
};