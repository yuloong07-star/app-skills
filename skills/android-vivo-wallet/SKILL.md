---
name: android-vivo-wallet
description: 在 vivo 钱包（com.vivo.wallet）里查看交通卡、门禁卡、余额与优惠券时使用。触发词：钱包、交通卡、NFC刷卡、门禁卡、公交卡余额。
app:
  name: 钱包
  package: com.vivo.wallet
  platform: android
  vendor: vivo
  version_tested: "未记录"
  verified: "未验证"
tags: [wallet, nfc]
status: draft
author: yuloong07-star
tools_used: [ui_tree, screenshot, ocr]
risk: high
danger_steps: ["充值", "开通新卡", "绑定银行卡"]
---

## 概览

> **骨架文件（draft）**：界面流程**尚未走查**，以下为待补清单，勿当作可执行步骤。
> 涉及资金（充值/开卡/绑卡），**任何写操作都必须用户确认，默认只读**。

- 预期能力：交通卡余额与充值、门禁卡管理、银行卡与优惠券。

## 已知信息

- 包名 `com.vivo.wallet`，vivo 系统钱包（Android），依赖 NFC。

## 待走查清单

1. 冷启动入口与首页分区（卡包/优惠/我的）。
2. 只读流程：交通卡余额查看、卡列表读取（这是本技能的默认安全路径）。
3. ⚠️ 危险步骤：充值、开新卡、绑银行卡的入口与确认弹窗文案——**只记录路径，不执行**。
4. 门禁卡模拟的开卡流程（涉及写卡，须用户操作）。
5. 已知坑候选：需 vivo 账号登录、部分卡种因机型不支持。
