'use strict';

// ── Data ─────────────────────────────────────────────────────────────────────

const CATEGORIES = {
  expense: ['Food & Dining','Groceries','Transportation','Housing','Utilities','Healthcare','Entertainment','Shopping','Education','Travel','Subscriptions','Personal Care','Gifts','Other'],
  income:  ['Salary','Freelance','Investments','Rental','Business','Bonus','Gift','Refund','Other'],
};

const CAT_COLORS = [
  '#4f8ef7','#22c55e','#ef4444','#a855f7','#f59e0b','#06b6d4','#ec4899',
  '#84cc16','#f97316','#8b5cf6','#14b8a6','#e11d48','#0ea5e9','#d97706',
];

const ASSET_TYPE_LABELS = {
  cash: 'Cash & Bank', investment: 'Investment', property: 'Property',
  vehicle: 'Vehicle', liability: 'Liability', other: 'Other',
};

function loadData() {
  return {
    transactions: JSON.parse(localStorage.getItem('ft_transactions') || '[]'),
    assets: JSON.parse(localStorage.getItem('ft_assets') || '[]'),
  };
}

function saveData(data) {
  localStorage.setItem('ft_transactions', JSON.stringify(data.transactions));
  localStorage.setItem('ft_assets', JSON.stringify(data.assets));
}

let data = loadData();

// ── Utilities ─────────────────────────────────────────────────────────────────

const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(n);

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function today() {
  return new Date().toISOString().slice(0, 10);
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function catIcon(cat) {
  const icons = {
    'Food & Dining':'🍽️','Groceries':'🛒','Transportation':'🚗','Housing':'🏠',
    'Utilities':'💡','Healthcare':'🏥','Entertainment':'🎬','Shopping':'🛍️',
    'Education':'📚','Travel':'✈️','Subscriptions':'📺','Personal Care':'💆',
    'Gifts':'🎁','Salary':'💼','Freelance':'💻','Investments':'📈',
    'Rental':'🏢','Business':'🏪','Bonus':'🎉','Gift':'🎁','Refund':'↩️',
  };
  return icons[cat] || '💰';
}

// ── Navigation ───────────────────────────────────────────────────────────────

function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item, .mobile-nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('page-' + id).classList.add('active');
  document.querySelector(`.nav-item[data-page="${id}"]`)?.classList.add('active');
  document.querySelector(`.mobile-nav-item[data-page="${id}"]`)?.classList.add('active');
  if (id === 'dashboard') renderDashboard();
  if (id === 'transactions') renderTransactions();
  if (id === 'assets') renderAssets();
  if (id === 'summary') renderSummary();
}

document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', e => {
    if (!item.dataset.page) return; // let real href links (Back to Website) navigate normally
    e.preventDefault();
    showPage(item.dataset.page);
  });
});

document.querySelectorAll('.mobile-nav-item').forEach(item => {
  item.addEventListener('click', e => {
    if (item.dataset.action === 'add') { e.preventDefault(); openModal(); return; }
    if (!item.dataset.page) return; // let real href links navigate normally
    e.preventDefault();
    showPage(item.dataset.page);
  });
});

// ── Category Selects ──────────────────────────────────────────────────────────

function populateCategorySelect(type) {
  const sel = document.getElementById('tx-category');
  sel.innerHTML = '';
  CATEGORIES[type].forEach(c => {
    const o = document.createElement('option');
    o.value = c; o.textContent = c;
    sel.appendChild(o);
  });
}

document.getElementById('tx-type').addEventListener('change', e => {
  populateCategorySelect(e.target.value);
});

function populateFilterCategory() {
  const sel = document.getElementById('filter-category');
  const all = [...new Set(data.transactions.map(t => t.category))].sort();
  sel.innerHTML = '<option value="">All Categories</option>';
  all.forEach(c => { const o = document.createElement('option'); o.value = c; o.textContent = c; sel.appendChild(o); });
}

