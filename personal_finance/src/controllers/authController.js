import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

export async function register(req, res, next) {
  const { username, lastname, email, password } = req.body;

  if (!username || !lastname || !email || !password) {
    return res.status(400).json({ message: 'Eksik alan' });
  }

  const db = await open({ filename: 'database.db', driver: sqlite3.Database });
  try {
    // check existing email
    const existing = await db.get(`SELECT id FROM users WHERE email = ?`, [email]);
    if (existing) return res.status(409).json({ message: 'E-posta zaten kayıtlı' });

    // hash password
    const hashed = await new Promise((resolve, reject) => {
      bcrypt.hash(password, 10, (err, hash) => (err ? reject(err) : resolve(hash)));
    });

    const result = await db.run(
      `INSERT INTO users (username, lastname, password, email) VALUES (?, ?, ?, ?)`,
      [username, lastname, hashed, email]
    );

    const userId = result.lastID;
    return res.status(201).json({ id: userId, message: 'Kullanıcı oluşturuldu' });
  } catch (err) {
    next(err);
  } finally {
    await db.close();
  }
}

export async function login(req, res, next) {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Eksik alan' });

  const db = await open({ filename: 'database.db', driver: sqlite3.Database });
  try {
  const user = await db.get(`SELECT id, password, username, lastname FROM users WHERE email = ?`, [email]);
    if (!user) return res.status(401).json({ message: 'Geçersiz kimlik bilgileri' });

    const match = await new Promise((resolve) => {
      bcrypt.compare(password, user.password, (err, same) => resolve(!err && same));
    });

    if (!match) return res.status(401).json({ message: 'Geçersiz kimlik bilgileri' });

  const token = jwt.sign({ id: user.id, username: user.username, lastname: user.lastname, email }, JWT_SECRET, { expiresIn: '7d' });
  // set httpOnly cookie
  res.cookie('token', token, { httpOnly: true, sameSite: 'lax' });
  return res.json({ id: user.id });
  } catch (err) {
    next(err);
  } finally {
    await db.close();
  }
}

export default { register, login };
