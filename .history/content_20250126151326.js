// 创建翻译图标和结果显示框
const translateIcon = document.createElement('div');
translateIcon.className = 'ai-translate-icon';
translateIcon.style.display = 'none'; // 初始状态设置为隐藏
translateIcon.innerHTML = `
  <svg viewBox="0 0 24 24" width="16" height="16">
    <path fill="currentColor" d="M12.87 15.07l-2.54-2.51.03-.03A17.52 17.52 0 0014.07 6H17V4h-7V2H8v2H1v2h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"/>
  </svg>
`;

// 确保图标添加到页面
if (document.body) {
  document.body.appendChild(translateIcon);
  console.log('翻译图标已添加到页面');
} else {
  // 如果 body 还不存在，等待 DOM 加载完成
  document.addEventListener('DOMContentLoaded', () => {
    document.body.appendChild(translateIcon);
    console.log('翻译图标已添加到页面 (DOMContentLoaded)');
  });
}

const tooltip = document.createElement('div');
tooltip.className = 'ai-translate-tooltip';
document.body.appendChild(tooltip);

// 检测语言
function detectLanguage(text) {
  const chineseRegex = /[\u4e00-\u9fa5]/;
  return chineseRegex.test(text) ? 'zh' : 'en';
}

// 显示翻译图标
function showTranslateIcon(x, y) {
  console.log('显示翻译图标:', { x, y, display: 'flex' });
  translateIcon.style.cssText = `
    display: flex !important;
    position: fixed !important;
    left: ${x}px !important;
    top: ${y}px !important;
    z-index: 2147483647 !important;
  `;
}

// 隐藏翻译图标
function hideTranslateIcon() {
  translateIcon.style.display = 'none';
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
let selectedText = '';
let selectionRect = null;

document.addEventListener('mouseup', (e) => {
  console.log('mouseup 事件触发');
  
  // 如果点击的是翻译图标或翻译结果框，不处理
  if (translateIcon.contains(e.target) || tooltip.contains(e.target)) {
    console.log('点击了翻译图标或提示框，不处理');
    return;
  }

  // 立即隐藏之前的图标和提示
  hideTranslateIcon();
  hideTranslation();

  // 使用 requestAnimationFrame 确保在下一帧处理选中文本
  requestAnimationFrame(() => {
    const selection = window.getSelection();
    selectedText = selection.toString().trim();
    
    console.log('选中的文本:', selectedText);
    
    if (!selectedText) {
      console.log('没有选中文本');
      return;
    }

    try {
      const range = selection.getRangeAt(0);
      selectionRect = range.getBoundingClientRect();
      
      // 显示翻译图标在选中文本的右上方
      const iconX = selectionRect.right + window.scrollX + 5;
      const iconY = selectionRect.top + window.scrollY - 20;
      
      console.log('准备显示翻译图标');
      showTranslateIcon(iconX, iconY);
      console.log('翻译图标当前状态:', {
        display: translateIcon.style.display,
        left: translateIcon.style.left,
        top: translateIcon.style.top,
        zIndex: translateIcon.style.zIndex
      });
    } catch (error) {
      console.error('获取选中文本位置失败:', error);
      hideTranslateIcon();
    }
  });
});

// 点击翻译图标进行翻译
translateIcon.addEventListener('click', async () => {
  if (!selectedText || !selectionRect) return;

  // 计算tooltip位置
  const tooltipX = selectionRect.left + window.scrollX;
  const tooltipY = selectionRect.bottom + window.scrollY + 5;

  // 显示加载状态
  showTranslation('翻译中...', tooltipX, tooltipY);
  tooltip.classList.add('loading');

  // 发送翻译请求
  const sourceLang = detectLanguage(selectedText);
  const targetLang = sourceLang === 'zh' ? 'en' : 'zh';

  try {
    const response = await chrome.runtime.sendMessage({
      action: 'translate',
      text: selectedText,
      sourceLang: sourceLang,
      targetLang: targetLang
    });

    tooltip.classList.remove('loading');
    
    if (response.success) {
      showTranslation(response.translatedText, tooltipX, tooltipY);
    } else {
      showTranslation('翻译失败: ' + response.error, tooltipX, tooltipY);
    }
  } catch (error) {
    tooltip.classList.remove('loading');
    showTranslation('翻译失败: ' + error.message, tooltipX, tooltipY);
  }
});

// 点击页面其他地方时隐藏翻译图标和结果
document.addEventListener('mousedown', (e) => {
  if (!translateIcon.contains(e.target) && !tooltip.contains(e.target)) {
    hideTranslateIcon();
    hideTranslation();
    selectedText = '';
    selectionRect = null;
  }
});

// 按下 ESC 键时隐藏翻译图标和结果
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    hideTranslateIcon();
    hideTranslation();
    selectedText = '';
    selectionRect = null;
  }
}); 