function populateYearSelects() {
  const years = [...new Set(data.transactions.map(t => t.date.slice(0,4)))];
  if (!years.length) years.push(String(new Date().getFullYear()));
  years.sort((a,b) => b-a);

  ['chart-year-select','summary-year'].forEach(id => {
    const sel = document.getElementById(id);
    const cur = sel.value;
    sel.innerHTML = '';
    years.forEach(y => { const o = document.createElement('option'); o.value = y; o.textContent = y; sel.appendChild(o); });
    if (cur && years.includes(cur)) sel.value = cur;
  });
}

// ── Modal: Add / Edit Transaction ─────────────────────────────────────────────

function openModal(tx = null) {
  const modal = document.getElementById('add-modal');
  const form = document.getElementById('transaction-form');
  form.reset();
  document.getElementById('edit-id').value = '';
  document.getElementById('tx-date').value = today();
  populateCategorySelect('expense');

  if (tx) {
    document.getElementById('modal-title').textContent = 'Edit Transaction';
    document.getElementById('save-btn').textContent = 'Update Transaction';
    document.getElementById('edit-id').value = tx.id;
    document.getElementById('tx-type').value = tx.type;
    populateCategorySelect(tx.type);
    document.getElementById('tx-date').value = tx.date;
    document.getElementById('tx-desc').value = tx.description;
    document.getElementById('tx-amount').value = tx.amount;
    document.getElementById('tx-category').value = tx.category;
    document.getElementById('tx-notes').value = tx.notes || '';
  } else {
    document.getElementById('modal-title').textContent = 'Add Transaction';
    document.getElementById('save-btn').textContent = 'Save Transaction';
  }

  modal.classList.add('open');
}

function closeModal() { document.getElementById('add-modal').classList.remove('open'); }

document.getElementById('open-add-modal').addEventListener('click', () => openModal());
document.getElementById('open-add-modal-2').addEventListener('click', () => openModal());
document.getElementById('close-modal').addEventListener('click', closeModal);
document.getElementById('cancel-modal').addEventListener('click', closeModal);
document.getElementById('add-modal').addEventListener('click', e => { if (e.target === e.currentTarget) closeModal(); });

document.getElementById('transaction-form').addEventListener('submit', e => {
  e.preventDefault();
  const id = document.getElementById('edit-id').value;
  const tx = {
    id: id || uid(),
    type: document.getElementById('tx-type').value,
    date: document.getElementById('tx-date').value,
    description: document.getElementById('tx-desc').value.trim(),
    amount: parseFloat(document.getElementById('tx-amount').value),
    category: document.getElementById('tx-category').value,
    notes: document.getElementById('tx-notes').value.trim(),
  };
  if (id) {
    const idx = data.transactions.findIndex(t => t.id === id);
    if (idx !== -1) data.transactions[idx] = tx;
  } else {
    data.transactions.push(tx);
  }
  saveData(data);
  closeModal();
  refreshAll();
});

function deleteTransaction(id) {
  if (!confirm('Delete this transaction?')) return;
  data.transactions = data.transactions.filter(t => t.id !== id);
  saveData(data);
  refreshAll();
}

// ── Modal: Asset ──────────────────────────────────────────────────────────────

function openAssetModal(asset = null) {
  const modal = document.getElementById('asset-modal');
  document.getElementById('asset-form').reset();
  document.getElementById('asset-edit-id').value = '';
  if (asset) {
    document.getElementById('asset-modal-title').textContent = 'Edit Asset';
    document.getElementById('asset-edit-id').value = asset.id;
    document.getElementById('asset-name').value = asset.name;
    document.getElementById('asset-type').value = asset.type;
    document.getElementById('asset-value').value = asset.value;
  } else {
    document.getElementById('asset-modal-title').textContent = 'Add Asset';
  }
  modal.classList.add('open');
}

