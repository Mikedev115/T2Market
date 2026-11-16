// Derived report numbers. Move server-side when a backend/DB is added.
const byDate = (a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0);
export const sum = (rows, f) => rows.reduce((s, r) => s + (Number(f(r)) || 0), 0);

export function hiveReport(rounds, opening) {
  const rows = [...rounds].sort(byDate);
  let cum = 0;
  const out = rows.map((r, i) => {
    cum += Number(r.honeyKg) || 0;
    const prev = i === 0 ? opening.total : rows[i - 1].total;
    return { ...r, change: r.total - prev, cumHoney: cum };
  });
  return {
    rows: out,
    totals: {
      rounds: rows.length,
      current: rows.length ? rows[rows.length - 1].total : opening.total,
      newHives: sum(rows, (r) => r.newHives),
      lost: sum(rows, (r) => r.lost),
      honey: sum(rows, (r) => r.honeyKg),
      honeySold: sum(rows, (r) => r.honeySoldKg),
      income: sum(rows, (r) => r.income),
    },
  };
}

export function visitReport(visits) {
  const rows = [...visits].sort(byDate);
  let cp = 0;
  const out = rows.map((r) => {
    cp += Number(r.people) || 0;
    return { ...r, net: r.income - r.expense, cumPeople: cp };
  });
  const income = sum(rows, (r) => r.income);
  const expense = sum(rows, (r) => r.expense);
  return { rows: out, totals: { count: rows.length, people: cp, income, expense, net: income - expense } };
}

export function seedReport(batches, sales) {
  const isSale = (s) => (s.kind || 'sale') === 'sale';
  const brows = [...batches].sort(byDate).map((b) => {
    const mine = sales.filter((s) => s.batchId === b.id);
    const sold = sum(mine.filter(isSale), (s) => s.qty);
    const given = sum(mine.filter((s) => !isSale(s)), (s) => s.qty);
    return { ...b, rate: b.sown ? (b.survived / b.sown) * 100 : 0, sold, given, available: b.ready - sold - given };
  });
  const srows = [...sales].sort(byDate).map((s) => ({
    ...s,
    kind: s.kind || 'sale',
    species: batches.find((b) => b.id === s.batchId)?.species ?? '—',
    total: isSale(s) ? s.qty * s.unitPrice : 0,
  }));
  const sown = sum(brows, (b) => b.sown);
  const survived = sum(brows, (b) => b.survived);
  return {
    batches: brows,
    sales: srows,
    totals: {
      sown, survived, rate: sown ? (survived / sown) * 100 : 0,
      ready: sum(brows, (b) => b.ready),
      sold: sum(brows, (b) => b.sold),
      given: sum(brows, (b) => b.given),
      available: sum(brows, (b) => b.available),
      revenue: sum(srows, (s) => s.total),
    },
  };
}

export const goatDelta = (e) => (e.type === 'birth' || e.type === 'bought' ? e.count : -e.count);

export function goatReport(events, opening) {
  const rows = [...events].sort(byDate);
  let male = opening.male, female = opening.female;
  const out = rows.map((e) => {
    const d = goatDelta(e);
    if (e.sex === 'male') male += d; else female += d;
    return { ...e, male, female, total: male + female };
  });
  const cnt = (type, sex) => sum(rows.filter((e) => e.type === type && (!sex || e.sex === sex)), (e) => e.count);
  return {
    rows: out,
    totals: {
      male, female, total: male + female,
      born: cnt('birth'), bought: cnt('bought'), sold: cnt('sold'), died: cnt('death'),
      bornMale: cnt('birth', 'male'), bornFemale: cnt('birth', 'female'),
      diedMale: cnt('death', 'male'), diedFemale: cnt('death', 'female'),
      income: sum(rows.filter((e) => e.type === 'sold'), (e) => e.income),
    },
  };
}

export function productReport(products, moves) {
  const prows = products.map((p) => {
    const m = moves.filter((x) => x.productId === p.id);
    const ins = m.filter((x) => x.type === 'in');
    const inQty = sum(ins, (x) => x.qty);
    const adj = sum(m.filter((x) => x.type === 'adjust'), (x) => x.qty);
    const sold = sum(m.filter((x) => x.type === 'sale'), (x) => x.qty);
    const revenue = sum(m.filter((x) => x.type === 'sale'), (x) => x.qty * x.unitPrice);
    const avgCost = inQty ? sum(ins, (x) => x.qty * (x.unitCost || 0)) / inQty : 0;
    return { ...p, kind: p.kind || 'bee', inQty, adj, sold, revenue, avgCost, cogs: sold * avgCost, stock: inQty + adj - sold };
  });
  const mrows = [...moves].sort(byDate).map((x) => {
    const p = products.find((q) => q.id === x.productId);
    return { ...x, productName: p?.name ?? '—', unit: p?.unit ?? '' };
  });
  return {
    products: prows,
    moves: mrows,
    totals: { revenue: sum(prows, (p) => p.revenue), sold: sum(prows, (p) => p.sold), stock: sum(prows, (p) => p.stock) },
  };
}
