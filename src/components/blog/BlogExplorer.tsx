// BlogExplorer — React island สำหรับ "ค้นหา + กรอง" บทความบล็อกทั้งหมด
// เป็นส่วน interactive เพียงจุดเดียว (ตาม CLAUDE.md: React ใช้เฉพาะ search/filter)
// ข้อมูลรูปถูก optimize ด้วย getImage() ใน .astro แล้วส่งเป็น plain data เข้ามา
import { useMemo, useState } from 'react';

export interface BlogCardData {
  slug: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  /** วันที่ format th-TH มาแล้วจากฝั่ง .astro */
  date: string;
  /** รูปปก optimize แล้ว (null ถ้าบทความไม่มี cover) */
  cover: { src: string; srcSet: string } | null;
}

interface Props {
  posts: BlogCardData[];
  categories: string[];
  tags: string[];
}

// ขนาดรูปในกริด (ตรงกับ srcSet ที่ getImage สร้างไว้) — กัน CLS ด้วย aspect คงที่
const IMG_SIZES = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw';

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
);

const ClearIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
);

const PlayIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><circle cx="12" cy="12" r="10" /><polygon points="10 8 16 12 10 16 10 8" /></svg>
);

export default function BlogExplorer({ posts, categories, tags }: Props) {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState(''); // '' = ทั้งหมด
  const [activeTags, setActiveTags] = useState<string[]>([]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts.filter((p) => {
      // หมวดหมู่ — AND (ต้องตรงหมวดที่เลือก ถ้าเลือกไว้)
      if (activeCategory && p.category !== activeCategory) return false;
      // แท็ก — OR (มีอย่างน้อยหนึ่งแท็กที่เลือก)
      if (activeTags.length && !p.tags.some((t) => activeTags.includes(t))) return false;
      // ค้นหา — ครอบ title + description + category + tags
      if (q) {
        const haystack = `${p.title} ${p.description} ${p.category} ${p.tags.join(' ')}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [posts, query, activeCategory, activeTags]);

  const toggleTag = (t: string) =>
    setActiveTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));

  const hasFilter = query.trim() !== '' || activeCategory !== '' || activeTags.length > 0;
  const reset = () => {
    setQuery('');
    setActiveCategory('');
    setActiveTags([]);
  };

  const pill = (active: boolean) =>
    `px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
      active
        ? 'bg-gray-900 text-white border-gray-900'
        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-900 hover:text-gray-900'
    }`;

  return (
    <div>
      {/* แถบควบคุม: ค้นหา + ตัวกรอง */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8 mb-10">
        {/* ช่องค้นหา */}
        <div className="relative mb-6">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            <SearchIcon />
          </span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ค้นหาบทความ เช่น งานสกรีน, เลือกผ้า, สร้างแบรนด์..."
            aria-label="ค้นหาบทความ"
            className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3.5 pl-12 pr-4 text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/10 transition-colors"
          />
        </div>

        {/* ตัวกรองหมวดหมู่ */}
        <div className="mb-5">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">หมวดหมู่</p>
          <div className="flex flex-wrap gap-2.5">
            <button type="button" onClick={() => setActiveCategory('')} className={pill(activeCategory === '')}>
              ทั้งหมด
            </button>
            {categories.map((c) => (
              <button key={c} type="button" onClick={() => setActiveCategory(c)} className={pill(activeCategory === c)}>
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* ตัวกรองแท็ก (เลือกได้หลายตัว) */}
        {tags.length > 0 && (
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">แท็ก</p>
            <div className="flex flex-wrap gap-2">
              {tags.map((t) => {
                const active = activeTags.includes(t);
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => toggleTag(t)}
                    aria-pressed={active}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                      active
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-gray-50 text-gray-600 border-gray-100 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* แถบสรุปผล + ล้างตัวกรอง */}
      <div className="flex items-center justify-between gap-4 mb-8">
        <p className="text-sm text-gray-500">
          พบ <span className="font-bold text-gray-900">{filtered.length}</span> บทความ
        </p>
        {hasFilter && (
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ClearIcon />
            ล้างตัวกรอง
          </button>
        )}
      </div>

      {/* กริดบทความ — สไตล์เดียวกับ BlogGrid.astro */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          {filtered.map((post) => (
            <a
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group block bg-white rounded-3xl p-3 border border-transparent hover:border-gray-100 hover:shadow-lg transition-all duration-300"
            >
              <div className="rounded-2xl overflow-hidden mb-5 aspect-[4/3] bg-gray-100">
                {post.cover && (
                  <img
                    src={post.cover.src}
                    srcSet={post.cover.srcSet}
                    sizes={IMG_SIZES}
                    alt={post.title}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                  />
                )}
              </div>
              <div className="px-2 pb-2">
                <div className="flex items-center justify-between gap-3 text-sm text-gray-500 mb-3">
                  {post.tags[0] && (
                    <span className="bg-gray-100 px-2.5 py-1 rounded-full text-gray-800 font-medium text-xs whitespace-nowrap">
                      {post.tags[0]}
                    </span>
                  )}
                  <span className="text-xs">{post.date}</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                  {post.title}
                </h3>
                <div className="flex items-center text-sm font-semibold text-gray-900 group-hover:text-blue-600">
                  <PlayIcon />
                  อ่านบทความ
                </div>
              </div>
            </a>
          ))}
        </div>
      ) : (
        // Empty state
        <div className="text-center py-20 px-6 bg-white rounded-3xl border border-dashed border-gray-200">
          <p className="text-lg font-bold text-gray-900 mb-2">ไม่พบบทความที่ตรงกับเงื่อนไข</p>
          <p className="text-sm text-gray-500 mb-6">ลองเปลี่ยนคำค้นหา หรือล้างตัวกรองเพื่อดูบทความทั้งหมด</p>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-white bg-gray-900 rounded-full hover:bg-gray-800 transition-colors"
          >
            ล้างตัวกรอง
          </button>
        </div>
      )}
    </div>
  );
}
