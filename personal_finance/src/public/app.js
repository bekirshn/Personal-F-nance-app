document.addEventListener('DOMContentLoaded', () => {
  const usernameEl = document.getElementById('username');
  const logoutBtn = document.getElementById('logout');

  // No localStorage tokens anymore. We rely on httpOnly cookie set by the server.
  usernameEl.textContent = `Hoşgeldiniz`;

  const headers = { 'Content-Type': 'application/json' };

  const expensesList = document.getElementById('expensesList');
  const incomesList = document.getElementById('incomesList');
  const notesList = document.getElementById('notesList');

  async function load() {
    try {
      // get current user from server (reads token cookie)
      const meRes = await fetch('/api/me', { headers, credentials: 'same-origin' });
      if (!meRes.ok) { window.location.href = '/login/login.html'; return; }
      const meJson = await meRes.json();
      const currentUser = meJson.user;
      if (currentUser) {
        usernameEl.textContent = `Hoşgeldiniz, ${currentUser.username || ''} ${currentUser.lastname || ''}`.trim();
      }

      const res = await fetch(`/api/${currentUser.id}?limit=100&offset=0`, { headers, credentials: 'same-origin' });
      if (!res.ok) throw new Error('Yüklenemedi');
      const data = await res.json();
      renderExpenses(data.expenses || []);
      renderIncomes(data.incomes || []);
      renderNotes(data.notes || []);
    } catch (err) {
      console.error(err);
      // show simple message
      expensesList.innerHTML = '<li class="meta">Veriler yüklenemiyor</li>';
    }
  }

  function renderExpenses(items) {
    expensesList.innerHTML = '';
    items.forEach(it => {
      const li = document.createElement('li');
      li.innerHTML = `<div>
        <div><strong>${escapeHtml(it.expense_name)}</strong> <span class="meta">(${escapeHtml(it.categoryName)})</span></div>
        <div class="meta">${escapeHtml(it.expense_date)} — ${it.amount}</div>
      </div>
      <div class="actions">
        <button data-id="${it.id}" data-type="expense" class="edit">Düzenle</button>
        <button data-id="${it.id}" data-type="expense" class="del">Sil</button>
      </div>`;
      expensesList.appendChild(li);
    });
  }

  function renderIncomes(items) {
    incomesList.innerHTML = '';
    items.forEach(it => {
      const li = document.createElement('li');
      li.innerHTML = `<div>
        <div><strong>${escapeHtml(it.income_name)}</strong> <span class="meta">(${escapeHtml(it.categoryName)})</span></div>
        <div class="meta">${escapeHtml(it.income_date)} — ${it.amount}</div>
      </div>
      <div class="actions">
        <button data-id="${it.id}" data-type="income" class="edit">Düzenle</button>
        <button data-id="${it.id}" data-type="income" class="del">Sil</button>
      </div>`;
      incomesList.appendChild(li);
    });
  }

  function renderNotes(items) {
    notesList.innerHTML = '';
    items.forEach(it => {
      const li = document.createElement('li');
      li.innerHTML = `<div>
        <div>${escapeHtml(it.note)}</div>
        <div class="meta">${escapeHtml(it.created_at)}</div>
      </div>
      <div class="actions">
        <button data-id="${it.id}" data-type="note" class="edit">Düzenle</button>
        <button data-id="${it.id}" data-type="note" class="del">Sil</button>
      </div>`;
      notesList.appendChild(li);
    });
  }

  function escapeHtml(s){ return (s||'').toString().replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]); }

  // add handlers for create forms
  document.getElementById('addExpense').addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const f = ev.target;
    const category = f.category.value.trim();
    const name = f.name.value.trim();
    const amount = Number(f.amount.value);
    if (!category || !name || Number.isNaN(amount)) return alert('Eksik/hatali veri');

    await fetch('/api/expense', { method: 'POST', headers, credentials: 'same-origin', body: JSON.stringify({ categoryName: category, expenseName: name, amount }) });
    f.reset(); load();
  });

  document.getElementById('addIncome').addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const f = ev.target;
    const category = f.category.value.trim();
    const name = f.name.value.trim();
    const amount = Number(f.amount.value);
    if (!category || !name || Number.isNaN(amount)) return alert('Eksik/hatali veri');

    await fetch('/api/income', { method: 'POST', headers, credentials: 'same-origin', body: JSON.stringify({ categoryName: category, incomeName: name, amount }) });
    f.reset(); load();
  });

  document.getElementById('addNote').addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const f = ev.target;
    const note = f.note.value.trim();
    if (!note) return;
    await fetch('/api/note', { method: 'POST', headers, credentials: 'same-origin', body: JSON.stringify({ note }) });
    f.reset(); load();
  });

  // delegate edit/delete
  document.addEventListener('click', async (ev) => {
    const btn = ev.target.closest('button');
    if (!btn) return;
    if (btn.classList.contains('del')) {
      const id = btn.dataset.id;
      const type = btn.dataset.type;
      if (!confirm('Silmek istediğinize emin misiniz?')) return;
      await fetch(`/api/${type}/${id}`, { method: 'DELETE', headers, credentials: 'same-origin' });
      load();
      return;
    }

    if (btn.classList.contains('edit')) {
      const id = btn.dataset.id;
      const type = btn.dataset.type;
        if (type === 'note') {
        const newVal = prompt('Notu düzenle:');
        if (newVal === null) return;
        await fetch(`/api/note/${id}`, { method: 'PUT', headers, credentials: 'same-origin', body: JSON.stringify({ note: newVal }) });
      } else if (type === 'expense') {
        const expenseName = prompt('Gider adı:');
        const amount = prompt('Tutar:');
        const categoryId = prompt('Kategori id (isteğe bağlı):');
        await fetch(`/api/expense/${id}`, { method: 'PUT', headers, credentials: 'same-origin', body: JSON.stringify({ expenseName, amount: Number(amount), categoryId: categoryId ? Number(categoryId) : null }) });
      } else if (type === 'income') {
        const incomeName = prompt('Gelir adı:');
        const amount = prompt('Tutar:');
        const categoryId = prompt('Kategori id (isteğe bağlı):');
        await fetch(`/api/income/${id}`, { method: 'PUT', headers, credentials: 'same-origin', body: JSON.stringify({ incomeName, amount: Number(amount), categoryId: categoryId ? Number(categoryId) : null }) });
      }
      load();
      return;
    }
  });

  logoutBtn.addEventListener('click', async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' });
    window.location.href = '/login/login.html';
  });

  load();
});
