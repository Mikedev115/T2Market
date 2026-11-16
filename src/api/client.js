// Data access layer. Currently an in-memory mock.
// To connect a real backend, replace the bodies with fetch('/api/...') calls
// (see backend/README.md). The rest of the UI only uses this file.
import { createSeed } from '../mock/seed.js';

const db = createSeed();
const uid = () => Math.random().toString(36).slice(2, 9);
const wait = (v) => new Promise((r) => setTimeout(() => r(structuredClone(v)), 40));

export const api = {
  async all() { return wait(db); },
  async create(col, data) { const row = { id: uid(), ...data }; db[col].push(row); return wait(row); },
  async update(col, id, data) {
    const i = db[col].findIndex((r) => r.id === id);
    if (i < 0) throw new Error('ไม่พบข้อมูล');
    db[col][i] = { ...db[col][i], ...data, id };
    return wait(db[col][i]);
  },
  async remove(col, id) { db[col] = db[col].filter((r) => r.id !== id); return wait({ ok: true }); },
  async saveSettings(patch) { db.settings = { ...db.settings, ...patch }; return wait(db.settings); },
  // quarterly report, one document per period number
  async saveReport(no, data) {
    const i = db.reports.findIndex((r) => r.no === no);
    if (i < 0) db.reports.push({ no, ...data }); else db.reports[i] = { ...db.reports[i], ...data, no };
    return wait({ ok: true });
  },
};
