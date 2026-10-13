---
name: android-vivo-notes
description: 在 vivo 原子笔记（com.android.notes）里新建/追加/查找笔记、管理待办与文档、建文件夹或找回最近删除时使用。典型场景：把整理好的长文存进指定笔记、每日往同一笔记追加一行、在文件夹间归档、勾掉一条待办。触发词：记笔记、存进笔记、原子笔记、往笔记里加一段、建文件夹、新建待办、笔记里的文档。 不适用：往「健康日报」那类有专门流程的单篇笔记里写数据（用 health-daily-report）；需要账号协作的云笔记（本机没有）。
app:
  name: 原子笔记
  package: com.android.notes
  platform: android
  vendor: vivo
  version_tested: "5.4.5.107（vivo V2417A / Android 16）"
  verified: "2026-10-11"
tags: [notes, productivity]
status: verified
author: yuloong07-star
tools_used: [ui_tree, screenshot, ocr, tap_by_text, tap_coord, type, swipe, system_key, launch_app]
risk: medium
danger_steps: ["删除笔记/待办/文档", "清空最近删除", "移入原子隐私系统", "加锁"]
---

## 概览

- **适合**：新建/追加/查找笔记，管理文件夹（建、改名、颜色、子文件夹、移动），读列表与字数，
  以及同一应用里的 **待办** 与 **文档** 两个分区、**我的** 分区里的同步开关、「最近删除」。
- **不适合**：批量删除、清空回收站、账号与云同步设置（不可逆或涉及账号，交回主人）。

一句话结构：底部四分区（笔记 / 待办 / 文档 / 我的）+ 左滑不出的**左侧文件夹抽屉**，
「笔记」列表是卡片式（标题 + 首行 + 时间 + 可选重要度/标签），点卡片进编辑页，
编辑页顶部两个按钮（页面布局 / 更多）藏着全部高阶功能。

## 什么时候不要用我

- 往标题固定的专门笔记里写数据（如「健康日报」）→ 用 health-daily-report，它自带日期过滤与写入流程
- 只想读某份文件的内容 → 用文件工具直接读，不必进笔记应用
- 要「记住一件事以后提醒我」→ 那是闹钟/日历/自动指令的活，不是笔记

## 前提

- 无障碍（屏幕读取）权限已授予；无需登录即可本地使用。
- 实测版本 **5.4.5.107**（vivo V2417A / Android 16），2026-10-11 走查。
- 屏幕坐标系：实测于 1260×2800 的屏；下文矩形一律从 `lw_ui` 实时取，**不要把像素抄进流程**。
- 长文**一次性整段写入**，不要分段追加（分段写会被后段覆盖）。

## 入口

- 包名 `com.android.notes`，启动组件 `com.android.notes/.Notes`，冷启动直达**笔记**分区列表。
- 应用与本机其它笔记应用无冲突；单实例，已在别处运行时 `lw_launch` 只把它唤到前台。
- 应用内四个分区的顺序固定：笔记 / 待办 / 文档 / 我的（底部 `nav_container`，行 `desc` 即分区名）。

## 页面地图

