import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { productSchema } from './product';

export const promotionSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  value: z.number().positive(),
  minQuantity: z.number().optional(),
  product: productSchema
});

const errorSchema = z.object({ error: z.string() })

const createPromotionSchema = promotionSchema.omit({ id: true, product: true }).extend({ productId: z.string() })

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
      const promotion = await prisma.promotion.create({ data: request.body, include: { product: true } });
      return reply.code(201).send(promotion)
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
    return await prisma.promotion.findMany({
      include: { product: true }
    });
  });

  app.get('/:id', {
    onRequest: [fastify.authenticate],
    schema: {
      params: z.object({ id: z.string() }),
      response: { 200: promotionSchema, 404: errorSchema }
    }
  }, async (request, reply) => {
    const promotion = await prisma.promotion.findUnique({ where: { id: request.params.id }, include: { product: true } })
    if(!promotion) return reply.code(404).send({ error: 'Promotion not found' })
    return reply.code(200).send(promotion)
  })

  app.put('/:id', {
    onRequest: [fastify.authenticate],
    schema: {
      params: z.object({ id: z.string() }),
      body: createPromotionSchema.partial(),
      response: { 200: promotionSchema, 404: errorSchema }
    }
  }, async (request, reply) => {
    try {
      const promotion = await prisma.promotion.update({
        where: { id: request.params.id },
        data: request.body,
        include: { product: true }
      });
      return reply.code(200).send(promotion);
    } catch {
      return reply.code(404).send({ error: 'Promotion not found' });
    }
  });
}
