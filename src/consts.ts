// ค่าคงที่กลางของเว็บ — แก้ที่เดียว ใช้ได้ทั้งไซต์ (SEO, RSS, JSON-LD)
export const SITE = {
  name: 'ThanaPlus',
  title: 'ThanaPlus — โรงงานรับผลิตเสื้อโปโลครบวงจร สกรีน ปักเสื้อพนักงาน ยูนิฟอร์ม',
  description:
    'ThanaPlus โรงงานรับผลิตเสื้อโปโลพนักงาน เสื้อทีมองค์กร ยูนิฟอร์ม และเสื้อยืดสำเร็จรูปครบจบในที่เดียว พร้อมงานปักโลโก้ งานบล็อกสกรีน ออกแบบฟรี ส่งฟรีในกรุงเทพฯ',
  // ภาษาเริ่มต้นของไซต์
  lang: 'th',
  locale: 'th_TH',
  // รูป Open Graph เริ่มต้น (วางไฟล์จริงไว้ที่ public/og-default.png)
  defaultOgImage: '/og-default.png',
  // ข้อมูลองค์กรสำหรับ JSON-LD
  author: 'ThanaPlus',
  contact: {
    phone: '090-201-9121',
    phoneLink: 'tel:0902019121',
    line: '@thanaplus',
    lineLink: 'https://lin.ee/1i3cwjx',
    email: 'thanaplusonline@gmail.com',
    address: '503 ถนนสุโขทัย แขวงสวนจิตรลดา เขตดุสิต กรุงเทพมหานคร 10300',
  },
} as const;

