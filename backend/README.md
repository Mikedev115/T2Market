# Backend skeleton (not built yet)

The UI reads/writes data only through `src/api/client.js` (currently an in-memory mock).
To add a real backend, implement these REST endpoints and rewrite `client.js` with `fetch`.
Derived numbers (cumulative, survival rate, stock, quarterly indicators, financial tables) live in
`src/lib/calc.js` and `src/lib/quarter.js` — move them server-side when a database is added.

| Collection   | Endpoints (GET list / POST / PUT :id / DELETE :id) | Key fields |
|--------------|-----------------------------------------------------|------------|
| hiveFarms    | /api/hiveFarms    | name, startHives, startDate, lat, lng (plot coordinates, decimal degrees), note |
| hiveRounds   | /api/hiveRounds   | date, total, newHives, lost, honeyKg, honeySoldKg, income, note, photos[] |
| goatEvents   | /api/goatEvents   | date, type(birth/bought/sold/death), sex, count, income, note |
| visits       | /api/visits       | date, org, people, income, expense, note, photos[] |
| seedBatches  | /api/seedBatches  | date, species, sown, survived, ready, note, photos[] |
| seedSales    | /api/seedSales    | date, batchId, kind(sale/give), qty, unitPrice, buyer |
| products     | /api/products     | name, kind(bee/resale), unit, price, icon |
| stockMoves   | /api/stockMoves   | date, productId, type(in/sale/adjust), qty, unitPrice, unitCost, note |
| ledger       | /api/ledger       | date, unit, type(expense/grant), amount, fromGrant, desc, photos[] |
| reports      | GET/PUT /api/reports/:no | quarterly text, targets per unit, status, evidence checklist |
| settings     | GET/PUT /api/settings | hiveOpening, goatOpening |

Auth: the UI has a login page (no sign-up). The demo skips auth via the "เข้าชมระบบ" button.
Report periods follow the RECOFTC MOU: 1 Aug 2026 – 31 Aug 2029, 12 quarterly reports + closing report.
