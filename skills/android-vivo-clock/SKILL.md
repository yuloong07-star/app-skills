---
name: android-vivo-clock
description: 在 vivo 闹钟时钟（com.android.BBKClock）里查看/新建/启停闹钟、看某个时区的当前时间、操作秒表与计时器时使用。典型场景：明早几点叫我、把 6 点的闹钟关掉、看现在纽约几点、帮我计个时。触发词：闹钟、叫我起床、定个提醒、世界时钟、计时器、秒表。 不适用：只想用一句自然语言让系统助手顺手设个闹钟（用 android-vivo-copilot 一步到位）；想按日期提醒某件事（用 android-vivo-calendar 建日程）。
app:
  name: 闹钟时钟
  package: com.android.BBKClock
  platform: android
  vendor: vivo
  version_tested: "vivo V2417A / Android 16"
  verified: "2026-10-11"
tags: [clock, alarm]
status: verified
author: yuloong07-star
tools_used: [ui_tree, screenshot, tap_by_text, tap_coord, type, swipe, system_key, launch_app]
risk: medium
danger_steps: ["关闭/删除主人的闹钟", "修改既有闹钟时间", "启用起床闹钟"]
---

## 概览

- **适合**：读现有闹钟（时间+重复+开关）、新建闹钟、开关单个闹钟、看世界时钟、用秒表与计时器。
- **不适合**：未经确认就动主人正在用的闹钟；跨日提醒（那是日历的活）。

四个要点：**底部四个分区** 闹钟 / 世界时钟 / 秒表 / 计时器；
**闹钟行的 desc 自带状态**（形如「已关闭,06:00,仅一次,开关」）；
**时间轮盘在控件树里是 SeekBar，其 text 就是当前小时/分钟**（拖动后读它即可验证）；
新建页的「重复 / 日期 / 铃声 / 稍后提醒 / 语音播报」都是带 summary 的设置行。

## 什么时候不要用我

- 一句话让系统助手设闹钟（不关心界面细节）→ android-vivo-copilot
- 「下周三提醒我交材料」这类带日期的 → android-vivo-calendar
- 只想读一次闹钟列表 → 仍可用本技能的读法（没有对应的 lw_* 工具）

## 前提

- 无障碍（屏幕读取）权限已授予。
- 实测环境：vivo V2417A / Android 16，2026-10-11 走查；屏幕 1260×2800。
- 动主人已有闹钟前**先读一遍原状态**（哪些开、哪些关），改完按需恢复。

## 入口

- 包名 `com.android.BBKClock`；冷启动组件是 `.Timer`，但落页通常是**闹钟**页（实测）。
- 单实例：已在运行时 `lw_launch` 只把它唤到前台，可能停在上次的秒表/计时器分区——
  **先看底部哪个分区高亮或读标题再动手**。

## 页面地图

```
闹钟分区
├─ 顶栏：标题「闹钟」+ desc=语音 + desc=更多
├─ 全关时的横幅：tv_clock_header_no_or_close_clock「已关闭所有闹钟」
├─ 列表 alarm_card_item（每条 = alarm_item_content，desc=「开关态,时间,重复规则,开关」）
│   行内：alarm_time(text/desc=时间) · label(重复规则) · item_check_box · bar_onff_layout(desc=「已关闭,开关」)
│         > Switch#bar_onoff
├─ FAB：bt_add_alarm desc=新建闹钟
└─ 更多菜单三项：**启用起床闹钟 / 编辑 / 设置**

新建闹钟页
├─ 顶栏：取消 / 标题「新建闹钟」/ 完成
├─ 时间轮盘：time_pick > bbk_hour(hour_parent) 与 bbk_minute(minute_parent)，**都是 SeekBar，text 即当前值**
└─ 设置行（item_preference，每行 title + summary）：
    重复(仅一次) · 日期(明天) · 闹钟名称 · 铃声与振动(默认铃声) · 提醒关闭后删除此闹钟 ·
    稍后提醒(间隔5分钟，提醒5次) · 稍后提醒报时 · 语音播报(关闭)

世界时钟分区：顶栏 标题 + desc=更多；时钟面板 view_world_clock(desc=当前时间)；FAB bt_add_time desc=添加城市
秒表分区：顶栏 标题 + desc=语音 + desc=更多；控件 bt_left(desc=计次) 与 bt_right(desc=开始/停止)
计时器分区：顶栏 同上；大按钮 bt_start(desc=开始)、「常用计时器」标题 + desc=新增(button_add)、
            列表每行 item_check_box + iv_start(desc=开始)
底部四分区：闹钟 / 世界时钟 / 秒表 / 计时器（tabLayout 内四个带 desc 的 FrameLayout）
```

## 控件速查表

| 控件 | id / desc | 动作 | 判据 |
| --- | --- | --- | --- |
| 新建闹钟 | `bt_add_alarm` desc=新建闹钟 | 点 | 进「新建闹钟」页 |
| 时间轮盘 | `bbk_hour` / `bbk_minute`（SeekBar） | 拖动 | 读它的 text 变成目标值 |
| 一条闹钟 | `alarm_card_item` / `alarm_item_content` | 读 desc | 「已关闭,HH:MM,重复规则,开关」 |
| 开关 | `bar_onoff`（Switch），外层 desc=「已关闭,开关」 | 点 | 等约 1 秒回读 Switch 态，或外层 desc 前缀 |
| 行内复选 | `item_check_box` | 点 | 进多选（用于批量删/改，未逐项验证） |
| 顶部横幅 | `tv_clock_header_no_or_close_clock` | 读 | 「已关闭所有闹钟」= 全关 |
| 更多 | 顶栏 desc=更多 | 点 | 菜单：启用起床闹钟 / 编辑 / 设置 |
| 世界时钟 添加城市 | `bt_add_time` desc=添加城市 | 点 | 城市搜索页 |
| 秒表 开始/计次 | `bt_right` desc=开始、`bt_left` desc=计次 | 点 | 计时开始 / 记录一段 |
| 计时器 开始 | `bt_start` desc=开始 / `iv_start` | 点 | 倒计时启动 |

