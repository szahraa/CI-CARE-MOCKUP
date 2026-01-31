import initSqlJs from 'sql.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import bcrypt from 'bcryptjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, 'ci-care.db');

let _db = null;

function bindParams(sql, params) {
  let i = 0;
  return sql.replace(/\?/g, () => {
    const v = params[i++];
    if (v === null || v === undefined) return 'NULL';
    if (typeof v === 'string') return "'" + v.replace(/'/g, "''") + "'";
    return String(v);
  });
}

function rowToObject(columns, values) {
  const o = {};
  columns.forEach((c, i) => { o[c] = values[i]; });
  return o;
}

function save() {
  if (!_db) return;
  try {
    const data = _db.export();
    fs.writeFileSync(dbPath, Buffer.from(data));
  } catch (e) { /* ignore */ }
}

async function initDb() {
  const SQL = await initSqlJs();
  if (fs.existsSync(dbPath)) {
    const buf = fs.readFileSync(dbPath);
    _db = new SQL.Database(buf);
  } else {
    _db = new SQL.Database();
  }

  _db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'Dokter Umum',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  _db.run(`
    CREATE TABLE IF NOT EXISTS patients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      birth_date TEXT,
      condition TEXT,
      status TEXT DEFAULT 'Stabil',
      last_visit TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  _db.run(`
    CREATE TABLE IF NOT EXISTS appointments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER NOT NULL,
      scheduled_at TEXT NOT NULL,
      type TEXT NOT NULL,
      status TEXT DEFAULT 'Terjadwal',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (patient_id) REFERENCES patients(id)
    );
  `);
  _db.run(`
    CREATE TABLE IF NOT EXISTS medical_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER NOT NULL,
      doctor_id INTEGER NOT NULL,
      notes TEXT,
      prescription TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (patient_id) REFERENCES patients(id),
      FOREIGN KEY (doctor_id) REFERENCES users(id)
    );
  `);

  const userCount = _db.exec("SELECT COUNT(*) as c FROM users");
  if (!userCount[0]?.values[0][0]) {
    const hashedPassword = bcrypt.hashSync('admin123', 10);
    _db.run("INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)", ['dr.sarah@cicare.com', hashedPassword, 'dr. Sarah Wijaya', 'Dokter Umum']);
  }

  const patientNames = ['Budi Santoso', 'Ani Rahayu', 'Citra Dewi'];
  const patientData = {
    'Budi Santoso': ['1979-05-15', 'Diabetes Type 2', 'Stabil', '2 hari lalu'],
    'Ani Rahayu': ['1985-08-22', 'Hipertensi', 'Monitoring', '1 hari lalu'],
    'Citra Dewi': ['1990-12-03', 'Pemulihan Pasca Operasi', 'Pemulihan', '3 hari lalu'],
  };
  for (const name of patientNames) {
    const r = _db.exec(bindParams("SELECT 1 FROM patients WHERE name = ?", [name]));
    if (!r[0]?.values?.length) {
      const [dob, cond, status, lastVisit] = patientData[name];
      _db.run("INSERT INTO patients (name, birth_date, condition, status, last_visit) VALUES (?, ?, ?, ?, ?)", [name, dob, cond, status, lastVisit]);
    }
  }

  const aptCount = _db.exec("SELECT COUNT(*) as c FROM appointments");
  if (!aptCount[0]?.values[0][0]) {
    const today = new Date().toISOString().slice(0, 10);
    const budi = _db.exec("SELECT id FROM patients WHERE name = 'Budi Santoso' LIMIT 1");
    const ani = _db.exec("SELECT id FROM patients WHERE name = 'Ani Rahayu' LIMIT 1");
    const budiId = budi[0]?.values[0]?.[0];
    const aniId = ani[0]?.values[0]?.[0];
    if (budiId) {
      _db.run("INSERT INTO appointments (patient_id, scheduled_at, type, status) VALUES (?, ?, ?, ?)", [budiId, `${today} 09:00`, 'Kontrol Rutin', 'Menunggu']);
      _db.run("INSERT INTO appointments (patient_id, scheduled_at, type, status) VALUES (?, ?, ?, ?)", [budiId, `${today} 10:30`, 'Konsultasi', 'Terjadwal']);
    }
    if (aniId) _db.run("INSERT INTO appointments (patient_id, scheduled_at, type, status) VALUES (?, ?, ?, ?)", [aniId, `${today} 14:00`, 'Follow-up', 'Terjadwal']);
  }

  save();
  return _db;
}

export const ready = initDb();

export default {
  get ready() { return ready; },
  prepare(sql) {
    return {
      run(...params) {
        if (!_db) throw new Error('DB not ready');
        if (params.length) _db.run(sql, params);
        else _db.run(sql);
        const lid = _db.exec("SELECT last_insert_rowid() as id");
        const lastInsertRowid = lid[0]?.values[0]?.[0] ?? undefined;
        save();
        return { lastInsertRowid };
      },
      get(...params) {
        if (!_db) throw new Error('DB not ready');
        const s = params.length ? bindParams(sql, params) : sql;
        const r = _db.exec(s);
        if (!r[0] || !r[0].values.length) return null;
        return rowToObject(r[0].columns, r[0].values[0]);
      },
      all(...params) {
        if (!_db) throw new Error('DB not ready');
        const s = params.length ? bindParams(sql, params) : sql;
        const r = _db.exec(s);
        if (!r[0]) return [];
        return r[0].values.map(row => rowToObject(r[0].columns, row));
      },
    };
  },
};
