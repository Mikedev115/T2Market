// Demo seed data (in memory only, resets on page reload).
// Mostly SIMULATED numbers so charts look full. Facts taken from the real RECOFTC report:
// MOU start 1 Aug 2026, grant 300,000 THB received 28 Aug 2026, 59 hives / 19 goats at start,
// 500 honey-soap bars produced in Oct 2026, nursery species (มะริด, ผักหวานป่า, มะแขว่น), report text/targets of period 1.
let seq = 0;
const id = (p) => `${p}${(++seq).toString(36)}`;

// Sample "photos" are references to cartoon scenes (rendered by <Placeholder/>), not emoji cards.
export function samplePhoto(label, c1, c2, emoji) {
  return 'scene:' + ({ '🐝': 'hive', '👥': 'visit', '🌱': 'nursery' }[emoji] || 'tree');
}

export function createSeed() {
  // Beekeepers: each farmer records their own farm (starting hives as of a date, then every honey harvest).
  const hiveFarms = [
    { name: 'เกษตรกร A (ตัวอย่าง)', startHives: 10, startDate: '2026-08-01', note: '' },
    { name: 'เกษตรกร B (ตัวอย่าง)', startHives: 9, startDate: '2026-08-01', note: '' },
    { name: 'เกษตรกร C (ตัวอย่าง)', startHives: 8, startDate: '2026-08-01', note: '' },
    { name: 'เกษตรกร D (ตัวอย่าง)', startHives: 8, startDate: '2026-08-01', note: '' },
    { name: 'เกษตรกร E (ตัวอย่าง)', startHives: 8, startDate: '2026-08-01', note: '' },
    { name: 'เกษตรกร F (ตัวอย่าง)', startHives: 8, startDate: '2026-08-01', note: '' },
    { name: 'เกษตรกร G (ตัวอย่าง)', startHives: 8, startDate: '2026-08-01', note: '' },
  ].map((f) => ({ id: id('f'), ...f }));
  // [farm index, date, hives now, honey kg, honey sold kg, income, note]
  const hiveRounds = [
    [0, '2026-08-20', 10, 0.3, 0, 0, ''], [1, '2026-08-22', 9, 0.2, 0, 0, ''], [2, '2026-08-28', 9, 0.2, 0.2, 200, ''],
    [0, '2026-09-18', 12, 0.5, 0.3, 300, 'ขยายรังเพิ่ม 2 รัง'], [3, '2026-09-20', 9, 0.4, 0, 0, ''], [4, '2026-09-25', 9, 0.3, 0.2, 200, ''],
    [1, '2026-10-05', 11, 0.6, 0.5, 500, ''], [5, '2026-10-08', 9, 0.4, 0, 0, ''], [6, '2026-10-12', 8, 0.2, 0, 0, ''],
    [0, '2026-10-20', 13, 0.8, 0.7, 700, 'ช่วงดอกไม้บาน'], [2, '2026-10-24', 10, 0.5, 0.4, 400, ''],
    [3, '2026-11-02', 10, 0.6, 0.5, 500, ''], [4, '2026-11-06', 10, 0.5, 0.4, 400, ''], [5, '2026-11-10', 10, 0.7, 0.5, 500, ''],
    [6, '2026-11-12', 9, 0.4, 0.3, 300, ''], [1, '2026-11-14', 12, 0.7, 0.2, 200, 'รังแข็งแรง'],
  ].map(([fi, date, total, honeyKg, honeySoldKg, income, note], i) => ({
    id: id('h'), farmerId: hiveFarms[fi].id, date, total, honeyKg, honeySoldKg, income, note,
    photos: i >= 13 ? [samplePhoto('รังชันโรง', '#f59e0b', '#b45309', '🐝')] : [],
  }));

  const visits = [
    { date: '2026-08-22', org: 'กลุ่มเกษตรกรบ้านตัวอย่าง', people: 15, income: 3000, expense: 1200, note: '' },
    { date: '2026-09-10', org: 'โรงเรียนตัวอย่างวิทยา', people: 32, income: 6400, expense: 3100, note: 'ทัศนศึกษา ม.2' },
    { date: '2026-09-28', org: 'อบต.ตัวอย่าง', people: 18, income: 3600, expense: 1500, note: '' },
    { date: '2026-10-18', org: 'คณะศึกษาดูงาน ชุดที่ 1', people: 12, income: 7000, expense: 6780, note: 'รับคณะศึกษาดูงาน เยี่ยมชมโครงการ' },
    { date: '2026-10-30', org: 'วิทยาลัยการอาชีพตัวอย่าง', people: 25, income: 5000, expense: 2300, note: '' },
    { date: '2026-11-10', org: 'คณะศึกษาดูงาน ชุดที่ 2', people: 20, income: 9000, expense: 5200, note: 'ผลตอบรับดีมาก' },
    { date: '2026-11-14', org: 'สำนักงานเกษตรตัวอย่าง', people: 28, income: 5600, expense: 2400, note: '' },
  ].map((r, i) => ({ id: id('v'), ...r, photos: i >= 3 ? [samplePhoto('ศึกษาดูงาน', '#16a34a', '#14532d', '👥')] : [] }));

  const b1 = id('b'), b2 = id('b'), b3 = id('b'), b4 = id('b'), b5 = id('b'), b6 = id('b');
  const seedBatches = [
    { id: b1, date: '2026-08-25', species: 'มะค่า', sown: 300, survived: 261, ready: 200, price: 25, note: '' },
    { id: b2, date: '2026-09-10', species: 'มะริด', sown: 400, survived: 372, ready: 180, price: 20, note: 'เพาะที่เรือนเพาะชำ 2 แห่ง' },
    { id: b3, date: '2026-09-10', species: 'ผักหวานป่า', sown: 300, survived: 252, ready: 60, price: 35, note: 'โตช้า ทยอยพร้อมขาย' },
    { id: b4, date: '2026-09-10', species: 'มะแขว่น', sown: 300, survived: 276, ready: 90, price: 25, note: '' },
    { id: b5, date: '2026-10-12', species: 'สมอพิเภก', sown: 350, survived: 301, ready: 0, price: 18, note: 'ยังไม่พร้อมจำหน่าย' },
    { id: b6, date: '2026-11-05', species: 'ยางนา', sown: 450, survived: 410, ready: 0, price: 20, note: '' },
  ].map((r, i) => ({ ...r, photos: i === 1 ? [samplePhoto('เรือนเพาะชำ', '#4ade80', '#166534', '🌱')] : [] }));

  const seedSales = [
    { date: '2026-10-05', batchId: b1, kind: 'sale', qty: 60, unitPrice: 25, buyer: 'ชุมชนบ้านตัวอย่าง' },
    { date: '2026-10-20', batchId: b1, kind: 'give', qty: 20, unitPrice: 0, buyer: 'แจกในกิจกรรมศึกษาดูงาน' },
    { date: '2026-10-26', batchId: b2, kind: 'sale', qty: 50, unitPrice: 20, buyer: 'ร้านพันธุ์ไม้ตัวอย่าง' },
    { date: '2026-11-03', batchId: b3, kind: 'sale', qty: 15, unitPrice: 35, buyer: 'ลูกค้าทั่วไป' },
    { date: '2026-11-08', batchId: b4, kind: 'sale', qty: 30, unitPrice: 25, buyer: 'อบต.ตัวอย่าง' },
    { date: '2026-11-12', batchId: b2, kind: 'give', qty: 20, unitPrice: 0, buyer: 'แจกสมาชิกปลูกป่า' },
    { date: '2026-11-14', batchId: b1, kind: 'sale', qty: 40, unitPrice: 25, buyer: 'โรงเรียนตัวอย่างวิทยา' },
  ].map((r) => ({ id: id('s'), ...r }));

  const goatEvents = [
    { date: '2026-08-12', type: 'birth', sex: 'female', count: 2, income: 0, note: '' },
    { date: '2026-08-25', type: 'birth', sex: 'male', count: 1, income: 0, note: '' },
    { date: '2026-09-08', type: 'sold', sex: 'male', count: 2, income: 7000, note: 'ขายให้ผู้เลี้ยงในชุมชน' },
    { date: '2026-09-20', type: 'birth', sex: 'female', count: 3, income: 0, note: '' },
    { date: '2026-10-04', type: 'bought', sex: 'female', count: 2, income: 0, note: 'ซื้อแม่พันธุ์เพิ่ม' },
    { date: '2026-10-18', type: 'death', sex: 'male', count: 1, income: 0, note: 'ป่วย' },
    { date: '2026-10-27', type: 'birth', sex: 'male', count: 2, income: 0, note: '' },
    { date: '2026-11-02', type: 'birth', sex: 'female', count: 2, income: 0, note: '' },
    { date: '2026-11-09', type: 'sold', sex: 'male', count: 1, income: 3500, note: '' },
    { date: '2026-11-13', type: 'birth', sex: 'female', count: 1, income: 0, note: '' },
  ].map((r) => ({ id: id('g'), ...r }));

  const p1 = id('p'), p2 = id('p'), p3 = id('p'), p4 = id('p');
  const products = [
    { id: p1, kind: 'bee', name: 'สบู่น้ำผึ้งชันโรง', unit: 'ก้อน', priceWholesale: 80, priceRetail: 100, icon: '🧼' },
    { id: p2, kind: 'bee', name: 'น้ำผึ้งชันโรง', unit: 'ขวด', priceWholesale: 300, priceRetail: 350, icon: '🍯' },
    { id: p3, kind: 'resale', name: 'ข้าวสารอินทรีย์ (ตัวอย่าง)', unit: 'กก.', priceWholesale: 50, priceRetail: 60, icon: '🌾' },
    { id: p4, kind: 'resale', name: 'น้ำตาลมะพร้าว (ตัวอย่าง)', unit: 'กก.', priceWholesale: 48, priceRetail: 55, icon: '🥥' },
  ].map((p) => ({ ...p, photos: [] }));

  // Sales are logged by channel: 'retail' (ขายปลีก) or 'wholesale' (ขายส่ง); each sale deducts stock.
  const mv = (date, productId, type, qty, unitPrice = 0, unitCost = 0, note = '', channel = '') => ({ id: id('m'), date, productId, type, qty, unitPrice, unitCost, note, channel });
  const R = 'retail', W = 'wholesale';
  const stockMoves = [
    mv('2026-10-31', p1, 'in', 500, 0, 25, 'ผลิตล็อตแรก 500 ก้อน'),
    mv('2026-11-02', p1, 'sale', 12, 100, 0, '', R), mv('2026-11-05', p1, 'sale', 20, 80, 0, '', W), mv('2026-11-09', p1, 'sale', 15, 100, 0, '', R),
    mv('2026-11-12', p1, 'sale', 30, 100, 0, 'ลูกทัวร์ดูงาน', R), mv('2026-11-14', p1, 'sale', 10, 100, 0, '', R),
    mv('2026-11-01', p2, 'in', 25, 0, 0, 'บรรจุขวด'),
    mv('2026-11-04', p2, 'sale', 4, 350, 0, '', R), mv('2026-11-08', p2, 'sale', 6, 300, 0, '', W), mv('2026-11-13', p2, 'sale', 5, 350, 0, '', R),
    mv('2026-09-20', p3, 'in', 100, 0, 45, 'ซื้อจากกลุ่มเกษตรกร'),
    mv('2026-10-05', p3, 'sale', 30, 50, 0, '', W), mv('2026-10-22', p3, 'sale', 25, 60, 0, '', R),
    mv('2026-11-05', p3, 'in', 80, 0, 46), mv('2026-11-14', p3, 'sale', 20, 60, 0, '', R),
    mv('2026-10-10', p4, 'in', 60, 0, 38),
    mv('2026-10-25', p4, 'sale', 20, 55, 0, '', R), mv('2026-11-08', p4, 'sale', 15, 48, 0, '', W),
  ];

  const ledger = [
    { date: '2026-08-28', unit: 'general', type: 'grant', amount: 300000, fromGrant: false, desc: 'ได้รับเงินสนับสนุนจาก RECOFTC' },
    { date: '2026-09-05', unit: 'nursery', type: 'expense', amount: 18500, fromGrant: true, desc: 'วัสดุเพาะชำ ดิน ถุงเพาะ' },
    { date: '2026-09-12', unit: 'hive', type: 'expense', amount: 22000, fromGrant: true, desc: 'อุปกรณ์เลี้ยงชันโรง' },
    { date: '2026-10-04', unit: 'goat', type: 'expense', amount: 6500, fromGrant: true, desc: 'ซื้อแม่พันธุ์แพะ 2 ตัว' },
    { date: '2026-10-05', unit: 'hive', type: 'expense', amount: 12600, fromGrant: true, desc: 'วัสดุผลิตสบู่น้ำผึ้งชันโรง 500 ก้อน' },
    { date: '2026-10-10', unit: 'general', type: 'expense', amount: 8000, fromGrant: true, desc: 'ป้ายและประชาสัมพันธ์' },
    { date: '2026-10-20', unit: 'nursery', type: 'expense', amount: 5400, fromGrant: false, desc: 'ปุ๋ยและสารกำจัดศัตรูพืช' },
    { date: '2026-11-04', unit: 'goat', type: 'expense', amount: 3200, fromGrant: false, desc: 'อาหารและยาแพะ' },
    { date: '2026-11-08', unit: 'hive', type: 'expense', amount: 9800, fromGrant: true, desc: 'กล่องรังชันโรง' },
  ].map((r) => ({ id: id('l'), ...r, photos: [] }));

  // Quarterly report (period 1) -- text and targets copied from the RECOFTC form.
  const reports = [
    {
      no: 1,
      preparer: 'ผู้จัดทำรายงาน (ตัวอย่าง)', position: 'ประธานกลุ่มวิสาหกิจชุมชนต้นไม้ของเรา', reviewer: '', reportDate: '2026-11-15',
      summary: '- วันที่ 28 สิงหาคม 2569 ได้รับเงินสนับสนุนจาก RECOFTC จำนวน 300,000 บาท\n- เดือนตุลาคม 2569 ผลิตสบู่น้ำผึ้งชันโรง จำนวน 500 ก้อน (อยู่ระหว่างการผลิต)',
      consult: '',
      members: '1. งานชันโรง เกษตรกรและเจ้าหน้าที่ผู้รับผิดชอบ จำนวน 5 ราย\n2. ศึกษาดูงาน เกษตรกร จำนวน 12 ราย',
      meeting: '',
      evidence: { ledger: true, receipts: true, transfer: false, bank: false, sales: false, stock: false, minutes: false, photos: true, allocation: false },
      units: {
        hive: { status: 'onplan', activities: 'ผลิตสบู่น้ำผึ้งชันโรง จำนวน 500 ก้อน', problems: '', next: 'วางจำหน่ายสบู่น้ำผึ้งชันโรงและผลิตภัณฑ์น้ำผึ้ง\nสร้างจุดรวมผึ้งชันโรง 1 แห่ง\nจัดซื้อแม่พันธุ์และกล่องรังชันโรง',
          targets: { farmers: 10, start: 59, net: 30, end: 100, honey: 30, honeySold: 30, revenue: 30000 } },
        goat: { status: 'onplan', farmers: 2, activities: '', problems: '', next: '',
          targets: { farmers: 2, start: 19, born: 5, bought: 0, sold: 10, died: 0, end: 29, revenue: 30000 } },
        visit: { status: 'onplan', activities: 'รับคณะศึกษาดูงาน เยี่ยมชมโครงการ', problems: '', next: '',
          targets: { count: 1, people: 10, groups: 1, income: 5000, cost: 0 } },
        nursery: { status: 'onplan',
          activities: 'เดือนกันยายน 2569 เกษตรกรเตรียมดิน วัสดุอุปกรณ์ และเริ่มเพาะกล้าจากเมล็ดไม้ เช่น มะริด ผักหวานป่า มะแขว่น จำนวน 2 เรือนเพาะชำ',
          problems: 'ช่วงเมล็ดงอกมักมีศัตรูพืช เช่น มด หอยทาก กัดกินต้นอ่อนทำให้ต้นกล้าตาย แก้ไขโดยใช้สารกำจัดมดและผงโรยหอยทากรอบเรือนเพาะชำ',
          next: 'เพาะกล้าไม้ จำนวน 6 เรือนเพาะชำ กล้าไม้ 5,000 ต้น',
          targets: { start: 0, produced: 1000, sold: 200, given: 100, damaged: 100, end: 700, revenue: 5000 } },
        resale: { status: 'notstarted', activities: '', problems: '', next: '',
          targets: { items: 2, bought: 100, sold: 50, stock: 50, revenue: 3000, cogs: 2300 } },
      },
    },
  ];

  return {
    ledger, hiveFarms, hiveRounds, visits, seedBatches, seedSales, goatEvents, products, stockMoves, reports,
    settings: {
      goatOpening: { date: '2026-08-01', male: 5, female: 14 },
    },
  };
}
