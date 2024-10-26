// functions/summary.js

const { expensesTable } = require('../schema');
const db = require('../db');
const { eq } = require('drizzle-orm');


const getExpensesByCatId = async (id) => await db.select().from(expensesTable).where(eq(expensesTable.category_id, id));


module.exports = { getExpensesByCatId }