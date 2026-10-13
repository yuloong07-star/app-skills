---
name: android-vivo-weather
description: 用 vivo 天气（com.vivo.weather）读当前天气、未来多日预报、空气质量与生活指数，或切换城市查看时使用。典型场景：今天穿什么、明天有没有雨、南京空气怎么样。触发词：天气、气温、下雨吗、穿什么、空气质量、未来几天。 不适用：要历史天气或分钟级降水精度（走 web 数据源）；把天气与课表结合起来排行程（用 weather-trip-planning）。
app:
  name: 天气
  package: com.vivo.weather
  platform: android
  vendor: vivo
  version_tested: "未记录（vivo V2417A / Android 16 ROM）"
  verified: "2026-10-10"
tags: [weather, life]
status: verified
author: yuloong07-star
tools_used: [ui_tree, screenshot, swipe]
risk: low
danger_steps: []
---

## 概览

vivo 天气的无障碍做得极好：**几乎所有数据都在控件的 desc 里，直接读树即可**，无需 OCR。
- **适合**：读当前/未来天气、空气、指数；横滑切换城市。
- 读到的数据若要对外答复，可与外部源（wttr.in 等）交叉验证，两源不一致时如实说明。

## 什么时候不要用我

- 历史天气、往年同期、分钟级降水 → 走 web 数据源（App 只给当前与未来）
- 要结合当天课程空档安排行程 → 用 weather-trip-planning 技能
- 数据要对外发布或引用 → 用外部源交叉验证并注明来源与读取时间

## 入口

- 包名 `com.vivo.weather`，组件 `.WeatherMain`，冷启动直达当前城市页。
- 页面是**多城市 ViewPager**：左右横滑切换城市（每城一页，页内纵向滚动）。

## 数据字段速查（实测控件，直接读文本/desc）

| 信息 | 控件 | 示例 |
| --- | --- | --- |
| 当前天气 | `tv_condition` | 晴 |
| 当前温区 | `live_hign_low_temp` | 15 ~ 26 |
| 当前大温度 | `live_temp_text`（区域） | — |
| PM2.5 / 紫外线 | `cl_pm25_root` desc、`cl_uv_root` desc | 「pm2点5,19」「紫外线,强」 |
| 未来逐日 | 逐行 Button **desc 全含** | 「10月11日,明天,多云,15 到 26摄氏度,」 |
| 详情卡 | `detail_item_card_root` desc 全含 | 「体感,28℃,温暖,」「湿度,50%,适中,」「西南风,3级,」 |
| 空气质量 | `aqi_import` desc | 「空气质量,优,46,」 |
| 日出日落/月出月落 | `sunlayout_import` desc | 「日出时间06:04,日落时间17:39…」 |
| 生活指数 | `recommend_root` desc 一组 | 「穿衣,春秋装」「旅游,适宜」「洗车,较适宜」 |
| 穿衣建议条 | `banner_button` 内 `vbutton_title` | 「天气舒适，建议穿长袖…」 |

## 流程一：读今天的天气并答复

1. 启动天气 → 判据：`tv_condition` 出现。
2. 读 `tv_condition` + `live_hign_low_temp` + `live_temp_text`。
3. 需要指数时读对应 `detail_item_card_root` / `recommend_root` 的 desc。
4. 直接把读到的值组织成答复；不臆造未读到的字段。

## 流程二：读未来 N 天

1. 页内向下滚动（`lw_scroll` 或读已渲染的行——逐日行通常一屏内有 5-7 天）。
2. 逐行读 Button desc（格式固定：日期,星期,天气,温区[,降水概率]）。
3. 「查看更多天气」`forecast_future_fold_view` 可展开 15 天。

## 流程三：切城市

1. 横滑（`lw_swipe` 从右向左）翻到相邻城市页。
2. 回读 `tv_condition` 与温区确认已切换到目标城市（两页数据不同）。

## 已知坑

- **desc 即数据**：读 desc 优先于读子文本，desc 一行就是完整记录。
- **页面很长**：内容在 `ScrollView` 里，超出部分要滚动；滚动后再读。
- **多城市页并存**：树里可能同时出现相邻页的控件（横坐标超出屏宽），按坐标范围区分当前页。
- **数据时效**：App 数据可能滞后，答复时说明取自天气 App 与读取时间；要更高可信度就与外部源互证。

## 验证

- 关键答复（如明天有雨）用两路：App 的逐日 desc + 外部天气源（wttr.in 的中文字段），不一致时如实报告两边结果。

## 工具映射（可选）

DeepSeek Harness（LittleWhale）：`lw_ui` 直接读 desc、`lw_scroll` 翻页、`lw_swipe` 横滑切城市。
