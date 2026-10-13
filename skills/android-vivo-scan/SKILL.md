---
name: android-vivo-scan
description: 在 vivo 扫描（com.vivo.vtouch）里扫二维码、条形码、识文字或扫文档时使用。触发词：扫一扫、扫码、扫描二维码、文字识别。
app:
  name: 扫描
  package: com.vivo.vtouch
  platform: android
  vendor: vivo
  version_tested: "未记录"
  verified: "未验证"
tags: [scan, qr]
status: draft
author: yuloong07-star
tools_used: [ui_tree, screenshot, ocr]
risk: medium
danger_steps: ["扫码后跳转的支付/授权确认"]
---

## 概览

> **骨架文件（draft）**：界面流程**尚未走查**，以下为待补清单，勿当作可执行步骤。

- 预期能力：扫码（二维码/条码）、识文字、扫文档翻译。

## 已知信息

- 包名 `com.vivo.vtouch`，vivo 系统扫描应用（Android）；也常作为其他应用的扫码后端。

## 待走查清单

1. 冷启动入口与取景页模式切换（扫码/识字/文档）。
2. 扫码结果页结构：结果文本如何呈现（可读树还是需截图）。
3. 相机权限与暗光补光控件。
4. ⚠️ 危险步骤：扫码可能直接进入支付/授权页——**结果页若出现金额或授权字样，先停下报用户**。
5. 已知坑候选：作为第三方调起时是独立任务栈，返回行为不同。
