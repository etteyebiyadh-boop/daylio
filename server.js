const express = require("express");
const initSqlJs = require("sql.js");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, "database.db");

app.use(express.json());
app.use(express.static("public"));

let db;

function saveDb() {
  if (db) {
    const data = db.export();
    fs.writeFileSync(DB_PATH, Buffer.from(data));
  }
}

async function initDb() {
  const SQL = await initSqlJs();
  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

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
  saveDb();
}

app.get("/clients", (req, res) => {
  try {
    const stmt = db.prepare("SELECT * FROM clients");
    const rows = [];
    while (stmt.step()) rows.push(stmt.getAsObject());
    stmt.free();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.post("/clients", (req, res) => {
  const { name, phone } = req.body;
  try {
    db.run("INSERT INTO clients (name, phone) VALUES (?, ?)", [name, phone]);
    saveDb();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.get("/appointments", (req, res) => {
  try {
    const stmt = db.prepare("SELECT * FROM appointments");
    const rows = [];
    while (stmt.step()) rows.push(stmt.getAsObject());
    stmt.free();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.post("/appointments", (req, res) => {
  const { client_name, date, time } = req.body;
  try {
    db.run(
      "INSERT INTO appointments (client_name, date, time) VALUES (?, ?, ?)",
      [client_name, date, time]
    );
    saveDb();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.get("/appointments/today", (req, res) => {
  const today = new Date().toISOString().split("T")[0];
  try {
    const stmt = db.prepare(
      "SELECT * FROM appointments WHERE date = ?"
    );
    stmt.bind([today]);
    const rows = [];
    while (stmt.step()) rows.push(stmt.getAsObject());
    stmt.free();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
