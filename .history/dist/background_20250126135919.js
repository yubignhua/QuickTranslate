chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'translate') {
    const text = request.text;
    
    // 获取用户选择的语言方向
    chrome.storage.sync.get('languageDirection', (data) => {
      const languageDirection = data.languageDirection || 'zh-en';
      
      // 根据语言方向调用相应的翻译 API
      if (languageDirection === 'zh-en') {
        translateText(text, 'zh', 'en', sendResponse);
      } else if (languageDirection === 'en-zh') {
        translateText(text, 'en', 'zh', sendResponse);
      }
    });
    
    return true; // 异步响应
  }
});

function translateText(text, sourceLang, targetLang, callback) {
  // 调用翻译 API，将结果通过 callback 返回
  // ...
}
