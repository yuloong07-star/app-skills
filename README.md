# app-skills · 各应用操作指南

> 让 AI Agent 直接会用的应用操作技能集。
> App operation skills any AI agent can load — one app, one `SKILL.md`.

## 这是什么

现在的 AI Agent（Claude Code / Codex / DeepSeek Harness / 各种手机 Agent）都能"操作手机"，
但它们**不熟悉每个具体应用怎么走流程**：去哪儿点"新建"、验证码在哪个页面、哪一步会弹二次确认、
什么按钮点了会扣钱。

这个仓库把这些经验做成**可被 Agent 直接加载的技能（Skill）**：
每个应用一个目录、一份 `SKILL.md`，写清包名、入口、关键控件的定位方式、完整操作流程、
已知坑与验证方法。Agent 装上就能用，人照着做也是份现成的操作手册。

一份好的 App Skill 不是"教程"，而是**给机器执行的路线图**：控件用文本/id 描述而不是固定像素坐标，
每一步都带"怎么确认这步成功了"，危险动作（付款、删除、发布）单独标出来。

## 目录结构

```
.
├── skills/<app-id>/SKILL.md      # 一个应用一份技能（Agent 读这个）
├── skills/<app-id>/examples/     # 可选：录制/整理的控件树、OCR 片段、截图说明
├── index.json                    # 机器可读索引：app-id / 包名 / 平台 / 标签 / 状态
├── schema/skill.schema.json      # SKILL.md frontmatter 的校验规则
└── tools/validate.mjs            # 本地校验：frontmatter + index.json 是否一致
```

`<app-id>` 用小写连字符，优先 `平台-应用名`：`android-vivo-notes`、`ios-bilibili`。

## 快速开始

**用现成的**：把 `skills/` 下你要的目录拷进你 Agent 的技能目录。
DeepSeek Harness 是 `$DSH_HOME/skills/`，Claude Code 是 `~/.claude/skills/`，
其它框架只要能加载 `SKILL.md`（YAML frontmatter + Markdown 正文）就能用。

**写一份新的**：抄 [`skills/_template/SKILL.md`](skills/_template/SKILL.md)，
改 frontmatter，按"定位方式 → 分步流程 → 已知坑 → 验证"的顺序填。
写完跑一次校验：

```bash
node tools/validate.mjs          # 检查全部
node tools/validate.mjs --app android-vivo-notes
```

## SKILL.md 长什么样

```markdown
---
name: android-vivo-notes          # 与目录名一致，kebab-case
description: 在 vivo 原子笔记里新建/查找/改写笔记时使用……
app:
  name: 原子笔记
  package: com.android.notes
  platform: android
  version_tested: "1.0.4"
  verified: "2026-10-10"
tools_used: [ui_tree, screenshot, ocr, tap_by_text]
risk: low                          # low | medium | high（涉及支付/删除/发布用 high）
---

## 概览 / 前提
## 入口
## 关键控件（用文本或 resource-id 描述，不要写死像素坐标）
## 流程：新建一篇笔记
1. …
## 已知坑
## 验证
```

## 规范要点（写之前请读）

1. **坐标不写死**。控件用可见文本、`resource-id`、无障碍描述来指路；坐标只在"仅此一处"时才写，
   并标注屏幕尺寸与像素密度。
2. **每步都要可验证**。写清"做完这步，屏幕上应该出现什么"，让 Agent 有判据，而不是盲点。
3. **危险步骤单独标记**。付款、删除、解绑、发布、授权，一律加 `> ⚠️ 危险` 引用块，
   写清影响面与是否可逆。
4. **标注测试环境**。手机型号、系统版本、应用版本、日期。没实测过的部分要写 `未验证`，
   不许把猜的写成真的。
5. **不写账号、密码、手机号、验证码、订单号**。示例数据一律打码。
6. **一份技能只讲一个应用**。跨应用流程（比如"从日程跳到闹钟"）放 `skills/_flows/`。

## 贡献

欢迎任何应用、任何平台（Android / iOS / 鸿蒙 / Web 版应用均可），
也欢迎只补一个坑、只修一句描述。

- 新增应用：复制 `skills/_template/`，按上面的规范填，提交 PR
- 修 bug / 补坑：直接改对应 `SKILL.md`，在 PR 里写清"哪句错、凭什么"
- 有疑问或想认领应用：提 [Issue](.github/ISSUE_TEMPLATE/app-skill-request.yml)

PR 合并要求：`node tools/validate.mjs` 通过；`index.json` 与技能目录同步；
`verified` 日期是你真的跑过的日期。

## 收录状态

见 [`index.json`](index.json)。`status` 三档：

- `verified` — 在标注的版本上完整跑通过
- `draft` — 结构完整、部分步骤未实测
- `broken` — 应用改版后失效，等待修复（很欢迎 PR）

## 许可

[MIT](LICENSE)。技能内容本身就是给人看、给机器读的文档，随便用。
