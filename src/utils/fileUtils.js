import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

/**
 * ページリストを読み込む
 * @param {string} pageListPath - ページリストファイルのパス
 * @returns {Array} ページリスト
 */
function loadPageList(pageListPath) {
  try {
    const rawData = readFileSync(pageListPath, 'utf8');
    const pageList = JSON.parse(rawData);
    return pageList;
  } catch (error) {
    console.error('ページリスト読み込みエラー:', error.message);
    return [];
  }
}

/**
 * ディレクトリを作成する
 * @param {string} dirPath - 作成するディレクトリのパス
 */
function ensureDirectoryExists(dirPath) {
  mkdirSync(dirPath, { recursive: true });
}

/**
 * ファイルの存在確認
 * @param {string} filePath - ファイルパス
 * @returns {boolean} ファイルが存在するか
 */
function fileExists(filePath) {
  return existsSync(filePath);
}

/**
 * ファイルを作成する（Windows側からも編集可能）
 * @param {string} filePath - ファイルパス
 * @param {string} content - ファイル内容（デフォルト: 空文字）
 */
function createFile(filePath, content = '') {
  try {
    writeFileSync(filePath, content, { 
      encoding: 'utf8',
      mode: 0o666 // Windows側からも編集可能な権限
    });
  } catch (error) {
    console.error('ファイル作成エラー:', error.message);
  }
}

/**
 * ファイルを読み込む
 * @param {string} filePath - ファイルパス
 * @returns {string} ファイル内容
 */
function readFile(filePath) {
  try {
    const content = readFileSync(filePath, 'utf8');
    return content;
  } catch (error) {
    return '';
  }
}

/**
 * ファイルをリセットする
 * @param {string} filePath - ファイルパス
 */
function resetFile(filePath) {
  try {
    writeFileSync(filePath, '', 'utf8');
    // ファイルハンドルを確実に閉じるために少し待機
    setTimeout(() => {
      // 何もしない、ただファイルハンドルが閉じられるのを待つ
    }, 100);
  } catch (error) {
    console.error('ファイルリセットエラー:', error.message);
  }
}

export {
  loadPageList,
  ensureDirectoryExists,
  fileExists,
  readFile,
  resetFile,
  createFile
};