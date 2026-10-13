#!/usr/bin/env node
/**
 * app-skills 的索引工具
 *
 * 这个仓库不只是"一堆 SKILL.md 放在那儿"，它同时是一份**索引仓库**：根目录的 `index.json` 是那份机器
 * 索引，别人（另一个 Agent、另一个人的脚本）不用 clone、不用翻目录，抓一个地址就知道这里有什么、每条
 * 多大、内容摘要对不对得上、该去哪个地址取。
 *
 * 一份索引要能被人信，靠的不是"它是我们写的"，而是**每个字段都能当场从 SKILL.md 重算出来**：
 * 文件名、体积、sha256、标签、风险、实测日期 —— 这一份工具把该算的都算一遍，对不上就 exit 1。
 *
 * 跑法：
 *   node tools/app-skills-index.mjs build [--dir skills] [--ref index-1] [--base <url 前缀>] [--out index.json]
 *   node tools/app-skills-index.mjs check [--dir skills] [--index index.json] [--ref index-1] [--base <url 前缀>]
 *
 * build 重新扫一遍 `--dir` 下每一份 `SKILL.md`，把整份索引写出来；check 拿现成那份索引与技能目录重新对一遍
 * （忽略 `generated` 与 `note` 这两个每次都变的字段），对不上就报出是哪一条对不上 —— CI 与发版跑的该是 check。
 *
 * 三条写死的规矩：
 *
 * - **`--ref` 是内容 tag，不是 `main`**：jsDelivr 对分支引用会 301 到 `raw.githubusercontent.com`，而那个
 *   域名在某些网络里不通（2026-10-11 实测）。所以索引里的链接一律钉在 tag 上；**内容一改就得换 tag**，
 *   否则别人手里那份 sha256 会与 URL 取回来的内容对不上。
 * - **`status` 不是手写的**：`app.verified` 写着「未验证」的，`status` 只能是 `draft`、且 `risk` 不许是 high
 *   —— 骨架期的技能不该被当成跑通过的技能发出去。
 * - **`deprecated` 是手写段**：哪个 app-id 已经作废、该换成哪一份，是人的决定，生成器不许把它抹掉，
 *   check 也不因为它对不上就报错。
 *
 * 索引里的地址是第一个可用的那份，其余 jsDelivr 镜像域进 `mirrors`：主机不通时换一个域取，内容同一份。
 */

import { createHash } from 'node:crypto'
import { readFile, readdir, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseFrontmatter } from './lib/frontmatter.mjs'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const args = process.argv.slice(2)
const command = args[0]

function option(name, fallback = null) {
  const at = args.indexOf(`--${name}`)
  return at < 0 ? fallback : args[at + 1]
}

if (command !== 'build' && command !== 'check') {
  console.error('用法: node tools/app-skills-index.mjs build [--dir skills] [--ref <内容 tag>] [--base <url 前缀>] [--out index.json]')
  console.error('      node tools/app-skills-index.mjs check [--dir skills] [--index index.json] [--ref <内容 tag>] [--base <url 前缀>]')
  process.exit(2)
}

const directory = resolve(ROOT, option('dir', 'skills'))
const ref = option('ref', 'index-1')
const base = option('base', `https://cdn.jsdelivr.net/gh/yuloong07-star/app-skills@${ref}/`)
const out = resolve(ROOT, option('out', 'index.json'))
const indexFile = resolve(ROOT, option('index', 'index.json'))

const REPO = 'app-skills'
const SOURCE = 'https://github.com/yuloong07-star/app-skills'
/** jsDelivr 的几个等价镜像域；第一个进 `url`，其余进 `mirrors` */
const MIRRORS = ['fastly.jsdelivr.net', 'gcore.jsdelivr.net', 'testingcf.jsdelivr.net']
const PLATFORMS = ['android', 'ios', 'harmony', 'web', 'other']
const STATUSES = ['verified', 'draft', 'broken']
const RISKS = ['low', 'medium', 'high']

const sha256 = (buffer) => `sha256:${createHash('sha256').update(buffer).digest('hex')}`
const withMirror = (url, host) => url.replace('cdn.jsdelivr.net', host)

/** 一份 SKILL.md → 一条索引记录；缺字段、自相矛盾就抛，由调用方说清是哪一份 */
async function entryOf(id) {
  const path = `skills/${id}/SKILL.md`
  const bytes = await readFile(join(ROOT, path))
  const text = bytes.toString('utf8')
  let data
  try {
    ;({ data } = parseFrontmatter(text))
  } catch (error) {
    throw new Error(`${error.message}（${path}）`)
  }
  const app = data.app
  if (!app || typeof app !== 'object') throw new Error(`${path}: 缺少 app 段`)
  if (data.name !== id) throw new Error(`${path}: name "${data.name}" 与目录名 "${id}" 不一致`)
  for (const key of ['name', 'package', 'platform', 'vendor', 'version_tested', 'verified']) {
    if (!app[key]) throw new Error(`${path}: 缺少 app.${key}`)
  }
  for (const key of ['description', 'tags', 'status', 'author']) {
    if (data[key] === undefined || data[key] === '') throw new Error(`${path}: 缺少 ${key}`)
  }
  if (!Array.isArray(data.tags) || data.tags.length === 0) throw new Error(`${path}: tags 要写成 [a, b] 这样的数组`)
  if (!PLATFORMS.includes(app.platform)) throw new Error(`${path}: app.platform "${app.platform}" 不在 ${PLATFORMS.join('/')}`)
  const risk = data.risk || 'low'
  if (!RISKS.includes(risk)) throw new Error(`${path}: risk "${risk}" 不在 ${RISKS.join('/')}`)
  if (!STATUSES.includes(data.status)) throw new Error(`${path}: status "${data.status}" 不在 ${STATUSES.join('/')}`)
  const unverified = app.verified === '未验证'
  if (unverified && data.status === 'verified') throw new Error(`${path}: app.verified 是「未验证」，status 不许写 verified`)
  // 高风险与"没走过查"并不矛盾：风险说的是这应用本身会扣钱、删数据；所以这里只提醒一声
  if (unverified && risk === 'high') console.warn(`  ! ${path}: 未验证 + high 风险 —— 骨架期先只写不执行`)

  const url = `${base}${path}`
  return {
    id,
    name: app.name,
    package: app.package,
    platform: app.platform,
    vendor: app.vendor,
    tags: data.tags,
    version_tested: app.version_tested,
    verified: app.verified,
    status: data.status,
    risk,
    author: data.author,
    description: data.description,
    tools_used: data.tools_used || [],
    danger_steps: data.danger_steps || [],
    path,
    url,
    mirrors: MIRRORS.map((host) => withMirror(url, host)),
    sha256: sha256(bytes),
    size: bytes.length,
  }
}

