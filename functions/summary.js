// functions/summary.js

const { expensesTable } = require("../schema");
const db = require("../db");
const { gte, and, lt } = require("drizzle-orm");
const { getCategoriesById } = require("./categorie");

async function getSumByYearAndMonth(yearAndMonth, request, reply) {
  // format: 2021-09
  let [year, month] = yearAndMonth.split("-");

  if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
    reply.status(400).send({ message: "Invalid date format" });
    return false;
  }

  year = parseInt(year);
  month = parseInt(month);

  const dateStartMonth = new Date(year, month - 1, 1);
  const nextMonth = new Date(year, month, 1);

  // const expenses = await db.select().from('expenses').where('date', '>=', date).where('date', '<', nextMonth);
  const monthExpenses = await db
    .select()
    .from(expensesTable)
    .where(
      and(gte(expensesTable.date, dateStartMonth), lt(expensesTable.date, nextMonth))
    );

  const categoriesSums = {};
  const categoriesCount = {};

  for (expense of monthExpenses) {
    catId = parseInt(expense.category_id)
    if (!(catId in categoriesSums)) {
      categoriesSums[catId] = 0
    }

    if (!(catId in categoriesCount)) {
      categoriesCount[catId] = 0
    }
    categoriesSums[catId] += parseFloat(expense.amount)
    categoriesCount[catId] += 1

  }

  var response = [];

  for (catId in categoriesSums) {
    const categorie = await getCategoriesById(catId);

    console.log(categorie);

    response.push({
      categorie: categorie[0],
      sum: parseFloat(categoriesSums[catId].toFixed(2)),
      count: categoriesCount[catId]
    });
  }


  //  reply.send(monthExpenses);
  return response;
}

module.exports = { getSumByYearAndMonth };
