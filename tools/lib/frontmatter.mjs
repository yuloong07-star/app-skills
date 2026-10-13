/**
 * app-skills 的 frontmatter 解析（零依赖，Node 18+）
 *
 * 只认本仓库真正用到的这一小撮 YAML：顶层键值、一层嵌套（`app:`）、行内数组 `[a, b]`、短横线列表。
 * 有意不引 YAML 依赖：`tools/validate.mjs`（校验）与 `tools/app-skills-index.mjs`（生成索引）都要能在
 * 任何一台只装了 node 的机器上直接跑，而且两边**必须解析出同一份结果** —— 所以解析器只有这一份。
 *
 * 它只做"读"，不做规范判断：字段必填与否由各工具自己那一段说清。
 */

/** 解析 `---` 包起来的那一段；没有 frontmatter 直接抛（这是硬错，不该静默跳过） */
export function parseFrontmatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!m) throw new Error('缺少 YAML frontmatter（文件必须以 --- 开头）');
  const data = {};
  const warnings = [];
  let parent = null;
  for (const raw of m[1].split(/\r?\n/)) {
    if (!raw.trim() || raw.trim().startsWith('#')) continue;
    const indent = raw.match(/^\s*/)[0].length;
    const line = raw.trim();
    if (line.startsWith('- ')) {
      if (parent) (data[parent] ||= []).push(coerce(line.slice(2).trim()));
      else warnings.push(`顶层出现列表项，已忽略 "${line}"`);
      continue;
    }
    const idx = line.indexOf(':');
    if (idx === -1) {
      warnings.push(`无法解析的行 "${line}"`);
      continue;
    }
    const key = line.slice(0, idx).trim();
    const val = line.slice(idx + 1).trim();
    if (indent > 0 && parent) {
      if (!val) {
        warnings.push(`${parent}.${key} 为空`);
        continue;
      }
      if (typeof data[parent] !== 'object' || Array.isArray(data[parent])) data[parent] = {};
      data[parent][key] = coerce(val);
    } else if (!val) {
      data[key] = [];
      parent = key;
    } else {
      data[key] = coerce(val);
      parent = null;
    }
  }
  return { data, warnings };
}

/** frontmatter 里那一段原文（不含 `---`），照着改的时候用得上 */
export function frontmatterBlock(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  return m ? m[1] : null;
}

function coerce(v) {
  if (/^\[.*\]$/.test(v)) return v.slice(1, -1).split(',').map((s) => unquote(s.trim())).filter(Boolean);
  return unquote(v);
}

function unquote(v) {
  return v.replace(/^["']|["']$/g, '');
}
