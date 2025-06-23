// メインエントリーポイント
import { main } from './src/index.js';

// 実行
main().catch((error) => {
  console.error('実行エラー:', error);
  Deno.exit(1);
});