function closeAssetModal() { document.getElementById('asset-modal').classList.remove('open'); }

document.getElementById('open-asset-modal').addEventListener('click', () => openAssetModal());
document.getElementById('close-asset-modal').addEventListener('click', closeAssetModal);
document.getElementById('cancel-asset-modal').addEventListener('click', closeAssetModal);
document.getElementById('asset-modal').addEventListener('click', e => { if (e.target === e.currentTarget) closeAssetModal(); });

document.getElementById('asset-form').addEventListener('submit', e => {
  e.preventDefault();
  const id = document.getElementById('asset-edit-id').value;
  const asset = {
    id: id || uid(),
    name: document.getElementById('asset-name').value.trim(),
    type: document.getElementById('asset-type').value,
    value: parseFloat(document.getElementById('asset-value').value),
  };
  if (id) {
    const idx = data.assets.findIndex(a => a.id === id);
    if (idx !== -1) data.assets[idx] = asset;
  } else {
    data.assets.push(asset);
  }
  saveData(data);
  closeAssetModal();
  renderAssets();
  updateSidebarNetWorth();
});

function deleteAsset(id) {
  if (!confirm('Delete this asset?')) return;
  data.assets = data.assets.filter(a => a.id !== id);
  saveData(data);
  renderAssets();
  updateSidebarNetWorth();
}

// ── Render: Dashboard ─────────────────────────────────────────────────────────

let monthlyChart = null;
let categoryChart = null;

function renderDashboard() {
  populateYearSelects();
  const year = document.getElementById('chart-year-select').value || String(new Date().getFullYear());
  renderYearStats(year);
  renderMonthlyChart();
  renderCategoryChart();
  renderRecentTransactions();
}

function renderYearStats(year) {
  const yearTx = data.transactions.filter(t => t.date.startsWith(year));
  const totalIncome  = yearTx.filter(t => t.type === 'income').reduce((s,t) => s+t.amount, 0);
  const totalExpense = yearTx.filter(t => t.type === 'expense').reduce((s,t) => s+t.amount, 0);
  const totalAssets  = data.assets.filter(a => a.type !== 'liability').reduce((s,a) => s+a.value, 0);
  const balance = totalIncome - totalExpense;

  document.getElementById('stat-income').textContent = fmt(totalIncome);
  document.getElementById('stat-expense').textContent = fmt(totalExpense);
  document.getElementById('stat-assets').textContent = fmt(totalAssets);
  document.getElementById('stat-balance').textContent = fmt(balance);
  document.getElementById('stat-balance').className = 'stat-value ' + (balance >= 0 ? 'text-green' : 'text-red');

  // Update labels to show the active year
  document.querySelector('#stat-income').closest('.stat-card').querySelector('.stat-label').textContent  = `${year} Income`;
  document.querySelector('#stat-expense').closest('.stat-card').querySelector('.stat-label').textContent = `${year} Expenses`;
  document.querySelector('#stat-balance').closest('.stat-card').querySelector('.stat-label').textContent = `${year} Net Balance`;

  updateSidebarNetWorth();
}

function renderMonthlyChart() {
  const year = document.getElementById('chart-year-select').value || String(new Date().getFullYear());
  const monthlyIncome = Array(12).fill(0);
  const monthlyExpense = Array(12).fill(0);

  data.transactions.forEach(t => {
    if (t.date.startsWith(year)) {
      const m = parseInt(t.date.slice(5,7)) - 1;
      if (t.type === 'income') monthlyIncome[m] += t.amount;
      else monthlyExpense[m] += t.amount;
    }
  });

  const ctx = document.getElementById('monthly-chart').getContext('2d');
  if (monthlyChart) monthlyChart.destroy();

  monthlyChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: MONTHS,
      datasets: [
        { label: 'Income', data: monthlyIncome, backgroundColor: 'rgba(34,197,94,0.7)', borderRadius: 4, borderSkipped: false },
        { label: 'Expenses', data: monthlyExpense, backgroundColor: 'rgba(239,68,68,0.7)', borderRadius: 4, borderSkipped: false },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: { legend: { labels: { color: '#6b7a99', boxWidth: 12, font: { size: 11 } } } },
      scales: {
        x: { grid: { color: '#2a3147' }, ticks: { color: '#6b7a99', font: { size: 11 } } },
        y: { grid: { color: '#2a3147' }, ticks: { color: '#6b7a99', font: { size: 11 }, callback: v => '$' + v.toLocaleString() } },
      },
    },
  });
}

