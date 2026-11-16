// Builds the 3-month (quarterly) report for the RECOFTC MOU form from raw records.
import { sum, goatDelta, productReport, hiveBalance } from './calc.js';

export const MOU = {
  start: '2026-08-01', end: '2029-08-31',
  org: 'วิสาหกิจชุมชนต้นไม้ของเรา รักษ์สันติสุข', project: 'โครงการ T2Market', partner: 'RECOFTC',
};
export const STATUS = { onplan: 'ตามแผน', late: 'ล่าช้า', notstarted: 'ยังไม่ดำเนินการ' };
export const UNITS = [
  { key: 'hive', title: 'ชันโรง', icon: '🐝', color: '#d97706' },
  { key: 'goat', title: 'แพะ', icon: '🐐', color: '#8a5a33' },
  { key: 'visit', title: 'ศึกษาดูงาน', icon: '👥', color: '#16a34a' },
  { key: 'nursery', title: 'เรือนเพาะชำ', icon: '🌱', color: '#0d9488' },
  { key: 'resale', title: 'ซื้อมาขายไป', icon: '🛒', color: '#2563eb' },
];

const iso = (d) => d.toISOString().slice(0, 10);
export function periods() {
  const out = [];
  for (let n = 1; ; n++) {
    const start = iso(new Date(Date.UTC(2026, 7 + 3 * (n - 1), 1)));
    if (start > MOU.end) break;
    let end = iso(new Date(Date.UTC(2026, 7 + 3 * n, 0)));
    if (end > MOU.end) end = MOU.end;
    out.push({ no: n, start, end });
  }
  return out;
}

export const EVIDENCE = [
  ['ledger', 'ทะเบียนรายรับ–รายจ่าย', 'ตรวจสอบรายการทางการเงินในแต่ละงวด'],
  ['receipts', 'ใบเสร็จรับเงิน / ใบสำคัญจ่าย', 'ตรวจสอบการใช้จ่ายจริง'],
  ['transfer', 'หลักฐานการโอนเงินหรือรับเงิน', 'ยืนยันรายการจ่ายและรับเงิน'],
  ['bank', 'สมุดบัญชีธนาคาร / รายการเดินบัญชี', 'กระทบยอดเงินคงเหลือ'],
  ['sales', 'ทะเบียนการขายสินค้าและบริการ', 'ตรวจสอบรายได้แต่ละธุรกิจ'],
  ['stock', 'ทะเบียนสินค้า / ผลผลิตคงเหลือ', 'ตรวจสอบทรัพย์สินและผลผลิต'],
  ['minutes', 'รายงานการประชุมคณะกรรมการ', 'ตรวจสอบการตัดสินใจและการบริหารงาน'],
  ['photos', 'ภาพถ่ายกิจกรรมหรือผลผลิต', 'ยืนยันความก้าวหน้าการดำเนินงาน'],
  ['allocation', 'เอกสารการจัดสรรเงินแก่สมาชิก', 'ตรวจสอบการกระจายรายได้และผลประโยชน์'],
];

// Proposed due date: the 15th of the month after the period ends (closing report: 30 Sep 2029).
export function dueDate(p) {
  if (p.no === 13) return '2029-09-30';
  const [y, m] = p.end.split('-').map(Number);
  return iso(new Date(Date.UTC(y, m, 15)));
}

export function emptyReport(no) {
  return { no, preparer: '', position: '', reviewer: '', reportDate: '', summary: '', consult: '', units: {} };
}

