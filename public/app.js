function escapeHtml(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

async function loadClients() {
  const res = await fetch("/clients");
  const data = await res.json();
  const list = document.getElementById("clientList");
  list.innerHTML = "";
  data.forEach((c) => {
    const li = document.createElement("li");
    li.className = "client";
    li.innerHTML = `<div class="meta">${escapeHtml(c.name || "")}</div><div class="phone">${escapeHtml(c.phone || "")}</div>`;
    list.appendChild(li);
  });
  loadClientOptions();
}

function loadClientOptions() {
  fetch("/clients")
    .then((res) => res.json())
    .then((data) => {
      const select = document.getElementById("appointment_client");
      if (!select) return;
      select.innerHTML = '<option value="">Select client</option>';
      data.forEach((c) => {
        const option = document.createElement("option");
        option.value = c.name;
        option.textContent = c.name;
        select.appendChild(option);
      });
    });
}

document.getElementById("clientForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("name").value.trim();
  const phone = document.getElementById("phone").value.trim();
  if (!name || !phone) return;
  await fetch("/clients", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, phone }),
  });
  document.getElementById("name").value = "";
  document.getElementById("phone").value = "";
  loadClients();
});

async function loadAppointments() {
  const res = await fetch("/appointments");
  const data = await res.json();
  const list = document.getElementById("appointmentList");
  if (!list) return;
  list.innerHTML = "";
  data.forEach((a) => {
    const li = document.createElement("li");
    li.textContent = `${a.client_name} • ${a.date} ${a.time}`;
    list.appendChild(li);
  });
}

function loadToday() {
  fetch("/appointments/today")
    .then((res) => res.json())
    .then((data) => {
      const list = document.getElementById("todayList");
      if (!list) return;
      list.innerHTML = "";
      data.forEach((a) => {
        const li = document.createElement("li");
        li.textContent = `${a.time} — ${a.client_name}`;
        list.appendChild(li);
      });
    });
}

async function addAppointment() {
  const select = document.getElementById("appointment_client");
  const client_name = select ? select.value.trim() : "";
  const date = document.getElementById("date").value;
  const time = document.getElementById("time").value;
  if (!client_name || !date || !time) return;
  await fetch("/appointments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ client_name, date, time }),
  });
  if (select) select.value = "";
  document.getElementById("date").value = "";
  document.getElementById("time").value = "";
  loadAppointments();
  loadToday();
}

document.getElementById("addAppointmentBtn").addEventListener("click", addAppointment);

loadClients();
loadAppointments();
loadToday();
setInterval(loadToday, 5000);
