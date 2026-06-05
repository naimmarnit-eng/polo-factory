// สร้างรูปปกบทความบล็อกด้วย Replicate google/imagen-4 (โทนน้ำเงิน-เทา)
// แล้วแปะ cover + coverAlt ลง frontmatter ของไฟล์บทความให้อัตโนมัติ
//
// ใช้งาน:
//   npm run gen-cover -- src/content/blog/<slug>.md
//   npm run gen-cover -- src/content/blog/<slug>.md --prompt "ฉากที่ต้องการ (อังกฤษ)" --alt "คำอธิบายภาพไทย"
//   npm run gen-cover -- src/content/blog/<slug>.md --aspect 16:9 --force
//
// ต้องมี REPLICATE_API_TOKEN ใน .env (อ่านอัตโนมัติ ทน `export` และ quote) หรือใน environment
// ขอ token ที่ https://replicate.com/account/api-tokens

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import Replicate from 'replicate';

const ROOT = process.cwd();
const ASSET_DIR = path.join(ROOT, 'src', 'assets', 'blogs');

// ---- โหลด .env เอง (ทนรูปแบบ `export KEY=...` และค่ามี/ไม่มี quote) ----
async function loadEnv() {
  const envPath = path.join(ROOT, '.env');
  if (!existsSync(envPath)) return;
  const raw = await readFile(envPath, 'utf8');
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^\s*(?:export\s+)?([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    let val = m[2].trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!(m[1] in process.env)) process.env[m[1]] = val;
  }
}

// ---- parse argv แบบง่าย (--key value / --flag) ----
function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next === undefined || next.startsWith('--')) args[key] = true;
      else { args[key] = next; i++; }
    } else args._.push(a);
  }
  return args;
}

// ---- frontmatter helpers (ไม่พึ่ง dependency yaml) ----
function splitFrontmatter(src) {
  const m = src.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!m) return null;
  return { fm: m[1], body: src.slice(m[0].length) };
}
function getField(fm, key) {
  const m = fm.match(new RegExp(`^${key}\\s*:\\s*(.*)$`, 'm'));
  if (!m) return null;
  let v = m[1].trim();
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
  return v;
}
function upsertField(fm, key, value) {
  const line = `${key}: "${String(value).replace(/"/g, '\\"')}"`;
  const re = new RegExp(`^${key}\\s*:.*$`, 'm');
  if (re.test(fm)) return fm.replace(re, line);
  return fm.replace(/\s*$/, '') + '\n' + line;
}

// ---- สไตล์รูปปก: โทนน้ำเงิน-เทา, ไม่มีตัวอักษรในภาพ ----
const STYLE = [
  'professional editorial product photography for a blog cover',
  'subject relevant to the article topic (clean blank cotton t-shirts, apparel, screen printing, or a tidy branding workspace)',
  'color grading: deep navy and steel blue with warm neutral grays — a calm blue & neutral palette',
  'soft diffused studio lighting, gentle shadows, shallow depth of field, crisp detail, photorealistic',
  'minimal premium e-commerce aesthetic with generous negative space',
  'absolutely no text, no letters, no numbers, no typography, no watermark, no logo',
  'wide 16:9 horizontal composition',
].join(', ');

function buildPrompt(title, description) {
  const topic = [title, description].filter(Boolean).join(' — ');
  return `Cover image for a Thai blog article about: ${topic}. ${STYLE}.`;
}
function buildAlt(title) {
  return `ภาพปกบทความโทนน้ำเงิน-เทา แสดงเสื้อยืดและงานแบรนด์เสื้อผ้า ประกอบบทความ ${title}`;
}

async function main() {
  await loadEnv();
  const args = parseArgs(process.argv.slice(2));
  const target = args._[0];

  if (!target) {
    console.error('ใช้: npm run gen-cover -- <path/to/post.md> [--prompt "..."] [--alt "..."] [--aspect 16:9] [--force]');
    process.exit(1);
  }
  if (!process.env.REPLICATE_API_TOKEN) {
    console.error('✗ ไม่พบ REPLICATE_API_TOKEN — ใส่ใน .env (REPLICATE_API_TOKEN=r8_...) ก่อน');
    process.exit(1);
  }

  const mdPath = path.resolve(ROOT, target);
  const src = await readFile(mdPath, 'utf8');
  const parsed = splitFrontmatter(src);
  if (!parsed) { console.error(`✗ ไม่พบ frontmatter ใน ${target}`); process.exit(1); }

  const slug = path.basename(mdPath).replace(/\.(md|mdx)$/i, '');
  const title = getField(parsed.fm, 'title') || slug;
  const description = getField(parsed.fm, 'description') || '';
  const existingCover = getField(parsed.fm, 'cover');

  if (existingCover && !args.force) {
    console.error(`✗ โพสต์นี้มี cover อยู่แล้ว (${existingCover}) — ใส่ --force ถ้าต้องการสร้างทับ`);
    process.exit(1);
  }

  const prompt = typeof args.prompt === 'string' ? args.prompt : buildPrompt(title, description);
  const alt = typeof args.alt === 'string' ? args.alt : buildAlt(title);
  const aspect = typeof args.aspect === 'string' ? args.aspect : '16:9';

  console.log(`▶ สร้างรูปปกสำหรับ: ${title}`);
  console.log(`  prompt: ${prompt}`);

  const replicate = new Replicate();
  const output = await replicate.run('google/imagen-4', {
    input: { prompt, aspect_ratio: aspect, safety_filter_level: 'block_only_high' },
  });

  const file = Array.isArray(output) ? output[0] : output;
  const url = typeof file === 'string'
    ? file
    : (typeof file?.url === 'function' ? String(file.url()) : String(file));

  const res = await fetch(url);
  if (!res.ok) { console.error(`✗ ดาวน์โหลดรูปไม่สำเร็จ: HTTP ${res.status}`); process.exit(1); }
  const buf = Buffer.from(await res.arrayBuffer());

  await mkdir(ASSET_DIR, { recursive: true });
  const outPath = path.join(ASSET_DIR, `${slug}.png`);
  await writeFile(outPath, buf);

  let fm = upsertField(parsed.fm, 'cover', `@/assets/blogs/${slug}.png`);
  fm = upsertField(fm, 'coverAlt', alt);
  await writeFile(mdPath, `---\n${fm}\n---\n${parsed.body}`);

  console.log(`✓ บันทึกรูป: src/assets/blogs/${slug}.png (${(buf.length / 1024).toFixed(0)} KB)`);
  console.log(`✓ อัปเดต frontmatter: cover + coverAlt ใน ${target}`);
  console.log('  ถัดไป: npx astro check ให้ผ่าน, เปิดดูรูป, แล้วปรับ coverAlt ให้ตรงภาพจริงถ้าต้องการ');
}

main().catch((e) => { console.error('✗ ผิดพลาด:', e?.message || e); process.exit(1); });