export function buildQuarter(db, p, report) {
  const s = p.start, e = p.end, M = MOU.start;
  const inP = (d) => d >= s && d <= e;
  const inC = (d) => d >= M && d <= e;
  const R = report || emptyReport(p.no);
  const unitData = (k) => R.units?.[k] || {};
  const tgt = (k, key) => unitData(k).targets?.[key];
  const manual = (k) => unitData(k).farmers ?? 0;

  const rows = (k, spec) => spec.map(([key, label, unit, actual, cum]) => {
    const target = tgt(k, key);
    return { key, label, unit, target, actual, cum, pct: target > 0 ? (actual / target) * 100 : null };
  });
  const range = (list, f, v) => [sum(list.filter((x) => inP(x.date)), v ?? f), sum(list.filter((x) => inC(x.date)), v ?? f)];

  /* ---- hive ---- */
  const rounds = [...db.hiveRounds].sort((a, b) => (a.date < b.date ? -1 : 1));
  const hiveBal = (pred, startPred) => hiveBalance(db.hiveFarms, rounds, pred, startPred);
  const hStart = hiveBal((r) => r.date < s, (f) => f.startDate < s), hEnd = hiveBal((r) => r.date <= e, (f) => f.startDate <= e);
  const hOpen = sum(db.hiveFarms, (f) => f.startHives);
  const beeSales = db.stockMoves.filter((m) => m.type === 'sale' && db.products.find((x) => x.id === m.productId)?.kind === 'bee');
  const [honeyP, honeyC] = range(rounds, null, (r) => r.honeyKg);
  const [soldP, soldC] = range(rounds, null, (r) => r.honeySoldKg);
  const [incP, incC] = range(rounds, null, (r) => r.income);
  const [bsP, bsC] = range(beeSales, null, (m) => m.qty * m.unitPrice);
  const hive = rows('hive', [
    ['farmers', 'ผู้เลี้ยงที่ดำเนินกิจกรรม', 'ราย', db.hiveFarms.length, db.hiveFarms.length],
    ['start', 'จำนวนรังต้นงวด', 'รัง', hStart, hOpen],
    ['net', 'รังเพิ่ม / ลดสุทธิ', 'รัง', hEnd - hStart, hEnd - hOpen],
    ['end', 'จำนวนรังปลายงวด', 'รัง', hEnd, hEnd],
    ['honey', 'ผลผลิตน้ำผึ้ง', 'กก.', honeyP, honeyC],
    ['honeySold', 'ปริมาณน้ำผึ้งขาย', 'กก.', soldP, soldC],
    ['revenue', 'รายได้จากการขาย', 'บาท', incP + bsP, incC + bsC],
  ]);

  /* ---- goat ---- */
  const ev = [...db.goatEvents];
  const op = db.settings.goatOpening;
  const gBal = (pred) => op.male + op.female + sum(ev.filter(pred), goatDelta);
  const gStart = gBal((x) => x.date < s), gEnd = gBal((x) => x.date <= e), gOpen = op.male + op.female;
  const cnt = (type) => range(ev.filter((x) => x.type === type), (x) => x.count);
  const [bornP, bornC] = cnt('birth'), [buyP, buyC] = cnt('bought'), [sellP, sellC] = cnt('sold'), [dieP, dieC] = cnt('death');
  const [gIncP, gIncC] = range(ev.filter((x) => x.type === 'sold'), (x) => x.income);
  const goat = rows('goat', [
    ['farmers', 'ผู้เลี้ยงที่ดำเนินกิจกรรม', 'ราย', manual('goat'), manual('goat')],
    ['start', 'จำนวนแพะต้นงวด', 'ตัว', gStart, gOpen],
    ['born', 'จำนวนเกิดใหม่', 'ตัว', bornP, bornC],
    ['bought', 'จำนวนซื้อหรือรับเพิ่ม', 'ตัว', buyP, buyC],
    ['sold', 'จำนวนขาย', 'ตัว', sellP, sellC],
    ['died', 'จำนวนตายหรือสูญเสีย', 'ตัว', dieP, dieC],
    ['end', 'จำนวนแพะปลายงวด', 'ตัว', gEnd, gEnd],
    ['revenue', 'รายได้จากการขาย', 'บาท', gIncP, gIncC],
  ]);

  /* ---- visits ---- */
  const [vCntP, vCntC] = range(db.visits, () => 1);
  const [vPplP, vPplC] = range(db.visits, (x) => x.people);
  const [vIncP, vIncC] = range(db.visits, (x) => x.income);
  const [vCostP, vCostC] = range(db.visits, (x) => x.expense);
  const visit = rows('visit', [
    ['count', 'จำนวนกิจกรรมที่จัด', 'ครั้ง', vCntP, vCntC],
    ['people', 'ผู้เข้าร่วมกิจกรรม', 'คน', vPplP, vPplC],
    ['groups', 'จำนวนคณะหรือหน่วยงาน', 'คณะ', vCntP, vCntC],
    ['income', 'รายได้ค่าบริการ', 'บาท', vIncP, vIncC],
    ['cost', 'ต้นทุนจัดกิจกรรม', 'บาท', vCostP, vCostC],
  ]);

  /* ---- nursery ---- */
  const dam = (b) => b.sown - b.survived;
  const nBal = (lim) => sum(db.seedBatches.filter((b) => b.date < lim), (b) => b.sown - dam(b)) - sum(db.seedSales.filter((x) => x.date < lim), (x) => x.qty);
  const nEndBal = sum(db.seedBatches.filter((b) => b.date <= e), (b) => b.sown - dam(b)) - sum(db.seedSales.filter((x) => x.date <= e), (x) => x.qty);
  const sales = db.seedSales.filter((x) => (x.kind || 'sale') === 'sale');
  const gives = db.seedSales.filter((x) => x.kind === 'give');
  const [prodP, prodC] = range(db.seedBatches, (b) => b.sown);
  const [dmgP, dmgC] = range(db.seedBatches, dam);
  const [slP, slC] = range(sales, (x) => x.qty);
  const [gvP, gvC] = range(gives, (x) => x.qty);
  const [nrP, nrC] = range(sales, (x) => x.qty * x.unitPrice);
  const nursery = rows('nursery', [
    ['start', 'จำนวนกล้าไม้ต้นงวด', 'ต้น', nBal(s), 0],
    ['produced', 'กล้าไม้ผลิตเพิ่ม', 'ต้น', prodP, prodC],
    ['sold', 'กล้าไม้จำหน่าย', 'ต้น', slP, slC],
    ['given', 'กล้าไม้แจกหรือใช้ในกิจกรรม', 'ต้น', gvP, gvC],
    ['damaged', 'กล้าไม้เสียหาย', 'ต้น', dmgP, dmgC],
    ['end', 'กล้าไม้ปลายงวด', 'ต้น', nEndBal, nEndBal],
    ['revenue', 'รายได้จากการขาย', 'บาท', nrP, nrC],
  ]);

  /* ---- resale ---- */
  const resaleIds = db.products.filter((x) => x.kind === 'resale').map((x) => x.id);
  const rm = db.stockMoves.filter((m) => resaleIds.includes(m.productId));
  const avgCost = (pid) => { const ins = rm.filter((m) => m.productId === pid && m.type === 'in' && m.date <= e); const q = sum(ins, (m) => m.qty); return q ? sum(ins, (m) => m.qty * (m.unitCost || 0)) / q : 0; };
  const rsale = rm.filter((m) => m.type === 'sale');
  const [rbP, rbC] = range(rm.filter((m) => m.type === 'in'), (m) => m.qty);
  const [rsP, rsC] = range(rsale, (m) => m.qty);
  const [rrP, rrC] = range(rsale, (m) => m.qty * m.unitPrice);
  const [rcP, rcC] = range(rsale, (m) => m.qty * avgCost(m.productId));
  const rStock = sum(rm.filter((m) => m.date <= e), (m) => (m.type === 'in' || m.type === 'adjust' ? m.qty : -m.qty));
  const itemsP = new Set(rm.filter((m) => inP(m.date)).map((m) => m.productId)).size;
  const itemsC = new Set(rm.filter((m) => inC(m.date)).map((m) => m.productId)).size;
  const resale = rows('resale', [
    ['items', 'รายการสินค้าที่จำหน่าย', 'รายการ', itemsP, itemsC],
    ['bought', 'ปริมาณสินค้ารับเข้าหรือซื้อ', 'หน่วย', rbP, rbC],
    ['sold', 'ปริมาณสินค้าที่ขาย', 'หน่วย', rsP, rsC],
    ['stock', 'สินค้าคงเหลือ', 'หน่วย', rStock, rStock],
    ['revenue', 'รายได้จากการขาย', 'บาท', rrP, rrC],
    ['cogs', 'ต้นทุนสินค้าที่ขาย', 'บาท', Math.round(rcP), Math.round(rcC)],
    ['gross', 'กำไรขั้นต้น', 'บาท', Math.round(rrP - rcP), Math.round(rrC - rcC)],
  ]);

  const byKey = { hive, goat, visit, nursery, resale };
  const units = UNITS.map((u) => {
    const d = unitData(u.key);
    const rs = byKey[u.key];
    const scored = rs.filter((r) => r.pct !== null && ['revenue', 'end', 'people', 'honey', 'sold', 'produced', 'count', 'income'].includes(r.key));
    const score = scored.length ? sum(scored, (r) => Math.min(r.pct, 100)) / scored.length : null;
    return { ...u, status: d.status || 'notstarted', activities: d.activities || '', problems: d.problems || '', next: d.next || '', rows: rs, score };
  });
  return { units, revenue: sum(units, (u) => u.rows.find((r) => r.key === 'revenue' || r.key === 'income')?.actual ?? 0), report: R };
}

