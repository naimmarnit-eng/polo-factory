# SEO Audit — เสื้อแท้ (ธน พลัส 153)

> รายงานตรวจ SEO เชิงลึกของ "โค้ด" โปรเจค Astro 6 (SSG) ร้านรับผลิตเสื้อ ภาษาไทย — ตรวจและรายงานเท่านั้น ไม่มีการแก้โค้ด/คอนเทนต์

| หัวข้อ | รายละเอียด |
|---|---|
| วันที่ตรวจ | 2026-06-12 |
| Branch / Commit | `main` / `f381266` (`feat: update coverAlt descriptions for blog posts…`) |
| ขอบเขต | ทั้ง repo: `src/components/SEO.astro`, `src/layouts/*`, `src/consts.ts`, `astro.config.mjs`, `src/content.config.ts`, ทุกหน้าใน `src/pages/**`, `rss.xml.ts`, คอนเทนต์ใน `src/content/{products,blog}` และผลลัพธ์ที่ render จริงใน `dist/` |
| วิธีตรวจ | `npm run build` (✅ exit 0, ไม่มี warning) → ตรวจ HTML ที่ render จริงใน `dist/**/index.html`, `dist/sitemap-0.xml`, `dist/sitemap-index.xml`, `dist/robots.txt`, `dist/rss.xml` + แกะ JSON-LD ทุกบล็อกด้วย `JSON.parse` + `npx astro check` (✅ exit 0) + วิเคราะห์ความยาว title/description และ internal link ในคอนเทนต์ |
| เลนส์ที่ใช้ | skill `astro-seo` (`/seo`) เป็นหลัก + audit-checklist + json-ld reference; เสริมหลักเกณฑ์ technical/on-page/schema/AEO ที่ใช้ได้จริงกับสถาปัตยกรรมนี้ |

---

## Executive Summary

**สถานะรวม: แข็งแรงมาก (พื้นฐาน SEO ถูกวางมาดีตั้งแต่ระดับสถาปัตยกรรม)** — build ผ่าน, type-check ผ่าน, ทุกหน้ามี title/description/canonical/JSON-LD ที่ render เป็น static HTML จริง, มี `<h1>` หน้าละ 1 อันทุกหน้า, hydration ใช้ `client:visible` แค่จุดเดียวทั้งโปรเจค, internal linking เป็นระบบ pillar–cluster ครบ ปัญหาที่พบส่วนใหญ่เป็นระดับ "ปรับให้ดีขึ้น" ไม่ใช่ของพัง

| หมวด | เกรด | สรุป |
|---|---|---|
| Technical SEO | A | canonical/sitemap/robots/hreflang/lang ครบและถูก; ~~ติดเรื่อง sitemap ใส่ URL หน้า `noindex` (tag)~~ ✅ + ~~trailing-slash ไม่นิ่ง (P2-11)~~ ✅ แก้แล้ว 2026-06-12 |
| On-page SEO | A | title นำด้วย keyword ทุก money page, 1×h1/หน้า, ไม่มี title ซ้ำ, internal link ดีเยี่ยม; ~~ความยาว description บางหน้า + alt รูปสินค้า generic + title ยาว~~ ✅ แก้แล้ว 2026-06-12 (P2-3/P2-4/P2-12) |
| Structured Data | A− | Organization/WebSite ผูก `@id`, FAQPage ทุกที่, Product/BlogPosting ครบ; ~~ขาด BreadcrumbList หน้าสินค้า+บทความ + `isPartOf`/LocalBusiness~~ ✅ แก้แล้ว 2026-06-12 (P2-1/2/6/7) |
| AI-visibility / GEO | B+ | entity/NAP/FAQ ชัด; ~~FAQ ตื้น, ไม่มี `llms.txt`~~ ✅ ขยาย FAQ money page 15 ข้อ + ship `llms.txt` (P2-8/10); เหลือ `sameAs` มีแค่ LINE (P2-9 รอ URL social) |
| Broken links / Crawl | A | ไม่พบลิงก์ภายในเสีย/asset 404/orphan; ความเสี่ยงหลักคือ **content cannibalization** (บทความซ้ำหัวข้อ) — ✅ แก้แล้ว 2026-06-12 (ดู §การแก้ไข P1) |

**จำนวน finding ตามระดับ**

