import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { promotionFromCents, promotionToCents } from '../lib/money.js';
import { PromotionType } from '../../generated/prisma/enums.js';
import { productFromCents, productSchema } from './product.js';

// Money fields are in reais; PERCENTAGE discountValue is a whole percent (20 = 20%)
export const promotionSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  type: z.enum(PromotionType),
  discountValue: z.number().positive().nullable(),
  totalValue: z.number().positive().nullable(),
  minQuantity: z.int().positive(),
  product: productSchema
});

const errorSchema = z.object({ error: z.string() })

const createPromotionSchema = promotionSchema
  .omit({ id: true, product: true })
  .extend({
    productId: z.string(),
    discountValue: promotionSchema.shape.discountValue.optional(),
    totalValue: promotionSchema.shape.totalValue.optional(),
    minQuantity: promotionSchema.shape.minQuantity.optional(),
  })

type PromotionRules = {
  type: PromotionType;
  discountValue?: number | null;
  totalValue?: number | null;
  minQuantity?: number;
}

/** Returns an error message if the promotion's fields don't fit its type. */
function validatePromotion(p: PromotionRules): string | null {
  switch (p.type) {
    case PromotionType.FIXED:
      if (p.discountValue == null) return 'FIXED promotion requires discountValue';
      break;
    case PromotionType.PERCENTAGE:
      if (p.discountValue == null) return 'PERCENTAGE promotion requires discountValue';
      if (p.discountValue > 100) return 'PERCENTAGE discountValue must be at most 100';
      break;
    case PromotionType.COMBO:
      if (p.totalValue == null) return 'COMBO promotion requires totalValue';
      if ((p.minQuantity ?? 1) < 2) return 'COMBO promotion requires minQuantity of at least 2';
      break;
  }
  return null;
}

type PromotionWithProduct = Parameters<typeof promotionFromCents>[0] & { product: { value: number } };

function toApi<T extends PromotionWithProduct>(promotion: T): T {
  return { ...promotionFromCents(promotion), product: productFromCents(promotion.product) };
}

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
    const error = validatePromotion(request.body);
    if (error) return reply.code(400).send({ error });

    try {
      const promotion = await prisma.promotion.create({
        data: promotionToCents(request.body),
        include: { product: true }
      });
      return reply.code(201).send(toApi(promotion))
    } catch {
      return reply.code(400).send({ error: 'Product not found' });
    }
  });

  // READ ALL PROMOTIONS
  app.get('/', {
    onRequest: [fastify.authenticate],
    schema: {
      response: { 200: z.array(promotionSchema) }
    }
  }, async () => {
    const promotions = await prisma.promotion.findMany({
      include: { product: true }
    });
    return promotions.map(toApi);
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
    return reply.code(200).send(toApi(promotion))
  })

  app.put('/:id', {
    onRequest: [fastify.authenticate],
    schema: {
      params: z.object({ id: z.string() }),
      body: createPromotionSchema.partial(),
      response: { 200: promotionSchema, 400: errorSchema, 404: errorSchema }
    }
  }, async (request, reply) => {
    const existing = await prisma.promotion.findUnique({ where: { id: request.params.id } });
    if (!existing) return reply.code(404).send({ error: 'Promotion not found' });

    // Validate the promotion as it will look after the update (existing values are in cents)
    const merged = { ...promotionFromCents(existing), ...request.body };
    const error = validatePromotion(merged);
    if (error) return reply.code(400).send({ error });

    try {
      const promotion = await prisma.promotion.update({
        where: { id: request.params.id },
        data: promotionToCents({
          ...request.body,
          type: merged.type,
          discountValue: merged.discountValue,
          totalValue: merged.totalValue,
        }),
        include: { product: true }
      });
      return reply.code(200).send(toApi(promotion));
    } catch {
      return reply.code(400).send({ error: 'Product not found' });
    }
  });

  app.delete('/:id', {
    onRequest: [fastify.authenticate],
    schema: {
      params: z.object({ id: z.string() }),
      response: { 204: z.null(), 404: errorSchema }
    }
  }, async (request, reply) => {
    try {
      await prisma.promotion.delete({ where: { id: request.params.id } });
      return reply.code(204).send(null)
    } catch {
      return reply.code(404).send({ error: 'Promotion not found' });
    }
  });
}
