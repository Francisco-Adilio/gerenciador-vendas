import Fastify, { FastifyReply, FastifyRequest } from 'fastify'

import { 
  serializerCompiler, 
  validatorCompiler, 
  ZodTypeProvider 
} from 'fastify-type-provider-zod';
import { userRoutes } from './routes/user';
import authPlugin from './plugins/auth'
import { productRoutes } from './routes/product';
import { promotionRoutes } from './routes/promotion';
import { saleRoutes } from './routes/sale';

const fastify = Fastify({ logger: true }).withTypeProvider<ZodTypeProvider>();

fastify.setValidatorCompiler(validatorCompiler);
fastify.setSerializerCompiler(serializerCompiler);

fastify.register(authPlugin)

fastify.register(userRoutes, { prefix: '/users' })
fastify.register(productRoutes, { prefix: '/products' })
fastify.register(promotionRoutes, { prefix: '/promotions' })
fastify.register(saleRoutes, { prefix: '/sales' })

const start = async () => {
  try {
    await fastify.listen({ port: 4000, host: '0.0.0.0' });
    console.log('🚀 Servidor rodando na porta 4000');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();