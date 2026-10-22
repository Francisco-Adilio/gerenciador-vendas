import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { productSchema } from './product.js';
import { promotionSchema } from './promotion.js';

const saleSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  quantity: z.int(),
  paymentMethod: z.string(),
  product: productSchema,
  promotion: promotionSchema.omit({ product: true }).nullable()
});

const createSaleSchema = z.object({
  productId: z.string(),
  promotionId: z.string().nullable(),
  quantity: z.number(),
  paymentMethod: z.string(),
})

const saleParams = z.object({
  eventId: z.string(),
})

const responseSaleSchema = saleSchema.extend({ totalValue: z.number() })

const errorSchema = z.object({ error: z.string() })

export async function saleRoutes(fastify: FastifyInstance) {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  app.post('/', {
    onRequest: [fastify.authenticate],
    schema: {
      body: createSaleSchema,
      params: saleParams,
      response: { 201: responseSaleSchema, 400: errorSchema }
    }
  }, async (request, reply) => {
    const { productId, promotionId, quantity, paymentMethod } = request.body;
    const { eventId } = request.params

    const [product, promotion, event] = await Promise.all([
      prisma.product.findUnique({ where: { id: productId } }),
      promotionId ? prisma.promotion.findUnique({ where: { id: promotionId } }) : null,
      prisma.event.findUnique({ where: { id: eventId } })
    ])

    if (!event) {
      return reply.status(400).send({ error: 'Event not found' });
    }

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
          paymentMethod,
          eventId,
          productId,
          promotionId
        },
        include: { product: true, promotion: true },
        omit: { productId: true, promotionId: true, eventId: true }
      });
      return reply.code(201).send(sale);
    } catch(e) {
      return reply.code(400).send({ error: 'Invalid product or promotion association' });
    }
  });

  app.get('/', {
    onRequest: [fastify.authenticate],
    schema: {
      params: saleParams,
      response: { 200: z.object({
        sales: z.array(responseSaleSchema),
      }).transform(data => {
        const totals = data.sales.reduce((acc, sale) => {
          return {
            totalValue: acc.totalValue + sale.totalValue,
            totalQuantity: acc.totalQuantity + sale.quantity
          }
        }, { totalValue: 0, totalQuantity: 0 })
      
        return {
          sales: data.sales,
          totalValue: totals.totalValue,
          totalQuantity: totals.totalQuantity,
        }
      })
    }
    }
  }, async (request, reply) => {
    const { eventId } = request.params
    const sales = await prisma.sale.findMany({
      where: { eventId },
      orderBy: { createdAt: 'desc' },
      include: { 
        product: true,
        promotion: {
          select: {
            id: true, name: true, value: true,
          }
        }
      }
    });

    return { sales }
  });

  app.delete('/:id', {
    onRequest: [fastify.authenticate],
    schema: {
      params: saleParams.extend({ id: z.string() }),
      response: { 204: z.null(), 404: errorSchema }
    }
  }, async (request, reply) => {
    const { eventId, id } = request.params
    try {
      await prisma.sale.delete({ where: { id, eventId } });
      return reply.code(204).send(null)
    } catch {
      return reply.code(404).send({ error: 'Sale not found' });
    }
  });
}