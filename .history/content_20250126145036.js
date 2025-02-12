// 创建翻译结果显示框
const tooltip = document.createElement('div');
tooltip.className = 'ai-translate-tooltip';
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

// 处理选中文本
document.addEventListener('mouseup', async (e) => {
  const selection = window.getSelection();
  const text = selection.toString().trim();
  
  if (!text) {
    hideTranslation();
    return;
  }

  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();
  
  // 计算tooltip位置
  const x = rect.left + window.scrollX;
  const y = rect.bottom + window.scrollY + 5;

  // 显示加载状态
  showTranslation('翻译中...', x, y);
  tooltip.classList.add('loading');

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

    tooltip.classList.remove('loading');
    
    if (response.success) {
      showTranslation(response.translatedText, x, y);
    } else {
      showTranslation('翻译失败: ' + response.error, x, y);
    }
  } catch (error) {
    tooltip.classList.remove('loading');
    showTranslation('翻译失败: ' + error.message, x, y);
  }
});

// 点击页面其他地方时隐藏翻译结果
document.addEventListener('click', (e) => {
  if (!tooltip.contains(e.target)) {
    hideTranslation();
  }
});

// 按下 ESC 键时隐藏翻译结果
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    hideTranslation();
  }
}); 