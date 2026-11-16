import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api } from './api/client.js';

const Ctx = createContext(null);
export const useData = () => useContext(Ctx);

export function DataProvider({ children }) {
  const [db, setDb] = useState(null);
  const reload = useCallback(async () => setDb(await api.all()), []);
  useEffect(() => { reload(); }, [reload]);

  const actions = {
    create: async (col, data) => { const row = await api.create(col, data); await reload(); return row; },
    update: async (col, id, data) => { await api.update(col, id, data); await reload(); },
    remove: async (col, id) => { await api.remove(col, id); await reload(); },
    saveSettings: async (patch) => { await api.saveSettings(patch); await reload(); },
    saveReport: async (no, data) => { await api.saveReport(no, data); await reload(); },
  };
  if (!db) return <div className="loading">กำลังโหลด…</div>;
  return <Ctx.Provider value={{ db, ...actions }}>{children}</Ctx.Provider>;
}
