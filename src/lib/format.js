const nf = new Intl.NumberFormat('th-TH', { maximumFractionDigits: 2 });
export const num = (v) => (v === null || v === undefined || v === '' ? '—' : nf.format(v));
export const baht = (v) => `฿${nf.format(v ?? 0)}`;
export const pct = (v) => `${(v ?? 0).toFixed(1)}%`;
export const fmtDate = (d) =>
  d ? new Date(d + 'T00:00:00').toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' }) : '—';
export const monthShort = (d) =>
  new Date(d + 'T00:00:00').toLocaleDateString('th-TH', { month: 'short' });
export const today = () => new Date().toISOString().slice(0, 10);
export const dm = (d) => new Date(d + 'T00:00:00').toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });
