---
name: android-vivo-theme
description: 在 vivo 主题（com.bbk.theme）里更换壁纸、主题、字体与息屏样式时使用。触发词：主题、换壁纸、换字体、息屏显示。
app:
  name: 主题
  package: com.bbk.theme
  platform: android
  version_tested: "未记录"
  verified: "未验证"
tools_used: [ui_tree, screenshot, ocr]
risk: low
danger_steps: ["付费主题购买"]
---

## 概览

> **骨架文件（draft）**：界面流程**尚未走查**，以下为待补清单，勿当作可执行步骤。

- 预期能力：换壁纸/主题/字体/息屏样式；部分资源付费。

## 已知信息

- 包名 `com.bbk.theme`，vivo 系统主题商店（Android）。

## 待走查清单

1. 冷启动入口与首页 tab（主题/壁纸/字体/息屏）。
2. 资源详情页的「应用/试用/购买」按钮区分（付费是危险步骤）。
3. 本地已购资源的管理入口。
4. ⚠️ 危险步骤：付费购买按钮与二次确认弹窗文案（须用户确认）。
5. 已知坑候选：会员订阅入口、免费资源的广告标签。
