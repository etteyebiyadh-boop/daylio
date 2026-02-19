async function loadClients(){
  const res = await fetch('/clients');
  const data = await res.json();
  const list = document.getElementById('clientList');
  list.innerHTML = '';
  data.forEach(c => {
    const li = document.createElement('li');
    li.className = 'client';
    li.innerHTML = `<div class="meta">${escapeHtml(c.name || '')}</div><div class="phone">${escapeHtml(c.phone || '')}</div>`;
    list.appendChild(li);
  });
}

function escapeHtml(s){
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

document.getElementById('clientForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('name').value.trim();
  const phone = document.getElementById('phone').value.trim();
  if(!name || !phone) return;
  await fetch('/clients', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ name, phone })
  });
  document.getElementById('name').value='';
  document.getElementById('phone').value='';
  loadClients();
});

loadClients();

async function addAppointment(){
  const client_name = document.getElementById('client_name').value.trim();
  const date = document.getElementById('date').value;
  const time = document.getElementById('time').value;
  if(!client_name || !date || !time) return;
  await fetch('/appointments', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ client_name, date, time })
  });
  document.getElementById('client_name').value = '';
  document.getElementById('date').value = '';
  document.getElementById('time').value = '';
  loadAppointments();
}

async function loadAppointments(){
  const res = await fetch('/appointments');
  const data = await res.json();
  const list = document.getElementById('appointmentList');
  if(!list) return;
  list.innerHTML = '';
  data.forEach(a => {
    const li = document.createElement('li');
    li.textContent = `${a.client_name} • ${a.date} ${a.time}`;
    list.appendChild(li);
  });
}

loadAppointments();

function loadToday() {
  fetch("/appointments/today")
    .then(res => res.json())
    .then(data => {
      const list = document.getElementById("todayList");
      if(!list) return;
      list.innerHTML = "";
      data.forEach(a => {
        const li = document.createElement("li");
        li.textContent = `${a.time} — ${a.client_name}`;
        list.appendChild(li);
      });
    });
}

loadToday();
setInterval(loadToday, 5000);
function addAppointment() {
  const client_name = document.getElementById("client_name").value;
  const date = document.getElementById("date").value;
  const time = document.getElementById("time").value;

  fetch("/appointments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ client_name, date, time })
  }).then(loadAppointments);
}

function loadAppointments() {
  fetch("/appointments")
    .then(res => res.json())
    .then(data => {
      const list = document.getElementById("appointmentList");
      list.innerHTML = "";
      data.forEach(a => {
        const li = document.createElement("li");
        li.textContent = `${a.client_name} — ${a.date} at ${a.time}`;
        list.appendChild(li);
      });
    });
}

loadAppointments();
