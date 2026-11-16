# Trees4All · ระบบรายงานผลการดำเนินงาน (เดโม)

ตัวอย่างหน้าจอ (UI demo) สำหรับวิสาหกิจชุมชนต้นไม้ของเรา รักษ์สันติสุข — โครงการ Trees4All (MOU RECOFTC)

- **หน้าบ้าน** — แนะนำกิจกรรม สินค้า สั่งซื้อ และจองศึกษาดูงาน
- **หลังบ้าน** — ชันโรง · แพะ · ศึกษาดูงาน · เรือนเพาะชำ · สินค้า/ซื้อมาขายไป · การเงิน · ออเดอร์/การจอง
- **รายงาน** — เลือกช่วงเวลาได้ (1 วัน / 1 เดือน / 6 เดือน / 1 ปี / ทั้งหมด / เลือกเอง) และรายงานงวด 3 เดือนตามแบบฟอร์ม RECOFTC พร้อมรายงานการเงิน

> เป็นตัวเดโม: ข้อมูลทั้งหมดเป็นข้อมูลจำลองเก็บในหน่วยความจำ (รีเฟรชหน้า = รีเซ็ต) ยังไม่มีฐานข้อมูล/ระบบล็อกอินจริง
> หน้า Login กดปุ่ม **"เข้าชมระบบ (เดโม)"** เพื่อเข้าดูได้เลย

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
```

## Structure

- `src/api/client.js` — data layer (in-memory mock). Swap for `fetch` when a backend exists, see `backend/README.md`
- `src/lib/calc.js`, `src/lib/quarter.js` — report/derived numbers (cumulative, quarterly indicators, finance tables)
- `src/pages/` — public site, order/booking flow, back-office pages
- `public/images/` — optional real photos (see README there); cartoon illustrations are used when missing

Stack: React + Vite (no database). Deployed with GitHub Pages (`.github/workflows/pages.yml`).
