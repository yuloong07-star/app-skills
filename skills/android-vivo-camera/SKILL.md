---
name: android-vivo-camera
description: 在 vivo 相机（com.android.camera）里拍照、录像、切模式、切前后摄、调变焦/闪光灯/画幅/倒计时，或改相机设置时使用。典型场景：拍下眼前的东西、录一段视频、切前置、调画幅与倒计时。触发词：拍照、拍一下、录像、前置、变焦、画幅、倒计时、相机设置。 不适用：识别镜头前是什么（用 lw_look 或视频模式，不必开相机应用）；对已拍照片做编辑（用 dsh-imagegen-edit）；找相册里的照片（用 android-vivo-gallery）。
app:
  name: 相机
  package: com.android.camera
  platform: android
  version_tested: "vivo V2417A / Android 16"
  verified: "2026-10-11"
tools_used: [ui_tree, screenshot, ocr, tap_by_text, tap_coord, swipe, system_key, launch_app]
risk: low
danger_steps: []
---

## 概览

- **适合**：拍照、录像、切模式、切前后摄、调变焦与闪光灯、改画幅/倒计时/水印等拍摄参数、进相机设置。
- **不适合**：识物（用 `lw_look`/视频模式）、照片编辑（用生图技能）、翻相册（用 android-vivo-gallery）。

三个要点：**相机的无障碍描述很完善**（快门、模式行、闪光灯、变焦全有 desc 或文本，是少数能纯控件树操作的自绘应用）；
**取景画面是自绘的**（看画面只能截图）；**「设置」按钮打开的是快捷面板，真正的设置页在面板右上角的「更多设置」**。

## 什么时候不要用我

- 问「镜头前是什么 / 这是什么牌子」→ 用 `lw_look` 或切视频模式，不必开相机再截图
- 要对刚拍的照片改图 → dsh-imagegen-edit
- 想找/删相册里的照片 → android-vivo-gallery

## 前提

- 无障碍（屏幕读取）权限已授予。
- **相机是单实例**：已在运行时 `lw_launch` 会回 `Warning: Activity not started, intent has been delivered to
  currently running top-most instance`——这不是失败，先 `lw_ui` 看它在哪块屏上（实测能在自建虚拟屏上正常落窗预览）。
- 实测环境：vivo V2417A / Android 16，2026-10-11 走查；屏幕 1260×2800。
- 虚拟屏上相机可正常预览与截图（**识物/取景不必占主屏**）。

## 入口

- 包名 `com.android.camera`，组件 `.CameraActivity`。
- 冷启动落「拍照模式」，模式行上「拍照模式」为 checked。

## 页面地图

```
拍照页（22 个可读控件）
├─ 顶部：desc=闪光灯,关闭（状态写在 desc 里） · desc=色彩风格,质感 · desc=设置 · 「成片方向」文本
├─ 取景区：自绘（无控件树），截图看
├─ 变焦：zoom_circle_button_0 / _1 / _2（文本 0.6 / 1x / 2，desc=「N倍变焦」）
├─ 底部：thumbnail(desc=查看照片或视频) · shutter_button(desc=「拍照，按钮，点按两次即可拍照，
│  点按两次并按住可连拍」) · camera_switch(desc=切换前置)
├─ 右下角：item_parent_layout / item_image_container_layout（一个小控件，功能未验证）
└─ 模式行（一横排，desc 即模式名，checked 表示当前）：抓拍模式 · 夜景模式 · 人像模式 ·
   **拍照模式** · 录像模式 · 微电影模式 · 更多模式

快捷设置面板（点 desc=设置 打开，id=top_bar_1_5_layout）
├─ 画幅：desc=「已选中/未选中画幅 1:1 / 4:3 / 16:9 / 全屏」
├─ 倒计时：desc=「已选中/未选中倒计时 无延时 / 3s / 5s / 10s」
├─ 开关行（grid_item_layout，desc 形如「构图线,关闭」）：构图线 · 水平仪 · 抖动提示 ·
│  效果大师 · 照片水印（可展开）· 运动追焦（可展开）· HDR
├─ 关闭：camera_top_bar_for_1_5_menu_button desc=关闭
└─ **更多设置**：camera_top_bar_for_1_5_setting_button desc=更多设置 → 真设置页

更多设置页
├─ 顶栏：标题「更多设置」+ 分隔线
├─ 分组（setting_checkbox_container，desc=组名）：通用 · 保留设置 · 运动追焦 · 人像功能 ·
│  专业功能 · 拍照（分组按模式显示，可滚动）
└─ 项（行内 title + 说明）实测见：水印 · 快门声音 · 地理位置 · 自拍镜像 · 超广角矫正 ·
   快捷启动相机 · 运动追焦 · 成片方向 …（每项都带一句副说明）
```

## 控件速查表

