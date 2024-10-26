// functions/summary.js

const { categoriesTable } = require('../schema');
const db = require('../db');
const { eq } = require('drizzle-orm');


const getCategoriesById = async (id) => await db.select().from(categoriesTable).where(eq(categoriesTable.id, id));


module.exports = { getCategoriesById }