## 流程

### 一、读全部闹钟（只读，最常用）

1. `lw_launch(displayId, "com.android.BBKClock")`；判据：底部「闹钟」分区高亮、标题「闹钟」。
2. 读每条 `alarm_item_content` 的 desc：**一行里就有开关态、时间、重复规则**，直接汇报。
3. 顶部若有「已关闭所有闹钟」横幅，说明全部处于关闭态。
4. 一行一个闹钟；数量多时可 `lw_swipe` 翻列表。

### 二、新建闹钟

1. 点 `bt_add_alarm`（desc=新建闹钟）→ 判据：出现时间轮盘与「重复/日期/闹钟名称…」设置行。
2. 拖 `bbk_hour` / `bbk_minute` 到目标值 → **等约 1 秒**读 SeekBar 的 text 确认（这是验证拖动生效的抓手）。
3. 按需改设置行：重复（仅一次/每天/工作日…）、日期、名称、铃声与振动、稍后提醒、语音播报。
4. 点顶栏「完成」→ 判据：回闹钟列表，出现该时间的新条目，且开关为开。
5. 复核：再读一次该条 `alarm_item_content` 的 desc（时间与重复规则一致）。

### 三、开/关一个闹钟（改主人既有设置，先确认）

1. 先读全部闹钟并**把「哪个时间、原来是开还是关」报给主人**（见危险步骤）。
2. 点该条的 `bar_onoff`（或它的外层 `bar_onff_layout`）。
3. **等约 1 秒**回读 Switch 的 checkable 与外层 desc 前缀——两路一致才算改成功。
4. 若只是测量而主人没要求改动，改回原值并说明。

### 四、看某个时区的时间

1. 点底部分区「世界时钟」→ 判据：标题「世界时钟」。
2. 读 `view_world_clock` 的 desc（形如「15:19:10」，即该城市当前时间）；
   城市名在面板上的文本里（没加过的城市要先点 desc=添加城市 搜索）。
3. 只读不写时不要点「添加城市」。

### 五、秒表与计时器

- 秒表：点「秒表」分区 → 点 `bt_right`(desc=开始) 开始/停止，`bt_left`(desc=计次) 记一段。
- 计时器：点「计时器」分区 → 大按钮 `bt_start`(desc=开始) 启动默认时长；
  「常用计时器」里可点 `button_add`(desc=新增) 加一个常用时长。
- 这两处都会真的计时，用完记得停掉（再点一次同一按钮）。

## 已知坑

- **时间轮盘没有 a11y 节点细项**：它只暴露成一整块 SeekBar，只能整列拖动；
  拖完必须回读 text（`bbk_hour` / `bbk_minute`），否则会把「没动」当成「动了」。
- **开关状态要等**：点 `bar_onoff` 后立刻读会读到旧值，等约 1 秒。
- **入口 Activity 与落页不一致**：组件是 `.Timer` 却可能直接显示闹钟页，以标题为准。
- **单实例 + 记分区**：重新 launch 可能停在秒表或计时器，先看底部分区。
- **闹钟时间是 12/24 小时制**：读到的 text 形如「06:00」，汇报时按主人习惯说明是上午还是下午。
- **「日期」行的 summary**：新建时默认「明天」，改时间不等于改日期，跨天场景要一起看。
- **误触风险高**：列表里点一下开关就改了主人的闹钟，**没有撤销**；
  不需要改时不要顺手点（列表本身是只读观察）。

## 验证

- 新建：列表出现目标时间的新条目 **且** 其开关为开。
- 启停：回读 `bar_onoff` 的 checkable + 外层 desc 前缀，两路一致。
- 改时间：读 `bbk_hour` / `bbk_minute` 的 text。
- 世界时钟：读 `view_world_clock` 的 desc，并可与 `lw_device`/系统时间对账。

## 未验证清单（2026-10-11 走查范围之外）

- 更多菜单里 **启用起床闹钟 / 编辑 / 设置** 的落地页（只确认菜单项存在）。
- 多选（`item_check_box`）之后的批量操作项。
- 「重复 / 日期 / 铃声与振动 / 稍后提醒 / 语音播报」各弹窗里的可选项列表。
- 世界时钟「添加城市」的搜索页与秒表「计次」列表的细节。
- 起床闹钟（vivo 的睡眠相关功能）与节日闹钟等系统能力。

## 危险步骤

> ⚠️ **危险**：关掉主人正在用的闹钟会导致他起不来床；删除闹钟不可恢复。
> 任何**启停、删除、改时间**动作执行前，把「哪个时间、原来开还是关、改成什么」报给主人确认；
> 不确认就只读不写。**「编辑」菜单不要在没有明确要求时点**（会覆盖主人的设置）。
> 主人自己的测试闹钟（如 Agent 为验证流程新建的）验证完当场删掉并说明。

## 工具映射（本机 LittleWhale）

`lw_launch("com.android.BBKClock")`、`lw_ui` / `lw_ui_dump` 读树、`lw_tap(text=…)` 按 desc/标题点、
`lw_swipe` 拖时间轮盘、`lw_key(BACK)` 返回；
本机没有直接读写闹钟的工具，改闹钟只能走这个界面（或让蓝心小V代设）。
