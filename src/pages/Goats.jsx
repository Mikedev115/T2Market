import { useState } from 'react';
import { useData } from '../data.jsx';
import { goatReport } from '../lib/calc.js';
import { num, baht, fmtDate, dm, today } from '../lib/format.js';
import { Kpi, PageHead, Card, DataTable, FormModal, useDemo } from '../components/ui.jsx';
import Chart, { Donut } from '../components/Chart.jsx';

const sexLabel = { male: 'ตัวผู้', female: 'ตัวเมีย' };
const types = {
  birth: ['เกิดเพิ่ม', 'green', '+'], bought: ['ซื้อ / รับเพิ่ม', 'blue', '+'],
  sold: ['ขาย', 'amber', '−'], death: ['ตาย / สูญเสีย', 'red', '−'],
};

export default function Goats() {
  const { db, create, update, remove, saveSettings } = useData();
  const demo = useDemo();
  const [form, setForm] = useState(null);
  const [openingForm, setOpeningForm] = useState(false);
  const opening = db.settings.goatOpening;
  const { rows, totals } = goatReport(db.goatEvents, opening);
  const save = (d) => (form.id ? update('goatEvents', form.id, d) : create('goatEvents', d));

  const fields = [
    { key: 'date', label: 'วันที่', type: 'date', required: true, default: today() },
    { key: 'type', label: 'เหตุการณ์', type: 'select', required: true, default: 'birth', options: Object.entries(types).map(([value, t]) => ({ value, label: t[0] })) },
    { key: 'sex', label: 'เพศ', type: 'select', required: true, default: 'female', options: [{ value: 'male', label: 'ตัวผู้' }, { value: 'female', label: 'ตัวเมีย' }] },
    { key: 'count', label: 'จำนวน (ตัว)', type: 'number', min: 1, required: true, default: 1 },
    { key: 'income', label: 'รายได้จากการขาย (บาท)', type: 'number', min: 0, default: 0, hint: 'ใช้เฉพาะ "ขาย"', wide: true },
    { key: 'note', label: 'บันทึก', type: 'textarea' },
  ];
  const openingFields = [
    { key: 'date', label: 'ณ วันที่', type: 'date', required: true },
    { key: 'male', label: 'ตัวผู้ตั้งต้น', type: 'number', min: 0, required: true },
    { key: 'female', label: 'ตัวเมียตั้งต้น', type: 'number', min: 0, required: true },
  ];
  const cols = [
    { label: 'วันที่', render: (r) => fmtDate(r.date) },
    { label: 'เหตุการณ์', render: (r) => <span className={`tag ${types[r.type][1]}`}>{types[r.type][0]}</span> },
    { label: 'เพศ', render: (r) => sexLabel[r.sex] },
    { label: 'จำนวน', align: 'right', render: (r) => <b className={types[r.type][2] === '+' ? 'up' : 'down'}>{types[r.type][2]}{r.count}</b> },
    { label: 'รายได้', align: 'right', render: (r) => (r.type === 'sold' ? baht(r.income) : '—') },
    { label: 'ผู้สะสม', align: 'right', render: (r) => num(r.male) },
    { label: 'เมียสะสม', align: 'right', render: (r) => num(r.female) },
    { label: 'รวมสะสม', align: 'right', render: (r) => <b>{num(r.total)}</b> },
    { label: 'บันทึก', render: (r) => <span className="muted">{r.note || '—'}</span> },
  ];

  return (
    <>
      <PageHead icon="🐐" title="ธุรกิจแพะ" desc="ตัวผู้ ตัวเมีย ปริมาณสะสม เกิดเพิ่ม ซื้อ/รับเพิ่ม ขาย ตาย และรายได้">
        <button className="btn" onClick={() => demo('ส่งออกรายงานแพะ (Excel / PDF)')}>⬇ ส่งออก</button>
        <button className="btn" onClick={() => setOpeningForm(true)}>⚙ จำนวนตั้งต้น</button>
        <button className="btn primary" onClick={() => setForm({})}>＋ บันทึกเหตุการณ์</button>
      </PageHead>
      <div className="kpi-grid">
        <Kpi icon="🐐" label="แพะทั้งหมด" value={`${num(totals.total)} ตัว`} tone="brown" sub={`ตั้งต้น ${opening.male + opening.female} ตัว`} />
        <Kpi icon="♂" label="ตัวผู้" value={num(totals.male)} tone="blue" />
        <Kpi icon="♀" label="ตัวเมีย" value={num(totals.female)} />
        <Kpi icon="🍼" label="เกิดเพิ่มรวม" value={`${totals.born} ตัว`} sub={`ซื้อ ${totals.bought} · ขาย ${totals.sold} · ตาย ${totals.died}`} />
      </div>
      <p className="muted pad">ตั้งต้น ณ {fmtDate(opening.date)}: ผู้ {opening.male} · เมีย {opening.female} ตัว · รายได้จากการขายรวม {baht(totals.income)}</p>
      <div className="grid-2">
        <Card title="แพะสะสมหลังแต่ละเหตุการณ์"><Chart type="line" color="#8a5a33" labels={rows.map((r) => dm(r.date))} values={rows.map((r) => r.total)} unit="ตัว" /></Card>
        <Card title="สัดส่วนผู้ / เมีย ปัจจุบัน">
          <Donut items={[{ label: 'ตัวผู้', value: totals.male, color: '#2563eb' }, { label: 'ตัวเมีย', value: totals.female, color: '#e879a9' }]} centerValue={totals.total} centerLabel="ตัว" />
        </Card>
      </div>
      <Card title="ประวัติเหตุการณ์">
        <DataTable cols={cols} rows={rows} onEdit={setForm} onDelete={(r) => remove('goatEvents', r.id)} />
      </Card>
      {form && (
        <FormModal title={form.id ? 'แก้ไขเหตุการณ์' : 'บันทึกเหตุการณ์'} fields={fields} initial={form} onSave={save} onClose={() => setForm(null)}
          validate={(v) => {
            if (!['sold', 'death'].includes(v.type) || form.id) return '';
            const cur = v.sex === 'male' ? totals.male : totals.female;
            return v.count > cur ? `มี${sexLabel[v.sex]}อยู่ ${cur} ตัว ลดเกินจำนวนไม่ได้` : '';
          }} />
      )}
      {openingForm && <FormModal title="จำนวนแพะตั้งต้น" fields={openingFields} initial={opening} onSave={(d) => saveSettings({ goatOpening: d })} onClose={() => setOpeningForm(false)} />}
    </>
  );
}
