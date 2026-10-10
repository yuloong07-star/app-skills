# SKILL.md frontmatter 规范

技能文件必须是 YAML frontmatter + Markdown 正文，frontmatter 用 `---` 包起来：

```yaml
---
name: android-vivo-notes       # 必填，kebab-case，且与所在目录名一致
description: 一句话说明"什么时候用这份技能"，写清触发场景，别写"这是一个……的技能"
app:                            # 必填
  name: 原子笔记                 # 应用常见中文名
  package: com.android.notes     # Android 包名 / iOS Bundle ID / 网站域名
  platform: android              # android | ios | harmony | web | other
  version_tested: "1.0.4"        # 实测版本；未实测写 未验证
  verified: "2026-10-10"         # 实测日期 YYYY-MM-DD
tools_used: [ui_tree, screenshot, ocr, tap_by_text]
risk: low                       # low | medium | high
danger_steps: []                # 危险步骤的标题，如 ["提交订单", "删除笔记"]
---

## 概览
## 前提
## 入口
## 关键控件
## 流程
## 已知坑
## 验证
## 工具映射（可选）
```

## 字段说明

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `name` | 是 | 与目录名一致，Agent 用它来引用技能 |
| `description` | 是 | 决定 Agent 什么时候想起它，务必写触发场景 |
| `app.name` | 是 | 人看的应用名 |
| `app.package` | 是 | 机器定位应用的唯一标识 |
| `app.platform` | 是 | 平台枚举 |
| `app.version_tested` | 是 | 没实测就写 `未验证`，不许猜 |
| `app.verified` | 是 | 日期，方便判断是否过期 |
| `tools_used` | 否 | 中性能力名，见下 |
| `risk` | 是 | `high` 表示流程里含付款/删除/发布等不可逆动作 |
| `danger_steps` | 否 | 危险步骤的标题列表，便于 Agent 提前打招呼 |

## `tools_used` 推荐用词（中性、别绑框架）

`ui_tree`（读控件树）、`screenshot`、`ocr`、`tap_by_text`、`tap_coord`、`type`、`swipe`、
`system_key`、`launch_app`、`clipboard`、`notification`、`file_io`。

## 正文要求

- 用有序步骤描述流程，每步一个动作；
- 每步之后写判据（"应该看到……"）；
- 危险步骤用 `> ⚠️ **危险**：…` 引用块；
- 顶部"概览"里用一句话说明这应用适合让 Agent 干什么、不适合干什么。
