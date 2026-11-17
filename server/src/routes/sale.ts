import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { calculateItemTotal, fromCents, promotionFromCents } from '../lib/money.js';
import { PaymentMethod } from '../../generated/prisma/enums.js';
import { productFromCents, productSchema } from './product.js';
import { promotionSchema } from './promotion.js';

// All money fields are in reais
const saleItemSchema = z.object({
  id: z.string(),
  quantity: z.int(),
  unitValue: z.number(),
  totalValue: z.number(),
  product: productSchema,
  promotion: promotionSchema.omit({ product: true }).nullable()
});

const saleSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  paymentMethod: z.enum(PaymentMethod),
  totalValue: z.number(),
  items: z.array(saleItemSchema)
});

const createSaleSchema = z.object({
  paymentMethod: z.enum(PaymentMethod),
  items: z.array(z.object({
    productId: z.string(),
    promotionId: z.string().nullable(),
    quantity: z.int().positive(),
  })).min(1),
})

const saleParams = z.object({
  eventId: z.string(),
})

const errorSchema = z.object({ error: z.string() })

const saleInclude = {
  items: { include: { product: true, promotion: true } }
} as const

type SaleWithItems = Awaited<ReturnType<typeof findSalesWithItems>>[number]

function findSalesWithItems(eventId: string) {
  return prisma.sale.findMany({
    where: { eventId },
    orderBy: { createdAt: 'desc' },
    include: saleInclude
  })
}

/** DB sale (cents) -> API sale (reais). */
function saleToApi(sale: SaleWithItems) {
  return {
    id: sale.id,
    createdAt: sale.createdAt,
    paymentMethod: sale.paymentMethod,
    totalValue: fromCents(sale.totalValue),
    items: sale.items.map(item => ({
      id: item.id,
      quantity: item.quantity,
      unitValue: fromCents(item.unitValue),
      totalValue: fromCents(item.totalValue),
      product: productFromCents(item.product),
      promotion: item.promotion && promotionFromCents(item.promotion),
    }))
  }
}

export async function saleRoutes(fastify: FastifyInstance) {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  app.post('/', {
    onRequest: [fastify.authenticate],
    schema: {
      body: createSaleSchema,
      params: saleParams,
      response: { 201: saleSchema, 400: errorSchema }
    }
  }, async (request, reply) => {
    const { paymentMethod, items } = request.body;
    const { eventId } = request.params

    const productIds = [...new Set(items.map(item => item.productId))]
    const promotionIds = [...new Set(items.flatMap(item => item.promotionId ? [item.promotionId] : []))]

    const [event, products, promotions] = await Promise.all([
      prisma.event.findUnique({ where: { id: eventId }, include: { products: { select: { id: true } } } }),
      prisma.product.findMany({ where: { id: { in: productIds } } }),
      prisma.promotion.findMany({ where: { id: { in: promotionIds } } }),
    ])

    if (!event) {
      return reply.status(400).send({ error: 'Event not found' });
    }

    const eventProductIds = new Set(event.products.map(p => p.id))
    const productsById = new Map(products.map(p => [p.id, p]))
    const promotionsById = new Map(promotions.map(p => [p.id, p]))

    const itemsData = []
    for (const item of items) {
      const product = productsById.get(item.productId)
      if (!product) {
        return reply.status(400).send({ error: `Product ${item.productId} not found` });
      }
      if (!eventProductIds.has(product.id)) {
        return reply.status(400).send({ error: `Product ${product.name} is not sold in this event` });
      }

      const promotion = item.promotionId ? promotionsById.get(item.promotionId) : null
      if (item.promotionId && !promotion) {
        return reply.status(400).send({ error: `Promotion ${item.promotionId} not found` });
      }
      if (promotion && promotion.productId !== product.id) {
        return reply.status(400).send({ error: `Promotion ${promotion.id} does not belong to product ${product.id}` });
      }
      if (promotion && item.quantity < promotion.minQuantity) {
        return reply.status(400).send({ error: `Quantity smaller than minQuantity for promotion ${promotion.id}` });
      }

      itemsData.push({
        productId: product.id,
        promotionId: promotion?.id ?? null,
        quantity: item.quantity,
        unitValue: product.value,
        totalValue: calculateItemTotal(product.value, item.quantity, promotion ?? null),
      })
    }

    const totalValue = itemsData.reduce((sum, item) => sum + item.totalValue, 0)

    // Nested create: the sale and all its items are written atomically
    const sale = await prisma.sale.create({
      data: {
        eventId,
        paymentMethod,
        totalValue,
        items: { create: itemsData }
      },
      include: saleInclude
    });

    return reply.code(201).send(saleToApi(sale));
  });

  app.get('/', {
    onRequest: [fastify.authenticate],
    schema: {
      params: saleParams,
      response: { 200: z.object({
        sales: z.array(saleSchema),
      }).transform(data => {
        const totals = data.sales.reduce((acc, sale) => ({
          totalValue: acc.totalValue + sale.totalValue,
          totalQuantity: acc.totalQuantity + sale.items.reduce((sum, item) => sum + item.quantity, 0)
        }), { totalValue: 0, totalQuantity: 0 })

        return {
          sales: data.sales,
          // sum in reais can drift (0.1 + 0.2); round back to 2 decimals
          totalValue: Math.round(totals.totalValue * 100) / 100,
          totalQuantity: totals.totalQuantity,
        }
      })
    }
    }
  }, async (request) => {
    const sales = await findSalesWithItems(request.params.eventId);
    return { sales: sales.map(saleToApi) }
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
      // SaleItems are removed by onDelete: Cascade
      await prisma.sale.delete({ where: { id, eventId } });
      return reply.code(204).send(null)
    } catch {
      return reply.code(404).send({ error: 'Sale not found' });
    }
  });
}
