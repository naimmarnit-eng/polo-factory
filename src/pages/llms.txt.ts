// /llms.txt — สรุปไซต์แบบ machine-readable สำหรับ AI/LLM crawler (มาตรฐาน llmstxt.org)
// generate จากคอลเลกชัน blog ชุดเดียวกับเว็บ → รายการบทความ sync อัตโนมัติ (เหมือน rss.xml.ts)
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';
import { SITE } from '@/consts';

export async function GET(context: APIContext) {
  const site = context.site ?? new URL(SITE.defaultOgImage, 'https://xn--o3c1bj3b4bj8cd.com/');
  const abs = (path: string) => new URL(path, site).toString();

  const posts = (await getCollection('blog'))
    .filter((p) => !p.data.draft)
    .sort((a, b) => b.data.publishedAt.valueOf() - a.data.publishedAt.valueOf());

  const postLines = posts
    .map((p) => `- [${p.data.title}](${abs(`/blog/${p.id}/`)}): ${p.data.description}`)
    .join('\n');

  const body = `# ${SITE.name} (ธน พลัส 153)

> ${SITE.description} ดำเนินงานโดยบริษัท ธน พลัส 153 จำกัด โรงงานรับผลิตเสื้อครบวงจรในกรุงเทพมหานคร ประเทศไทย — รับผลิตเสื้อยืด โปโล แจ็คเก็ต เสื้อช็อป และกระเป๋าผ้า งานซิลค์สกรีน DTG/DTF ซับลิเมชัน และงานปัก พร้อมบริการออกแบบฟรี

ข้อมูลติดต่อ: โทร ${SITE.contact.phone} · LINE ${SITE.contact.line} (${SITE.contact.lineLink}) · อีเมล ${SITE.contact.email} · ที่อยู่ ${SITE.contact.address}

## หน้าหลัก
- [โรงงานผลิตเสื้อผ้า รับผลิตเสื้อครบวงจร](${abs('/services/')}): บริการรับผลิตเสื้อ สกรีน ตัดเย็บ ออกแบบฟรี ครบวงจร — money page หลัก
- [ผลงานรับผลิตเสื้อ](${abs('/products/')}): ตัวอย่างงานสกรีนและตัดเย็บที่ผ่านมา
- [บทความและความรู้](${abs('/blog/')}): เทรนด์ เทคนิคงานสกรีน ความรู้เรื่องผ้า และการทำแบรนด์เสื้อผ้า
- [หน้าแรก](${abs('/')}): ภาพรวมบริการและสินค้าทั้งหมด

## บทความ
${postLines}
`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
