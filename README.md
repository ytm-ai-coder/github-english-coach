# GitHub 英语记忆助手

> 在 GitHub 页面上选中英语，读懂它、记住它、复习它。

一个离线优先的 Chrome / Edge 扩展。它帮助中文学习者理解 GitHub 界面与代码协作英语：选中术语即可看到词面义、英英释义、GitHub 语境、记忆钩子和例句；一键朗读、加入生词本，再按间隔复习巩固。

当前是 `v0.3.3` 测试发布版，欢迎通过 Issue 提交缺词、错误或使用反馈。

## 它能做什么

- 收录 513 个 Git、GitHub、PR、Actions、安全、设置、代码阅读与高频开发词汇。
- 在 GitHub 页面上主动选词后解释，不自动翻译整页或读取你的仓库内容。
- 提供中文词面义，例如 `repositories` → “仓库”。
- 通过浏览器系统语音朗读，并可选择美音/英音和语速。
- 将词卡保存在浏览器本地，按简单的间隔复习节奏复习。
- 无账号、无 Token、无 API Key、无智能体依赖。

## 安装（测试版）

1. 下载或克隆本仓库，然后解压到一个不会被删除的位置。
2. 在 Edge 打开 `edge://extensions`，或在 Chrome 打开 `chrome://extensions`。
3. 开启右上角的“开发人员模式”。
4. 点击“加载解压缩的扩展”，选择本项目根目录 `github-english-coach`（其中应直接看到 `manifest.json`）。
5. 打开任意 `github.com` 页面并刷新一次。

> 正式商店版本发布后，普通用户可直接从商店一键安装；测试版需要上述开发者模式步骤。

## 使用方式

1. 选中一个英文词或短语，点击其旁边出现的“解释”。
2. 或右键选择“用 GitHub 英语助手解释并记住”。
3. 也可按 `Alt + G` 解释当前选中内容。
4. 在词卡中点击 `🔊` 听发音，点击“加入生词本”保存。
5. 点击浏览器工具栏中的扩展图标，选择“开始复习”。

完整的操作、生词本和复习说明见 [使用说明.md](使用说明.md)。

## 隐私

本扩展不发送网络请求，不上传网页内容、私有代码、选中文字或生词本。数据只保存在当前浏览器的扩展本地存储中；发音由浏览器的 Web Speech API 提供。详见 [隐私政策](PRIVACY.md)。

## 为项目作贡献

缺少某个 GitHub 界面词？欢迎提出建议。请先阅读 [贡献指南](CONTRIBUTING.md)；版本变更记录在 [CHANGELOG.md](CHANGELOG.md)。

## 发布与打包

项目已包含图标、商店文案和 PowerShell 打包脚本。发布人可参考 [发布清单](RELEASE_CHECKLIST.md)，并运行：

```powershell
.\scripts\package.ps1
```

生成的 ZIP 会位于 `dist/`，其中 `manifest.json` 位于压缩包根目录，可提交到 Chrome Web Store 或 Microsoft Edge Add-ons。

## 开源协议

本项目采用 [MIT License](LICENSE)。GitHub 是 GitHub, Inc. 的商标；本项目为独立的学习工具，与 GitHub, Inc. 没有从属或授权关系。
