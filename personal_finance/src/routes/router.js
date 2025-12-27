import { Router } from 'express';
import getUserFinancials, {
    upExpenseFinance,
    deleteExpenseFinance,
    upIncomeFinance,
    deleteIncomeFinance,
    upNotes,
    deleteNote
} from '../models/userFinance.js';

import createDb from '../controllers/UserFinance-controller.js';
import validateCreateFinance from '../middleware/validationCreateFinance.js';
import { register, login } from '../controllers/authController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { createExpense, createIncome, createNote } from '../models/userFinance.js';

const router = Router();

/* current user info (must be before '/:id' route to avoid route collision)
   Returns the authenticated user's public info */
router.get('/me', authMiddleware, (req, res) => {
    const u = req.user;
    res.json({ user: { id: u.id, username: u.username, lastname: u.lastname, email: u.email } });
});

/* GET user financials */
router.get('/:id', authMiddleware, async (req, res, next) => {
    const userId = req.params.id;
    // ensure the requesting user matches the requested id
    if (!req.user || String(req.user.id) !== String(userId)) {
        return res.status(403).json({ message: 'Yetkisiz erişim' });
    }
    const limit = Number(req.query.limit) || 10;
    const offset = Number(req.query.offset) || 0;

    try {
        const data = await getUserFinancials(userId, limit, offset);
        res.json(data);
    } catch (err) {
        next(err);
    }
});

/* CREATE finance data */
router.post(
    '/',
    validateCreateFinance,
    async (req, res, next) => {
        try {
            await createDb(req.body);
            res.status(201).json({ message: 'Oluşturuldu' });
        } catch (err) {
            next(err);
        }
    }
);

/* AUTH: register/login */
router.post('/auth/register', async (req, res, next) => {
    try {
        await register(req, res, next);
    } catch (err) {
        next(err);
    }
});

router.post('/auth/login', async (req, res, next) => {
    try {
        await login(req, res, next);
    } catch (err) {
        next(err);
    }
});

router.post('/auth/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Çıkış yapıldı' });
});

/* create expense/income/note for existing user */
router.post('/expense', authMiddleware, async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { categoryName, expenseName, amount } = req.body;
        const id = await createExpense(userId, categoryName, expenseName, amount);
        res.status(201).json({ id, message: 'Expense oluşturuldu' });
    } catch (err) { next(err); }
});

router.post('/income', authMiddleware, async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { categoryName, incomeName, amount } = req.body;
        const id = await createIncome(userId, categoryName, incomeName, amount);
        res.status(201).json({ id, message: 'Income oluşturuldu' });
    } catch (err) { next(err); }
});

router.post('/note', authMiddleware, async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { note } = req.body;
        const id = await createNote(userId, note);
        res.status(201).json({ id, message: 'Not oluşturuldu' });
    } catch (err) { next(err); }
});



/* UPDATE expense */
router.put('/expense/:id', authMiddleware, async (req, res, next) => {
    try {
        const { expenseName, amount, categoryId } = req.body;
        const userId = req.user.id;

        await upExpenseFinance(req.params.id, userId, expenseName, amount, categoryId);
        res.json({ message: 'Expense güncellendi' });
    } catch (err) {
        err.status = 400;
        next(err);
    }
});

/* DELETE expense */
router.delete('/expense/:id', authMiddleware, async (req, res, next) => {
    try {
        const userId = req.user.id;
        await deleteExpenseFinance(req.params.id, userId);
        res.json({ message: 'Expense silindi' });
    } catch (err) {
        err.status = 400;
        next(err);
    }
});

/* UPDATE income */
router.put('/income/:id', authMiddleware, async (req, res, next) => {
    try {
        const { incomeName, amount, categoryId } = req.body;
        const userId = req.user.id;

        await upIncomeFinance(req.params.id, userId, incomeName, amount, categoryId);
        res.json({ message: 'Income güncellendi' });
    } catch (err) {
        err.status = 400;
        next(err);
    }
});

/* DELETE income */
router.delete('/income/:id', authMiddleware, async (req, res, next) => {
    try {
        const userId = req.user.id;
        await deleteIncomeFinance(req.params.id, userId);
        res.json({ message: 'Income silindi' });
    } catch (err) {
        err.status = 400;
        next(err);
    }
});

/* UPDATE note */
router.put('/note/:id', authMiddleware, async (req, res, next) => {
    try {
        const { note } = req.body;
        const userId = req.user.id;

        await upNotes(req.params.id, userId, note);
        res.json({ message: 'Not güncellendi' });
    } catch (err) {
        err.status = 400;
        next(err);
    }
});

/* DELETE note */
router.delete('/note/:id', authMiddleware, async (req, res, next) => {
    try {
        const userId = req.user.id;
        await deleteNote(req.params.id, userId);
        res.json({ message: 'Not silindi' });
    } catch (err) {
        err.status = 400;
        next(err);
    }
});

export default router;
