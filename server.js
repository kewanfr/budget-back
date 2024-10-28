// server.js
const fastify = require('fastify')({ logger: true });
require('dotenv').config();
const path = require('path');
const autoload = require('@fastify/autoload');
const fastifyPlugin = require('fastify-plugin');
const fastifyCors = require('@fastify/cors');



// Configurer CORS
fastify.register(fastifyCors, {
  origin: '*', // Vous pouvez restreindre cela à des domaines spécifiques
  methods: ['GET', 'POST', 'PUT', 'DELETE']
});

fastify.register(autoload, {
  dir: path.join(__dirname, 'routes'),
  // options: { prefix: `/${apiVersion}` },
});

const start = async () => {
  try {
    await fastify.listen({ port: process.env.PORT || 3000, host: '0.0.0.0'});
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