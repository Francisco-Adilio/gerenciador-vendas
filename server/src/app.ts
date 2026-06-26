import Fastify, { FastifyReply, FastifyRequest } from 'fastify'

import { 
  serializerCompiler, 
  validatorCompiler, 
  ZodTypeProvider 
} from 'fastify-type-provider-zod';
import { userRoutes } from './routes/user.js';
import authPlugin from './plugins/auth.js'
import { productRoutes } from './routes/product.js';
import { promotionRoutes } from './routes/promotion.js';
import { saleRoutes } from './routes/sale.js';

const fastify = Fastify({ logger: true }).withTypeProvider<ZodTypeProvider>();

fastify.setValidatorCompiler(validatorCompiler);
fastify.setSerializerCompiler(serializerCompiler);

fastify.register(authPlugin)

fastify.register(userRoutes, { prefix: '/users' })
fastify.register(productRoutes, { prefix: '/products' })
fastify.register(promotionRoutes, { prefix: '/promotions' })
fastify.register(saleRoutes, { prefix: '/sales' })

fastify.get('/', async (request, reply) => {
  return { hello: 'world' };
});

if (process.env.NODE_ENV !== 'production') {
  fastify.listen({ port: 4000 });
  console.log('🚀 Servidor rodando na porta 4000');
}

export default async (request: FastifyRequest, reply: FastifyReply) => {
  await fastify.ready();
  fastify.server.emit('request', request, reply);
};