// Financial report (RECOFTC form: table 1 grant usage, table 2 per-unit income/expense).
export function buildFinance(db, p, built) {
  const s = p.start, e = p.end;
  const led = db.ledger || [];
  const inP = (d) => d >= s && d <= e;
  const received = sum(led.filter((x) => x.type === 'grant' && x.date <= e), (x) => x.amount);
  const grantSpend = led.filter((x) => x.type === 'expense' && x.fromGrant);
  const before = sum(grantSpend.filter((x) => x.date < s), (x) => x.amount);
  const during = sum(grantSpend.filter((x) => inP(x.date)), (x) => x.amount);
  const resaleIds = db.products.filter((x) => x.kind === 'resale').map((x) => x.id);
  const units = UNITS.map((u) => {
    const revenue = built.units.find((x) => x.key === u.key).rows.find((r) => r.key === 'revenue' || r.key === 'income')?.actual ?? 0;
    let expense = sum(led.filter((x) => x.type === 'expense' && x.unit === u.key && inP(x.date)), (x) => x.amount);
    if (u.key === 'visit') expense += sum(db.visits.filter((x) => inP(x.date)), (x) => x.expense);
    if (u.key === 'resale') expense += sum(db.stockMoves.filter((m) => m.type === 'in' && resaleIds.includes(m.productId) && inP(m.date)), (m) => m.qty * (m.unitCost || 0));
    return { ...u, revenue, expense, net: revenue - expense };
  });
  const general = sum(led.filter((x) => x.type === 'expense' && x.unit === 'general' && inP(x.date)), (x) => x.amount);
  const total = { revenue: sum(units, (u) => u.revenue), expense: sum(units, (u) => u.expense) + general, general };
  total.net = total.revenue - total.expense;
  return { grant: { received, before, during, remaining: received - before - during }, units, total };
}
