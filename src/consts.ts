// ค่าคงที่กลางของเว็บ — แก้ที่เดียว ใช้ได้ทั้งไซต์ (SEO, RSS, JSON-LD)
export const SITE = {
  name: 'เสื้อแท้',
  title: 'เสื้อแท้ — โรงงานรับผลิตเสื้อครบวงจร สกรีน ตัดเย็บ ออกแบบฟรี',
  description:
    'เสื้อแท้ โรงงานรับผลิตเสื้อยืด โปโล แจ็คเก็ต เสื้อช็อป และกระเป๋าผ้า ครบจบในที่เดียว พร้อมงานสกรีน ออกแบบฟรี',
  // ภาษาเริ่มต้นของไซต์
  lang: 'th',
  locale: 'th_TH',
  // รูป Open Graph เริ่มต้น (วางไฟล์จริงไว้ที่ public/og-default.png)
  defaultOgImage: '/og-default.png',
  // ข้อมูลองค์กรสำหรับ JSON-LD
  author: 'เสื้อแท้',
  social: {
    twitter: '@astrotshirt',
  },
} as const;
