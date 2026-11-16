// Demo-only "session": remembers that the visitor pressed "เข้าชมระบบ".
const K = 'demo-entered';
export const isIn = () => { try { return sessionStorage.getItem(K) === '1'; } catch { return false; } };
export const enter = () => { try { sessionStorage.setItem(K, '1'); } catch { /* ignore */ } };
export const leave = () => { try { sessionStorage.removeItem(K); } catch { /* ignore */ } };
