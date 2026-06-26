import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { productSchema } from './product';
import { promotionSchema } from './promotion';

const saleSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  quantity: z.int(),
  product: productSchema,
  promotion: promotionSchema.omit({ product: true }).nullable()
});

const createSaleSchema = z.object({
  productId: z.string(),
  promotionId: z.string().nullable(),
  quantity: z.number(),
})

const responseSaleSchema = saleSchema.extend({ totalValue: z.number() })

const errorSchema = z.object({ error: z.string() })

export async function saleRoutes(fastify: FastifyInstance) {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  // CREATE SALE
  app.post('/', {
    onRequest: [fastify.authenticate],
    schema: {
      body: createSaleSchema,
      response: { 201: responseSaleSchema, 400: errorSchema }
    }
  }, async (request, reply) => {
    const { productId, promotionId, quantity } = request.body;

    const [product, promotion] = await Promise.all([
      prisma.product.findUnique({ where: { id: productId } }),
      promotionId ? prisma.promotion.findUnique({ where: { id: promotionId } }) : null
    ])

    if (!product) {
      return reply.status(400).send({ error: 'Product not found' });
    }

    if(quantity < (promotion?.minQuantity || 1)) {
      return reply.status(400).send({ error: 'Quantity smaller than minQuantity' })
    }

    const value = promotion?.value ?? product.value
    const totalValue = value * quantity

    try {
      const sale = await prisma.sale.create({
        data: {
          quantity,
          totalValue,
          productId,
          promotionId
        },
        include: { product: true, promotion: true },
        omit: { productId: true, promotionId: true }
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
      response: { 200: z.array(responseSaleSchema) }
    }
  }, async () => {
    return await prisma.sale.findMany({
      include: { 
        product: true,
        promotion: {
          select: {
            id: true, name: true, value: true,
          }
        }
      }
    });
  });

  app.delete('/:id', {
    onRequest: [fastify.authenticate],
    schema: {
      params: z.object({ id: z.string() }),
      response: { 204: z.null(), 404: errorSchema }
    }
  }, async (request, reply) => {
    try {
      await prisma.sale.delete({ where: { id: request.params.id } });
      return reply.code(204);
    } catch {
      return reply.code(404).send({ error: 'Sale not found' });
    }
  });
}