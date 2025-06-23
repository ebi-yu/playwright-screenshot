import { load } from "https://deno.land/std@0.208.0/dotenv/mod.ts";

await load({ export: true });

// 環境変数から設定を読み込み
const baseURL = Deno.env.get('BASE_URL');
const loginPath = Deno.env.get('LOGIN_PATH') || '/';

if (!baseURL) {
  console.error('BASE_URLが設定されていません。.envファイルを確認してください。');
  Deno.exit(1);
}

// ログイン用URLを構築
const fullURL = `${baseURL}${loginPath}`;

console.log(`Playwright Code Generatorを起動します...`);
console.log(`URL: ${fullURL}`);

// playwright codegen コマンドを実行
try {
  const command = new Deno.Command('playwright', {
    args: ['codegen', fullURL],
    stdout: 'inherit',
    stderr: 'inherit'
  });
  
  const { code } = await command.output();
  console.log(`Code Generator終了コード: ${code}`);
} catch (error) {
  console.error('Code Generator起動エラー:', error.message);
  Deno.exit(1);
}