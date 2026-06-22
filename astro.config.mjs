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
      // กันไฟล์ข้อมูลพรีวิว (endpoint .json) + หน้า /tag/* (ตั้ง noindex,nofollow)
      // ไม่ให้หลุดลง sitemap — sitemap ควรมีเฉพาะหน้าที่ตั้งใจให้ index เท่านั้น
      // (อย่าใช้ robots Disallow /tag/ แทน เพราะ Googlebot ต้องคลานเข้าหน้าได้จึงจะเห็น meta noindex)
      filter: (page) =>
        !page.endsWith("/blog-previews.json") && !page.includes("/tag/"),
      // ปรับ priority/changefreq รายหน้าให้สะท้อนความสำคัญจริง
      // เทียบด้วย pathname (กันปัญหา trailing slash จาก SITE_URL)
      serialize(item) {
        const path = new URL(item.url).pathname;

        if (path === "/") {
          // หน้าแรก — สำคัญสุด อัปเดตบ่อย
          item.priority = 1.0;
          item.changefreq = EnumChangefreq.DAILY;
        } else if (path === "/services/") {
          // หน้าบริการ "รับผลิตเสื้อ" — money page หลัก
          item.priority = 0.9;
          item.changefreq = EnumChangefreq.WEEKLY;
        } else if (path === "/products/") {
          // หน้า list สินค้า — ทางเข้าหลักของ catalog
          item.priority = 0.9;
          item.changefreq = EnumChangefreq.WEEKLY;
        } else if (path === "/blog/") {
          // หน้า list บล็อก — hub ของคอนเทนต์
          item.priority = 0.8;
          item.changefreq = EnumChangefreq.WEEKLY;
        } else if (path.startsWith("/products/")) {
          // หน้าสินค้ารายชิ้น
          item.priority = 0.8;
          item.changefreq = EnumChangefreq.WEEKLY;
        } else if (path.startsWith("/blog/")) {
          // บทความบล็อกรายชิ้น — เผยแพร่แล้วเปลี่ยนไม่บ่อย
          item.priority = 0.7;
          item.changefreq = EnumChangefreq.MONTHLY;
        } else if (path.startsWith("/category/")) {
          // หน้า category (หมวดหมู่บล็อก) — taxonomy
          item.priority = 0.5;
          item.changefreq = EnumChangefreq.WEEKLY;
        } else if (path.startsWith("/tag/")) {
          // หน้า tag — taxonomy ละเอียดสุด ความสำคัญต่ำสุด
          item.priority = 0.4;
          item.changefreq = EnumChangefreq.WEEKLY;
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
    server: {
      // อนุญาตให้เข้า dev server ผ่าน Cloudflare Quick Tunnel (*.trycloudflare.com)
      // ขึ้นต้นด้วยจุด = ครอบคลุมทุก subdomain ที่สุ่มใหม่ทุกครั้ง ไม่ต้องแก้ซ้ำ
      // (มีผลเฉพาะ dev server; โปรดักชันเป็น static ไม่เกี่ยว)
      allowedHosts: [".trycloudflare.com"],
    },
  },
});
