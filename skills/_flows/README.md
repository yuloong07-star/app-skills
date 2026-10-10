# 跨应用流程

`skills/` 下一级目录默认是**一个应用一份技能**。
当一条流程要跨两个以上应用（例如「把教务系统的课表写进日历」「从日程跳到闹钟」）时，
放在这里，一份流程一个 Markdown，开头列出它用到的应用技能。

约定：

- 文件名用动词短语的 kebab-case：`sync-timetable-to-calendar.md`
- 开头写 `uses: [android-vivo-calendar, android-vivo-notes]`
- 正文只写编排顺序与交接点（在哪一步从 A 切到 B、切过去之后靠什么确认）
- 单个应用的细节不重复，直接指向各自的 SKILL.md

这些文件不参与 `index.json`，也不影响校验。
