// server.js
const fastify = require('fastify')({ logger: true });
require('dotenv').config();
const path = require('path');
const autoload = require('@fastify/autoload');
const fastifyPlugin = require('fastify-plugin');
const expenseRoutes = require('./routes/expense');

fastify.register(autoload, {
  dir: path.join(__dirname, 'routes'),
  // options: { prefix: `/${apiVersion}` },
});


const start = async () => {
  try {
    await fastify.listen({ port: process.env.PORT || 3000 });
    console.log(`Server listening on port ${process.env.PORT || 3000}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

// start();

if (require.main === module) {
  start();
} else {
  module.exports = fastify;
}