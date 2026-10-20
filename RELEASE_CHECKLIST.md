# 发布清单

这份清单用于把一个已测试的版本发布到 GitHub Release、Chrome Web Store 或 Microsoft Edge Add-ons。

## 1. 发布前检查

- [ ] 运行 `powershell -ExecutionPolicy Bypass -File .\scripts\verify.ps1`。
- [ ] 在 Chrome 和 Edge 中分别“重新加载”扩展，并手动测试：选词、右键菜单、`Alt + G`、朗读、加入/移出生词本、复习。
- [ ] 使用公开 GitHub 页面测试，不在截图和反馈材料中泄露私有仓库、Token 或个人信息。
- [ ] 检查 `manifest.json` 中的版本号高于上一次商店提交版本。
- [ ] 更新 [CHANGELOG.md](CHANGELOG.md) 的日期和用户可见改动。
- [ ] 复核 [PRIVACY.md](PRIVACY.md)，确认功能没有新增联网、同步或数据收集行为。

## 2. 打包

在项目根目录运行：

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\package.ps1
```

脚本会先做静态检查，再把运行时文件压缩为 `dist/github-english-coach-v<版本>.zip`。压缩包根目录必须直接包含 `manifest.json`；不要把外层项目文件夹一起压缩。

## 3. GitHub 发布

- [ ] 新建公开仓库，例如 `github-english-coach`。
- [ ] 上传全部源码，但不要提交 `dist/` 内的 ZIP。
- [ ] 创建标签 `v<版本>`，例如 `v0.3.0`。
- [ ] 创建同名 GitHub Release，附上打包 ZIP 和本版本的更新说明。
- [ ] 在 README 中保留测试版的“加载解压缩的扩展”安装方法。

## 4. Chrome Web Store 发布

- [ ] 注册 Chrome Web Store 开发者账号。
- [ ] 上传 `dist/` 中的 ZIP。
- [ ] 填写 [商店文案草稿](store/CHROME_WEB_STORE.md)。
- [ ] 上传真实产品截图：选词词卡、生词本/复习页、设置/语音页。不要使用模拟截图冒充产品功能。
- [ ] 填写隐私披露，内容应与 [隐私政策](PRIVACY.md) 一致。
- [ ] 提供支持邮箱或公开的 GitHub Issues 链接。
- [ ] 提交前确认扩展只服务于“帮助用户理解并复习其主动选中的 GitHub 英语”这一单一用途。

Chrome 的官方准备与打包说明：<https://developer.chrome.com/docs/webstore/prepare>

## 5. Microsoft Edge Add-ons 发布（可选）

- [ ] 用相同 ZIP 创建 Edge Add-ons 提交。
- [ ] 复用商店文案、隐私政策和真实截图，但逐项核对 Edge Partner Center 的当前字段。
- [ ] 完成 Microsoft 的认证流程后再公开发布。

Edge 官方发布说明：<https://learn.microsoft.com/microsoft-edge/extensions/publish/publish-extension>
