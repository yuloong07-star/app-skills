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

## 索引仓库：抓一个地址就能用

本仓库同时是一份**索引仓库**：根目录的 `index.json` 是那份机器索引，里面每个字段都是从
`skills/*/SKILL.md` 现算出来的（体积、sha256、标签、状态、取用地址），所以别人不用 clone、
不用翻目录也能取用：

1. 抓索引。地址钉在**内容 tag** `index-1` 上，不随 `main` 改动，取回来就能对上：

   ```
   https://cdn.jsdelivr.net/gh/yuloong07-star/app-skills@index-1/index.json
   ```

   同一个文件另有三处等价的 jsDelivr 域，通不了就换开头的主机名：
   `fastly.jsdelivr.net` / `gcore.jsdelivr.net` / `testingcf.jsdelivr.net`。

2. 在 `apps` 里挑。`status: verified` 才建议放进常驻技能目录，`draft` 是骨架、留在冷存储；
   `risk: high` 的流程含付款/删除/发布这类不可逆动作，先看它的 `danger_steps`。
   挑的时候看 `package`、`tags`、`description` 就够，不必先读全文。

3. 按那一条的 `url` 取 `SKILL.md`，放进你的技能目录（DeepSeek Harness 是 `$DSH_HOME/skills/<id>/`，
   Claude Code 是 `~/.claude/skills/<id>/`）。取回来用 `sha256` 与 `size` 对一下，就知道有没有取岔。

4. `deprecated` 里点名的 app-id 别再用，照它写的换一份。

索引是生成物，不是手写文件：

```bash
node tools/app-skills-index.mjs build     # 从 skills/ 重新生成 index.json
node tools/app-skills-index.mjs check     # 索引与技能目录对账（CI 跑的是这一条）
```

**tag 钉的是内容**：改了任何一份 SKILL.md，就要换一个 tag（`--ref index-2`）再 build ——
否则别人手里的 sha256 与他按旧地址取回的内容对不上。

## 目录结构

```
.
├── skills/<app-id>/SKILL.md      # 一个应用一份技能（Agent 读这个）
├── skills/<app-id>/examples/     # 可选：录制/整理的控件树、OCR 片段、截图说明
├── index.json                    # 机器索引（生成物，别手改）：包名/平台/标签/状态/体积/sha256/取用地址
├── schema/index.schema.json      # index.json 的字段规范
├── schema/skill.frontmatter.md   # SKILL.md frontmatter 的字段规范
└── tools/
    ├── validate.mjs              # 本地校验：frontmatter 写得对不对、index.json 与目录是否同步
    ├── app-skills-index.mjs      # 索引生成与对账（build / check）
    └── lib/frontmatter.mjs       # 上面两个工具共用的 frontmatter 解析（只此一份，免得两边解析出不同结果）
```

`<app-id>` 用小写连字符，优先 `平台-应用名`：`android-vivo-notes`、`ios-bilibili`。

## 快速开始

**用现成的**：抓上面那份 `index.json`，挑一条按 `url` 取 `SKILL.md`；也可以直接 clone 后把
`skills/` 下你要的目录拷进你 Agent 的技能目录。
DeepSeek Harness 是 `$DSH_HOME/skills/`，Claude Code 是 `~/.claude/skills/`，
其它框架只要能加载 `SKILL.md`（YAML frontmatter + Markdown 正文）就能用。

**写一份新的**：抄 [`skills/_template/SKILL.md`](skills/_template/SKILL.md)，
改 frontmatter，按"定位方式 → 分步流程 → 已知坑 → 验证"的顺序填。
写完跑一次校验、再把索引重新生成：

```bash
node tools/validate.mjs                  # 检查全部
node tools/validate.mjs --app android-vivo-notes
node tools/app-skills-index.mjs build    # 改过内容就要重生成 index.json
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

## 收录规模与常驻策略（写新技能前先读）

技能目录是**全量常驻**的：每份 SKILL.md 的 name 与 description 都会整条进系统提示，
框架不做检索、不做数量上限、不做分组。**因此条数本身就是成本**——几十条尚可，
上百条会明显出现「明明有技能却选错」、上下文变贵、响应变慢的现象。

本仓库从 2026-10 起按这套办法收：

1. **description 末尾必须写边界**：加一句「不适用：…」，并点名叫该用哪份别的技能。
   误选大多不是模型笨，而是描述边界不清。
2. **实测与骨架分开对待**：`status: draft`（`verified: 未验证`）的骨架技能不要长期常驻加载，
   留一份在仓库即可，等补完实测再启用。
3. **常驻保持精简**：同一应用只留一份技能；同一能力的两种粒度（如"查天气"与"查天气+排行程"）
   要拆成两份时，必须互相写清边界。
4. **分组优先于堆叠**：一个应用的多条流程写在同一份 SKILL.md 里分节，
   不要为一个动作新建一份技能。
5. **按需分层**：取用本仓库技能时，先看 `index.json` 的 `status`，
   只把 `verified` 的放进常驻目录；`draft` 的留在冷存储，需要时再拷。

## 贡献

欢迎任何应用、任何平台（Android / iOS / 鸿蒙 / Web 版应用均可），
也欢迎只补一个坑、只修一句描述。

- 新增应用：复制 `skills/_template/`，按上面的规范填，提交 PR
- 修 bug / 补坑：直接改对应 `SKILL.md`，在 PR 里写清"哪句错、凭什么"
- 有疑问或想认领应用：提 [Issue](.github/ISSUE_TEMPLATE/app-skill-request.yml)

PR 合并要求：`node tools/validate.mjs` 与 `node tools/app-skills-index.mjs check` 都通过；
`index.json` 与技能目录同步；`verified` 日期是你真的跑过的日期。

## 收录状态

见 [`index.json`](index.json)。`status` 三档：

- `verified` — 在标注的版本上完整跑通过
- `draft` — 结构完整、部分步骤未实测
- `broken` — 应用改版后失效，等待修复（很欢迎 PR）

## 许可

[MIT](LICENSE)。技能内容本身就是给人看、给机器读的文档，随便用。
