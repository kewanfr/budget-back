// functions/summary.js

const { categories } = require('../schema');
const db = require('../db');
const { eq } = require('drizzle-orm');


const getCategorieById = async (id) => await db.select().from(categories).where(eq(categories.id, id));


module.exports = { getCategorieById }