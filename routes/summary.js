// routes/events.js
const { getSumByYearAndMonth } = require('../functions/summary');

async function summaryRoutes(fastify, options) {
  // Récupère toutes les catégories
  fastify.get('/v1/summary/sumByMonth', async (request, reply) => {

    const { yearAndMonth } = request.query;

    console.log(yearAndMonth);
    if (!yearAndMonth) {
      return reply.status(400).send({ message: 'Missing required fields' });
    }
    var summary = {} 


    try {
      if (Array.isArray(yearAndMonth)) {
        for (yearMonth of yearAndMonth) {
          summary[yearMonth] = await getSumByYearAndMonth(yearMonth, request, reply);
          if (!summary[yearMonth]) {
            return false
          }
        }
      } else {
        summary[yearAndMonth] = await getSumByYearAndMonth(yearAndMonth, request, reply);
        if (!summary[yearAndMonth]) {
          return false
        }
      }

      reply.send(summary);
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({ message: 'Error fetching summary' });
    }

  });

}

module.exports = summaryRoutes;
