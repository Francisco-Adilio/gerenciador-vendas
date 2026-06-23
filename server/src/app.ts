import Fastify, { FastifyReply, FastifyRequest } from 'fastify'

import { 
  serializerCompiler, 
  validatorCompiler, 
  ZodTypeProvider 
} from 'fastify-type-provider-zod';
import { userRoutes } from './routes/user';
import authPlugin from './plugins/auth'

const fastify = Fastify({ logger: true }).withTypeProvider<ZodTypeProvider>();

fastify.setValidatorCompiler(validatorCompiler);
fastify.setSerializerCompiler(serializerCompiler);

fastify.register(authPlugin)

fastify.register(userRoutes, { prefix: '/users' })

const start = async () => {
  try {
    await fastify.listen({ port: 3000, host: '0.0.0.0' });
    console.log('🚀 Servidor rodando na porta 3000');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();