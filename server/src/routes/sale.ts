import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { prisma } from '../lib/prisma';

const saleSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  productId: z.string(),
  promotionId: z.string().nullable(),
});

const createSaleSchema = saleSchema.omit({ id: true, createdAt: true }).extend({
  promotionId: z.string().optional(),
});

const errorSchema = z.object({ error: z.string() })

export async function saleRoutes(fastify: FastifyInstance) {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  // CREATE SALE
  app.post('/', {
    onRequest: [fastify.authenticate],
    schema: {
      body: createSaleSchema,
      response: { 201: saleSchema, 400: errorSchema }
    }
  }, async (request, reply) => {
    const { productId, promotionId } = request.body;
    
    try {
      const sale = await prisma.sale.create({
        data: {
          productId,
          promotionId: promotionId || null,
        },
      });
      return reply.code(201).send(sale);
    } catch {
      return reply.code(400).send({ error: 'Invalid product or promotion association' });
    }
  });

  // READ ALL SALES
  app.get('/', {
    onRequest: [fastify.authenticate],
    schema: {
      response: { 200: z.array(saleSchema) }
    }
  }, async () => {
    return await prisma.sale.findMany();
  });
}