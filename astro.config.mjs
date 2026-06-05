// @ts-check
import { defineConfig } from "astro/config";
import { loadEnv } from "vite";

import react from "@astrojs/react";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import { EnumChangefreq } from "sitemap";
import robotsTxt from "astro-robots-txt";
import tailwindcss from "@tailwindcss/vite";

// โดเมนจริงของเว็บ — อ่านจาก .env (ดู .env.example), fallback เป็นค่า default
// มีผลต่อ sitemap / robots / rss / canonical URL
const { SITE_URL = "https://xn--o3c1bj3b4bj8cd.com/" } = loadEnv(
  process.env.NODE_ENV ?? "",
  process.cwd(),
  "",
);

// https://astro.build/config
export default defineConfig({
  // ใช้ static output (SSG) เป็นหลัก ตาม core stack
  output: "static",
  site: SITE_URL,

  integrations: [
    // React island เฉพาะส่วน interactive (search/filter/form) เท่านั้น
    react(),
    // MDX สำหรับเนื้อหา content collections
    mdx(),
    // SEO: sitemap.xml อัตโนมัติ (ดึงจากหน้าที่ build จริง — draft ถูกกรองออกแล้วใน getStaticPaths)
    sitemap({
      // ความถี่/ลำดับความสำคัญเริ่มต้นของทุก URL
      changefreq: "weekly",
      priority: 0.7,
      lastmod: new Date(),
      // กันไฟล์ข้อมูลพรีวิว (endpoint .json) ไม่ให้หลุดลง sitemap
      filter: (page) => !page.endsWith("/blog-previews.json"),
      // ปรับ priority รายหน้า: หน้าแรกสำคัญสุด, หน้า list รองลงมา
      serialize(item) {
        if (item.url === `${SITE_URL}/`) {
          item.priority = 1.0;
          item.changefreq = EnumChangefreq.DAILY;
        } else if (
          item.url.endsWith("/products/") ||
          item.url.endsWith("/blog/")
        ) {
          item.priority = 0.8;
        }
        return item;
      },
    }),
    // SEO: robots.txt อัตโนมัติ (อ้างอิง sitemap-index.xml ให้ด้วย)
    robotsTxt({
      // ระบุ sitemap ทั้ง 2 ไฟล์ชัดเจน (index + ไฟล์จริง sitemap-0.xml)
      sitemap: [
        `${SITE_URL.replace(/\/$/, "")}/sitemap-index.xml`,
        `${SITE_URL.replace(/\/$/, "")}/sitemap-0.xml`,
      ],
      policy: [
        {
          userAgent: "*",
          allow: "/",
          // กันบอทไม่ให้ไล่ query string ของ search/filter (กัน duplicate/crawl budget)
          disallow: ["/*?"],
        },
      ],
    }),
  ],

  vite: {
    plugins: [tailwindcss()],
  },
});
