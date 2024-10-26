// routes/events.js
const { expensesTable, categoriesTable } = require('../schema');
const db = require('../db');
const { eq, gte, and, lt } = require('drizzle-orm');
const { getCategoriesById } = require('../functions/categorie');
const { getExpensesByCatId } = require('../functions/expense');

async function expenseRoutes(fastify, options) {
  // Récupère toutes les dépenses avec les catégories associées
  fastify.get('/v1/expense', async (request, reply) => {
    try {
      const allExpenses = await db.select({
        ...expensesTable,
        categorie: {
          ...categoriesTable
        }
      }).from(expensesTable).innerJoin(categoriesTable, eq(categoriesTable.id, expensesTable.category_id))

      reply.send(allExpenses);
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({ message: 'Error fetching expenses' });
    }
  });

  // Crée une nouvelle dépense
  fastify.post('/v1/expense', async (request, reply) => {
    let { category_id, magasin, date, amount, description } = request.body;

    // default values for magasin, description
    magasin = magasin || '';
    description = description || '';

    date = new Date(date);
    if (isNaN(date)) {
      return reply.status(400).send({ message: 'Invalid date' });
    }

    amount = parseFloat(amount);

    if (!category_id || !date || !amount) {
      return reply.status(400).send({ message: 'Missing required fields' });
    }


    try {
      const category = await getCategoriesById(category_id);

      if (category.length === 0) {
        return reply.status(404).send({ message: 'Category not found' });
      }

      const newExpense = await db.insert(expensesTable).values({
        category_id: category_id,
        magasin: magasin,
        date: date,
        amount: amount,
        description: description
      }).returning();

      reply.status(201).send(newExpense);
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({ message: 'Error creating expense' });
    }
  });

  // Modifie une dépense existante
  fastify.put('/v1/expense', async (request, reply) => {

    const { id, category_id, magasin, date, amount, description } = request.body;

    if (!id) {
      return reply.status(400).send({ message: 'Missing required fields' });
    }

    // les autres champs sont optionnels et seront mis à jour s'ils sont fournis
    const updateFields = {};
    if (category_id) {
      updateFields.category_id = category_id
    }
    if (magasin) {
      updateFields.magasin = magasin
    }
    if (date) {
      updateFields.date = new Date(date)
    }
    if (amount) {
      updateFields.amount = amount
    }
    if (description) {
      updateFields.description = description
    }

    try {
      const expense = await db.select().from(expensesTable).where(eq(expensesTable.id, id));

      if (expense.length === 0) {
        return reply.status(404).send({ message: 'Expense not found' });
      }

      const updatedExpense = await db.update(expensesTable).set(updateFields).where(eq(expensesTable.id, id)).returning();
      
      reply.send(updatedExpense[0]);
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({ message: 'Error updating expense' });
    }
  });

  // Récupère une dépense spécifique
  fastify.get('/v1/expense/:id', async (request, reply) => {
    const { id } = request.params;

    if (!id) {
      return reply.status(400).send({ message: 'Missing required fields' });
    }

    if (isNaN(id)) {
      return reply.status(400).send({ message: 'Invalid id' });
    }
    
    try {
      const expense = await db.select().from(expensesTable).where(eq(expensesTable.id, id));

      if (expense.length === 0) {
        return reply.status(404).send({ message: 'Expense not found' });
      }

      reply.send(expense[0]);
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({ message: 'Error fetching expense' });
    }
  });

  // Supprime une dépense spécifique
  fastify.delete('/v1/expense/:id', async (request, reply) => {
    const { id } = request.params;

    const expense = await db.select().from(expensesTable).where(eq(expensesTable.id, id));
    
    if (expense.length === 0) {
      return reply.status(404).send({ message: 'Expense not found' });
    }

    try {
      const expenseDelete = await db.delete(expensesTable).where(eq(expensesTable.id, id));
      
      if (expenseDelete === 0) {
        return reply.status(404).send({ message: 'Expense not found' });
      }

      reply.send({ message: 'Expense deleted' });
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({ message: 'Error deleting expense' });
    }
  });


  // Récupère toutes les dépenses par catégorie
  fastify.get('/v1/expense/findByCategorie', async (request, reply) => {
    console.log(request.query);
    let { categorie } = request.query;

    // verify all int value of categorie
    if (!categorie) {
      return reply.status(400).send({ message: 'Missing required fields' });
    }
  
    if (!Array.isArray(categorie)) {
      categorie = [categorie];
    }

    if (isNaN(categorie[0])) {
      return reply.status(400).send({ message: 'Invalid categorie id' });
    }
    
    try {

      const expensesFound = await getExpensesByCatId(categorie[0]);
      
      if(expensesFound.length == 0){
        return reply.status(404).send({ message: "Expenses not found" })
      }

      return reply.send(expensesFound);


    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({ message: 'Error finding expenses' });
    }
  });

  // Récupère toutes les dépenses par mois
  fastify.get('/v1/expense/findByMonth', async (request, reply) => {

    const { yearAndMonth } = request.query;

    console.log(yearAndMonth);
    if (!yearAndMonth) {
      return reply.status(400).send({ message: 'Missing required fields' });
    }
    
    let [year, month] = yearAndMonth.split("-");

    if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
      reply.status(400).send({ message: "Invalid date format" });
      return false;
    }

    year = parseInt(year);
    month = parseInt(month);

    const dateStartMonth = new Date(year, month - 1, 1);
    const nextMonth = new Date(year, month, 1);

    try {
      const monthExpenses = await db.select().from(expensesTable).where(and(gte(expensesTable.date, dateStartMonth), lt(expensesTable.date, nextMonth)));

      reply.send(monthExpenses);
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({ message: 'Error fetching summary' });
    }
  });


}

module.exports = expenseRoutes;
