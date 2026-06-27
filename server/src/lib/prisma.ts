import "dotenv/config";
import { PrismaClient } from "../../generated/prisma/client.js";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const url = process.env.NODE_ENV !== 'production'
  ? process.env.LOCAL_DATABASE_URL
  : process.env.TURSO_DATABASE_URL;

const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  throw new Error("TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be defined");
}

const adapter = new PrismaLibSql({
  url,
  authToken,
});

const prisma = new PrismaClient({ adapter });

export { prisma };