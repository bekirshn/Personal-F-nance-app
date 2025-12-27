export default function validateCreateFinance(req, res, next) {
    const {
        username,
        lastname,
        password,
        email,

        expenseCategoryName,
        expenseName,
        expenseAmount,

        incomeCategoryName,
        incomeName,
        incomeAmount
    } = req.body;

    // password must exist and be long enough before hashing
    if (!password || password.length < 6) {
        return res.status(400).json({
            message: 'Parola en az 6 karakter olmalıdır'
        });
    }

    // NOTE: Do not hash here; hashing is performed server-side in controllers to keep middleware sync-free.
    /* USER zorunlu */
    if (!username || !lastname || !password || !email) {
        return res.status(400).json({
            message: 'Kullanıcı bilgileri eksik'
        });
    }

    /* EXPENSE varsa doğrula */
    const hasExpense =
        expenseCategoryName ||
        expenseName ||
        expenseAmount !== undefined;

    if (hasExpense) {
        const amount = Number(expenseAmount);

        if (
            !expenseCategoryName ||
            !expenseName ||
            Number.isNaN(amount)
        ) {
            return res.status(400).json({
                message: 'Expense verisi hatalı'
            });
        }

        req.body.expenseAmount = amount;
    }

    /* INCOME varsa doğrula */
    const hasIncome =
        incomeCategoryName ||
        incomeName ||
        incomeAmount !== undefined;

    if (hasIncome) {
        const amount = Number(incomeAmount);

        if (
            !incomeCategoryName ||
            !incomeName ||
            Number.isNaN(amount)
        ) {
            return res.status(400).json({
                message: 'Income verisi hatalı'
            });
        }

        req.body.incomeAmount = amount;
    }

    /* En az bir finansal kayıt olmalı */
    if (!hasExpense && !hasIncome) {
        return res.status(400).json({
            message: 'En az bir gelir veya gider girilmelidir'
        });
    }

    next();
}