| 控件 | id / desc | 动作 | 判据 |
| --- | --- | --- | --- |
| 快门 | `shutter_button` desc=拍照…（完整 desc 见上） | 点 | thumbnail 缩略图更新 |
| 切前后摄 | `camera_switch` desc=切换前置 | 点 | 取景反转（截图看） |
| 变焦 | `zoom_circle_button_0/1/2`（文本 0.6 / 1x / 2） | 点 | 该按钮的 `checked_view` 出现 |
| 闪光灯 | `flash_toggle_button` desc=「闪光灯,关闭」 | 点 | **desc 里的档位变了**（关/自动/开） |
| 色彩风格 | `camera_zeiss_color_button` desc=「色彩风格,质感」 | 点 | 弹出风格列表（未逐项验证） |
| 设置 | `camera_more_1_5` desc=设置 | 点 | 打开快捷设置面板 |
| 模式 | 模式行的 View，desc=模式名（抓拍/夜景/人像/拍照/录像/微电影/更多模式） | 点 | 该模式变为 checked |
| 画幅 | `grid_item1..4` desc=「未选中/已选中画幅 …」 | 点 | desc 前缀由「未选中」变「已选中」 |
| 倒计时 | `grid_item1..4` desc=「…倒计时 无延时/3s/5s/10s」 | 点 | 同上 |
| 参数开关 | `grid_item_layout` desc=「构图线,关闭」等 | 点 | desc 后的状态字变化 |
| 更多设置 | desc=更多设置 | 点 | 进「更多设置」页 |
| 缩略图 | `thumbnail` desc=查看照片或视频 | 点 | 进相册最后一张 |

## 流程

### 一、拍一张照片

1. `lw_launch(displayId, "com.android.camera")`；判据：`shutter_button` 出现、模式行「拍照模式」checked。
   （若回 `Warning: … top-most instance`，说明相机已在运行，直接 `lw_ui` 看它在哪。）
2. 需要时先调：变焦点 `zoom_circle_button_*`、闪光点 `flash_toggle_button`（以 desc 回读为准）、
   画幅/倒计时在快捷面板里点。
3. 点 `shutter_button` → 判据：`thumbnail` 缩略图内容变化；**画面本身要用 `lw_screenshot` 看**。
4. 想确认拍了什么：点 `thumbnail` 进相册看最后一张，或截图看取景。

### 二、录像

1. 点模式行 desc=录像模式 → 判据：该 View 变 checked，快门变样式。
2. 点 `shutter_button` 开始 → 判据：出现计时文本（截图确认）。
3. 再点一次停止 → 判据：`thumbnail` 更新。

### 三、切镜头 / 调变焦

- 切镜头：点 `camera_switch` → 判据：取景画面反转（截图）。
- 变焦：点 `zoom_circle_button_1`（1x）等 → 判据：该按钮出现 checked 态。
  更细的变焦可试双指捏合（`lw_pinch`，本机未复测，慎用）。

### 四、改画幅 / 倒计时 / 水印等拍摄参数

1. 点 desc=设置 → 判据：弹出快捷设置面板（画幅、倒计时、开关行）。
2. 点目标项 → 判据：**desc 前缀/后缀状态字变了**（如「未选中画幅 4:3」→「已选中画幅 4:3」）。
3. 点 desc=关闭 收起面板（或 BACK）。

### 五、进相机设置改默认项

1. 快捷面板右上角点 desc=更多设置 → 判据：标题「更多设置」，出现分组与设置项。
2. 点某一项（如「快门声音」「地理位置」）→ 判据：该项的状态/开关变化，回到列表可见。
3. 只读时看每项右侧或开关态即可，不要顺手改主人的拍摄偏好。

## 已知坑

- **取景是自绘**：控件树只有按钮层，**画面内容必须截图看**（`lw_screenshot` + `read_image`）。
- **「设置」不是设置页**：`desc=设置` 打开的是快捷面板；真设置页要再点面板里的 **desc=更多设置**。
- **状态写在 desc 里**：闪光灯、画幅、倒计时、各参数开关的当前状态都在 desc 文本中，
  **以 desc 回读为准**，不要靠图标颜色判断。
- **模式行是一横排**：「更多模式」在最右侧（x 接近屏宽），要找冷门模式先点它。
- **相机单实例**：不要因为 launch 回 WARNING 就重复 launch；先看 `lw_ui` 哪个屏有它。
- **控件很少**（22 个）：树里没有的就是自绘或不存在，不要在树里反复找某个按钮。
- **虚拟屏可用**：相机能在自建虚拟屏落窗预览（2026-10-05、2026-10-11 两次实测），识物取景不必占主屏。
- **拍摄会真出片**：快门一按就写进相册，测试拍摄前想清楚要不要留图。

## 验证

- 拍照：`thumbnail` 变化 + 进相册（android-vivo-gallery）看到新图，两路。
- 模式切换：模式行 View 的 checked 态 + 快门样式（截图）。
- 参数（闪光/画幅/倒计时/开关）：**读 desc 文本**，状态字变化即生效。

## 未验证清单（2026-10-11 走查范围之外）

- 「色彩风格」列表里的各档（蔡司自然/质感/…）。
- 「更多模式」展开后的全部模式及其专属控件（人像/夜景/微电影的专业参数）。
- 更多设置页里每一项的候选值与子页面（只列出了项名与说明）。
- 右下角 `item_image_container_layout` 那个小控件的作用。
- 专业模式的手动参数（快门/ISO/对焦）。
- 扫码/文档校正这类从相机进入的独立功能。

## 危险步骤

> ⚠️ **注意**：拍照/录像会**真的写入相册**（无危险但会留文件）。
> Agent 为验证流程拍的测试照片，验证完当场删除（并在汇报里说明删了什么）；
> 不要替主人改他的拍摄偏好（更多设置里的项）——只指出位置，改动交给主人。

## 工具映射（本机 LittleWhale）

`lw_launch("com.android.camera")`、`lw_ui` / `lw_ui_dump` 读树、`lw_tap(text=…)`（快门/模式/闪光灯都能按 desc 点）、
`lw_screenshot` + `read_image` 看取景、`lw_key(BACK)` 返回；
识物类需求直接用 `lw_look`，不必绕相机应用。
