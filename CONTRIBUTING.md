# 贡献指南

## 一分钟上手

```bash
git clone https://github.com/yuloong07-star/app-skills
cd app-skills
cp -r skills/_template skills/android-你的应用
# 填 SKILL.md（frontmatter 里 tags/status/author 等字段见 schema/skill.frontmatter.md）
node tools/validate.mjs
node tools/app-skills-index.mjs build   # index.json 是生成物，不要手改这一份
```

`index.json` 由 `tools/app-skills-index.mjs` 从 SKILL.md 现算，体积、sha256、取用地址都在里面；
CI 会跑 `check` 核对，索引没重生成就会红。

## 技能必须回答的五个问题

一份能用的 App Skill，本质是在回答这五件事。缺任何一条，Agent 用起来就会卡。

1. **怎么进来** —— 包名/入口 Activity、应用内主要页面怎么切换。
2. **控件叫什么** —— 关键按钮的可见文本、`resource-id`、无障碍描述。不要写死像素坐标。
3. **怎么一步步走完** —— 有序步骤，每步一个动作。
4. **怎么知道成了** —— 每步的判据：屏幕应该出现什么文字/页面，或控件树里应该出现什么节点。
5. **哪里会翻车** —— 弹窗、二次确认、区域限制、会员限制、版本差异、WebView 无控件树。

## 写法约定

- 步骤用有序列表，一步一个动作；动作里点名控件时，用引号原样写出屏幕上的文字。
- 平台能力用中性词：`点击`、`输入`、`返回`、`读取屏幕文本`，不要绑死某个 Agent 的工具名；
  如果确实要用到具体工具，放在文件末尾的"工具映射"一节里，并注明框架。
- 未实测的部分显式标 `未验证`；实测过的写清版本与日期。
- 危险步骤（付款、删除、解绑、发布、授权、退出登录）用：

  > ⚠️ **危险**：说出后果（扣多少钱 / 数据能否恢复），并写明"执行前需用户确认"。

## 隐私红线

提交前自查，以下内容**一律不许出现**：

- 账号、手机号、邮箱、身份证、地址、验证码、订单号、金额明细
- 截图里的聊天内容、通讯录、相册缩略图
- 任何 token、cookie、密钥

示例一律用 `138****0000`、`¥00.00` 这样的占位写法。
需要配图时，只描述界面结构，不要提交真实截图；确需截图请先彻底打码。

## 提交信息

```
feat(android-vivo-notes): 补新建笔记流程
fix(ios-bilibili): 改版后「投币」按钮文案变了
docs: 规范补充危险步骤写法
```

## 评审看什么

1. `node tools/validate.mjs` 与 `node tools/app-skills-index.mjs check` 是否通过；
2. `index.json` 是否和目录同步（改过 SKILL.md 就要重新 build）；
3. 步骤是否可执行、判据是否明确；
4. 有没有把没验证的东西写成已验证。

## 声明

收录的应用名称、商标归各自权利人所有。本仓库只记录公开界面上的操作路径，
不含任何反编译代码、不绕过任何应用的安全机制、不鼓励自动化刷量或规避风控。
若你是应用方且不希望被收录，提 Issue 即可移除。
