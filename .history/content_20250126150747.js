// 创建翻译图标和结果显示框
let translateIcon;
let tooltip;

// 初始化函数
function initializeTranslator() {
  // 如果已存在则先移除
  if (translateIcon) translateIcon.remove();
  if (tooltip) tooltip.remove();

  translateIcon = document.createElement('div');
  translateIcon.className = 'ai-translate-icon';
  translateIcon.style.display = 'none';
  translateIcon.innerHTML = `
    <svg viewBox="0 0 24 24" width="16" height="16">
      <path fill="currentColor" d="M12.87 15.07l-2.54-2.51.03-.03A17.52 17.52 0 0014.07 6H17V4h-7V2H8v2H1v2h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"/>
    </svg>
  `;
  document.body.appendChild(translateIcon);

  tooltip = document.createElement('div');
  tooltip.className = 'ai-translate-tooltip';
  document.body.appendChild(tooltip);

  // 重新添加事件监听器
  setupEventListeners();
}

// 设置事件监听器
function setupEventListeners() {
  // 点击翻译图标进行翻译
  translateIcon.addEventListener('click', async () => {
    if (!selectedText || !selectionRect) return;

    // 计算tooltip位置
    const tooltipX = selectionRect.left + window.scrollX;
    const tooltipY = selectionRect.bottom + window.scrollY + 5;

    // 显示加载状态
    showTranslation('翻译中...', tooltipX, tooltipY);
    tooltip.classList.add('loading');

    try {
      // 检查扩展是否有效
      if (!chrome.runtime?.id) {
        throw new Error('扩展已失效，请刷新页面');
      }

      // 发送翻译请求
      const sourceLang = detectLanguage(selectedText);
      const targetLang = sourceLang === 'zh' ? 'en' : 'zh';

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
      if (error.message.includes('Extension context invalidated')) {
        showTranslation('扩展已失效，请刷新页面', tooltipX, tooltipY);
        // 尝试重新初始化
        setTimeout(initializeTranslator, 1000);
      } else {
        showTranslation('翻译失败: ' + error.message, tooltipX, tooltipY);
      }
    }
  });
}

// 检测语言
function detectLanguage(text) {
  const chineseRegex = /[\u4e00-\u9fa5]/;
  return chineseRegex.test(text) ? 'zh' : 'en';
}

// 显示翻译图标
function showTranslateIcon(x, y) {
  translateIcon.style.left = `${x}px`;
  translateIcon.style.top = `${y}px`;
  translateIcon.style.display = 'flex'; // 使用 flex 布局
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
  // 检查扩展是否有效
  if (!chrome.runtime?.id) {
    console.warn('扩展已失效，正在尝试重新初始化...');
    initializeTranslator();
    return;
  }

  // 如果点击的是翻译图标或翻译结果框，不处理
  if (translateIcon.contains(e.target) || tooltip.contains(e.target)) {
    return;
  }

  // 立即隐藏之前的图标和提示
  hideTranslateIcon();
  hideTranslation();

  // 使用 requestAnimationFrame 确保在下一帧处理选中文本
  requestAnimationFrame(() => {
    const selection = window.getSelection();
    selectedText = selection.toString().trim();
    
    if (!selectedText) {
      return;
    }

    try {
      const range = selection.getRangeAt(0);
      selectionRect = range.getBoundingClientRect();
      
      // 显示翻译图标在选中文本的右上方
      const iconX = selectionRect.right + window.scrollX + 5;
      const iconY = selectionRect.top + window.scrollY - 20;
      
      showTranslateIcon(iconX, iconY);

      // 添加调试信息
      console.log('选中文本:', selectedText);
      console.log('图标位置:', { x: iconX, y: iconY });
      console.log('选区位置:', selectionRect);
    } catch (error) {
      console.error('获取选中文本位置失败:', error);
      hideTranslateIcon();
    }
  });
});

// 初始化翻译器
initializeTranslator();

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