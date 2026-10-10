---
name: android-vivo-calendar
description: 在 vivo 日历（com.bbk.calendar）里新建日程、搜索/修改已有日程、查看某天安排时使用。典型场景：把课表或会议写进日历、查询某天日程、补建一次性提醒。触发词：加日程、写进日历、安排提醒、查日历、明天有什么安排。 不适用：把教务课表批量同步进日历课程表（用 campus-schedule-sync）；结合课表与天气排一天行程（用 weather-trip-planning）。
app:
  name: 日历
  package: com.bbk.calendar
  platform: android
  version_tested: "未记录（vivo V2417A / Android 16 ROM）"
  verified: "2026-10-10"
tools_used: [ui_tree, screenshot, tap_by_text, type, swipe]
risk: low
danger_steps: []
---

## 概览

- **适合**：新建一次性日程、改时间/提醒/备注、按关键词搜日程、读某天安排。
- **不适合**：删除他人共享日程、改账号同步设置（须交回用户）。

两个核心发现：**标题框支持自然语言**（占位符就是「试着输入"明晚 7 点聚餐"」），
时间字段是**滚轮**（点按无效、只能拖动，改完等 1 秒再读）。

## 什么时候不要用我

- 批量导入/更新课程表 → 用 campus-schedule-sync 技能
- 要按当天天气与课程空档排一整天的行程 → 用 weather-trip-planning 技能
- 删除已有日程 → 属危险动作，不在本技能的自动流程内

## 前提

- 无账号可本地使用；写入的账号日历须已登录。
- 拖动滚轮时起止点都落在目标列矩形内。

## 入口

- 包名 `com.bbk.calendar`，组件 `.MainActivity`，冷启动直达主页。
- 主页（实测）：顶部年月 `gregorian_title`+`subtitle_month`、「默认视图」提示；按钮 `view_type_navi_btn`(视图导航)、`search_btn`(desc=搜索日程)、`menu_btn`(desc=更多)；分类 tab「全部」；日程列表 `agendalistview` 按日期分组（`tv_day_str` 日期、`tv_lunar_str` 农历、日程卡片 `ll_container` 内 `agenda_title`/`time`/`location`）；右下悬浮 `fab_button` **desc=新建日程**（按名点）；`btn_sync_agenda`(同步日程)、`btn_select_agenda`(选择)。

## 流程一：新建一条日程

1. 点 `fab_button`（新建日程）→ 判据：进入新建页，标题「新建日程」。
2. 新建页结构（实测）：顶栏 取消 / 完成 两个 Button；日程类型 RadioButton（个人/工作/生日/倒数日）+ `btn_calendars_setting`；`title` EditText（占位「试着输入"明晚 7 点聚餐"」）；「全天」Switch；开始/结束 `display_row`（summary 如「2026年10月10日 12:00」）；「提醒」`reminders_value_group`（summary「5分钟前」）；提醒方式 RadioButton（通知提醒/闹钟提醒）；「重复」`repeats_row`（summary「一次性日程」）；地点 `location_row` EditText「输入地点」；备注 EditText「输入备注」。
3. 写标题：直接在 `title` 输入——**若时间已在标题里说清（如"明晚7点聚餐"），应用会自动解析时间**；否则手动设第 4 步。
4. 改时间：点开始 `display_row` → 弹出日期/时间滚轮 → **拖动**目标列（日期/时/分各列独立）→ 等约 1 秒读 summary 确认已变。结束时间同理。
5. 点「完成」→ 判据：返回主页，目标日期分组出现该标题。

## 流程二：搜索并修改已有日程

1. 点 `search_btn`（搜索日程）→ 输入关键词 → 点结果行进入详情。
2. 详情页有编辑/删除入口（带无障碍动作）→ 改字段按流程一 → 保存。
3. 列表滚不动就用搜索直达。

## 流程三：读某天的安排

1. 主页直接读 `agendalistview`：每个日期组的 `agenda_title`+`time`+`location` 即当天日程。
2. 没有当天分组 = 当天无日程；跨屏内容滚动后再读。

## 已知坑

- **滚轮不吃点按**：日期/时间是拖动控件（日历时间滚轮在树里常暴露为 SeekBar），改值靠 `swipe`，改完等 1 秒再读，否则读到旧值误判失败。
- **标题自然语言**：能解析就别手动滚轮，省一半步骤；解析失败再手动设。
- **课程表视图只有周一至周五**：周末的课不能用「新建课程」承载（不显示），改用「新建日程」，标题写课程名、备注写补哪天。
- **地点是 POI 选择器**：直接打字不选候选，保存后地点为空。
- **窗口偶发消失**（虚拟屏上）：重新拉起应用即可，不必重建环境。
- **删除日程不可恢复**：属危险动作，执行前必须把「删哪条（标题+时间）」报给用户确认。

## 验证

- 保存后回到主页，**目标日期格子出现标题**；再用搜索按标题搜一次能搜到且时间正确，两路互证。
- 只看到「已保存」提示不算。

## 工具映射（可选）

DeepSeek Harness（LittleWhale）：`lw_swipe` 拖滚轮、`lw_ui` 读树、`lw_tap text=`（新建日程/搜索日程/完成/取消均为可按名控件）、`lw_type` 写标题。
