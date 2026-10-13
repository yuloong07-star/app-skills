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
  vendor: vivo                   # 应用出品方，如 vivo / 字节 / 独立
  version_tested: "1.0.4"        # 实测版本；未实测写 未验证
  verified: "2026-10-10"         # 实测日期 YYYY-MM-DD；没走查过写 未验证
tags: [notes, productivity]      # 必填，检索与分组用（小写英文词）
status: verified                 # 必填，verified | draft | broken
author: yuloong07-star           # 必填，GitHub 用户名
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
| `app.vendor` | 是 | 出品方；同一厂商的应用成组 |
| `app.version_tested` | 是 | 没实测就写 `未验证`，不许猜 |
| `app.verified` | 是 | 日期，方便判断是否过期；没走查过写 `未验证` |
| `tags` | 是 | 小写英文词，检索用；一个应用两三个就够 |
| `status` | 是 | `verified` 已跑通 / `draft` 骨架 / `broken` 改版失效 |
| `author` | 是 | 谁写的、谁实测的 |
| `tools_used` | 否 | 中性能力名，见下 |
| `risk` | 是 | `high` 表示流程里含付款/删除/发布等不可逆动作 |
| `danger_steps` | 否 | 危险步骤的标题列表，便于 Agent 提前打招呼 |

## 这几项会被算进 index.json，别写自相矛盾的

根目录的 `index.json` 是 **生成物**，不是手写文件：`node tools/app-skills-index.mjs build` 会把每份
SKILL.md 的上面这些字段连同文件名、体积、sha256、取用地址一起算出来写进去。因此：

- `app.verified` 写着「未验证」的，`status` 只能是 `draft`，`risk` 也不许是 `high`
  —— 骨架期的技能不该被当成跑通过的技能发出去；
- 改了任何一份 SKILL.md，就要重跑一次 build 并提交新的 `index.json`，
  否则 CI 的 `node tools/app-skills-index.mjs check` 会失败；
- 内容 tag（`--ref`，默认 `index-1`）钉的是内容：**改过内容就得换 tag**，
  否则别人拿到的 sha256 与他按 url 取回的内容对不上。

改完自检：

```bash
node tools/validate.mjs            # 写得对不对（字段、规范、隐私、危险标记）
node tools/app-skills-index.mjs check   # 索引与技能目录对不对得上
```

## `tools_used` 推荐用词（中性、别绑框架）

`ui_tree`（读控件树）、`screenshot`、`ocr`、`tap_by_text`、`tap_coord`、`type`、`swipe`、`scroll`、
`system_key`、`launch_app`、`clipboard`、`notification`、`file_io`。

## 正文要求

- 用有序步骤描述流程，每步一个动作；
- 每步之后写判据（"应该看到……"）；
- 危险步骤用 `> ⚠️ **危险**：…` 引用块；
- 顶部"概览"里用一句话说明这应用适合让 Agent 干什么、不适合干什么。
