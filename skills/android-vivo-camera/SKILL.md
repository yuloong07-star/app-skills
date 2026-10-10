---
name: android-vivo-camera
description: 在 vivo 相机（com.android.camera）里拍照、录像、切模式、切前后摄、调变焦与闪光灯时使用。典型场景：拍下眼前的东西、录一段视频、连拍。触发词：拍照、拍一下、录像、前置、变焦、扫码相机。
app:
  name: 相机
  package: com.android.camera
  platform: android
  version_tested: "未记录（vivo V2417A / Android 16 ROM）"
  verified: "2026-10-10"
tools_used: [ui_tree, screenshot, tap_by_text, tap_coord]
risk: low
danger_steps: []
---

## 概览

相机的无障碍描述**非常完善**（快门、模式、闪光灯全有 desc），是少数可以纯控件树操作的自绘应用。
- **适合**：拍照/录像/切模式/切镜头/调变焦。
- **不适合**：涉及相册删除、分享的操作（转相册技能处理）。

## 前提

- 无障碍权限已授予。
- 相机是**单实例**：已在运行时 launch 只把 intent 转给既有实例，不会重开。

## 入口

- 包名 `com.android.camera`，组件 `.CameraActivity`。
- 关键控件（实测，全部可按 desc 名点）：
  - 快门 `shutter_button`：desc=「拍照，按钮，点按两次即可拍照，点按两次并按住可连拍」
  - 切前后摄 `camera_switch`：desc=切换前置
  - 缩略图 `thumbnail`：desc=查看照片或视频（进相册）
  - 闪光灯 `flash_toggle_button`：desc=「闪光灯,关闭」（**当前状态写在 desc 里**）
  - 色彩风格 `camera_zeiss_color_button`：desc=「色彩风格,质感」
  - 设置 `camera_more_1_5`：desc=设置
  - 变焦 `zoom_circle_button_0/1/2`：文本 0.6 / 1x / 2
  - 模式行（View，desc 含当前态）：抓拍模式 / 夜景模式 / 人像模式 / **拍照模式[checked]** / 录像模式 / 微电影模式 / 更多模式

## 流程一：拍一张照片

1. 启动相机 → 判据：`shutter_button` 出现，模式行为「拍照模式」checked。
2. 需要的话先点变焦（如 `zoom_circle_button_1` 文本"1x"）。
3. 点 `shutter_button` → 判据：`thumbnail` 缩略图内容更新（画面变化），有快门音/震动反馈。
4. 想确认拍到了什么：点 `thumbnail` 进相册看最后一张，或截图看取景画面。

## 流程二：录像

1. 点模式行 desc=录像模式 → 判据：该 View 变 checked，快门变红点样式。
2. 点 `shutter_button` 开始 → 判据：出现计时文本。
3. 再点一次停止 → 判据：`thumbnail` 更新。

## 流程三：切前置 / 调闪光

- 切镜头：点 `camera_switch` → 判据：取景画面反转（截图确认）。
- 闪光：点 `flash_toggle_button` → desc 会变为「闪光灯,自动/开/关」——**以 desc 回读为准**。

## 已知坑

- **单实例**：launch 返回 WARM/RELAUNCH 是正常的，以控件树是否出现快门为准。
- **取景是自绘**：控件树只有按钮层，画面内容必须截图看。
- **模式行是横滑列表**：「更多模式」在最右侧，找不到目标模式时先点它展开。
- **虚拟屏可用**：相机可在虚拟屏落窗预览（本机实测），识物/拍照取景无需占主屏。

## 验证

- 拍照：`thumbnail` 变化 / 进相册回读最后一张。
- 模式切换：目标 View 的 checked 态 + 快门样式（截图）双证。
- 闪光：desc 回读到目标档位。

## 工具映射（可选）

DeepSeek Harness（LittleWhale）：`lw_tap text="拍照，按钮，点按两次即可拍照，点按两次并按住可连拍"`（或按 desc 关键词）、`lw_ui` 读模式 checked 态、`lw_screenshot` 看取景。
