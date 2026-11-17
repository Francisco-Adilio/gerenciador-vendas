import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js'
import { fromCents, toCents } from '../lib/money.js';

// Schemas reutilizáveis
export const productSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  value: z.number().positive(),
});

const createProductSchema = productSchema.omit({ id: true });
const updateProductSchema = createProductSchema.partial();

const errorSchema = z.object({
  error: z.string()
});

/** DB product (cents) -> API product (reais). */
export function productFromCents<T extends { value: number }>(product: T): T {
  return { ...product, value: fromCents(product.value) };
}

export async function productRoutes(fastify: FastifyInstance) {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  // CREATE
  app.post('/', {
    onRequest: [fastify.authenticate],
    schema: {
      body: createProductSchema,
      response: { 201: productSchema }
    }
  }, async (request, reply) => {
    const product = await prisma.product.create({
      data: { ...request.body, value: toCents(request.body.value) }
    });
    return reply.code(201).send(productFromCents(product));
  });

  // READ ALL
  app.get('/', {
    onRequest: [fastify.authenticate],
    schema: {
      response: { 200: z.array(productSchema) }
    }
  }, async () => {
    const products = await prisma.product.findMany();
    return products.map(productFromCents);
  });

  // READ ONE
  app.get('/:id', {
    onRequest: [fastify.authenticate],
    schema: {
      params: z.object({ id: z.string() }),
      response: { 200: productSchema, 404: errorSchema }
    }
  }, async (request, reply) => {
    const product = await prisma.product.findUnique({ where: { id: request.params.id } });
    if (!product) return reply.code(404).send({ error: 'Product not found' });
    return productFromCents(product);
  });

  // UPDATE
  app.put('/:id', {
    onRequest: [fastify.authenticate],
    schema: {
      params: z.object({ id: z.string() }),
      body: updateProductSchema,
      response: { 200: productSchema, 404: errorSchema }
    }
  }, async (request, reply) => {
    const { value, ...rest } = request.body;
    try {
      const product = await prisma.product.update({
        where: { id: request.params.id },
        data: { ...rest, ...(value !== undefined && { value: toCents(value) }) },
      });
      return productFromCents(product);
    } catch {
      return reply.code(404).send({ error: 'Product not found' });
    }
  });

  // DELETE
  app.delete('/:id', {
    onRequest: [fastify.authenticate],
    schema: {
      params: z.object({ id: z.string() }),
      response: { 204: z.null(), 404: errorSchema }
    }
  }, async (request, reply) => {
    try {
      await prisma.product.delete({ where: { id: request.params.id } });
      return reply.code(204).send(null);
    } catch {
      return reply.code(404).send({ error: 'Produto não encontrado ou em uso (possui vendas ou promoções).' });
    }
  });
}
