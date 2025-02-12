// 创建右键菜单
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'translateSelection',
    title: '翻译选中文本',
    contexts: ['selection']
  });
});

// AI 翻译 API 配置
const API_KEY = ''; // 在这里填入你的 API key
const API_ENDPOINT = 'https://api.openai.com/v1/chat/completions';

// 处理翻译请求
async function translateText(text, sourceLang, targetLang) {
  try {
    const prompt = `将以下${sourceLang === 'zh' ? '中文' : '英文'}文本翻译成${targetLang === 'zh' ? '中文' : '英文'}：\n\n${text}`;
    
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: '你是一个专业的翻译助手，请准确翻译用户提供的文本。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3
      })
    });

    if (!response.ok) {
      throw new Error('API 请求失败');
    }

    const data = await response.json();
    const translatedText = data.choices[0].message.content.trim();

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