---
name: android-vivo-manager
description: 在 vivo 手机管家（com.iqoo.secure）里体检、清理空间、查权限与安全设置时使用。触发词：手机管家、清理垃圾、杀毒、权限管理、省电。
app:
  name: 手机管家
  package: com.iqoo.secure
  platform: android
  version_tested: "未记录"
  verified: "未验证"
tools_used: [ui_tree, screenshot, ocr]
risk: high
danger_steps: ["一键清理", "卸载应用", "限制后台"]
---

## 概览

> **骨架文件（draft）**：界面流程**尚未走查**，以下为待补清单，勿当作可执行步骤。

- 预期能力：存储清理、权限管理、流量与省电、病毒扫描。

## 已知信息

- 包名 `com.iqoo.secure`，vivo/iQOO 系统安全管理应用（Android）。

## 待走查清单

1. 冷启动入口与首页功能宫格结构。
2. 「清理」流程：扫描结果页、可清理项列表、确认按钮文案。
3. 「应用管理/权限」入口路径与开关控件。
4. ⚠️ 危险步骤：一键清理会删缓存与文件（列清单确认）、限制后台会杀通知（改前记录原状态）。
5. 已知坑候选：体检分数弹窗、会员/广告入口误触。
