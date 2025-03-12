// 创建右键菜单
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'translateSelection',
    title: '翻译选中文本',
    contexts: ['selection']
  });
});

// Gemini API 配置
const API_KEY = ''; // 在这里填入你的 Gemini API key
const API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

// 处理翻译请求
async function translateText(text, sourceLang, targetLang) {
  try {
    const prompt = `将以下${sourceLang === 'zh' ? '中文' : '英文'}文本翻译成${targetLang === 'zh' ? '中文' : '英文'}：\n\n${text}\n\n请只返回翻译结果，不要包含任何其他解释或说明。`;
    
    const response = await fetch(`${API_ENDPOINT}?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.3,
          topK: 1,
          topP: 1,
        },
        safetySettings: [{
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_NONE"
        }]
      })
    });

    if (!response.ok) {
      throw new Error('API 请求失败');
    }

    const data = await response.json();
    const translatedText = data.candidates[0].content.parts[0].text.trim();

    return {
      success: true,
      translatedText
    };
  } catch (error) {
    console.error('翻译错误:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// 监听来自 popup 和 content script 的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'translate') {
    translateText(request.text, request.sourceLang, request.targetLang)
      .then(sendResponse);
    return true; // 保持消息通道打开以进行异步响应
  }
});

// 处理右键菜单点击
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'translateSelection') {
    // 向当前标签页发送消息，请求翻译选中的文本
    chrome.tabs.sendMessage(tab.id, {
      action: 'getSelection'
    });
  }
}); 