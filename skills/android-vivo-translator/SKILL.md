---
name: android-vivo-translator
description: 在 vivo 翻译机（com.vivo.translator）里做文本翻译、语音翻译或拍照翻译时使用。触发词：翻译、翻成英文、听译、拍照翻译。
app:
  name: 翻译机
  package: com.vivo.translator
  platform: android
  vendor: vivo
  version_tested: "未记录"
  verified: "未验证"
tags: [translate, tools]
status: draft
author: yuloong07-star
tools_used: [ui_tree, screenshot, ocr]
risk: low
danger_steps: []
---

## 概览

> **骨架文件（draft）**：界面流程**尚未走查**，以下为待补清单，勿当作可执行步骤。

- 预期能力：文本/语音/拍照翻译，语种切换。

## 已知信息

- 包名 `com.vivo.translator`，vivo 系统翻译应用（Android）。

## 待走查清单

1. 冷启动入口与模式 tab（文本/语音/拍照/对话）。
2. 文本翻译：输入框与结果区的控件、语言选择器位置。
3. 结果是控件树可读还是需截图（决定验证方式）。
4. 危险步骤：无（预计），若联网下载语包有确认弹窗需记录。
5. 已知坑候选：需联网、离线语包下载、结果区 WebView。
