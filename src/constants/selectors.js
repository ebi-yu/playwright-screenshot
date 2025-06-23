/**
 * ボタンテキストから動的にセレクターを生成するためのテンプレート
 */
const BUTTON_SELECTOR_TEMPLATES = [
  'button:has-text("{text}")',
  'button.elp-button:has-text("{text}")',
  'button[name*="{text}"]',
  'input[type="submit"][value*="{text}"]',
  'button[type="submit"]:has-text("{text}")',
  '[role="button"]:has-text("{text}")',
  'input[type="button"][value*="{text}"]',
  'a:has-text("{text}")',
  '[data-testid*="{lowerText}"]',
  '[id*="{lowerText}"][type="button"]',
  '[id*="{lowerText}"][type="submit"]',
  'button[class*="{lowerText}"]',
  '.{lowerText}-button',
  'button.btn-{lowerText}',
  'button.{lowerText}-btn'
];

/**
 * ボタンテキストの配列からセレクターを生成する関数
 * @param {string[]} buttonTexts - ボタンテキストの配列
 * @returns {string[]} 生成されたセレクターの配列
 */
function generateButtonSelectors(buttonTexts) {
  return buttonTexts.flatMap(text => {
    const lowerText = text.toLowerCase();
    return BUTTON_SELECTOR_TEMPLATES.map(template => 
      template.replace('{text}', text).replace('{lowerText}', lowerText)
    );
  });
}

export {
  BUTTON_SELECTOR_TEMPLATES,
  generateButtonSelectors
};