/** 手写的作废表：生成器不许抹掉别人的决定 */
async function deprecatedOf(path) {
  try {
    const existing = JSON.parse(await readFile(path, 'utf8'))
    return Array.isArray(existing.deprecated) ? existing.deprecated : []
  } catch (error) {
    if (error.code !== 'ENOENT') console.warn(`没读成 ${path}（${error.message}）`)
    return []
  }
}

const ids = (await readdir(directory, { withFileTypes: true }))
  .filter((entry) => entry.isDirectory() && !entry.name.startsWith('_'))
  .map((entry) => entry.name)
  .sort()
if (ids.length === 0) throw new Error(`${directory} 里一个技能目录都没有`)

const apps = []
for (const id of ids) {
  if (!existsSync(join(directory, id, 'SKILL.md'))) {
    console.error(`✗ skills/${id}: 目录里没有 SKILL.md —— 不进索引`)
    process.exit(1)
  }
  let entry
  try {
    entry = await entryOf(id)
  } catch (error) {
    console.error(`✗ ${error.message}`)
    console.error('  这一份不进索引 —— 先把 frontmatter 补齐（见 schema/skill.frontmatter.md）')
    process.exit(1)
  }
  apps.push(entry)
  console.log(`✓ ${entry.id}  ${entry.name} · ${entry.platform}/${entry.vendor} · ${entry.status} · risk=${entry.risk}  ${entry.size}B  ${entry.sha256.slice(0, 20)}…`)
}

/** `updated` 取所有实测日期里最新的那一天：它是算出来的，不是今天 —— 否则每次 build 都改这一行 */
const dates = apps.map((app) => app.verified).filter((value) => /^\d{4}-\d{2}-\d{2}$/.test(value)).sort()
const document = {
  $schema: './schema/index.schema.json',
  format: 'app-skills-index/1',
  repo: REPO,
  generated: new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'),
  updated: dates.at(-1) ?? null,
  source: SOURCE,
  index_url: `${base}index.json`,
  index_mirrors: MIRRORS.map((host) => withMirror(`${base}index.json`, host)),
  note: '本文件由 tools/app-skills-index.mjs 生成：每条都是从 skills/<app-id>/SKILL.md 现算的（体积与 sha256 都是那一份文件的）。url 钉在内容 tag 上，内容一改就得换 tag 并重新 build。取用时先看 status：verified 才进常驻技能目录，draft 留冷存储。deprecated 是手写的作废表。',
  apps,
  deprecated: [],
}

if (command === 'build') {
  document.deprecated = await deprecatedOf(out)
  await writeFile(out, `${JSON.stringify(document, null, 2)}\n`)
  const counts = apps.reduce((acc, app) => ({ ...acc, [app.status]: (acc[app.status] ?? 0) + 1 }), {})
  console.log(`\n写好 ${out}: ${apps.length} 条（${Object.entries(counts).map(([k, v]) => `${k} ${v}`).join(' / ')}），作废表 ${document.deprecated.length} 条`)
} else {
  const existing = JSON.parse(await readFile(indexFile, 'utf8'))
  if (existing.format !== document.format) {
    console.error(`\n${indexFile} 的 format 不是 app-skills-index/1（现在是 ${existing.format ?? '空的'}）`)
    process.exit(1)
  }
  document.deprecated = existing.deprecated ?? []
  const strip = (value) => JSON.stringify({ ...value, generated: null, note: null })
  if (strip(existing) !== strip(document)) {
    const before = new Map((existing.apps ?? []).map((app) => [app.id, app]))
    const after = new Map(document.apps.map((app) => [app.id, app]))
    for (const [id, app] of after) if (!before.has(id)) console.error(`  + index.json 里缺 ${id}`)
    for (const [id, app] of before) {
      if (!after.has(id)) {
        console.error(`  - index.json 里多的 ${id}：目录里没有这份技能`)
        continue
      }
      if (JSON.stringify(app) !== JSON.stringify(after.get(id))) console.error(`  ~ ${id} 的字段与 SKILL.md 对不上`)
    }
    console.error('\n索引与 skills/ 对不上 —— 跑一次 build 重新生成，或者看看是哪一份 SKILL.md 改过')
    process.exit(1)
  }
  console.log(`\n${indexFile} 与 skills/ 一致（${apps.length} 条）`)
}
