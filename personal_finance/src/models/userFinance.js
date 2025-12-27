import sqlite from 'sqlite3';
import { open } from 'sqlite';

/* kullanıcının tüm finansal verileri */
export default async function getUserFinancials(id, limit, offset) {
    const dataBase = await open({
        filename: 'database.db',
        driver: sqlite.Database
    });

    try {
        const users = await dataBase.get(
            `
            SELECT
                id,
                username,
                lastname,
                email
            FROM users
            WHERE id = ?
            `,
            [id]
        );
        const expenses = await dataBase.all(
            `
            SELECT
                expenses.id,
                expenses.expense_name,
                expenses.amount,
                expenses.expense_date,
                users.username AS userName,
                users.lastname AS lastName,
                expense_categories.name AS categoryName
            FROM expenses
            JOIN users ON expenses.user_id = users.id
            JOIN expense_categories
                ON expenses.category_id = expense_categories.id
            WHERE expenses.user_id = ?
            LIMIT ? OFFSET ?
            `,
            [id, limit, offset]
        );

        const incomes = await dataBase.all(
            `
            SELECT
                incomes.id,
                incomes.income_name,
                incomes.amount,
                incomes.income_date,
                users.username AS userName,
                users.lastname AS lastName,
                income_categories.name AS categoryName
            FROM incomes
            JOIN users ON incomes.user_id = users.id
            JOIN income_categories
                ON incomes.category_id = income_categories.id
            WHERE incomes.user_id = ?
            LIMIT ? OFFSET ?
            `,
            [id, limit, offset]
        );
        const notes = await dataBase.all(
            `
            SELECT 
                notes.id,
                notes.note,
                notes.created_at,
                users.username,
                users.lastname
            FROM notes
            JOIN users ON notes.userInfo = users.id
            WHERE notes.userInfo = ?
            LIMIT ? OFFSET ?
            `, [id, limit, offset]
        )

    return { user: users, expenses, incomes, notes };
    } catch (err) {
        console.error('database error', err);
        throw err;
    } finally {
        await dataBase.close();
    }
}

/* expense update */
export async function upExpenseFinance(id, userId, expenseName, amount, categoryId) {
    const dataBase = await open({
        filename: 'database.db',
        driver: sqlite.Database
    });

    try {
        await dataBase.run(
            `
            UPDATE expenses
            SET expense_name = ?, amount = ?, category_id = ?
            WHERE id = ? AND user_id = ?
            `,
            [expenseName, amount, categoryId, id, userId]
        );
    } catch (err) {
        console.error('expense update error', err);
        throw err;
    } finally {
        await dataBase.close();
    }
}

/* expense delete */
export async function deleteExpenseFinance(id, userId) {
    const dataBase = await open({
        filename: 'database.db',
        driver: sqlite.Database
    });

    try {
        await dataBase.run(
            `
            DELETE FROM expenses
            WHERE id = ? AND user_id = ?
            `,
            [id, userId]
        );
    } catch (err) {
        console.error('expense delete error', err);
        throw err;
    } finally {
        await dataBase.close();
    }
}

/* income update */
export async function upIncomeFinance(id, userId, incomeName, amount, categoryId) {
    const dataBase = await open({
        filename: 'database.db',
        driver: sqlite.Database
    });

    try {
        await dataBase.run(
            `
            UPDATE incomes
            SET income_name = ?, amount = ?, category_id = ?
            WHERE id = ? AND user_id = ?
            `,
            [incomeName, amount, categoryId, id, userId]
        );
    } catch (err) {
        console.error('income update error', err);
        throw err;
    } finally {
        await dataBase.close();
    }
}

/* income delete */
export async function deleteIncomeFinance(id, userId) {
    const dataBase = await open({
        filename: 'database.db',
        driver: sqlite.Database
    });

    try {
        await dataBase.run(
            `
            DELETE FROM incomes
            WHERE id = ? AND user_id = ?
            `,
            [id, userId]
        );
    } catch (err) {
        console.error('income delete error', err);
        throw err;
    } finally {
        await dataBase.close();
    }
}

export async function upNotes(id, userId, note) {
    const dataBase = await open({
        filename: 'database.db',
        driver: sqlite.Database
    })
    try {
        await dataBase.run(
            `
            UPDATE notes
            SET note = ?
            WHERE id = ? AND userInfo = ?
            `, [note, id]
        )
    }
    catch (err) {
        console.error('note update error', err);
        throw err;
    }
    finally {
        await dataBase.close()
    }

}
export async function deleteNote(id, userId) {
    const dataBase = await open({
        filename: 'database.db',
        driver: sqlite.Database
    })
    try {
        await dataBase.run(
            `
            DELETE FROM notes
            WHERE id = ? AND userInfo = ?`, [id, userId]
        )
    }
    catch(err){
        console.error('note delete error', err);
        throw err;
    }
    finally{
        await dataBase.close()
    }
}

/* create expense for existing user */
export async function createExpense(userId, categoryName, expenseName, amount) {
    const dataBase = await open({
        filename: 'database.db',
        driver: sqlite.Database
    });

    try {
        await dataBase.exec('BEGIN');

        let categoryId;
        if (categoryName) {
            const cat = await dataBase.run(
                `INSERT INTO expense_categories (name) VALUES (?)`,
                [categoryName]
            );
            categoryId = cat.lastID;
        } else {
            throw new Error('Kategori adı gerekli');
        }

        const res = await dataBase.run(
            `INSERT INTO expenses (user_id, category_id, expense_name, amount) VALUES (?, ?, ?, ?)`,
            [userId, categoryId, expenseName, amount]
        );

        await dataBase.exec('COMMIT');
        return res.lastID;
    } catch (err) {
        await dataBase.exec('ROLLBACK');
        console.error('create expense error', err);
        throw err;
    } finally {
        await dataBase.close();
    }
}

export async function createIncome(userId, categoryName, incomeName, amount) {
    const dataBase = await open({
        filename: 'database.db',
        driver: sqlite.Database
    });

    try {
        await dataBase.exec('BEGIN');

        let categoryId;
        if (categoryName) {
            const cat = await dataBase.run(
                `INSERT INTO income_categories (name) VALUES (?)`,
                [categoryName]
            );
            categoryId = cat.lastID;
        } else {
            throw new Error('Kategori adı gerekli');
        }

        const res = await dataBase.run(
            `INSERT INTO incomes (user_id, category_id, income_name, amount) VALUES (?, ?, ?, ?)`,
            [userId, categoryId, incomeName, amount]
        );

        await dataBase.exec('COMMIT');
        return res.lastID;
    } catch (err) {
        await dataBase.exec('ROLLBACK');
        console.error('create income error', err);
        throw err;
    } finally {
        await dataBase.close();
    }
}

export async function createNote(userId, note) {
    const dataBase = await open({
        filename: 'database.db',
        driver: sqlite.Database
    });

    try {
        const res = await dataBase.run(
            `INSERT INTO notes (userInfo, note) VALUES (?, ?)`,
            [userId, note]
        );
        return res.lastID;
    } catch (err) {
        console.error('create note error', err);
        throw err;
    } finally {
        await dataBase.close();
    }
}