```
笔记分区（首页）
├─ 顶栏 orginui_vtoolbar_*：logo(desc=原子笔记→vivo账号页)、标题「全部」+副标题「N篇笔记」、
│  desc=搜索、desc=排序
├─ 文件夹抽屉（点顶栏标题「全部」展开；打开后左侧 main_side_container 占 970px）
│  ├─ 「编辑文件夹」（desc）→ 编辑文件夹页
│  ├─ 全部 / 未分类（各带数量）
│  ├─ 「新建文件夹」（desc）→ 新建文件夹弹窗
│  └─ 每个文件夹行 item_root：名称 + 数量 + 展开箭头（ll_fold / expand_icon desc=展开）
├─ 笔记列表 note_list：卡片 note_list_card_view（标题 note_title + 首行 first_content + 时间 +
│  可选「设置重要度」importance_text_view / 标签 label_layout / 缩略图 thumb_view）
└─ 右下 FAB add_icon_layout → Button#add_icon desc=新建笔记 → 编辑页

待办分区（tab_todo）
├─ 顶栏：标题「待办」+副标题「N条待办」、desc=搜索、desc=排序
├─ 列表 todo_list：每行 = 复选框 state_cb + 内容 content_tv(desc="未完成/已完成,<内容>")
│  + bt_todo_item_color(desc=颜色) + bt_todo_item_notice(desc=提醒) + bt_todo_item_delete(desc=删除)
└─ 右下 FAB Button#add_icon desc=新建待办

文档分区（tab_word）
├─ 顶栏：标题「文档」+副标题「N个文档」、desc=搜索、desc=排序
├─ 类型页签行：全部 / PDF / DOC / XLS / PPT / TXT
├─ 列表 file_list：按日期分组（divider_name），行内 name + size(时间 大小) + 行尾 menu
├─ 权限提示条 tv_content（第三方应用收发的文档可能读不到）+ close_document_tips(desc=关闭)
├─ 长按任意行 → 多选模式：每行出现 item_checkbox，顶栏变「全选 / 已选择N项 / 取消」，底部出现操作栏
└─ 右下 Button#new_iv desc=新建文档

我的分区（folder）
├─ 账号卡（头像 desc=vivo账号、昵称、脱敏手机号）→ vivo账号页
├─ 「我的创作」
├─ 云空间卡片（已用/总量、desc=关闭）
├─ 数据同步：自动同步原子笔记 Switch、自动同步的文档范围（指定文档）、使用数据网络同步 Switch
│  以及云空间已满时的提示条 + 「升级云空间」+ 关闭
└─ 其他设置：在电脑、iPad 编辑笔记 / 最近删除(N) / 设置

编辑页（点卡片或新建进入）
├─ 阅读态顶栏：back_btn(desc=返回)、edit_all(desc=页面布局)、more_btn(desc=更多)
├─ 标题 title_edit_text、时间 edit_time、字数 count_word、所属文件夹 note_folder_text + note_folder_down
├─ 正文 line_edit_text
└─ 点标题/正文进编辑态：顶栏换为 iv_undo(desc=撤销) / iv_redo(desc=恢复) / finish_edit(desc=完成)，
   底部浮出工具条 ly_rich_editor_sheet（小V写作 / 素材效果 / 文本编辑 / 段落编辑 / 待办事项 /
   拍摄或选择图片 / 添加附件）

二级页：编辑文件夹页、新建文件夹弹窗、笔记排序弹窗、搜索页（含搜索结果）、设置页、
        最近删除页、vivo账号页
```

## 控件速查表

**列表与顶栏（笔记分区）**

| 控件 | id / desc | 动作 | 判据 |
| --- | --- | --- | --- |
| 折叠顶栏标题 | `originui_vtoolbar_normal_title_rom14_0`（文本=当前文件夹名，如「全部」） | 点 | **展开左侧文件夹抽屉**（不是切换分区） |
| 顶栏副标题 | `originui_vtoolbar_normal_sub_title_rom14_0` | 读 | 「N篇笔记」，可作增删断言 |
| 搜索 | desc=搜索 | 点 | 进搜索页 |
| 排序 | desc=排序 | 点 | 弹「笔记排序」弹窗（4 个单选项 + 取消） |
| 应用 logo | desc=原子笔记 | 点 | 进 **vivo账号页**（不是文件夹！） |
| 新建笔记 | Button#add_icon desc=新建笔记（外层 `add_icon_layout`） | 点 | 进编辑页（新建态） |
| 列表卡片 | `note_list_card_view` 内 `note_title` / `first_content` | 按标题文本点 | 进编辑页（该笔记） |
| 卡片重要度 | `importance_text_view`「设置重要度」 | 点 | 长按卡片亦可达（本轮未展开验证） |

**文件夹抽屉**