function renderCategoryChart() {
  const year = document.getElementById('chart-year-select').value || String(new Date().getFullYear());
  const expenses = data.transactions.filter(t => t.type === 'expense' && t.date.startsWith(year));
  const catMap = {};
  expenses.forEach(t => { catMap[t.category] = (catMap[t.category] || 0) + t.amount; });
  const cats = Object.entries(catMap).sort((a,b) => b[1]-a[1]).slice(0, 8);

  const ctx = document.getElementById('category-chart').getContext('2d');
  if (categoryChart) categoryChart.destroy();

  if (!cats.length) {
    ctx.clearRect(0,0,300,200);
    document.getElementById('category-legend').innerHTML = '<span style="color:var(--text-muted);font-size:12px">No expense data yet</span>';
    return;
  }

  const colors = cats.map((_, i) => CAT_COLORS[i % CAT_COLORS.length]);

  categoryChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: cats.map(c => c[0]),
      datasets: [{ data: cats.map(c => c[1]), backgroundColor: colors, borderWidth: 0, hoverOffset: 6 }],
    },
    options: {
      responsive: true,
      cutout: '68%',
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => ` ${ctx.label}: ${fmt(ctx.raw)}` } } },
    },
  });

  document.getElementById('category-legend').innerHTML = cats.map((c, i) =>
    `<div class="legend-item"><div class="legend-dot" style="background:${colors[i]}"></div>${c[0]}</div>`
  ).join('');
}

function renderRecentTransactions() {
  const sorted = [...data.transactions].sort((a,b) => b.date.localeCompare(a.date)).slice(0, 8);
  const container = document.getElementById('recent-list');
  if (!sorted.length) {
    container.innerHTML = emptyState('No transactions yet. Add your first one!');
    return;
  }
  container.innerHTML = sorted.map(txHTML).join('');
}

document.getElementById('chart-year-select').addEventListener('change', () => {
  const year = document.getElementById('chart-year-select').value;
  renderYearStats(year);
  renderMonthlyChart();
  renderCategoryChart();
});

// ── Render: Transactions ──────────────────────────────────────────────────────

function renderTransactions() {
  populateFilterCategory();
  applyFilters();
}

function applyFilters() {
  const month = document.getElementById('filter-month').value;
  const type = document.getElementById('filter-type').value;
  const cat = document.getElementById('filter-category').value;
  const search = document.getElementById('filter-search').value.toLowerCase();

  let txs = [...data.transactions];
  if (month) txs = txs.filter(t => t.date.startsWith(month));
  if (type) txs = txs.filter(t => t.type === type);
  if (cat) txs = txs.filter(t => t.category === cat);
  if (search) txs = txs.filter(t => t.description.toLowerCase().includes(search) || t.category.toLowerCase().includes(search));

  txs.sort((a,b) => b.date.localeCompare(a.date));

  const container = document.getElementById('transactions-list');
  if (!txs.length) {
    container.innerHTML = emptyState('No transactions match your filters.');
    return;
  }
  container.innerHTML = txs.map(txHTML).join('');
}

['filter-month','filter-type','filter-category','filter-search'].forEach(id => {
  document.getElementById(id).addEventListener('input', applyFilters);
  document.getElementById(id).addEventListener('change', applyFilters);
});

