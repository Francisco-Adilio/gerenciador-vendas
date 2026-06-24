import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { prisma } from '../lib/prisma';

const promotionSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  value: z.number().positive(),
  productId: z.string(),
});

const errorSchema = z.object({ error: z.string() })

const createPromotionSchema = promotionSchema.omit({ id: true });

export async function promotionRoutes(fastify: FastifyInstance) {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  // CREATE PROMOTION
  app.post('/', {
    onRequest: [fastify.authenticate],
    schema: {
      body: createPromotionSchema,
      response: { 201: promotionSchema, 400: errorSchema }
    }
  }, async (request, reply) => {
    try {
      const promotion = await prisma.promotion.create({ data: request.body });
      return reply.code(201).send(promotion);
    } catch {
      return reply.code(400).send({ error: 'Product not found or already has a promotion' });
    }
  });

  // READ ALL PROMOTIONS
  app.get('/', {
    onRequest: [fastify.authenticate],
    schema: {
      response: { 200: z.array(promotionSchema) }
    }
  }, async () => {
    return await prisma.promotion.findMany();
  });
}
