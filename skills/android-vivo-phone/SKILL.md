---
name: android-vivo-phone
description: 在 vivo 电话与联系人（com.android.contacts）里打开拨号盘、查通话记录、查联系人或拨号时使用。典型场景：给某人打电话、看未接来电、找某个联系人的号码。触发词：打电话、拨号、通话记录、未接来电、联系人、号码。 不适用：发短信或社交软件消息（本机无对应技能）；回拨陌生、催收、验证码类来电（一律交回用户）。
app:
  name: 电话与联系人
  package: com.android.contacts
  platform: android
  vendor: vivo
  version_tested: "未记录（vivo V2417A / Android 16 ROM）"
  verified: "2026-10-10"
tags: [phone, contacts]
status: verified
author: yuloong07-star
tools_used: [ui_tree, screenshot, tap_by_text, tap_coord, type]
risk: high
danger_steps: ["拨号呼出", "删除通话记录", "删除联系人"]
---

## 概览

- **适合**：读通话记录、查联系人、打开拨号盘输入号码。
- **拨号是危险动作**：一键就把电话呼出去，任何拨打必须用户明确点头。

**启动注意**：`com.android.contacts` 同一个包名对应「电话」「联系人」两个桌面入口，
按包名启动会报歧义；组件 `activities.DialtactsActivity` 不存在（实测）。
**可靠做法是发 `ACTION_DIAL` intent**（实测成功，直接进拨号页）。

## 什么时候不要用我

- 发短信 / 发微信 → 不是本技能的范畴，微信消息另有流程
- 陌生来电、催收、疑似诈骗、验证码类 → 一律不代拨、不代接，交回用户
- 要给某人打电话 → 必须先把号码、归属、用哪张卡报给用户确认

## 前提

- 无障碍权限已授予。
- 本机双卡：拨号键有两个（电信/移动），看 desc 区分。

## 入口与结构（实测）

- 拨号页：标题「拨号」+ 按钮 desc=`选择`、desc=`更多`；过滤 tab 全部 / 未接。
- 通话记录列表：每条 `line1`（格式「已接来电,号码或标签」）、`label`（归属标注如「快递外卖 江苏南京」）、`date`、`to_detail`（desc=通话记录详情）。
- 推荐条：「开启广告推销电话拦截」提示，desc=`关闭` 可收起。
- 拨号盘 `dialpad_list`：按键 desc 格式「数字-,字母」（如 desc=`2-,ABC`），按 desc 点。
- 底部按钮：`dialButtonSim1` desc=**电信拨号**（文本「电信」）、`dialButtonSim2` desc=**移动拨号**（文本「移动」）；`dialpadOpenButton`（收起拨号盘）、`deleteButton`（desc=删除，退一位）。
- 底部 tab：拨号 / 联系人（desc）/ 收藏（desc）。

## 流程一：读未接来电

1. 发 `ACTION_DIAL` 打开拨号页（或从底部 tab 进）。
2. 点过滤 tab「未接」→ 读列表 `line1`+`label`+`date`。
3. 直接汇报条目（号码按需打码）。

## 流程二：查联系人

1. 底部 tab 点 desc=`联系人` → 进联系人列表页。
2. 用页内搜索（若有）按名字找，或滚动读。
3. 读到的号码属隐私：**只在用户要求拨号/展示时给出，不主动外传**。

## 流程三：拨号（危险，需确认）

1. 先把「要打给谁、号码、用哪张卡（电信/移动）」报给用户确认。
2. 用户同意后：点 `dialpadOpenButton` 打开拨号盘 → 按 desc 逐键输入号码 →
3. 点对应卡的拨号键（desc=电信拨号/移动拨号）→ 判据：进入通话界面。
4. **默认只允许拨到呼出即停的场景**；接通后的操作（挂断等）同样听用户指令。

## 已知坑

- **包名双入口**：按包名启动会报「reaches 2 apps」，用 `ACTION_DIAL` 或按入口名启动。
- **拨号盘按键文本重复**（数字在通话记录里也出现）：按 desc（含字母后缀）或拨号盘矩形内定位，别按裸数字全文匹配。
- **通话记录是真实隐私**：读到的号码不写进日志/记忆，汇报时按用户要求决定打码。
- **SIM 双键**：两张卡的拨号键并排，认准 desc 再点，打错卡会产生费用。

## 验证

- 拨号：进入通话界面才算呼出；没接通前可随时挂断。
- 查询：读到的 `line1`/`label` 与用户问题对得上再答复。

## 危险步骤

> ⚠️ **危险**：拨号会真实呼出并可能产生话费；删除通话记录/联系人不可恢复。
> 拨打前必须报「号码+归属+卡」等用户明确同意；删除类动作列清单确认后执行。
> 不代用户接打涉及借贷、验证码、陌生号码的电话。

## 工具映射（可选）

DeepSeek Harness（LittleWhale）：`lw_intent action=android.intent.action.DIAL` 打开拨号、`lw_tap text="未接"`/`text="联系人"`、拨号盘 `lw_tap` 按 desc、`lw_ui` 读记录。