| 控件 | id / desc | 动作 | 判据 |
| --- | --- | --- | --- |
| 编辑文件夹 | `edit_start` desc=编辑文件夹 | 点 | 进编辑文件夹页 |
| 全部 / 未分类 | `all_note_layout` / `uncategorized_notes_layout` | 点 | 切到该集合并收起抽屉 |
| 新建文件夹 | `new_folder` desc=新建文件夹 | 点 | 弹「新建文件夹」对话框 |
| 文件夹行 | `item_root`（`folder_icon` + `title` + `ll_fold`） | 点行 | 切到该文件夹 |
| 展开/收起 | `expand_icon` desc=展开 | 点 | 展开子文件夹（`create_folder_space` 出现） |

**编辑文件夹页**

| 控件 | id / desc | 动作 | 说明 |
| --- | --- | --- | --- |
| 取消 / 完成 | 文本「取消」/「完成」（顶栏左右） | 点 | 完成=保存改动 |
| 更多 | `more` desc=更多 | 点 | 弹文件夹菜单 |
| 排序把手 | `move` desc=排序 | 拖动 | 调整文件夹顺序 |

文件夹菜单五项一字不差：**重命名 / 更换颜色 / 新建子文件夹 / 移动 / 删除**（删除见危险步骤）。

**新建文件夹弹窗**

`alertTitle`「新建文件夹」+ `et_input`（占位「输入文件夹名称」，须覆盖式写入）+
`tv_select_color`「选择颜色」+ 五色方块（desc=黄色/绿色/蓝色/橘色/粉色）+
`button1`(desc=确定) / `button2`(desc=取消)。

**笔记排序弹窗**：`alertTitle`「笔记排序」，四个单选项 desc 分别为
`按修改时间：新到旧` / `按修改时间：旧到新` / `按创建时间：新到旧` / `按创建时间：旧到新`；
只有「取消」按钮，**选中即生效**。

**搜索页**

`accessibility_search_ll`(desc=搜索,编辑框) 包住 `search_et`；空态显示「搜索指定内容」+ 十个标签：
笔记 / 待办 / 文档 / 提醒 / 图片 / 录音 / 涂鸦 / 表格 / 视频 / 音频；
输入后 `search_clean_iv`(desc=清空) 出现；右侧 `cancel_tv`「取消」退出。
结果区 `search_recycler_view`(desc=搜索结果) 按类型分组：`title_divider_ll`（类型名 + 数量）+
结果行（`note_title` / `first_content` / 日期），命中词在预览里以省略号截断显示。

**编辑页（阅读态）**：`back_btn` desc=返回、`edit_all` desc=页面布局、`more_btn` desc=更多、
`title_edit_text`、`edit_time`、`count_word`（「N字」）、`note_folder_text`（所属文件夹，可点）、
`note_folder_down`、`line_edit_text`、滚动容器 `main_area_scroll`。

**编辑页（编辑态，点标题或正文后）**：`iv_undo` desc=撤销、`iv_redo` desc=恢复、
`finish_edit` desc=完成；底部 `ly_rich_editor_sheet` 七项：

| 工具 | id | desc |
| --- | --- | --- |
| 小V写作 | `ai_creation` | 小V写作（AI 代写，会消耗小V额度，非必要不用） |
| 素材效果 | `ib_effect_packs` | 素材效果 |
| 文本编辑 | `ib_font_style` | 文本编辑 |
| 段落编辑 | `ib_paragraph_style` | 段落编辑 |
| 待办事项 | `ib_todo` | 待办事项 |
| 拍摄或选择图片 | `ib_photo` | 拍摄或选择图片 |
| 添加附件 | `ib_attach` | 添加附件 |

**更多菜单（编辑页）**：一字不差七项 —— **提醒 / 删除 / 加锁 / 分享 / 导出 / 生成挂件 / 移入原子隐私系统**
（删除、加锁、移入隐私系统见危险步骤）。

**页面布局（页面调节面板）**：`sheet_dialog_title`「页面调节」+ `sheet_dialog_close_button`(desc=关闭)；
「纸张风格」+「更多」；五个纸色 `guideline_style` desc=白色/灰色/黄色/粉色/蓝色；
「纸张质感」；「页边距」滑杆（两端标注「小」「大」）。

