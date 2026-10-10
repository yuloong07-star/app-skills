---
name: android-vivo-video
description: 在 vivo 视频（com.android.VideoPlayer）里播放本地视频、管理下载与观看记录时使用。触发词：视频、播放视频、看录屏、本地视频。
app:
  name: 视频
  package: com.android.VideoPlayer
  platform: android
  version_tested: "未记录"
  verified: "未验证"
tools_used: [ui_tree, screenshot, ocr]
risk: low
danger_steps: []
---

## 概览

> **骨架文件（draft）**：界面流程**尚未走查**，以下为待补清单，勿当作可执行步骤。

- 预期能力：播放本地视频/录屏、断点续播、下载在线内容。

## 已知信息

- 包名 `com.android.VideoPlayer`，vivo 系统视频播放器（Android）。

## 待走查清单

1. 冷启动入口：是直接进文件列表还是首页推荐（两者流程不同）。
2. 本地视频列表结构与播放页控件（播放/暂停/进度/全屏）。
3. 从文件管理点开视频时的实际接管应用。
4. 危险步骤：删除观看记录/下载内容（须确认）。
5. 已知坑候选：在线内容需账号、开屏广告。