document.getElementById('clear-filters').addEventListener('click', () => {
  ['filter-month','filter-type','filter-category','filter-search'].forEach(id => {
    document.getElementById(id).value = '';
  });
  applyFilters();
});

function txHTML(t) {
  const d = new Date(t.date + 'T00:00:00');
  const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return `
    <div class="tx-item">
      <div class="tx-icon ${t.type}">${catIcon(t.category)}</div>
      <div class="tx-details">
        <div class="tx-desc">${escHtml(t.description)}<span class="tx-cat">${escHtml(t.category)}</span></div>
        <div class="tx-meta">${dateStr}${t.notes ? ' · ' + escHtml(t.notes) : ''}</div>
      </div>
      <div class="tx-amount ${t.type}">${t.type === 'income' ? '+' : '-'}${fmt(t.amount)}</div>
      <div class="tx-actions">
        <button class="btn btn-icon" onclick="openModal(data.transactions.find(x=>x.id==='${t.id}'))" title="Edit">✏️</button>
        <button class="btn btn-icon btn-danger" onclick="deleteTransaction('${t.id}')" title="Delete">🗑️</button>
      </div>
    </div>`;
}

// ── Render: Assets ────────────────────────────────────────────────────────────

function renderAssets() {
  const totalAssets = data.assets.filter(a => a.type !== 'liability').reduce((s,a) => s+a.value, 0);
  const totalLiab = data.assets.filter(a => a.type === 'liability').reduce((s,a) => s+a.value, 0);
  const netWorth = totalAssets - totalLiab;

  document.getElementById('asset-total').textContent = fmt(totalAssets);
  document.getElementById('liability-total').textContent = fmt(totalLiab);
  document.getElementById('net-worth-total').textContent = fmt(netWorth);
  document.getElementById('net-worth-total').className = 'stat-value ' + (netWorth >= 0 ? 'text-green' : 'text-red');

  const grid = document.getElementById('assets-grid');
  if (!data.assets.length) {
    grid.innerHTML = `<div style="grid-column:1/-1">${emptyState('No assets yet. Add your savings, investments, and debts.')}</div>`;
    return;
  }

  grid.innerHTML = data.assets.map(a => `
    <div class="asset-card">
      <div class="asset-card-header">
        <span class="asset-type-badge ${a.type}">${ASSET_TYPE_LABELS[a.type]}</span>
        <div class="asset-actions">
          <button class="btn btn-icon" onclick="openAssetModal(data.assets.find(x=>x.id==='${a.id}'))" title="Edit">✏️</button>
          <button class="btn btn-icon btn-danger" onclick="deleteAsset('${a.id}')" title="Delete">🗑️</button>
        </div>
      </div>
      <div class="asset-name">${escHtml(a.name)}</div>
      <div class="asset-value ${a.type === 'liability' ? 'negative' : 'positive'}">${a.type === 'liability' ? '-' : ''}${fmt(a.value)}</div>
    </div>`).join('');
}

// ── Render: Monthly Summary ───────────────────────────────────────────────────

function renderSummary() {
  populateYearSelects();
  buildSummaryTable();
}

