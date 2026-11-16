import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../data.jsx';
import { hiveReport, visitReport, seedReport, goatReport, productReport } from '../lib/calc.js';
import { num, baht } from '../lib/format.js';
import Illustration from '../components/Illustration.jsx';
import Icon from '../components/Icon.jsx';
import Photo, { useImgFallback, photoUrl, hasRealPhoto } from '../components/Photo.jsx';
import PublicShell, { useGoSection } from '../components/PublicShell.jsx';
import { PhotoStrip } from '../components/ui.jsx';

const photoKey = (p) => (p.kind === 'resale' ? (/ข้าว/.test(p.name) ? 'rice' : /น้ำตาล|มะพร้าว/.test(p.name) ? 'sugar' : 'resale') : /สบู่/.test(p.name) ? 'soap' : 'honey');

// Real hero photo (public/images/hero.jpg) if present, otherwise the drawn illustration.
function HeroArt() {
  const [ref, bad, fail] = useImgFallback(photoUrl('hero'));
  return bad || !hasRealPhoto('hero')
    ? <div className="hero-art"><Illustration /></div>
    : <div className="hero-art photo-frame"><img ref={ref} className="photo" src={photoUrl('hero')} alt="" onError={fail} /></div>;
}

export default function PublicSite() {
  const { db } = useData();
  const go = useGoSection();
  const hive = hiveReport(db.hiveRounds, db.settings.hiveOpening).totals;
  const visit = visitReport(db.visits).totals;
  const seed = seedReport(db.seedBatches, db.seedSales);
  const goat = goatReport(db.goatEvents, db.settings.goatOpening).totals;
  const prod = productReport(db.products, db.stockMoves);
  const photos = [...new Set([...db.hiveRounds, ...db.visits, ...db.seedBatches].flatMap((r) => r.photos || []).concat('scene:goat'))].slice(0, 8);

  const acts = [
    { photo: 'hive', title: 'ชันโรง', text: 'เลี้ยงผึ้งชันโรงเพื่อผลิตน้ำผึ้งและช่วยผสมเกสร', stat: `${num(hive.current)} รัง`, sub: `น้ำผึ้งสะสม ${num(hive.honey)} กก.` },
    { photo: 'goat', title: 'แพะ', text: 'เลี้ยงแพะในระบบฟาร์มที่เป็นมิตรกับธรรมชาติ', stat: `${num(goat.total)} ตัว`, sub: `ผู้ ${goat.male} · เมีย ${goat.female}` },
    { photo: 'visit', title: 'ศึกษาดูงาน', text: 'รับคณะดูงานเรียนรู้วิถีเกษตรผสมผสานแบบครบวงจร', stat: `${num(visit.count)} ครั้ง`, sub: `ผู้เข้าร่วมสะสม ${num(visit.people)} คน` },
    { photo: 'nursery', title: 'เรือนเพาะชำ', text: 'เพาะและจำหน่ายกล้าไม้ท้องถิ่น เช่น มะริด ผักหวานป่า มะแขว่น', stat: `${num(seed.totals.available)} ต้น`, sub: `พร้อมจำหน่าย · รอด ${seed.totals.rate.toFixed(0)}%` },
  ];
  const stats = [['hive', num(hive.current), 'รังชันโรง'], ['wallet', `${num(hive.honey)} กก.`, 'น้ำผึ้งที่เก็บได้'], ['users', num(visit.people), 'ผู้มาศึกษาดูงาน'], ['sprout', num(seed.totals.available), 'กล้าไม้พร้อมจำหน่าย'], ['paw', num(goat.total), 'แพะในฟาร์ม']];

  return (
    <PublicShell>
      <section className="hero" id="top">
        <div className="hero-text">
          <span className="pill">🌿 เกษตรผสมผสาน · ชุมชนยั่งยืน</span>
          <h1>ปลูกต้นไม้ เลี้ยงผึ้งชันโรง<br />เติบโตไปพร้อมกัน</h1>
          <p>วิสาหกิจชุมชนที่รวมผึ้งชันโรง แพะ เรือนเพาะชำ และแหล่งเรียนรู้ไว้ในที่เดียว ติดตามผลงานของเราได้แบบเรียลไทม์</p>
          <div className="hero-cta">
            <button className="btn primary lg" onClick={() => go('products')}>ดูสินค้า</button>
            <Link className="btn lg" to="/booking">จองศึกษาดูงาน</Link>
          </div>
        </div>
        <HeroArt />
      </section>

      <section className="stat-band">
        {stats.map(([i, v, l]) => (
          <div key={l}><span className="stat-ic"><Icon name={i} size={22} /></span><b>{v}</b><small>{l}</small></div>
        ))}
      </section>

      <section id="activities" className="pub-section">
        <h2>กิจกรรมของเรา</h2>
        <div className="act-grid">
          {acts.map((a) => (
            <article key={a.title} className="act">
              <div className="act-photo"><Photo name={a.photo} alt={a.title} /></div>
              <div className="act-body">
                <h3>{a.title}</h3>
                <p>{a.text}</p>
                <div className="act-stat"><b>{a.stat}</b><small>{a.sub}</small></div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="products" className="pub-section alt">
        <h2>สินค้าจากสวน</h2>
        <div className="prod-grid">
          {prod.products.map((p) => (
            <article key={p.id} className="prod">
              <div className="prod-img"><Photo name={photoKey(p)} src={p.photos?.[0]} alt={p.name} /></div>
              <h3>{p.name}</h3>
              <div className="prod-price">{baht(p.price)} <small>/ {p.unit}</small></div>
              <div className={`stock-badge ${p.stock > 0 ? 'ok' : 'out'}`}>{p.stock > 0 ? `เหลือ ${num(p.stock)} ${p.unit}` : 'สินค้าหมด'}</div>
              {p.stock > 0 ? <Link className="btn primary block" to={`/order?item=product:${p.id}`}><Icon name="cart" size={18} /> สั่งซื้อ</Link> : <button className="btn block" disabled>สินค้าหมด</button>}
            </article>
          ))}
          <article className="prod seedling">
            <div className="prod-img"><Photo name="nursery" alt="กล้าไม้" /></div>
            <h3>กล้าไม้</h3>
            <div className="prod-price">พร้อมจำหน่าย <b>{num(seed.totals.available)}</b> <small>ต้น</small></div>
            <div className="stock-badge ok">{seed.batches.filter((b) => b.available > 0).length} ชนิดพันธุ์</div>
            <Link className="btn primary block" to={`/order?item=seed:${(seed.batches.find((b) => b.available > 0) || {}).id || ''}`}><Icon name="cart" size={18} /> สั่งจองกล้าไม้</Link>
          </article>
        </div>
      </section>

      <section id="gallery" className="pub-section">
        <h2>ภาพกิจกรรม</h2>
        <div className="gallery">
          {photos.length ? photos.map((s, i) => <PhotoStrip key={i} photos={[s]} max={1} />) : ['hive', 'goat', 'visit', 'nursery'].map((n) => <Photo key={n} name={n} />)}
        </div>
      </section>
    </PublicShell>
  );
}
