import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../lib/prisma.js";
import bcrypt from 'bcrypt'

const SALT_ROUNDS = 10
export async function userRoutes(fastify: FastifyInstance) {
  const app = fastify.withTypeProvider<ZodTypeProvider>()  

  app.post(
    '/register',
    {
      schema: {
        body: z.object({
          name: z.string(),
          password: z.string().min(4, "Minimun 4 characters")
        }),
        response: {
          201: z.object({
            name: z.string(),
            password: z.string(),
          }),
          401: z.string(),
          500: z.unknown(),
        }
      }
    },
    async (req, res) => {
      const { name, password } = req.body

      const user = await prisma.user.findUnique({
        where: {
          name: name
        }
      })

      if(user) {
        return res.code(401).send("Already existing name")
      }

      try {
        const hash = await bcrypt.hash(password, SALT_ROUNDS)
        const user = await prisma.user.create({
          data: {
            password: hash,
            name
          }
        })

        return res.code(201).send(user)
      } catch (e) {
        return res.code(500).send(e)
      }
    }
  )

  app.post(
    '/login',
    {
      schema: {
        body: z.object({
          name: z.string(),
          password: z.string().min(4, "Minimun 4 characters")
        })
      }
    },
    async (req, res) => {
      const { name, password } = req.body
      const user = await prisma.user.findUnique({ where: { name: name } })

      const isMatch = user && (await bcrypt.compare(password, user.password))
      if(!isMatch) {
        return res.code(401).send("Invalid name or password")
      }

      const payload = {
        id: user.id,
        name: user.name
      }
      const token = fastify.jwt.sign(payload)

      return { accessToken: token }
    }
)
}