function buildSummaryTable() {
  const year = document.getElementById('summary-year').value || String(new Date().getFullYear());
  const rows = [];

  for (let m = 0; m < 12; m++) {
    const prefix = `${year}-${String(m+1).padStart(2,'0')}`;
    const txs = data.transactions.filter(t => t.date.startsWith(prefix));
    const income = txs.filter(t => t.type === 'income').reduce((s,t) => s+t.amount, 0);
    const expense = txs.filter(t => t.type === 'expense').reduce((s,t) => s+t.amount, 0);
    const net = income - expense;
    rows.push({ month: MONTHS[m], income, expense, net, count: txs.length });
  }

  const totalIncome = rows.reduce((s,r) => s+r.income, 0);
  const totalExpense = rows.reduce((s,r) => s+r.expense, 0);
  const totalNet = totalIncome - totalExpense;

  const wrapper = document.getElementById('summary-table-wrapper');
  wrapper.innerHTML = `
    <table class="summary-table">
      <thead>
        <tr>
          <th>Month</th>
          <th>Income</th>
          <th>Expenses</th>
          <th>Net</th>
          <th>Transactions</th>
        </tr>
      </thead>
      <tbody>
        ${rows.map(r => `
          <tr>
            <td class="month-label">${r.month}</td>
            <td class="${r.income > 0 ? 'amount-positive' : 'amount-neutral'}">${r.income > 0 ? fmt(r.income) : '—'}</td>
            <td class="${r.expense > 0 ? 'amount-negative' : 'amount-neutral'}">${r.expense > 0 ? fmt(r.expense) : '—'}</td>
            <td class="${r.net > 0 ? 'amount-positive' : r.net < 0 ? 'amount-negative' : 'amount-neutral'}">${r.income || r.expense ? fmt(r.net) : '—'}</td>
            <td class="amount-neutral">${r.count || '—'}</td>
          </tr>`).join('')}
      </tbody>
      <tfoot>
        <tr style="border-top:2px solid var(--border)">
          <td style="font-weight:700">Total</td>
          <td class="amount-positive">${totalIncome > 0 ? fmt(totalIncome) : '—'}</td>
          <td class="amount-negative">${totalExpense > 0 ? fmt(totalExpense) : '—'}</td>
          <td class="${totalNet >= 0 ? 'amount-positive' : 'amount-negative'}">${totalIncome || totalExpense ? fmt(totalNet) : '—'}</td>
          <td class="amount-neutral">${rows.reduce((s,r)=>s+r.count,0) || '—'}</td>
        </tr>
      </tfoot>
    </table>`;
}

document.getElementById('summary-year').addEventListener('change', buildSummaryTable);

// ── Helpers ───────────────────────────────────────────────────────────────────

function updateSidebarNetWorth() {
  const totalAssets = data.assets.filter(a => a.type !== 'liability').reduce((s,a) => s+a.value, 0);
  const totalLiab = data.assets.filter(a => a.type === 'liability').reduce((s,a) => s+a.value, 0);
  const nw = totalAssets - totalLiab;
  document.getElementById('sidebar-net-worth').textContent = fmt(nw);
  document.getElementById('sidebar-net-worth').className = 'nw-value ' + (nw >= 0 ? 'text-green' : 'text-red');
}

function emptyState(msg) {
  return `<div class="empty-state">
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
    <p>${msg}</p>
  </div>`;
}

function escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function refreshAll() {
  const activePage = document.querySelector('.page.active').id.replace('page-','');
  if (activePage === 'dashboard') renderDashboard();
  if (activePage === 'transactions') renderTransactions();
  if (activePage === 'summary') renderSummary();
  updateSidebarNetWorth();
}

// ── Seed data (only on first load) ───────────────────────────────────────────

