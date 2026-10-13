---
name: android-vivo-appstore
description: 在 vivo 应用商店（com.bbk.appstore）里搜索应用、查看更新、下载或管理已装应用时使用。触发词：应用商店、下载app、更新应用、装个软件。
app:
  name: 应用商店
  package: com.bbk.appstore
  platform: android
  vendor: vivo
  version_tested: "未记录"
  verified: "未验证"
tags: [appstore]
status: draft
author: yuloong07-star
tools_used: [ui_tree, screenshot, ocr]
risk: medium
danger_steps: ["下载与安装应用", "卸载应用"]
---

## 概览

> **骨架文件（draft）**：包名与平台已确认（本机安装清单），界面流程**尚未走查**，
> 以下为待补清单，勿当作可执行步骤。欢迎按 CONTRIBUTING.md 补充实测内容。

- 预期能力：搜索/下载/更新应用、查看已安装列表。

## 已知信息

- 包名 `com.bbk.appstore`，vivo 系统应用商店（Android）。

## 待走查清单

1. 冷启动入口与首页结构（首页 tab、搜索框定位方式）。
2. 搜索应用 → 详情页 → 下载/安装按钮的文本与判据。
3. 「更新」入口位置与批量更新控件。
4. ⚠️ 危险步骤确认：安装未知来源、卸载的入口与确认弹窗文案。
5. 已知坑候选：下载需登录/流量确认弹窗、广告位误触。
