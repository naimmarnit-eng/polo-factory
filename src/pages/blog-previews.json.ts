// Endpoint สถิต (SSG): แผนที่ข้อมูล "พรีวิวบทความ" สำหรับลิงก์ภายใน /blog/*
// ใช้คู่กับ src/components/blog/BlogLinkPreview.astro (hover/focus preview card)
// คีย์ = path ของบทความ ("/blog/<slug>"), ค่า = ข้อมูลย่อที่การ์ดต้องใช้
// รูปปกถูก optimize ผ่าน astro:assets (getImage) ตั้งแต่ build → ไม่กระทบ LCP/SEO
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { getImage } from 'astro:assets';

// จัดวันที่แบบไทยให้ตรงสไตล์ ArticleHeader (long month)
const dateFmt = new Intl.DateTimeFormat('th-TH', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

// ประมาณเวลาอ่าน (นาที) จากจำนวนอักขระไทย — ตัดมาร์กดาวน์/โค้ด/ลิงก์/ช่องว่างออกก่อน
function readingTimeOf(body: string): number {
  const plain = body
    .replace(/```[\s\S]*?```/g, '') // โค้ดบล็อก
    .replace(/https?:\/\/\S+/g, '') // URL
    .replace(/[#>*_`~\-[\]()!|]/g, '') // สัญลักษณ์มาร์กดาวน์
    .replace(/\s+/g, ''); // ช่องว่าง (ไทยไม่เว้นวรรคระหว่างคำ)
  return Math.max(1, Math.round(plain.length / 1000)); // ~1000 ตัวอักษร/นาที
}

export const GET: APIRoute = async () => {
  const posts = (await getCollection('blog')).filter((p) => !p.data.draft);

  const entries = await Promise.all(
    posts.map(async (post) => {
      const d = post.data;

      let cover: string | undefined;
      if (d.cover) {
        const img = await getImage({
          src: d.cover,
          width: 320,
          height: 200,
          format: 'webp',
          fit: 'cover',
        });
        cover = img.src;
      }

      return [
        `/blog/${post.id}`,
        {
          title: d.title,
          description: d.description,
          cover,
          coverAlt: d.coverAlt ?? d.title,
          category: d.category,
          readingTime: readingTimeOf(post.body ?? ''),
          dateLabel: dateFmt.format(d.publishedAt),
        },
      ] as const;
    }),
  );

  return new Response(JSON.stringify(Object.fromEntries(entries)), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
