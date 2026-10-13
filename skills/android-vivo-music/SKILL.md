---
name: android-vivo-music
description: 在 vivo 音乐（com.android.bbkmusic）里播放本地歌曲、搜索在线歌曲、建歌单时使用。触发词：音乐、放首歌、听歌、歌单。
app:
  name: 音乐
  package: com.android.bbkmusic
  platform: android
  vendor: vivo
  version_tested: "未记录"
  verified: "未验证"
tags: [music, media]
status: draft
author: yuloong07-star
tools_used: [ui_tree, screenshot, ocr]
risk: low
danger_steps: ["付费/会员开通"]
---

## 概览

> **骨架文件（draft）**：界面流程**尚未走查**，以下为待补清单，勿当作可执行步骤。

- 预期能力：播放本地与在线音乐、搜索、歌单管理。

## 已知信息

- 包名 `com.android.bbkmusic`，vivo 系统音乐应用（Android）。

## 待走查清单

1. 冷启动入口与首页结构（本地音乐/在线/我的 tab）。
2. 播放页控件：播放/暂停、上下曲、进度条的定位方式。
3. 搜索歌曲流程与结果页结构。
4. ⚠️ 危险步骤：会员/付费开通按钮（须用户确认）。
5. 已知坑候选：开屏广告、在线内容需登录、无版权歌曲不可播。
