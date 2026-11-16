import { createContext, useContext, useEffect, useState } from 'react';
import Photo, { Placeholder } from './Photo.jsx';

/* ---------- Demo popup ---------- */
const DemoCtx = createContext(() => {});
export const useDemo = () => useContext(DemoCtx);

export function DemoProvider({ children }) {
  const [msg, setMsg] = useState(null);
  return (
    <DemoCtx.Provider value={setMsg}>
      {children}
      {msg && (
        <Modal title="เป็นตัวเดโม" small onClose={() => setMsg(null)}>
          <div className="demo-note">
            <Photo name="hive" className="demo-photo" />
            <p><b>{msg}</b></p>
            <p className="muted">เวอร์ชันนี้เป็นตัวอย่างหน้าจอ ยังไม่ได้เชื่อมระบบจริง</p>
          </div>
          <div className="modal-actions">
            <button className="btn primary" onClick={() => setMsg(null)}>รับทราบ</button>
          </div>
        </Modal>
      )}
    </DemoCtx.Provider>
  );
}

/* ---------- Modal ---------- */
export function Modal({ title, children, onClose, small }) {
  useEffect(() => {
    const h = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);
  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`modal ${small ? 'small' : ''}`} role="dialog" aria-modal="true">
        <div className="modal-head">
          <h3>{title}</h3>
          <button className="icon-btn" onClick={onClose} aria-label="ปิด">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ---------- Photos ---------- */
function resizeImage(file, max = 1000) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const k = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * k);
      c.height = Math.round(img.height * k);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      resolve(c.toDataURL('image/jpeg', 0.8));
    };
    img.onerror = reject;
    img.src = url;
  });
}

export function PhotoPicker({ value = [], onChange }) {
  const add = async (e) => {
    const files = [...e.target.files].slice(0, 8 - value.length);
    const urls = await Promise.all(files.map((f) => resizeImage(f).catch(() => null)));
    onChange([...value, ...urls.filter(Boolean)]);
    e.target.value = '';
  };
  return (
    <div className="photo-picker">
      {value.map((src, i) => (
        <div className="thumb" key={i}>
          {src.startsWith('scene:') ? <Placeholder name={src.slice(6)} /> : <img src={src} alt="" />}
          <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))} aria-label="ลบรูป">✕</button>
        </div>
      ))}
      {value.length < 8 && (
        <label className="thumb add">
          <span>＋</span><small>แนบรูป</small>
          <input type="file" accept="image/*" multiple hidden onChange={add} />
        </label>
      )}
    </div>
  );
}

export function PhotoStrip({ photos = [], max = 3 }) {
  const [open, setOpen] = useState(null);
  if (!photos.length) return <span className="muted">—</span>;
  return (
    <>
      <div className="strip">
        {photos.slice(0, max).map((s, i) => (
          s.startsWith('scene:') ? <span key={i} className="strip-ph" onClick={() => setOpen(i)}><Placeholder name={s.slice(6)} /></span> : <img key={i} src={s} alt="" onClick={() => setOpen(i)} />
        ))}
        {photos.length > max && <span className="more" onClick={() => setOpen(max)}>+{photos.length - max}</span>}
      </div>
      {open !== null && (
        <div className="overlay lightbox" onClick={() => setOpen(null)}>
          {photos[open].startsWith('scene:') ? <div className="lb-scene"><Placeholder name={photos[open].slice(6)} /></div> : <img src={photos[open]} alt="" />}
          {photos.length > 1 && (
            <div className="lb-nav" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => setOpen((open + photos.length - 1) % photos.length)}>‹</button>
              <span>{open + 1} / {photos.length}</span>
              <button onClick={() => setOpen((open + 1) % photos.length)}>›</button>
            </div>
          )}
        </div>
      )}
    </>
  );
}

