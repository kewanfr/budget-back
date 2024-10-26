// routes/events.js
const { categories } = require('../schema');
const db = require('../db');
const { eq } = require('drizzle-orm');
const { getCategorieById } = require('../functions/categorie');

async function categorieRoutes(fastify, options) {
  // Récupère toutes les catégories
  fastify.get('/v1/categorie', async (request, reply) => {
    try {
      const allCategories = await db.select().from(categories);

      reply.send(allCategories);
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({ message: 'Error fetching categories' });
    }
  });

  // Crée une nouvelle catégorie
  fastify.post('/v1/categorie', async (request, reply) => {
    let { name } = request.body;

    if (!name) {
      return reply.status(400).send({ message: 'Missing required fields' });
    }

    try {

      const newCategory = await db.insert(categories).values({
        name: name
      }).returning();

      reply.status(201).send(newCategory);
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({ message: 'Error creating category' });
    }
  });

  // Récupère une catégorie selon l'id
  fastify.get('/v1/categorie/:id', async (request, reply) => {
    const { id } = request.params;
    try {
      const categorie = await getCategorieById(id);
      if (categorie.length === 0) {
        return reply.status(404).send({ message: 'Categorie not found' });
      }
      reply.send(categorie[0]);
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({ message: 'Error fetching categorie' });
    }
  });


  // Supprime une catégorie selon l'Id
  fastify.delete('/v1/categorie/:id', async (request, reply) => {
    const { id } = request.params;
    const categorie = await getCategorieById(id);
    
    if (categorie.length === 0) {
      return reply.status(404).send({ message: 'Categorie not found' });
    }

    try {
      const categorieDelete = await db.delete(categories).where(eq(categories.id, id));
      
      if (categorieDelete === 0) {
        return reply.status(404).send({ message: 'Categorie not found' });
      }

      reply.send({ message: 'Categorie deleted' });
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({ message: 'Error deleting categorie' });
    }
  });

  fastify.post('/v1/categorie/:id/uploadIcon', async (request, reply) => {
    reply.status(501).send({ message: 'Not implemented' });
  });

  fastify.put('/v1/categorie/:id/uploadIcon', async (request, reply) => {
    reply.status(501).send({ message: 'Not implemented' });
  });


}

module.exports = categorieRoutes;