**文本编辑面板**：`csdb_bold` 加粗 / `csdb_italic` 倾斜 / `csdb_underline` 下划线 /
`csdb_strikethrough` 删除线 / `csdb_highlight` 荧光笔；
字号 `rb_font_size_10/12/14/16/18/20/24/36/48`（desc=「N号字体」，横向滚动）；
字体颜色 `rb_font_color_1..8`（desc=黑色/深灰色/灰色/红色/橘色/黄色/绿色/蓝色）。

**段落编辑面板**：`align_start` 左对齐 / `align_center` 居中（无 desc，按 id 或用文本）/ `align_end` 右对齐；
`ly_bullet_dots` 圆点编号 / `ly_bullet_number` 数字编号 / `ly_bullet_letter` 字母编号。

**素材效果面板**：四个页签 `ly_tab_font_style` 文字样式 / `ly_tab_symbol` 符号 /
`ly_tab_divider` 分割线 / `ly_tab_template` 图文模板；文字样式子项 `font_style_pop_item_1..N`
（desc=「文字样式N」）。

**待办分区**

| 控件 | id / desc | 动作 | 判据 |
| --- | --- | --- | --- |
| 勾选 | `state_cb`（CheckBox） | 点 | desc 由「未完成,…」变「已完成,…」 |
| 内容 | `content_tv` | 点行 `item_content_fg` | 进待办详情/编辑（本轮未展开） |
| 颜色 | `bt_todo_item_color` desc=颜色 | 点 | 换该条配色 |
| 提醒 | `bt_todo_item_notice` desc=提醒 | 点 | 设提醒时间 |
| 删除 | `bt_todo_item_delete` desc=删除 | 点 | ⚠️ 删该条待办 |
| 新建待办 | `add_icon` desc=新建待办 | 点 | 新建一条待办 |

**文档分区**

| 控件 | id / desc | 动作 | 说明 |
| --- | --- | --- | --- |
| 类型页签 | `tab_text` 全部/PDF/DOC/XLS/PPT/TXT | 点 | 过滤列表 |
| 行 | `item_content_rl`（`name` + `size`） | 点 | 用对应应用打开文档 |
| 行尾菜单 | `menu` | 点 | 该文档的操作菜单 |
| 多选 | 长按行 | 长按 | 进多选：`item_checkbox` 出现，顶栏「全选/已选择N项/取消」 |
| 新建文档 | `new_iv` desc=新建文档 | 点 | 新建文档 |
| 权限提示 | `tv_content` + `close_document_tips` desc=关闭 | 点关闭 | 收起第三方应用文档的权限提示 |

**我的分区**：云空间卡（`title`「云空间」+ `tips`「已满」+ `summary`「已使用 x/yGB」）；
`Switch` desc=「自动同步原子笔记…」/「使用数据网络同步…」（**状态就是 desc 之外的那条 checkable**）；
「自动同步的文档范围」（summary=指定文档）；「在电脑、iPad 编辑笔记」；「最近删除」(summary=条数)；「设置」。
顶栏头像 desc=vivo账号、昵称、脱敏手机号 → vivo账号页（个人资料 / 安全与密码 / 账号资产 / 拟我形象 /
云服务 / 查找 / 家人共享 / 设备管理 / 帮助与反馈 + desc=消息中心、desc=扫描二维码）。

**设置页**（我的 → 设置）

| 分组 | 项 | 类型 |
| --- | --- | --- |
| 笔记 | 加锁笔记显示设置 | 行 |
| 笔记 | 笔记列表显示皮肤 | Switch |
| 笔记 | 笔记内容页面显示字数 | Switch（默认开） |
| 笔记 | 笔记默认字号（summary=16） | 行 |
| 笔记 | 录音保存位置信息 | Switch |
| 待办 | 隐藏已完成待办 | Switch |
| 其他 | 存储位置 / 功能介绍 / 帮助与反馈 / 检查更新（summary=版本号）/ 关于 / 个人信息收集清单 | 行 |

