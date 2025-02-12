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

// 创建语音合成对象
const speechSynthesis = window.speechSynthesis;
let currentUtterance = null;

// 创建语音按钮
const speakButton = document.createElement('button');
speakButton.className = 'ai-translate-speak-button';
speakButton.innerHTML = `
  <svg viewBox="0 0 24 24" width="16" height="16">
    <path fill="currentColor" d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
  </svg>
`;

// 创建翻译内容容器
const tooltipContent = document.createElement('div');
tooltipContent.className = 'ai-translate-tooltip-content';

// 创建控制按钮容器
const controls = document.createElement('div');
controls.className = 'ai-translate-controls';
controls.appendChild(speakButton);

// 修改 tooltip 结构
tooltip.appendChild(tooltipContent);
tooltip.appendChild(controls);

// 检测语言
function detectLanguage(text) {
  const chineseRegex = /[\u4e00-\u9fa5]/;
  return chineseRegex.test(text) ? 'zh' : 'en';
}

// 调整位置确保在可视区域内
function adjustPosition(x, y, width, height) {
  // 使用视口尺寸
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  // 确保不超出右边界
  if (x + width > viewportWidth) {
    x = viewportWidth - width - 10;
  }
  
  // 确保不超出左边界
  if (x < 0) {
    x = 10;
  }
  
  // 确保不超出底部边界
  if (y + height > viewportHeight) {
    y = viewportHeight - height - 10;
  }
  
  // 确保不超出顶部边界
  if (y < 0) {
    y = 10;
  }
  
  return { x, y };
}

// 显示翻译图标
function showTranslateIcon(x, y) {
  // 获取选中文本相对于视口的位置
  const { x: adjustedX, y: adjustedY } = adjustPosition(x, y, 24, 24);
  
  console.log('显示翻译图标:', { 
    original: { x, y },
    adjusted: { x: adjustedX, y: adjustedY },
    viewport: { width: window.innerWidth, height: window.innerHeight }
  });
  
  translateIcon.style.cssText = `
    display: flex !important;
    position: fixed !important;
    left: ${adjustedX}px !important;
    top: ${adjustedY}px !important;
    z-index: 2147483647 !important;
  `;
}

// 隐藏翻译图标
function hideTranslateIcon() {
  translateIcon.style.display = 'none';
}

// 播放语音
function speak(text, lang) {
  // 如果正在播放，先停止
  if (speechSynthesis.speaking) {
    speechSynthesis.cancel();
    if (currentUtterance === text) {
      speakButton.classList.remove('speaking');
      currentUtterance = null;
      return;
    }
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang === 'zh' ? 'zh-CN' : 'en-US';
  utterance.rate = 1.0;
  utterance.pitch = 1.0;

  // 开始播放时添加动画
  utterance.onstart = () => {
    speakButton.classList.add('speaking');
    currentUtterance = text;
  };

  // 结束播放时移除动画
  utterance.onend = () => {
    speakButton.classList.remove('speaking');
    currentUtterance = null;
  };

  // 发生错误时移除动画
  utterance.onerror = () => {
    speakButton.classList.remove('speaking');
    currentUtterance = null;
    console.error('语音播放失败');
  };

  speechSynthesis.speak(utterance);
}

// 点击语音按钮播放翻译结果
speakButton.addEventListener('click', () => {
  if (!selectedText) return;
  
  const targetLang = detectLanguage(selectedText) === 'zh' ? 'en' : 'zh';
  const textToSpeak = tooltipContent.textContent;
  speak(textToSpeak, targetLang);
});

// 修改显示翻译结果的函数
function showTranslation(text, x, y) {
  // 先设置内容以便获取实际尺寸
  tooltipContent.textContent = text;
  tooltip.style.display = 'block';
  tooltip.style.visibility = 'hidden';
  
  // 获取 tooltip 的实际尺寸
  const tooltipRect = tooltip.getBoundingClientRect();
  const { x: adjustedX, y: adjustedY } = adjustPosition(x, y, tooltipRect.width, tooltipRect.height);
  
  // 设置调整后的位置
  tooltip.style.cssText = `
    display: block !important;
    position: fixed !important;
    left: ${adjustedX}px !important;
    top: ${adjustedY}px !important;
    z-index: 2147483647 !important;
    visibility: visible !important;
  `;
}

// 修改隐藏翻译结果的函数
function hideTranslation() {
  tooltip.style.display = 'none';
  if (speechSynthesis.speaking) {
    speechSynthesis.cancel();
    speakButton.classList.remove('speaking');
    currentUtterance = null;
  }
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
      
      // 使用相对于视口的位置
      let iconX = selectionRect.right + 5;
      let iconY = selectionRect.top - 20;
      
      // 如果选中区域在屏幕右侧，将图标显示在左侧
      if (iconX > window.innerWidth - 50) {
        iconX = selectionRect.left - 29;
      }
      
      // 如果选中区域在屏幕顶部，将图标显示在下方
      if (iconY < 0) {
        iconY = selectionRect.bottom + 5;
      }
      
      console.log('准备显示翻译图标, 位置:', {
        selectionRect,
        iconX,
        iconY,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        }
      });
      
      showTranslateIcon(iconX, iconY);
    } catch (error) {
      console.error('获取选中文本位置失败:', error);
      hideTranslateIcon();
    }
  });
});

// 点击翻译图标进行翻译
translateIcon.addEventListener('click', async () => {
  if (!selectedText || !selectionRect) return;

  // 计算tooltip位置（使用相对于视口的位置）
  const tooltipX = selectionRect.left;
  const tooltipY = selectionRect.bottom + 5;

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