| ระดับ | จำนวน |
|---|---|
| 🔴 P0 (critical / ของพัง) | **0** |
| 🟠 P1 (สำคัญ — กระทบอันดับ/งบ crawl โดยตรง) | **0** ✅ (เดิม 2 — แก้ครบ 2026-06-12 ดู [§การแก้ไข P1](#-การแก้ไข-p1-2026-06-12)) |
| 🟡 P2 (nice-to-have / ปรับให้ดีขึ้น) | **0 เหลือ** ✅ (เดิม 13 — แก้เต็ม 11 + P2-6 บางส่วน [@id]/P2-9 รอ social URL — 2026-06-12 ดู [§การแก้ไข P2](#-การแก้ไข-p2-2026-06-12)) |

> ไม่พบ P0 — ไม่มีสิ่งที่ทำให้ทั้งไซต์ไม่ถูก index หรือ build พัง ทั้ง `npm run build` และ `npx astro check` ผ่านสะอาด canonical/domain ตั้งค่าถูกต้องชี้โดเมน production จริง (ดู Technical §T0)

---

## ตาราง Findings เรียงตามความสำคัญ

### 🟠 P1 — สำคัญ (✅ แก้ครบแล้ว 2026-06-12 — ดู [§การแก้ไข P1](#-การแก้ไข-p1-2026-06-12))

> ตารางด้านล่างเก็บไว้เป็น **บันทึกสภาพเดิมตอนตรวจ** — ทั้ง 2 ข้อแก้แล้ว รายละเอียดการแก้อยู่ท้ายตาราง

| # | ปัญหา | หลักฐาน (file:line / dist) | ผลกระทบ |
|---|---|---|---|
| P1-1 ✅ | **Sitemap บรรจุ URL หน้า `/tag/*` ทั้ง 16 หน้า ที่ตั้ง `noindex,nofollow`** — สัญญาณขัดกัน (sitemap = "เก็บ index หน้านี้สิ" แต่ meta = "อย่า index") | `dist/sitemap-0.xml` มี `/tag/...` 16 รายการ (priority 0.4) ↔ `dist/tag/*/index.html:25` ทุกไฟล์มี `name="robots" content="noindex, nofollow"` (ตั้งจาก [tag/[tag].astro:30](src/pages/tag/[tag].astro:30) `noindex={true}`); filter ใน [astro.config.mjs:38](astro.config.mjs:38) กรองแค่ `/blog-previews.json` | เปลือง crawl budget, ส่งสัญญาณสับสนให้ Google, **ขัดเจตนาของทีมเอง** (`src/content/blog/CLAUDE.md` §3 ระบุว่า tag ตั้ง noindex เพื่อ "กัน thin/duplicate กิน crawl budget") |
| P1-2 ✅ | **Keyword cannibalization — บทความ 2 คู่ที่ index ได้ ชนหัวข้อ/คีย์เวิร์ดเดียวกัน** | คู่ที่ชัดสุด: [tshirt-color-trend-2026-pantone-cloud-dancer.md](src/content/blog/tshirt-color-trend-2026-pantone-cloud-dancer.md) ("เทรนด์สีเสื้อปี 2026 ทำไม Pantone เลือกสีขาว Cloud Dancer") ↔ [pantone-cloud-dancer-2026-white-tshirt.md](src/content/blog/pantone-cloud-dancer-2026-white-tshirt.md) ("Pantone 2026 เลือกสีขาว Cloud Dancer โอกาสทองเสื้อยืดขาว") — ทั้งคู่ `index, follow`; คู่รอง: [clothing-brand-startup-guide.md](src/content/blog/clothing-brand-startup-guide.md) ↔ [start-clothing-brand-hands-on.md](src/content/blog/start-clothing-brand-hands-on.md) (ทั้งคู่เรื่อง "เริ่มสร้างแบรนด์เสื้อผ้า มือใหม่") | 2 หน้าแย่งคีย์เวิร์ดเดียวกัน → split ranking signal, Google เลือกหน้าผิด, ทั้งคู่ติดอันดับกลาง ๆ แทนที่หน้าเดียวจะแรง; เป็น **ความเสี่ยงเชิงระบบ** จาก routine ร่างบล็อกอัตโนมัติทุกวัน (ดู memory: daily blog draft) |

### ✅ การแก้ไข P1 (2026-06-12)

แก้ครบทั้ง 2 finding ระดับ P1 — `npm run build` ✅ exit 0, `npx astro check` ✅ 0 errors / 0 warnings, ยืนยันผลใน `dist/` ที่ render จริงแล้ว

**P1-1 — กรอง `/tag/*` ออกจาก sitemap** ✅
- แก้ `filter` ใน [astro.config.mjs:38](astro.config.mjs:38) เป็น `(page) => !page.endsWith("/blog-previews.json") && !page.includes("/tag/")` + อัปเดตคอมเมนต์
- **ไม่** ใช้ robots `Disallow: /tag/` (จะบัง Googlebot ไม่ให้เห็น meta `noindex`) ตามที่ §T3 เตือนไว้
- ยืนยัน: `dist/sitemap-0.xml` มี `/tag/` = **0 รายการ** (เดิม 16); หน้า `/tag/*` ยังตั้ง `noindex,nofollow` + navigate บนเว็บได้เหมือนเดิม

**P1-2 — Keyword cannibalization** ✅ (แนวทาง Hybrid — ยุบคู่ที่ซ้ำจริง + แยกคีย์เวิร์ดคู่ที่ angle ต่างได้)
- **คู่ Pantone (ซ้ำจริง) → ยุบเหลือหน้าเดียว:**
  - เก็บ [pantone-cloud-dancer-2026-white-tshirt.md](src/content/blog/pantone-cloud-dancer-2026-white-tshirt.md) เป็นหน้าหลัก (คีย์เวิร์ด "เสื้อยืดขาว" evergreen + เชิงพาณิชย์ + FAQ ลึกกว่า)
  - unpublish [tshirt-color-trend-2026-pantone-cloud-dancer.md](src/content/blog/tshirt-color-trend-2026-pantone-cloud-dancer.md) → ตั้ง `draft: true` + คอมเมนต์ YAML กัน routine ร่างบล็อก republish ซ้ำหัวข้อ
  - fold ของเด่นจากหน้าที่ปิดเข้าหน้าหลัก: section ใหม่ "จับคู่สี Cloud Dancer ให้ดูแพง + คุมสัดส่วนสต๊อก 60–70%", FAQ ข้อสต๊อก (รวมเป็น 6 ข้อ ยังอยู่ในเกณฑ์ 3–6 ของทีม), แหล่งอ้างอิง House of Colour, สอดคีย์เวิร์ด "เทรนด์สีเสื้อปี 2026" ลงเนื้อหา + ใส่ `updatedAt: 2026-06-12`
  - ยืนยัน: หน้า trend ไม่ถูก build / ไม่อยู่ใน sitemap+RSS; **ไม่มี inbound link เสีย** (ตรวจทั่ว `dist/` = 0 — มีแต่ self-link เดิม); หน้าหลัก render section + FAQ ใหม่ + `dateModified` ครบ
- **คู่ brand-startup (angle ต่างกันอยู่แล้ว + interlink สองทางครบ) → คงทั้งคู่ แยกคีย์เวิร์ดให้ชัด:**
  - แก้ `description` ของ [clothing-brand-startup-guide.md](src/content/blog/clothing-brand-startup-guide.md) ให้เน้น "ภาพรวมครบทุกด้าน" (เลิกใช้คำว่า "ทีละขั้นตอน" ที่ชนเจตนากับ hands-on "ทีละสเต็ป") → ลดการแย่ง head term เดียวกัน; interlink สองทาง guide↔hands-on ([:84](src/content/blog/clothing-brand-startup-guide.md:84) ↔ hands-on [:26](src/content/blog/start-clothing-brand-hands-on.md:26)) มีครบอยู่แล้ว
- **ยังเหลือ (นอก scope โค้ดรอบนี้):** ตั้งการ์ดกันบทความซ้ำหัวข้อใน routine ร่างบล็อกอัตโนมัติ (cron agent) — เป็นต้นตอเชิงระบบของ P1-2 ไม่ใช่บั๊กในโค้ดเว็บ

### 🟡 P2 — ปรับให้ดีขึ้น (✅ แก้แล้ว 2026-06-12 — ดู [§การแก้ไข P2](#-การแก้ไข-p2-2026-06-12))

> ตารางด้านล่างเก็บไว้เป็น **บันทึกสภาพเดิมตอนตรวจ** — สถานะการแก้อยู่ที่คอลัมน์ # และรายละเอียดท้ายตาราง

| # | ปัญหา | หลักฐาน (file:line / dist) | ผลกระทบ |
|---|---|---|---|
| P2-1 ✅ | **ขาด `BreadcrumbList` บนหน้าสินค้า** — มี Product schema แต่ไม่มี breadcrumb (ทั้งที่หน้า services/category/blog-index มี) | [products/[...slug].astro:25-46](src/pages/products/[...slug].astro:25) ออกแค่ Product + (FAQ); `dist/products/premium-tshirt/index.html` มี ld+json 3 บล็อก = Organization/WebSite/Product เท่านั้น | เสีย rich-result breadcrumb ใน SERP สินค้า; ไม่สอดคล้องกับ json-ld reference ที่กำหนดให้ Product จับคู่ BreadcrumbList |
| P2-2 ✅ | **ขาด `BreadcrumbList` บนหน้าบทความ** — `BlogPosting` ไม่มี breadcrumb ประกอบ (หน้า list หมวดหมู่มี แต่หน้าโพสต์จริงไม่มี) | [blog/[...slug].astro:29-44](src/pages/blog/[...slug].astro:29); `dist/blog/cotton-fabric-grades-explained/index.html` = Organization/WebSite/BlogPosting/FAQPage (ไม่มี Breadcrumb) | เสียโอกาส breadcrumb ใน SERP บทความ |
| P2-3 ✅ | **Meta description ยาว/สั้นเกินเกณฑ์** — services 179 ตัวอักษร (ยาวเกิน ~160 จะถูกตัดใน SERP); moisture-wicking 166, world-cup 166, pantone-cloud-dancer 161; ตรงข้าม clothing-brand-startup-guide **66 ตัว** (สั้น/บาง ต่ำกว่าเกณฑ์ 120 ของทีม) | [services.astro:125](src/pages/services.astro:125); [clothing-brand-startup-guide.md:3](src/content/blog/clothing-brand-startup-guide.md:3) "คู่มือที่จะพาคุณไปทีละขั้นตอน…" (ไม่มีคีย์เวิร์ดเด่น) — เทียบเกณฑ์ทีมเองที่ `src/content/blog/CLAUDE.md` §2 (~120–155) | description ถูกตัดกลางประโยค/หรือบางเกินไป → CTR ใน SERP ลดลง |
| P2-4 ✅ | **Alt รูปสินค้าเป็น boilerplate** — `imageAlt` ลงท้ายด้วยคำว่า "Image" และไม่บรรยายภาพจริง | [premium-tshirt.md:6](src/content/products/premium-tshirt.md:6) `imageAlt: "Premium Cotton T-Shirt Image"`; [polo-classic.mdx:6](src/content/products/polo-classic.mdx:6) `"Classic Polo Shirt Image"` | alt อ่อน (ซ้ำ title + คำว่า "Image" เปล่าประโยชน์) → เสีย image SEO/accessibility; schema บังคับ `imageAlt` แต่ค่าจริงยังลวก |
| P2-5 ✅ | **Tag/category ตั้งชื่อชนกัน** — มี category และ tag ชื่อเดียวกัน (เช่น "งานสกรีน", "ธุรกิจ") ทั้งที่คู่มือทีมห้ามไว้ | category: `dist/category/งานสกรีน/`, `dist/category/ธุรกิจ/` ↔ tag: `dist/tag/งานสกรีน/`, `dist/tag/ธุรกิจ/`; กฎใน `src/content/blog/CLAUDE.md` §3 "tag ห้ามตั้งชื่อชนกับ category" | สร้างหน้า near-duplicate ชุดบทความเดียวกัน — **บรรเทาด้วย tag `noindex` แล้ว** แต่ยังผิดแนวทางตัวเอง ควรเลือกใช้คำเป็น category *หรือ* tag อย่างใดอย่างหนึ่ง |
| P2-6 ✅ บางส่วน | **LocalBusiness บนหน้า services ไม่มี `geo` / `openingHoursSpecification` และไม่ผูก `@id` กับ Organization กลาง** | [services.astro:72-93](src/pages/services.astro:72) — `provider` เป็น LocalBusiness แต่ไม่มี geo/hours และไม่มี `@id` (กลายเป็น entity แยกจาก `/#organization`) | เสียสัญญาณ local-pack (พิกัด/เวลาทำการ) + entity แตกเป็นสองก้อน (Organization กับ LocalBusiness ไม่ถูกเชื่อมว่าเป็นรายเดียวกัน) |
| P2-7 ✅ | **`CollectionPage.isPartOf` ชี้ไป Organization แทน WebSite** — ตามความหมาย schema ควรเป็นส่วนหนึ่งของ WebSite | [category/[category].astro:33](src/pages/category/[category].astro:33) `isPartOf: { '@id': orgId }`; เห็นใน `dist/category/งานสกรีน/index.html` CollectionPage | จุดเล็กเรื่องความถูกต้องของกราฟ entity (WebSite ปัจจุบันไม่มี `@id` ให้อ้าง) |
| P2-8 ✅ | **FAQ ยังตื้นกว่าเป้า GEO** — หน้าแรก 6 ข้อ, services 6 ข้อ, บทความ 3–6 ข้อ ขณะที่ astro-seo แนะนำ 15–30 ข้อสำหรับ AI Overviews | [index.astro:13-44](src/pages/index.astro:13) 6 ข้อ; [services.astro:27-58](src/pages/services.astro:27) 6 ข้อ | จำนวน Q&A ที่ AI ดึงไปตอบยังจำกัด → โอกาสถูกอ้างใน AI Overviews/answer engine ต่ำกว่าที่ควร |
| P2-9 ⏸️ รอข้อมูล | **`sameAs` มีแค่ LINE — ไม่มี Facebook/Instagram** | [consts.ts:14-21](src/consts.ts:14) + Organization ใน `dist/index.html` `"sameAs":["https://line.me/...thanaplus"]` | สัญญาณ entity/brand ต่อ Google & LLM น้อย (ยืนยันตัวตนแบรนด์ได้แคบ) |
| P2-10 ✅ | **ไม่มี `llms.txt`** | `public/` มีแค่ `og-default.png` (ไม่มี `llms.txt`) | พลาด surface ใหม่สำหรับ AI-search ที่ astro-seo แนะนำให้ ship |
| P2-11 ✅ | **Trailing-slash ไม่นิ่งระหว่าง internal link / JSON-LD กับ canonical** — canonical เป็น `/services/` (มี slash) แต่ลิงก์ใน Navbar/RelatedServices และ `item` ใน JSON-LD เป็น `/services` (ไม่มี slash) | canonical `dist/services/index.html:25` = `…/services/`; [Navbar.astro:26](src/components/Navbar.astro:26) `href="/services"`; Service JSON-LD `url`/Breadcrumb `item` = `…/services` (ไม่มี slash) ใน `dist/services/index.html` | host ส่วนใหญ่ 301 จาก `/services`→`/services/` ทุกคลิก → เปลือง crawl เล็กน้อย + URL ใน JSON-LD ไม่ตรง canonical เป๊ะ |
| P2-12 ✅ | **Title ยาว 60–70 ตัวอักษรหลายบทความ → ส่วน " เสื้อแท้" ถูกตัดใน SERP** (keyword นำหน้าแล้วจึงกระทบต่ำ) | เช่น `dist/blog/moisture-wicking-uv-fabric-uniform-sport-heat/index.html` title 70 ตัว, อีก ~20 บทความ 61–68 ตัว; services 63 ตัว | แบรนด์ท้าย title ถูกตัดบนมือถือ (ผลต่ออันดับต่ำเพราะคีย์เวิร์ดอยู่หน้า แต่กระทบ brand recall ใน SERP) |
| P2-13 ✅ | **คอมเมนต์ separator ของ title ไม่ตรงโค้ด + ไม่มีตัวคั่นจริง** — คอมเมนต์บอกใช้ `" | "` แต่โค้ดต่อ title กับแบรนด์ด้วย space เดี่ยว | [SEO.astro:30-31](src/components/SEO.astro:30) คอมเมนต์ `separator " | "` แต่ `pageTitle = \`${title} ${SITE.name}\``; ยืนยัน rendered: codepoint ก่อน "เสื้อแท้" = `[…, 32(space)]` ไม่มี `|` | เล็กน้อย/ความสวยใน SERP — แบรนด์เชื่อมติดข้อความ title; คอมเมนต์ลวง (ควรแก้คอมเมนต์ หรือใส่ `" | "`/`" – "` จริง) |

> **หมายเหตุ raw `<img>` (ระดับต่ำกว่า P2):** พบ raw `<img>` 2 จุด — [ProductGallery.astro:44](src/components/products/ProductGallery.astro:44) (lightbox zoom, `src=""` ให้ JS ใส่ทีหลัง, alt="Fullscreen image") และ [BlogExplorer.tsx:167](src/components/blog/BlogExplorer.tsx:167) (React island). ทั้งคู่ขัดกฎ "ห้าม `<img>` ดิบ" ของทีม (`src/content/blog/CLAUDE.md` §5) แต่ **ผลกระทบต่ำ**: lightbox เป็น overlay ที่ JS ควบคุม ไม่ใช่ภาพคอนเทนต์; BlogExplorer ใช้ `srcSet`/`sizes` จาก astro:assets อยู่แล้ว (ได้ภาพ optimize + lazy) เพียงไม่มี `width`/`height` แต่มีกล่อง `aspect-[4/3]` กัน CLS ให้ — แนะนำใส่ `width`/`height` หรือเปลี่ยนเป็น `<Image>` เพื่อให้ตรงกฎ

### ✅ การแก้ไข P2 (2026-06-12)

แก้ระดับ P2 รอบนี้ **11 ข้อเต็ม + P2-6 บางส่วน (`@id`)** เหลือ P2-9 (รอ URL โซเชียลจริง) — `npm run build` ✅ exit 0 (48 หน้า), `npx astro check` ✅ 0 error / 0 warning, ยืนยันผลใน `dist/` ที่ render จริงแล้ว

**Structured data / schema**
- **P2-1 / P2-2 — เพิ่ม `BreadcrumbList`** หน้าสินค้า ([products/[...slug].astro:49](src/pages/products/[...slug].astro:49)) = หน้าแรก→ผลงาน→ชื่อสินค้า และหน้าบทความ ([blog/[...slug].astro:47](src/pages/blog/[...slug].astro:47)) = หน้าแรก→บทความ→ชื่อบทความ ส่งผ่าน `jsonLd` prop (ยืนยัน parse ใน `dist/products/*` และ `dist/blog/*` แล้ว)
- **P2-6 — ผูก `@id` LocalBusiness↔Organization** ใน [services.astro:74](src/pages/services.astro:74) (`'@id': /#organization`) → รวมเป็น entity เดียว; **ยังข้าม** `geo`/`openingHoursSpecification` (รอพิกัด lat/long + เวลาทำการจริง — ใส่ค่ามั่วเสี่ยงกว่าไม่ใส่)
- **P2-7 — `WebSite` มี `@id` (`/#website`)** ([SEO.astro:79](src/components/SEO.astro:79)) + ชี้ `CollectionPage.isPartOf` → `/#website` ([category/[category].astro:33](src/pages/category/[category].astro:33)) แทน Organization
- **P2-13 — ใส่ตัวคั่น title จริง** เปลี่ยน `pageTitle` เป็น `${title} – ${SITE.name}` (en dash) + แก้คอมเมนต์ให้ตรง ([SEO.astro:30](src/components/SEO.astro:30))

**On-page**
- **P2-3 — เกลา meta description** ทุกหน้า ≤155: services 179→144 ([services.astro:125](src/pages/services.astro:125)), moisture-wicking 166→144, world-cup 166→147, pantone-white 161→144, pfas 156→142 (clothing-brand-startup-guide เกลาแล้วใน P1-2)
- **P2-4 — เขียน `imageAlt` สินค้าใหม่** บรรยายภาพจริง เลิกต่อท้าย "Image" ([premium-tshirt.md:6](src/content/products/premium-tshirt.md:6), [polo-classic.mdx:6](src/content/products/polo-classic.mdx:6))
- **P2-12 — ตัด title ยาว 12 บทความ** (≥56 → ≤54 ตัว) โดยคงคีย์เวิร์ดนำหน้า → rendered `<title>` ยาวสุดเหลือ 66 ตัว (เดิม 70); **เกณฑ์ที่ตั้ง:** ตัดเฉพาะ title ≥56 ตัว ส่วนที่ ≤55 คงไว้ (อยู่ในช่วง 50–60 ของกฎทีม §2 + impact ต่ำเพราะคีย์เวิร์ดนำหน้าแล้ว); **ไม่ bump `updatedAt`** เพราะเป็น metadata hygiene ไม่ใช่แก้เนื้อหา (เลี่ยงสัญญาณ freshness ปลอมทั้งบล็อก)

**Taxonomy**
- **P2-5 — ลบ tag ที่ชนชื่อ category** (`"ธุรกิจ"`, `"งานสกรีน"`) ออกจาก 15 บทความ → ไม่ build หน้า `/tag/ธุรกิจ`, `/tag/งานสกรีน` อีก (category ครอบคลุมชุดบทความเดียวกันอยู่แล้ว) ตามกฎ `src/content/blog/CLAUDE.md` §3

**Technical / crawl consistency**
- **P2-11 — trailing slash ให้ตรง canonical**: internal link ใน [Navbar.astro](src/components/Navbar.astro) + [RelatedServices.astro](src/components/RelatedServices.astro) + back-link และ JSON-LD `item`/`url`/`isPartOf`/`mainEntityOfPage` ใน services/category/blog/products ลงท้าย `/` ทั้งหมด → ลด 301 ต่อคลิก + URL ใน JSON-LD ตรง canonical เป๊ะ

**AI-visibility / GEO**
- **P2-8 — ขยาย FAQ money page**: หน้าแรก 6→15 ข้อ ([index.astro](src/pages/index.astro)), services 6→15 ข้อ ([services.astro](src/pages/services.astro)) — answer-first, plain text, ตรงข้อเท็จจริงแบรนด์ (NAP/โปรโมชัน/เทคนิคพิมพ์); FAQ ของ "บทความ" คงกฎ 3–6 ข้อของทีม
- **P2-10 — ship `llms.txt`** ผ่าน endpoint [src/pages/llms.txt.ts](src/pages/llms.txt.ts) (สไตล์เดียวกับ `rss.xml.ts`) → `/llms.txt` generate จากคอลเลกชัน blog (รายการบทความ 25 ลิงก์ sync อัตโนมัติ) + บทสรุปแบรนด์/NAP/ลิงก์หน้าหลัก

**ยังเหลือ (รอข้อมูลจากเจ้าของ — ไม่ใช่บั๊กในโค้ด):**
- **P2-9** เพิ่ม Facebook / Instagram / Google Business Profile ใน `sameAs` ([consts.ts](src/consts.ts) + Organization ใน SEO.astro) — รอ URL โปรไฟล์จริง
- **P2-6 (ส่วน geo/เวลาทำการ)** ใส่ `geo` + `openingHoursSpecification` ให้ LocalBusiness — รอพิกัด lat/long + เวลาทำการจริง

---

## รายละเอียดตามหมวด

### T. Technical SEO

**T0. โดเมน / Foundations — ✅ ถูกต้อง (ตอบโจทย์ที่ตั้งไว้)**
- `SITE_URL` ใน [astro.config.mjs:14](astro.config.mjs:14) = `https://xn--o3c1bj3b4bj8cd.com/` ซึ่งเป็น **punycode ของโดเมน IDN จริง "เสื้อแท้.com"** — การใช้ punycode ใน canonical/sitemap/OG เป็นสิ่งที่ **ถูกต้องและจำเป็น** (URL ต้องเป็น ASCII) Google รองรับ IDN punycode ปกติ → **ไม่ใช่บั๊ก**
- ตรวจ `.env` จริง: `SITE_URL="https://xn--o3c1bj3b4bj8cd.com/"` (ไม่ใช่ localhost) → build ใช้โดเมน production จริง canonical ทุกหน้าใน `dist/**` ชี้โดเมนนี้ครบ
- **สิ่งที่ต้องยืนยันฝั่ง deploy (ไม่ใช่ code):** โดเมนที่เสิร์ฟไลฟ์จริงต้องเป็น `เสื้อแท้.com` (punycode เดียวกัน) ถ้าจริง ๆ ไลฟ์อยู่บน subdomain/host อื่น (เช่น `www.` หรือ Vercel preview) canonical/sitemap/OG จะชี้ผิด host ทั้งหมด

**T1. Canonical — ✅** มีทุกหน้า, derive จาก `Astro.site` ([SEO.astro:34](src/components/SEO.astro:34)), trailing-slash สม่ำเสมอ (ทุก canonical ลงท้าย `/`) — ดู P2-11 เรื่อง mismatch กับ internal link

**T2. Sitemap — ⚠️ ดู P1-1**
- `serialize()` ตั้ง priority/changefreq รายหน้าครบและสมเหตุผล: หน้าแรก 1.0/daily, services & products-list 0.9, blog-list 0.8, product/บทความ 0.8/0.7, category 0.5, tag 0.4 ([astro.config.mjs:41-77](astro.config.mjs:41))
- กรอง `/blog-previews.json` ออกแล้ว ✅; draft ถูกกรองตั้งแต่ `getStaticPaths` จึงไม่หลุดเข้า sitemap ✅
- **แต่** ยังใส่หน้า `/tag/*` (noindex) — ต้องกรองออก (P1-1)

**T3. robots.txt — ✅** `dist/robots.txt` allow `/`, disallow `/*?` (กัน query-string ของ filter/search) และอ้าง sitemap ทั้ง 2 ไฟล์ถูกต้อง
- ⚠️ **อย่า** ไป `Disallow: /tag/` เพื่อแก้ P1-1 — ถ้า block ใน robots, Googlebot จะมองไม่เห็น meta `noindex` (ต้องคลานเข้าหน้าได้ถึงจะเห็น noindex) วิธีที่ถูกคือ "เอาออกจาก sitemap" เฉย ๆ
- หมายเหตุตาม CLAUDE.md: `robots.txt` ถูก generate ลง `dist/` ตอน build แล้วจริง — ถ้าไลฟ์เจอ 502/404 ที่ `/robots.txt` คือปัญหา hosting ไม่ใช่ code

**T4. RSS — ✅** [rss.xml.ts](src/pages/rss.xml.ts) กรอง draft, เรียงตาม `publishedAt`, มี title/description/pubDate/link + `<language>th</language>`; `dist/rss.xml` ออกครบ (จุดจิ๊บ: fallback `context.site ?? SITE.title` ใส่ string ที่ไม่ใช่ URL แต่ `context.site` มาจาก config เสมอ จึงไม่เคย trigger — ไม่ต้องแก้)

**T5. hreflang / lang / locale — ✅** ไซต์ภาษาไทยล้วน → **ไม่ต้องมี hreflang** `<html lang="th">` ([Layout.astro:21](src/layouts/Layout.astro:21)), OG `locale=th_TH`, WebSite `inLanguage=th-TH` ครบ

**T6. astro:assets / รูป — ✅ (เกือบสมบูรณ์)** คอนเทนต์/คอมโพเนนต์ใช้ `<Image>`/`image()` schema; build optimize เป็น WebP 271 ไฟล์ (รูป cover 2 MB → 9–220 kB) — ดู note เรื่อง raw `<img>` 2 จุดด้านบน

**T7. Hydration / render-blocking — ✅ ดีเยี่ยม**
- ทั้งโปรเจคมี `client:*` แค่ **จุดเดียว**: `client:visible` ที่ [BlogExplorerSection.astro:52](src/components/blog/BlogExplorerSection.astro:52) — ไม่มี blanket `client:load` เลย (รักษา INP ได้ดีมาก)
- Third-party ใน [Layout.astro:27-56](src/layouts/Layout.astro:27): Ahrefs analytics โหลด `async` + `preconnect`; gtag เลื่อนโหลดจน user interact หรือ idle → ไม่ render-blocking

**T8. 404 — ✅** [404.astro:13](src/pages/404.astro:13) ตั้ง `noindex={true}` (ยืนยัน `dist/404.html` มี `noindex, nofollow`) และไม่อยู่ใน sitemap

---

### O. On-page SEO

**O1. Title นำด้วย target keyword (money page) — ✅ ยืนยันใน rendered**
- หน้าแรก `<title>`: "โรงงานรับผลิตเสื้อครบวงจร สกรีน ตัดเย็บ ออกแบบฟรี เสื้อแท้" — `<h1>` "โรงงานรับผลิตเสื้อครบวงจร…"
- **/services** `<title>`: "**โรงงานผลิตเสื้อผ้า** รับผลิตเสื้อครบวงจร สกรีน ออกแบบฟรี เสื้อแท้" + `<h1>` "**โรงงานผลิตเสื้อผ้า** ระดับมืออาชีพครบวงจร" + description นำด้วย "โรงงานผลิตเสื้อผ้าครบวงจร…" → **คีย์เวิร์ดเป้าหมายลงครบทั้ง title/desc/h1 ตามกฎ CLAUDE.md** ✅
- /products `<title>` "ผลงานรับผลิตเสื้อ…" + `<h1>` "ผลงานรับผลิตเสื้อ" ✅
- ไม่พบหน้าที่ใช้ title generic จน keyword หล่นจาก `<title>`

**O2. โครงสร้าง heading — ✅** ทุกหน้า (51 ไฟล์) มี `<h1>` **หน้าละ 1 อันพอดี**; คอนเทนต์บทความเริ่มที่ `##` (ไม่มี `#` ซ้อน h1), ลำดับ h2→h3 ถูกต้อง (h2 5–9 อัน/บทความ, มี h3 บางบทความ)

**O3. Title/description ไม่ซ้ำ — ✅** ตรวจ 51 หน้า ไม่พบ title หรือ description ซ้ำข้ามหน้า (ดูความยาวที่เกินเกณฑ์ใน P2-3, P2-12)

**O4. Internal linking — ✅ ดีเยี่ยม (pillar–cluster)**
- [RelatedServices.astro](src/components/RelatedServices.astro) ฝังท้ายทุกบทความ + ทุกหน้าสินค้า ลิงก์ "ขึ้น" ไป money pillar `/services`, `/services#screen`, `/products` ด้วย anchor เชิงบรรยาย (ไม่ใช่ "คลิกที่นี่")
- คอนเทนต์บทความ: **25/25 บทความมี in-content internal link** (รวม 99 ลิงก์) เชื่อมบทความ→บทความ (cluster)
- Navbar เชื่อม `/services` (+ dropdown ลึกไป section), `/blog`, `/products`, `/services#contact`; BlogSidebar/BlogFeed เชื่อมหน้า list↔โพสต์↔หมวดหมู่ → ไม่พบ orphan ในหน้าที่ index ได้

**O5. Image alt — ⚠️** `coverAlt` ของบทความบรรยายภาพจริงดี (เช่น "ขั้นตอนการผลิตและสร้างแบรนด์เสื้อผ้า…") แต่ `imageAlt` ของ **สินค้า** ยัง generic (ดู P2-4)

---

### S. Structured Data / Schema

**S1. Organization + WebSite — ✅ แข็งแรง** ออก "ทุกหน้า" ([SEO.astro:42-89](src/components/SEO.astro:42)) — Organization มี `@id=/#organization`, `legalName` "บริษัท ธน พลัส 153 จำกัด", `alternateName` (ธน พลัส 153 / Thana Plus 153), NAP ครบ (address/telephone/email), `contactPoint`, logo ผ่าน astro:assets (path hash จริง ไม่ 404); WebSite ผูก `publisher → @id` กลับไป Organization ✅ (ยืนยัน parse สำเร็จทุกบล็อก)

**S2. Product — ✅ ไม่มี schema drift** [products/[...slug].astro:25](src/pages/products/[...slug].astro:25) — `offers` มี `price` (490/650 ตรงกับราคาที่โชว์บนหน้า), `priceCurrency=THB`, `availability` ตาม `inStock`, `itemCondition`, `priceValidUntil`
- ⚠️ ขาด BreadcrumbList (P2-1)
- 💡 ข้อสังเกตเชิงโค้ด: หน้าแสดงราคาเฉพาะเมื่อ `d.price > 0` ([products/[...slug].astro:69](src/pages/products/[...slug].astro:69)) แต่ Product schema ออก `price` เสมอ — ปัจจุบันสินค้าทั้ง 2 ราคา >0 จึงยังไม่ drift แต่ถ้าอนาคตมีสินค้าราคา 0 schema จะประกาศ `price:0` ทั้งที่หน้าไม่โชว์ = drift (เผื่อกันไว้)

**S3. BlogPosting — ✅** [blog/[...slug].astro:29](src/pages/blog/[...slug].astro:29) — headline/description/image/author(Person)/publisher(`@id`)/`datePublished`/`dateModified`(เมื่อมี `updatedAt`)/`mainEntityOfPage` ครบ
- ⚠️ ขาด BreadcrumbList (P2-2)

**S4. FAQPage — ✅ ปลอด drift by design** สร้างจาก array เดียวกับ accordion ที่มองเห็น ([lib/faq.ts](src/lib/faq.ts) + [Faq.astro]) — ออกบนหน้าแรก/services/บทความที่มี `faq`/หน้าสินค้าที่มี `faq` (ดูความลึกใน P2-8)

**S5. CollectionPage + Breadcrumb (category) / Blog + Breadcrumb (blog index) / Service + Breadcrumb (services) — ✅** ครบ (ยืนยัน parse ใน `dist/category/…`, `dist/services/…`)
- ⚠️ `isPartOf` ชี้ Organization (P2-7); LocalBusiness ใน Service ขาด geo/hours/@id (P2-6)

**สรุปสิ่งที่ "ควรมีแต่ยังไม่มี":** BreadcrumbList บน **หน้าสินค้า** และ **หน้าบทความ** (สองชนิดหน้าที่ผู้ใช้เข้าจาก SERP มากสุด)

---

### G. AI-visibility / GEO (AEO)

- **Entity ชัด ✅** — Organization มี legalName/alternateName/NAP/contactPoint ครบ ช่วย LLM ผูกแบรนด์เป็น entity เดียว
- **NAP / LocalBusiness** — มี address ครบใน `consts.ts` และออกเป็น PostalAddress ทั้งใน Organization (ทุกหน้า) และ LocalBusiness (หน้า services) แต่ LocalBusiness ยังขาด `geo`/`openingHoursSpecification` (P2-6) — สองตัวนี้คือสัญญาณ local ที่ map pack/LLM ใช้ตอบ "ร้านอยู่ไหน/เปิดกี่โมง"
- **FAQ / answer-first** — มี FAQ จริงหลายหน้า + คอนเทนต์เขียน answer-first ตามคู่มือ แต่จำนวน Q&A ยังตื้นกว่าเป้า 15–30 ของ GEO (P2-8)
- **sameAs** — มีแค่ LINE (P2-9) ควรเพิ่ม Facebook/Instagram/Google Business Profile เพื่อยืนยันตัวตนแบรนด์
- **llms.txt** — ยังไม่มี (P2-10)
- **ความลึกคอนเทนต์ — ✅** บทความหลายชิ้นลึก (5,000–8,700 อักขระไทย) มีตาราง/บุลเล็ต/FAQ; บางชิ้นสั้น (~1,700–2,000) เช่น care-screen-printed-shirts, choose-tshirt-color-for-sales, company-polo-uniform-fabric-guide, restaurant-cafe-apron-guide → เสริมความลึกได้

---

### B. Broken links / Crawlability

- **ลิงก์ภายใน — ✅** ปลายทางใน Navbar/RelatedServices/breadcrumb ชี้ route ที่ build จริงทั้งหมด (`/services`, `/blog`, `/products`, `/category/*`) ไม่พบลิงก์ชี้หน้าที่ไม่มีอยู่
- **Asset — ✅** logo/favicon/OG ผ่าน astro:assets (path hash) + `public/og-default.png` มีจริง (OG resolve เป็น absolute URL `…/og-default.png`)
- **Orphan — ✅** หน้า category เข้าถึงได้ผ่าน BlogSidebar; product เข้าผ่าน /products; โพสต์เข้าผ่าน grid/sidebar/related — ไม่พบ orphan ในหน้าที่ index ได้ (หน้า tag เป็น noindex,nofollow โดยตั้งใจ)
- **ความเสี่ยงหลักของหมวดนี้คือ cannibalization (P1-2)** ไม่ใช่ลิงก์เสีย

---

## Action Plan (เรียงตาม impact ÷ effort)

| ลำดับ | งาน | finding | Impact | Effort | หมายเหตุการแก้ |
|---|---|---|---|---|---|
| 1 | ✅ **กรอง `/tag/*` ออกจาก sitemap** *(เสร็จ 2026-06-12)* | P1-1 | สูง | ต่ำมาก | แก้ `filter` ใน [astro.config.mjs:38](astro.config.mjs:38) แล้ว: `!page.endsWith("/blog-previews.json") && !page.includes("/tag/")` — `dist/sitemap-0.xml` ไม่มี `/tag/` แล้ว (เดิม 16) |
| 2 | ✅ **ยุบ/แยกบทความซ้ำหัวข้อ** *(เสร็จ 2026-06-12)* | P1-2 | สูง | กลาง | Hybrid: คู่ Pantone → เก็บ white-tshirt เป็นหน้าหลัก + unpublish ตัว trend (`draft:true`) + fold เนื้อหา/FAQ/อ้างอิงเข้าหน้าหลัก; คู่ brand-startup → คงทั้งคู่ แยก `description` (guide เน้นภาพรวม) + interlink สองทางครบ — ดู [§การแก้ไข P1](#-การแก้ไข-p1-2026-06-12) |
| 3 | ✅ **เพิ่ม BreadcrumbList บนหน้าสินค้า + หน้าบทความ** *(เสร็จ 2026-06-12)* | P2-1, P2-2 | กลาง | ต่ำ | ส่งผ่าน `jsonLd` prop แบบเดียวกับ services/category — ยืนยัน parse ใน `dist/products/*` + `dist/blog/*` |
| 4 | ✅ **เกลา description + ปรับ alt สินค้า + ตัด title** *(เสร็จ 2026-06-12)* | P2-3, P2-4, P2-12 | กลาง | ต่ำ | description ทุกหน้า ≤155; `imageAlt` บรรยายภาพจริง เลิกต่อท้าย "Image"; ตัด title 12 บทความ ≥56→≤54 ตัว |
| 5 | ✅ **เสริม schema entity (บางส่วน)** *(2026-06-12)* | P2-6, P2-7, P2-9 | กลาง | ต่ำ–กลาง | ผูก `@id` LocalBusiness→`/#organization` + `isPartOf`→`/#website` (WebSite มี `@id` แล้ว); **เหลือ** `geo`/`hours` + FB/IG ใน `sameAs` (P2-9) รอข้อมูลจริง |
| 6 | ✅ **เพิ่มความลึก FAQ + ship llms.txt** *(เสร็จ 2026-06-12)* | P2-8, P2-10 | กลาง | กลาง | ขยาย FAQ หน้าแรก+services เป็น 15 ข้อ; ship `/llms.txt` ผ่าน endpoint `src/pages/llms.txt.ts` |
| 7 | ✅ **เก็บงานเล็ก** *(2026-06-12)* | P2-5, P2-11, P2-12, P2-13 | ต่ำ | ต่ำ | ลบ tag ชน category; internal link/JSON-LD `item` trailing slash ตรง canonical; ใส่ separator ` – ` (en dash) + แก้คอมเมนต์ — **เหลือ** raw `<img>` 2 จุด (ต่ำกว่า P2 ยังไม่แตะ) |

---

### ภาคผนวก — สิ่งที่ตรวจแล้ว "ผ่าน" (ไม่ต้องแก้)
`npm run build` ✅ exit 0 ไม่มี warning · `npx astro check` ✅ exit 0 · canonical ทุกหน้า ✅ · domain ชี้ production จริง ✅ · robots.txt + disallow `/*?` ✅ · sitemap priority/changefreq/draft-filter ✅ · `<html lang=th>` + locale th_TH ✅ · 1×h1/หน้า ✅ · title นำด้วย keyword ทุก money page (ยืนยัน rendered) ✅ · ไม่มี title/description ซ้ำ ✅ · Organization/WebSite `@id` linking ✅ · FAQPage ปลอด drift ✅ · Product offers ตรงราคาหน้า ✅ · internal linking pillar–cluster ✅ · hydration `client:visible` จุดเดียว ✅ · 404 noindex ✅ · ไม่พบลิงก์ภายในเสีย/orphan ✅

*— จบรายงาน —*
