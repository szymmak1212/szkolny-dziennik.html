const STORAGE_KEY = 'dziennik_entries';

function load() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function save(entries) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function render() {
  const tbody = document.querySelector('#table tbody');
  tbody.innerHTML = '';
  const entries = load();
  entries.forEach((e, i) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${i+1}</td><td>${e.student}</td><td>${e.subject}</td><td>${e.grade}</td><td>${e.date}</td><td>${e.notes || ''}</td>`;
    tbody.appendChild(tr);
  });
}

document.getElementById('entryForm').addEventListener('submit', (ev) => {
  ev.preventDefault();
  const student = document.getElementById('student').value.trim();
  const subject = document.getElementById('subject').value.trim();
  const grade = document.getElementById('grade').value.trim();
  const date = document.getElementById('date').value;
  const notes = document.getElementById('notes').value.trim();
  if(!student || !subject || !grade || !date) return alert('Wypełnij wymagane pola.');
  const entries = load();
  entries.push({ student, subject, grade, date, notes });
  save(entries);
  render();
  ev.target.reset();
});

document.getElementById('exportCsv').addEventListener('click', () => {
  const entries = load();
  if(entries.length === 0) return alert('Brak wpisów do eksportu.');
  const header = ['Lp','Imię i nazwisko','Przedmiot','Ocena','Data','Uwagi'];
  const rows = entries.map((e, i) => [i+1, e.student, e.subject, e.grade, e.date, e.notes || '']);
  const csv = [header, ...rows].map(r => r.map(cell => '"' + String(cell).replace(/"/g,'""') + '"').join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'dziennik_export.csv';
  a.click();
  URL.revokeObjectURL(url);
});

document.getElementById('importCsvBtn').addEventListener('click', () => {
  document.getElementById('importCsv').click();
});

document.getElementById('importCsv').addEventListener('change', (ev) => {
  const file = ev.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const text = reader.result;
    const lines = text.split(/\r?\n/).filter(Boolean);
    const entries = [];
    // assume header present
    for(let i=1;i<lines.length;i++){
      const parts = lines[i].split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/).map(s=>s.replace(/^"|"$/g,''));
      if(parts.length < 6) continue;
      entries.push({ student: parts[1], subject: parts[2], grade: parts[3], date: parts[4], notes: parts[5] });
    }
    const existing = load();
    const merged = existing.concat(entries);
    save(merged);
    render();
    alert('Import zakończony. Dodano ' + entries.length + ' wpisów.');
  };
  reader.readAsText(file, 'utf-8');
});

document.getElementById('clearAll').addEventListener('click', () => {
  if(!confirm('Na pewno chcesz usunąć wszystkie wpisy?')) return;
  localStorage.removeItem(STORAGE_KEY);
  render();
});

// initial sample if empty
if(load().length === 0) {
  save([
    { student: 'Jan Kowalski', subject: 'Matematyka', grade: '5', date: '2025-09-01', notes: '' },
    { student: 'Anna Nowak', subject: 'Język polski', grade: '4', date: '2025-09-02', notes: 'Uczestniczyła aktywnie' }
  ]);
}

render();