/* ---------- Form modal ---------- */
export function FormModal({ title, fields, initial = {}, onSave, onClose, validate }) {
  const [v, setV] = useState(() => {
    const o = {};
    fields.forEach((f) => { o[f.key] = initial[f.key] ?? f.default ?? (f.type === 'photos' ? [] : ''); });
    return o;
  });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  // field.fill(value, values) may return extra values to set when this field changes (e.g. auto-fill a price)
  const set = (k, val) => setV((s) => ({ ...s, [k]: val, ...(fields.find((f) => f.key === k)?.fill?.(val, s) || {}) }));

  const submit = async (e) => {
    e.preventDefault();
    const out = {};
    for (const f of fields) {
      if (f.showIf && !f.showIf(v)) continue; // hidden field: skip
      let x = v[f.key];
      if (f.required && (x === '' || x === null)) return setErr(`กรุณากรอก "${f.label}"`);
      if (f.type === 'number') {
        x = x === '' ? 0 : Number(x);
        if (Number.isNaN(x)) return setErr(`"${f.label}" ต้องเป็นตัวเลข`);
        if (f.min !== undefined && x < f.min) return setErr(`"${f.label}" ต้องไม่น้อยกว่า ${f.min}`);
      }
      out[f.key] = x;
    }
    const m = validate?.(out);
    if (m) return setErr(m);
    setBusy(true);
    try { await onSave(out); onClose(); } catch (ex) { setErr(ex.message); setBusy(false); }
  };

  return (
    <Modal title={title} onClose={onClose}>
      <form onSubmit={submit} className="form">
        <div className="form-grid">
          {fields.filter((f) => !f.showIf || f.showIf(v)).map((f) => (
            <label key={f.key} className={`field ${f.wide || f.type === 'textarea' || f.type === 'photos' ? 'wide' : ''}`}>
              <span>{f.label}{f.required && <i> *</i>}</span>
              {f.type === 'select' ? (
                <select value={v[f.key]} onChange={(e) => set(f.key, e.target.value)}>
                  {f.placeholder && <option value="">{f.placeholder}</option>}
                  {f.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              ) : f.type === 'textarea' ? (
                <textarea rows={3} value={v[f.key]} onChange={(e) => set(f.key, e.target.value)} />
              ) : f.type === 'photos' ? (
                <PhotoPicker value={v[f.key]} onChange={(x) => set(f.key, x)} />
              ) : (
                <input
                  type={f.type || 'text'} step={f.step ?? (f.type === 'number' ? 'any' : undefined)}
                  value={v[f.key]} onChange={(e) => set(f.key, e.target.value)}
                />
              )}
              {f.hint && <small className="muted">{f.hint}</small>}
            </label>
          ))}
        </div>
        {err && <div className="form-err">{err}</div>}
        <div className="modal-actions">
          <button type="button" className="btn" onClick={onClose}>ยกเลิก</button>
          <button className="btn primary" disabled={busy}>{busy ? 'กำลังบันทึก…' : 'บันทึก'}</button>
        </div>
      </form>
    </Modal>
  );
}

/* ---------- Layout bits ---------- */
export function Kpi({ icon, label, value, sub, tone = 'green' }) {
  return (
    <div className={`kpi ${tone}`}>
      <div className="kpi-icon">{icon}</div>
      <div>
        <div className="kpi-label">{label}</div>
        <div className="kpi-value">{value}</div>
        {sub && <div className="kpi-sub">{sub}</div>}
      </div>
    </div>
  );
}

export function PageHead({ icon, title, desc, children }) {
  return (
    <div className="page-head">
      <div>
        <h1><span>{icon}</span> {title}</h1>
        {desc && <p className="muted">{desc}</p>}
      </div>
      <div className="head-actions">{children}</div>
    </div>
  );
}

export function Card({ title, right, children, className = '' }) {
  return (
    <section className={`card ${className}`}>
      {(title || right) && <div className="card-head"><h2>{title}</h2><div>{right}</div></div>}
      {children}
    </section>
  );
}

/* ---------- Data table with edit/delete ---------- */
export function DataTable({ cols, rows, onEdit, onDelete, empty = 'ยังไม่มีข้อมูล', foot }) {
  const [del, setDel] = useState(null);
  return (
    <>
      <div className="table-wrap">
        <table className="table stack">
          <thead>
            <tr>
              {cols.map((c) => <th key={c.label} className={c.align}>{c.label}</th>)}
              {(onEdit || onDelete) && <th className="right">จัดการ</th>}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && <tr><td colSpan={cols.length + 1} className="empty">{empty}</td></tr>}
            {rows.map((r) => (
              <tr key={r.id}>
                {cols.map((c) => <td key={c.label} data-label={c.label} className={c.align}>{c.render(r)}</td>)}
                {(onEdit || onDelete) && (
                  <td className="right nowrap actions">
                    {onEdit && <button className="link" onClick={() => onEdit(r)}>แก้ไข</button>}
                    {onDelete && <button className="link danger" onClick={() => setDel(r)}>ลบ</button>}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
          {foot && rows.length > 0 && <tfoot>{foot}</tfoot>}
        </table>
      </div>
      {del && (
        <Modal title="ยืนยันการลบ" small onClose={() => setDel(null)}>
          <p>ต้องการลบรายการนี้หรือไม่?</p>
          <div className="modal-actions">
            <button className="btn" onClick={() => setDel(null)}>ยกเลิก</button>
            <button className="btn danger" onClick={async () => { await onDelete(del); setDel(null); }}>ลบ</button>
          </div>
        </Modal>
      )}
    </>
  );
}
