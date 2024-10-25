// routes/events.js
const { expenses, categories } = require('../schema');
const db = require('../db');
const { eq, inArray } = require('drizzle-orm');

async function expenseRoutes(fastify, options) {
  // Récupère toutes les dépenses avec les catégories associées
  fastify.get('/v1/expense', async (request, reply) => {
    try {
      const allExpenses = await db.select({
        ...expenses,
        categorie: {
          ...categories
        }
      }).from(expenses).innerJoin(categories, eq(categories.id, expenses.category_id))
      // const allExpenses = await (await db.select().from(expenses)).join(categories, eq(expenses.category_id, categories.id));
      console.log(allExpenses);
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
      const category = await db.select().from(categories).where(eq(categories.id, category_id));

      if (category.length === 0) {
        return reply.status(404).send({ message: 'Category not found' });
      }

      const newExpense = await db.insert(expenses).values({
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

  // Récupère une dépense spécifique
  fastify.get('/v1/expense/:id', async (request, reply) => {
    const { id } = request.params;
    
    try {
      const expense = await db.select().from(expenses).where(eq(expenses.id, id));

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

    const expense = await db.select().from(expenses).where(eq(expenses.id, id));
    
    if (expense.length === 0) {
      return reply.status(404).send({ message: 'Expense not found' });
    }

    try {
      const expenseDelete = await db.delete(expenses).where(eq(expenses.id, id));
      
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
    let { categorie } = request.query;

    // verify all int value of categorie
    if (!categorie) {
      return reply.status(400).send({ message: 'Missing required fields' });
    }
  
    if (!Array.isArray(categorie)) {
      categorie = [categorie];
    }
    try {
      const expensesFound = await db.select().from(expenses).where(inArray(expenses.category_id, categorie));
      
      reply.send(expensesFound);
      if(expensesFound.length == 0){
        return reply.status(404).send({ message: "Expenses not found" })
      }

    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({ message: 'Error finding expenses' });
    }
  });


}

module.exports = expenseRoutes;
