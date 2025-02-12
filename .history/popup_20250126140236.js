document.addEventListener('DOMContentLoaded', () => {
  const sourceText = document.getElementById('sourceText');
  const translatedText = document.getElementById('translatedText');
  const translateBtn = document.getElementById('translateBtn');
  const targetLang = document.getElementById('targetLang');

  // 自动检测输入语言
  function detectLanguage(text) {
    const chineseRegex = /[\u4e00-\u9fa5]/;
    return chineseRegex.test(text) ? 'zh' : 'en';
  }

  // 翻译功能
  async function translate() {
    const text = sourceText.value.trim();
    if (!text) return;

    const sourceLang = detectLanguage(text);
    const targetLanguage = targetLang.value;

    // 如果源语言和目标语言相同，则切换目标语言
    if (sourceLang === targetLanguage) {
      targetLang.value = sourceLang === 'zh' ? 'en' : 'zh';
    }

    translateBtn.disabled = true;
    translateBtn.textContent = '翻译中...';

    try {
      // 发送消息到 background script 进行翻译
      const response = await chrome.runtime.sendMessage({
        action: 'translate',
        text: text,
        sourceLang: sourceLang,
        targetLang: targetLang.value
      });

      if (response.success) {
        translatedText.value = response.translatedText;
      } else {
        translatedText.value = '翻译失败: ' + response.error;
      }
    } catch (error) {
      translatedText.value = '翻译失败: ' + error.message;
    } finally {
      translateBtn.disabled = false;
      translateBtn.textContent = '翻译';
    }
  }

  // 绑定事件
  translateBtn.addEventListener('click', translate);

  // 添加快捷键支持 (Ctrl+Enter)
  sourceText.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'Enter') {
      translate();
    }
  });
}); 