**最近删除页**：`desc_tips`「已删除内容仅保留60天，逾期将永久删除。」+ 每条
（`title` / `content` / `date` / `note_surplus_time`「剩余N天」/ 行尾 `menu`）+ 顶栏 返回 / desc=搜索。

## 流程

### 一、读笔记列表（最常用，只读）

1. `lw_launch(displayId, "com.android.notes")`；判据：出现 `note_list` 与底部四分区。
2. 读 `originui_vtoolbar_normal_sub_title_rom14_0` 拿总数（如「115篇笔记」）。
3. 读列表卡片的 `note_title` + `first_content` + 时间。
   判据：卡片高度 284px，首屏约 8 条；要更多内容就 `lw_scroll` 或直接搜索。
4. 汇报时**只报主人问的那些**，不整屏念（列表里有私人内容）。

### 二、新建一篇笔记

1. 点 `add_icon`（desc=新建笔记）→ 判据：进编辑页，出现 `title_edit_text`。
2. `lw_type` 写标题（字段在编辑页顶部 `title_edit_text`）→ 回读确认。
3. 点正文区（`line_edit_text`）→ `lw_type` 一段写完正文。
   **两个输入框必须分别点**，否则内容串位。
4. 点 `finish_edit`（desc=完成）→ 判据：回列表，首条 `note_title` 就是新标题。
5. 复核：再用搜索按标题搜一次能搜到（两路证据）。

### 三、往已有笔记追加一段

1. 搜索或点卡片打开目标笔记。
2. 点 `line_edit_text` 让光标进入正文（**光标位置控件树读不到**，用 `lw_screenshot` + `read_image` 看）。
3. 先写换行再整段写入追加内容 → 点「完成」。
4. 复核：重新进入该笔记，末尾是新内容且旧内容完整（比对追加前后首尾文字）。

### 四、查找标题为 X 的笔记

1. 点顶栏 desc=搜索 → 判据：进搜索页，出现「搜索指定内容」与十个标签。
2. 点 `search_et`，**覆盖式写入**关键词（`lw_type(replace=true)`；该框会残留上次的搜索词）。
3. 判据：`search_recycler_view` 出现结果，按类型分组并带数量。
4. 空结果时：先回首页在「全部」里 `lw_scroll` 翻一遍再下结论，不要只说「没搜到」。

### 五、管理文件夹

1. 点顶栏标题「全部」展开抽屉；判据：左侧出现「我的文件夹」与各文件夹行。
2. 新建：点 desc=新建文件夹 → 写名称（覆盖占位）→ 选颜色 → `button1`(确定)；
   判据：抽屉 `我的文件夹` 下出现新行，数量为 0。
3. 改名 / 换色 / 建子文件夹 / 移动：进「编辑文件夹」页 → 点该行的 desc=更多 → 选对应项。
4. 复核：回抽屉读该行标题与数量。

### 六、读/勾一条待办

1. 底部点「待办」→ 判据：顶栏标题「待办」+ 副标题「N条待办」。
2. 读 `content_tv` 的 desc（**desc 自带「未完成,」或「已完成,」前缀**，比看复选框稳）。
3. 勾选：点该行 `state_cb` → 等约 1 秒回读 desc 前缀是否变化（点后立刻读会读到旧值）。

### 七、找一份文档并进多选

1. 底部点「文档」→ 判据：顶栏「文档」+「N个文档」+ 六个类型页签。
2. 点类型页签（如 TXT）过滤，或直接读 `name`/`size`。
3. 需要分享/删除多条时：长按任意行 → 进多选（每行出现复选框、顶栏「已选择N项」）→
   点「全选」/「取消」增删选中项 → 用底部操作栏（含「更多」）。

### 八、读版本与开关状态

- 版本：我的 → 设置 → 「检查更新」行的 summary（实测 5.4.5.107）。
- 同步开关：我的分区里两个 `Switch`，读它的 checkable 值即可，不必点开。

## 已知坑

- **抽屉不是左滑出来的**：从左边缘往右滑会被系统「返回手势」吃掉（实测：滑动后没有任何变化）。
  打开抽屉的唯一可靠动作是**点顶栏那个「全部」标题**。
