#!/usr/bin/env node
// app-skills 校验：SKILL.md frontmatter 合法性 + index.json 与实际目录是否一致。
// 零依赖，Node 18+。用法：
//   node tools/validate.mjs
//   node tools/validate.mjs --app android-vivo-notes
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SKILLS = join(ROOT, 'skills');
const errors = [];
const warnings = [];
const out = [];
const only = (() => { const i = process.argv.indexOf('--app'); return i > -1 ? process.argv[i + 1] : null; })();

function err(m) { errors.push(m); }
function warn(m) { warnings.push(m); }

// ---- 极简 YAML frontmatter 解析（只支持本仓库用到的 flat + 一层嵌套 + 数组） ----
function parseFrontmatter(text, file) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!m) { err(`${file}: 缺少 YAML frontmatter（文件必须以 --- 开头）`); return null; }
  const lines = m[1].split(/\r?\n/);
  const data = {};
  let parent = null;
  for (const raw of lines) {
    if (!raw.trim() || raw.trim().startsWith('#')) continue;
    const indent = raw.match(/^\s*/)[0].length;
    const line = raw.trim();
    if (line.startsWith('- ')) {
      if (parent) { (data[parent] ||= []).push(coerce(line.slice(2).trim())); }
      else warn(`${file}: 顶层出现列表项，已忽略`);
      continue;
    }
    const idx = line.indexOf(':');
    if (idx === -1) { warn(`${file}: 无法解析的行 "${line}"`); continue; }
    const key = line.slice(0, idx).trim();
    const val = line.slice(idx + 1).trim();
    if (indent > 0 && parent) {
      if (!val) { warn(`${file}: ${parent}.${key} 为空`); continue; }
      if (typeof data[parent] !== 'object' || Array.isArray(data[parent])) data[parent] = {};
      data[parent][key] = coerce(val);
    } else if (!val) { data[key] = []; parent = key; }
    else { data[key] = coerce(val); parent = null; }
  }
  function coerce(v) {
    if (/^\[.*\]$/.test(v)) return v.slice(1, -1).split(',').map((s) => unq(s.trim())).filter(Boolean);
    return unq(v);
  }
  function unq(v) { return v.replace(/^["']|["']$/g, ''); }
  return data;
}

const PLATFORMS = ['android', 'ios', 'harmony', 'web', 'other'];
const NEUTRAL_TOOLS = ['ui_tree', 'screenshot', 'ocr', 'tap_by_text', 'tap_coord', 'type', 'swipe', 'scroll',
  'system_key', 'launch_app', 'clipboard', 'notification', 'file_io'];

const dirs = existsSync(SKILLS) ? readdirSync(SKILLS).filter((d) => {
  if (d.startsWith('_')) return false;
  if (!statSync(join(SKILLS, d)).isDirectory()) return false;
  return only ? d === only : true;
}) : [];
if (only && dirs.length === 0) err(`找不到技能目录 skills/${only}`);

const index = JSON.parse(readFileSync(join(ROOT, 'index.json'), 'utf8'));
const idxIds = new Set(index.apps.map((a) => a.id));

for (const d of dirs) {
  const file = `skills/${d}/SKILL.md`;
  const fm = parseFrontmatter(readFileSync(join(SKILLS, d, 'SKILL.md'), 'utf8'), file);
  if (!fm) continue;
  if (fm.name !== d) err(`${file}: name "${fm.name}" 与目录名 "${d}" 不一致`);
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(d)) err(`${file}: 目录名不是 kebab-case`);
  if (!fm.description || fm.description.length < 12) err(`${file}: description 太短，写清触发场景`);
  const app = fm.app;
  if (!app || typeof app !== 'object') err(`${file}: 缺少 app 段`);
  else {
    for (const k of ['name', 'package', 'platform', 'version_tested', 'verified']) {
      if (!app[k]) err(`${file}: 缺少 app.${k}`);
    }
    if (app.platform && !PLATFORMS.includes(app.platform)) err(`${file}: app.platform "${app.platform}" 不在 ${PLATFORMS.join('/')}`);
    if (app.verified && app.verified !== '未验证' && !/^\d{4}-\d{2}-\d{2}$/.test(app.verified)) err(`${file}: app.verified 应为 YYYY-MM-DD 或「未验证」（骨架未走查时）`);
    if (app.verified === '未验证' && fm.risk === 'high') warn(`${file}: 未验证的技能标了 high 风险，骨架期先只写不执行`);
  }
  if (!['low', 'medium', 'high'].includes(fm.risk || 'low')) err(`${file}: risk 应为 low/medium/high`);
  for (const t of fm.tools_used || []) if (!NEUTRAL_TOOLS.includes(t)) warn(`${file}: tools_used 里的 "${t}" 不是推荐的中性词`);
  const body = readFileSync(join(SKILLS, d, 'SKILL.md'), 'utf8');
  if (!/⚠️/.test(body) && (fm.risk === 'high' || (fm.danger_steps || []).length)) {
    err(`${file}: 标了 high 风险/danger_steps，正文里却没有 ⚠️ 危险 标记`);
  }
  // 隐私自查：明显的真实凭据样式
  const leak = body.match(/\b1[3-9]\d{9}\b|\bghp_[A-Za-z0-9]{20,}\b|sk-[A-Za-z0-9]{16,}/);
  if (leak) err(`${file}: 疑似泄露真实手机号/令牌 "${leak[0]}"，请脱敏`);
  if (!idxIds.has(d)) err(`index.json 缺少条目 id="${d}"`);
  out.push(`  ✓ ${file}  (${fm.app?.name || '?'} · ${fm.app?.platform || '?'} · risk=${fm.risk || 'low'})`);
}

for (const a of index.apps) {
  if (only && a.id !== only) continue;
  if (!existsSync(join(ROOT, a.path))) err(`index.json 的 ${a.id} 指向了不存在的 ${a.path}`);
  else if (!dirs.includes(a.id) && !existsSync(join(SKILLS, a.id, 'SKILL.md'))) err(`index.json 的 ${a.id} 没有对应技能目录`);
  if (a.path !== `skills/${a.id}/SKILL.md`) warn(`index.json: ${a.id} 的 path 建议写成 skills/${a.id}/SKILL.md`);
}

console.log(`app-skills · 校验 ${dirs.length} 个技能 / index.json ${index.apps.length} 条`);
if (out.length) console.log(out.join('\n'));
if (warnings.length) console.log('\n警告：\n' + warnings.map((w) => '  ! ' + w).join('\n'));
if (errors.length) {
  console.log('\n错误：\n' + errors.map((e) => '  ✗ ' + e).join('\n'));
  process.exit(1);
}
console.log('\n全部通过。');
