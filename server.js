const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static("public"));

const db = new sqlite3.Database("./database.db");

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS clients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      phone TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS appointments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_name TEXT,
      date TEXT,
      time TEXT
    )
  `);
});

app.get("/clients", (req, res) => {
  db.all("SELECT * FROM clients", [], (err, rows) => {
    if (err) return res.json(err);
    res.json(rows);
  });
});

app.post("/clients", (req, res) => {
  const { name, phone } = req.body;
  db.run(
    "INSERT INTO clients (name, phone) VALUES (?, ?)",
    [name, phone],
    () => res.json({ success: true })
  );
});

app.get("/appointments", (req, res) => {
  db.all("SELECT * FROM appointments", [], (err, rows) => {
    if (err) return res.json(err);
    res.json(rows);
  });
});

app.post("/appointments", (req, res) => {
  const { client_name, date, time } = req.body;
  db.run(
    "INSERT INTO appointments (client_name, date, time) VALUES (?, ?, ?)",
    [client_name, date, time],
    () => res.json({ success: true })
  );
});

app.get("/appointments/today", (req, res) => {
  const today = new Date().toISOString().split("T")[0];

  db.all(
    "SELECT * FROM appointments WHERE date = ?",
    [today],
    (err, rows) => {
      if (err) return res.json(err);
      res.json(rows);
    }
  );
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
