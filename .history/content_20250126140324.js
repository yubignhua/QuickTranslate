// 创建翻译结果显示框
const tooltip = document.createElement('div');
tooltip.style.cssText = `
  position: fixed;
  padding: 10px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  max-width: 300px;
  z-index: 10000;
  display: none;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 14px;
`;
document.body.appendChild(tooltip);

// 检测语言
function detectLanguage(text) {
  const chineseRegex = /[\u4e00-\u9fa5]/;
  return chineseRegex.test(text) ? 'zh' : 'en';
}

// 显示翻译结果
function showTranslation(text, x, y) {
  tooltip.style.left = `${x}px`;
  tooltip.style.top = `${y}px`;
  tooltip.textContent = text;
  tooltip.style.display = 'block';
}

// 隐藏翻译结果
function hideTranslation() {
  tooltip.style.display = 'none';
}

// 处理选中文本的翻译
async function handleSelectedText() {
  const selection = window.getSelection();
  const text = selection.toString().trim();
  
  if (!text) return;

  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();
  
  // 计算tooltip位置
  const x = rect.left + window.scrollX;
  const y = rect.bottom + window.scrollY + 5;

  // 显示加载状态
  showTranslation('翻译中...', x, y);

  // 发送翻译请求
  const sourceLang = detectLanguage(text);
  const targetLang = sourceLang === 'zh' ? 'en' : 'zh';

  try {
    const response = await chrome.runtime.sendMessage({
      action: 'translate',
      text: text,
      sourceLang: sourceLang,
      targetLang: targetLang
    });

    if (response.success) {
      showTranslation(response.translatedText, x, y);
    } else {
      showTranslation('翻译失败: ' + response.error, x, y);
    }
  } catch (error) {
    showTranslation('翻译失败: ' + error.message, x, y);
  }
}

// 监听来自 background script 的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getSelection') {
    handleSelectedText();
  }
});

// 点击页面其他地方时隐藏翻译结果
document.addEventListener('click', (e) => {
  if (e.target !== tooltip) {
    hideTranslation();
  }
});

// 按下 ESC 键时隐藏翻译结果
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    hideTranslation();
  }
}); 