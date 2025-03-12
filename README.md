# AI  QuickTranslate 智能翻译助手 Chrome 扩展

QuickTranslate  这是一个基于 Gemini AI 的智能翻译 Chrome 扩展，支持中英文互译。它提供了简单易用的界面和快捷的翻译功能。

## 功能特点

- 支持中英文智能互译
- 支持右键菜单快速翻译选中文本
- 简洁美观的用户界面
- 快捷键支持 (Ctrl+Enter)
- 自动检测输入语言
- 实时翻译结果显示

## 安装说明

1. 下载本扩展的源代码
2. 打开 Chrome 浏览器，进入扩展管理页面 (chrome://extensions/)
3. 开启"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择本扩展的文件夹

## 使用方法

### 方法一：使用扩展图标

1. 点击浏览器工具栏中的扩展图标
2. 在输入框中输入要翻译的文本
3. 选择目标语言（中文/英文）
4. 点击"翻译"按钮或按 Ctrl+Enter

### 方法二：使用右键菜单

1. 在网页中选中要翻译的文本
2. 右键点击，选择"翻译选中文本"
3. 翻译结果将在选中文本下方显示

## 配置说明

在使用之前，需要在 `background.js` 文件中配置你的 AI API Key：

```javascript
const API_KEY = '你的API Key'; // 替换为你的 API Key
```

## 注意事项

- 请确保你有可用的 AI API Key
- 翻译服务可能需要付费
- 建议合理使用 API 配额

## 技术栈

- JavaScript
- Chrome Extension API
- OpenAI API

## 开发者信息

如果你想要贡献代码或报告问题，请访问我们的 GitHub 仓库。

## 许可证

MIT License 