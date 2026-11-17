import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { saleRoutes } from './sale.js';
import { promotionFromCents } from '../lib/money.js';
import { productFromCents, productSchema } from './product.js';
import { promotionSchema } from './promotion.js';

export const eventSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
});

const errorSchema = z.object({ error: z.string() })

const createEventSchema = eventSchema.omit({ id: true })

const eventProductSchema = productSchema.extend({
  promotions: z.array(promotionSchema.omit({ product: true }))
})

export async function eventRoutes(fastify: FastifyInstance) {
  const app = fastify.withTypeProvider<ZodTypeProvider>();
  
  app.register(saleRoutes, { prefix: '/:eventId/sales' })

  // PRODUCTS LINKED TO THE EVENT (with their promotions)
  app.get('/:id/products', {
    onRequest: [fastify.authenticate],
    schema: {
      params: z.object({ id: z.string() }),
      response: { 200: z.array(eventProductSchema), 404: errorSchema }
    }
  }, async (request, reply) => {
    const event = await prisma.event.findUnique({
      where: { id: request.params.id },
      include: { products: { include: { promotions: true }, orderBy: { name: 'asc' } } }
    })
    if (!event) return reply.code(404).send({ error: 'Event not found' })
    return event.products.map(product => ({
      ...productFromCents(product),
      promotions: product.promotions.map(promotionFromCents)
    }))
  })

  app.post('/:id/products', {
    onRequest: [fastify.authenticate],
    schema: {
      params: z.object({ id: z.string() }),
      body: z.object({ productId: z.string() }),
      response: { 204: z.null(), 404: errorSchema }
    }
  }, async (request, reply) => {
    try {
      await prisma.event.update({
        where: { id: request.params.id },
        data: { products: { connect: { id: request.body.productId } } }
      })
      return reply.code(204).send(null)
    } catch {
      return reply.code(404).send({ error: 'Event or product not found' })
    }
  })

  app.delete('/:id/products/:productId', {
    onRequest: [fastify.authenticate],
    schema: {
      params: z.object({ id: z.string(), productId: z.string() }),
      response: { 204: z.null(), 404: errorSchema }
    }
  }, async (request, reply) => {
    try {
      await prisma.event.update({
        where: { id: request.params.id },
        data: { products: { disconnect: { id: request.params.productId } } }
      })
      return reply.code(204).send(null)
    } catch {
      return reply.code(404).send({ error: 'Event not found' })
    }
  })

  app.post('/', {
    onRequest: [fastify.authenticate],
    schema: {
      body: createEventSchema,
      response: { 201: eventSchema, 500: errorSchema }
    }
  }, async (request, reply) => {
    try {
      const event = await prisma.event.create({ data: request.body });
      return reply.code(201).send(event)
    } catch {
      return reply.code(500).send({ error: 'Failed to create event' });
    }
  });

  app.get('/', {
    onRequest: [fastify.authenticate],
    schema: {
      response: { 200: z.array(eventSchema) }
    }
  }, async () => {
    return await prisma.event.findMany();
  });

  app.get('/:id', {
    onRequest: [fastify.authenticate],
    schema: {
      params: z.object({ id: z.string() }),
      response: { 200: eventSchema, 404: errorSchema }
    }
  }, async (request, reply) => {
    const event = await prisma.event.findUnique({ where: { id: request.params.id }})
    if(!event) return reply.code(404).send({ error: 'Event not found' })
    return reply.code(200).send(event)
  })

  app.put('/:id', {
    onRequest: [fastify.authenticate],
    schema: {
      params: z.object({ id: z.string() }),
      body: createEventSchema.partial(),
      response: { 200: eventSchema, 404: errorSchema }
    }
  }, async (request, reply) => {
    try {
      const event = await prisma.event.update({
        where: { id: request.params.id },
        data: request.body,
      });
      return reply.code(200).send(event);
    } catch {
      return reply.code(404).send({ error: 'Event not found' });
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
      await prisma.event.delete({ where: { id: request.params.id } });
      return reply.code(204).send(null)
    } catch {
      return reply.code(404).send({ error: 'Event not found' });
    }
  });
}