- **应用 logo 不是返回**：点左上角的原子笔记图标进的是 vivo账号页，不是文件夹、也不是首页。
- **虚拟屏上坐标点按不可靠**（2026-10-11 实测）：列表卡片、行尾 `menu` 这些**没有名字**的位置，
  按坐标点返回 `tapped: true` 但界面零变化；同一位置改成**按名字点**（卡片标题文本、
  `desc=更多`）立刻生效。底部四个分区页签按坐标点是有效的。结论：先按名字，坐标只作兜底。
- **两个输入框**：标题与正文是两个独立 EditText，必须分别点后写入；写正文前别停在标题框。
- **占位提示文字**：搜索框与文件夹名输入框都有占位，直接输入会连成「提示+新内容」，用覆盖模式。
- **字数不等于字符数**：`count_word` 显示「N字」，比实际字符数略少（约九成），只能当量级核对。
- **列表刷新有延迟**：保存后偶发约 1 秒才上列表，等一下再读，别立刻判「没保存」。
- **弹窗要按 BACK 收起**：排序/新建文件夹这类 `originui_dialog` 弹窗，点「取消」偶发不生效，
  用系统 BACK 一定收得掉。
- **待办事项按钮**：编辑态底部点「待办事项」在正文无选中文本时**界面无变化**（本轮未验证其生效条件）。
- **云空间已满**：我的分区会出现「云空间已满，无法继续同步数据。」提示条，
  此时写入仍成功但不同步——汇报时要说明这一点。

## 验证

- 新建/追加：**重新进入该笔记能读到内容**才算成功；「已保存」之类提示不算。
  追加场景还要比对旧内容未丢。
- 列表断言：顶栏副标题的篇数 / 文件夹行数量，增减前后对比。
- 待办：`content_tv` 的 desc 前缀（未完成/已完成）回读。
- 删除类：目标条目从列表消失 + 「最近删除」里条数 +1（若为永久删除则只核前者）。

## 未验证清单（2026-10-11 走查范围之外）

- 待办条目的详情/编辑页（点 `content_tv` 后）与「提醒」「颜色」两个弹窗的可选值。
- 编辑页更多菜单里 **提醒 / 加锁 / 分享 / 导出 / 生成挂件 / 移入原子隐私系统** 六个入口的落地页
  （只确认了菜单项存在，没有逐项点进去）。
- 「拍摄或选择图片」「添加附件」打开的媒体选择器结构。
- 文档分区行尾 `menu` 的具体项（点它没打开；长按进的是多选模式）。
- 云同步相关：`自动同步的文档范围`、`在电脑、iPad 编辑笔记` 的落地页（涉及账号与网络）。
- 图片笔记/涂鸦/录音类笔记的编辑体验。

## 危险步骤

> ⚠️ **危险**：以下动作不可逆或影响账号数据，**执行前必须把「哪一个（标题+文件夹）」报给主人确认**：
> 1. 编辑页更多菜单里的 **删除**（进「最近删除」，保留 60 天）；
> 2. 编辑文件夹页里文件夹的 **删除**（连同里面笔记，先读该文件夹数量再报）；
> 3. **最近删除** 页里的删除/清空（永久，不可恢复）；
> 4. **加锁 / 移入原子隐私系统**（会改变主人能否直接看到该笔记）；
> 5. 待办行上的 `bt_todo_item_delete`（直接删，不进回收站）。
> 另外：**云空间「升级云空间」**会引导付费，Agent 只指出入口、不代点。
> 主人自己的测试产物（如 Agent 为验证流程新建的笔记）测完当场删掉，删前后都要说明。

## 工具映射（本机 LittleWhale）

`lw_launch("com.android.notes")`、`lw_ui` 读树 / `lw_ui_dump` 落全量树、
`lw_tap(text=…)` 优先按名字点、`lw_type(replace=true)` 覆盖写入、
`lw_scroll` 翻列表、`lw_key(BACK)` 收弹窗、`lw_screenshot` + `read_image` 看光标与自绘内容。
