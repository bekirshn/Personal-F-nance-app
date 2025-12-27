import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import bcrypt from 'bcryptjs';

export default async function createFinance({
    username,
    lastname,
    password,
    email,

    expenseCategoryName,
    expenseName,
    expenseAmount,

    incomeCategoryName,
    incomeName,
    incomeAmount,

    userNote
}) {
    const db = await open({
        filename: 'database.db',
        driver: sqlite3.Database
    });

    await db.exec('PRAGMA foreign_keys = ON');
    await db.exec('BEGIN');

    try {
        /* USER */
        // hash password before insert
        const hashed = await new Promise((resolve, reject) => {
            bcrypt.hash(password, 10, (err, hash) => (err ? reject(err) : resolve(hash)));
        });
        const userResult = await db.run(
            `INSERT INTO users (username, lastname, password, email) VALUES (?, ?, ?, ?)`,
            [username, lastname, hashed, email]
        );
        const userId = userResult.lastID;

        /* EXPENSE */
        if (expenseCategoryName && expenseName) {
            const categoryResult = await db.run(
                `INSERT INTO expense_categories (name) VALUES (?)`,
                [expenseCategoryName]
            );

            await db.run(
                `
                INSERT INTO expenses (user_id, category_id, expense_name, amount)
                VALUES (?, ?, ?, ?)
                `,
                [userId, categoryResult.lastID, expenseName, expenseAmount]
            );
        }

        /* INCOME */
        if (incomeCategoryName && incomeName) {
            const categoryResult = await db.run(
                `INSERT INTO income_categories (name) VALUES (?)`,
                [incomeCategoryName]
            );

            await db.run(
                `
                INSERT INTO incomes (user_id, category_id, income_name, amount)
                VALUES (?, ?, ?, ?)
                `,
                [userId, categoryResult.lastID, incomeName, incomeAmount]
            );
        }

        /* NOTE */
        if (userNote) {
            await db.run(
                `
                INSERT INTO notes (userInfo, note)
                VALUES (?, ?)
                `,
                [userId, userNote]
            );
        }

        await db.exec('COMMIT');
        return userId;

    } catch (err) {
        await db.exec('ROLLBACK');
        throw err;
    } finally {
        await db.close();
    }
}
