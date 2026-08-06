// Content Layer API (Astro 6) — type-safe content collections
// ดูเอกสาร: https://docs.astro.build/en/guides/content-collections/
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
// Astro 6: นำเข้า zod จาก astro:schema (astro:content > z ถูก deprecate)
import { z } from 'astro:schema';

// คอลเลกชันสินค้า (เสื้อยืด) — เนื้อหา .md / .mdx ใน src/content/products
const products = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/products' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      // ราคา (บาท)
      price: z.number().nonnegative(),
      // รูปหลัก — ใช้ astro:assets เพื่อ optimize (สำคัญต่อ LCP/SEO)
      image: image(),
      imageAlt: z.string(),
      // แกลเลอรีเพิ่มเติม (ออปชัน)
      gallery: z.array(image()).optional(),
      colors: z.array(z.string()).default([]),
      sizes: z.array(z.enum(['XS', 'S', 'M', 'L', 'XL', 'XXL'])).default([]),
      tags: z.array(z.string()).default([]),
      featured: z.boolean().default(false),
      inStock: z.boolean().default(true),
      publishedAt: z.coerce.date(),
      updatedAt: z.coerce.date().optional(),
      // คำถามที่พบบ่อย (ออปชัน) — ป้อนใน frontmatter แล้วได้ทั้ง FAQPage JSON-LD + accordion บนหน้า
      faq: z.array(z.object({ question: z.string(), answer: z.string() })).optional(),
    }),
});

export const collections = { products };

