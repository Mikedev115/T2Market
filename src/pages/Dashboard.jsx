import { Link } from 'react-router-dom';
import { useData } from '../data.jsx';
import { hiveReport, visitReport, seedReport, goatReport, productReport } from '../lib/calc.js';
import { buildQuarter, buildFinance, periods, dueDate } from '../lib/quarter.js';
import { num, baht, dm, fmtDate, today } from '../lib/format.js';
import { Kpi, PageHead, Card, useDemo } from '../components/ui.jsx';
import Chart, { Donut } from '../components/Chart.jsx';

export default function Dashboard() {
  const { db } = useData();
  const demo = useDemo();
  const hive = hiveReport(db.hiveRounds, db.settings.hiveOpening);
  const visit = visitReport(db.visits);
  const seed = seedReport(db.seedBatches, db.seedSales);
  const goat = goatReport(db.goatEvents, db.settings.goatOpening);
  const prod = productReport(db.products, db.stockMoves);
  const all = { start: '2026-08-01', end: '2029-08-31' };
  const fin = buildFinance(db, all, buildQuarter(db, all, null));
  const lowStock = prod.products.filter((p) => p.stock <= 10);
  const next = periods().find((p) => dueDate(p) >= today()) || periods()[0];
  const pending = db.orders.filter((o) => o.status === 'pending').length + db.bookings.filter((o) => o.status === 'pending').length;
  const lbl = (rows) => rows.map((r) => dm(r.date));

  return (
    <>
      <PageHead icon="📊" title="ภาพรวม" desc="สรุปผลทุกหน่วยธุรกิจของวิสาหกิจ">
        <button className="btn" onClick={() => demo('ส่งออกรายงานสรุป (PDF / Excel)')}>⬇ ส่งออก</button>
        <Link className="btn primary" to="/admin/report">📑 ดูรายงาน</Link>
      </PageHead>

      {pending > 0 && (
        <Link to="/admin/orders" className="due-banner alt">
          <span>📥</span><div><b>มีออเดอร์ / การจองรอยืนยัน {pending} รายการ</b><small>แตะเพื่อดูและยืนยัน</small></div><i>›</i>
        </Link>
      )}
      <Link to="/admin/report" className="due-banner">
        <span>📅</span>
        <div><b>รายงานงวดถัดไป: งวดที่ {next.no}</b><small>ช่วง {fmtDate(next.start)} – {fmtDate(next.end)} · กำหนดส่ง {fmtDate(dueDate(next))}</small></div>
        <i>›</i>
      </Link>

      <div className="kpi-grid">
        <Kpi icon="🐝" label="รังชันโรง" value={num(hive.totals.current)} sub={`น้ำผึ้งสะสม ${num(hive.totals.honey)} กก.`} tone="amber" />
        <Kpi icon="🐐" label="แพะทั้งหมด" value={`${num(goat.totals.total)} ตัว`} sub={`ผู้ ${goat.totals.male} · เมีย ${goat.totals.female}`} tone="brown" />
        <Kpi icon="👥" label="ผู้มาศึกษาดูงาน" value={`${num(visit.totals.people)} คน`} sub={`${visit.totals.count} ครั้ง`} />
        <Kpi icon="🌱" label="กล้าไม้คงเหลือ" value={`${num(seed.totals.available)} ต้น`} sub={`อัตรารอด ${seed.totals.rate.toFixed(1)}%`} />
        <Kpi icon="🏦" label="เงินสนับสนุนคงเหลือ" value={baht(fin.grant.remaining)} sub={`ใช้ไป ${baht(fin.grant.before + fin.grant.during)}`} tone="blue" />
        <Kpi icon="💰" label="รายรับธุรกิจสะสม" value={baht(fin.total.revenue)} sub={`สุทธิ ${baht(fin.total.net)}`} tone="blue" />
      </div>

      <div className="grid-2">
        <Card title="จำนวนรังชันโรงแต่ละรอบ"><Chart type="line" color="#d97706" labels={lbl(hive.rows)} values={hive.rows.map((r) => r.total)} unit="รัง" /></Card>
        <Card title="รายรับแยกตามหน่วยธุรกิจ"><Donut items={fin.units.map((u) => ({ label: u.title, value: u.revenue, color: u.color }))} centerValue={num(fin.total.revenue)} centerLabel="บาท" /></Card>
        <Card title="ผู้มาศึกษาดูงานแต่ละครั้ง"><Chart color="#16a34a" labels={lbl(visit.rows)} values={visit.rows.map((r) => r.people)} unit="คน" /></Card>
        <Card title="จำนวนแพะหลังแต่ละเหตุการณ์"><Chart type="line" color="#8a5a33" labels={lbl(goat.rows)} values={goat.rows.map((r) => r.total)} unit="ตัว" /></Card>
      </div>

      <Card title="สต๊อกสินค้า">
        {lowStock.length > 0 && <div className="alert">⚠ สินค้าใกล้หมด: {lowStock.map((p) => `${p.name} (${p.stock})`).join(', ')}</div>}
        <div className="mini-table">
          {prod.products.map((p) => (
            <div key={p.id} className="mini-row">
              <span>{p.icon} {p.name}</span>
              <span>ขายแล้ว <b>{num(p.sold)}</b></span>
              <span>คงเหลือ <b>{num(p.stock)}</b> {p.unit}</span>
              <span>{baht(p.revenue)}</span>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}