function seedDemoData() {
  if (localStorage.getItem('ft_seeded')) return;

  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const pm = String(now.getMonth()).padStart(2, '0') || '12';
  const py = now.getMonth() === 0 ? y - 1 : y;

  const txs = [
    { id: uid(), type: 'income',  date: `${y}-${m}-01`, description: 'Monthly Salary',     amount: 5500, category: 'Salary',       notes: '' },
    { id: uid(), type: 'expense', date: `${y}-${m}-02`, description: 'Rent',                amount: 1500, category: 'Housing',      notes: '' },
    { id: uid(), type: 'expense', date: `${y}-${m}-04`, description: 'Whole Foods',         amount: 210,  category: 'Groceries',    notes: '' },
    { id: uid(), type: 'expense', date: `${y}-${m}-06`, description: 'Netflix + Spotify',   amount: 28,   category: 'Subscriptions',notes: '' },
    { id: uid(), type: 'expense', date: `${y}-${m}-09`, description: 'Uber rides',          amount: 65,   category: 'Transportation',notes: '' },
    { id: uid(), type: 'expense', date: `${y}-${m}-12`, description: 'Dinner with friends', amount: 95,   category: 'Food & Dining',notes: '' },
    { id: uid(), type: 'income',  date: `${y}-${m}-15`, description: 'Freelance project',   amount: 900,  category: 'Freelance',    notes: '' },
    { id: uid(), type: 'expense', date: `${y}-${m}-18`, description: 'Electricity bill',    amount: 85,   category: 'Utilities',    notes: '' },
    { id: uid(), type: 'expense', date: `${y}-${m}-20`, description: 'Amazon order',        amount: 134,  category: 'Shopping',     notes: '' },
    { id: uid(), type: 'expense', date: `${y}-${m}-22`, description: 'Doctor visit',        amount: 50,   category: 'Healthcare',   notes: '' },
    { id: uid(), type: 'income',  date: `${py}-${pm}-01`, description: 'Monthly Salary',    amount: 5500, category: 'Salary',       notes: '' },
    { id: uid(), type: 'expense', date: `${py}-${pm}-03`, description: 'Rent',              amount: 1500, category: 'Housing',      notes: '' },
    { id: uid(), type: 'expense', date: `${py}-${pm}-08`, description: 'Groceries',         amount: 185,  category: 'Groceries',    notes: '' },
    { id: uid(), type: 'expense', date: `${py}-${pm}-14`, description: 'Weekend trip',      amount: 420,  category: 'Travel',       notes: '' },
    { id: uid(), type: 'expense', date: `${py}-${pm}-19`, description: 'Gym membership',    amount: 45,   category: 'Personal Care',notes: '' },
  ];

  const assets = [
    { id: uid(), name: 'Checking Account', type: 'cash',       value: 4200  },
    { id: uid(), name: 'Savings Account',  type: 'cash',       value: 18500 },
    { id: uid(), name: '401k',             type: 'investment', value: 52000 },
    { id: uid(), name: 'Stock Portfolio',  type: 'investment', value: 12000 },
    { id: uid(), name: 'Student Loan',     type: 'liability',  value: 22000 },
    { id: uid(), name: 'Credit Card',      type: 'liability',  value: 1800  },
  ];

  data.transactions = txs;
  data.assets = assets;
  saveData(data);
  localStorage.setItem('ft_seeded', '1');
}

// ── Export / Import ───────────────────────────────────────────────────────────

document.getElementById('export-btn').addEventListener('click', () => {
  const payload = JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), ...data }, null, 2);
  const blob = new Blob([payload], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const dateStr = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `fintrack-backup-${dateStr}.json`;
  a.click();
  URL.revokeObjectURL(url);
});

document.getElementById('import-btn').addEventListener('click', () => {
  document.getElementById('import-file-input').click();
});

document.getElementById('import-file-input').addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = evt => {
    try {
      const parsed = JSON.parse(evt.target.result);
      if (!Array.isArray(parsed.transactions) || !Array.isArray(parsed.assets)) {
        alert('Invalid backup file — missing transactions or assets.');
        return;
      }
      if (!confirm(`Import ${parsed.transactions.length} transactions and ${parsed.assets.length} assets?\n\nThis will replace all current data.`)) return;
      data.transactions = parsed.transactions;
      data.assets = parsed.assets;
      saveData(data);
      localStorage.setItem('ft_seeded', '1'); // prevent re-seeding
      refreshAll();
      updateSidebarNetWorth();
      alert('Import successful!');
    } catch {
      alert('Could not read the file. Make sure it\'s a valid Fintrack backup.');
    }
  };
  reader.readAsText(file);
  e.target.value = ''; // reset so the same file can be re-imported
});

// ── Init ──────────────────────────────────────────────────────────────────────

seedDemoData();
data = loadData();
renderDashboard();
populateYearSelects();
