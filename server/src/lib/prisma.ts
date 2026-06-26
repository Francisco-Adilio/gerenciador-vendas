import "dotenv/config";
import { PrismaClient } from "../../generated/prisma/client.js";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  throw new Error("TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be defined");
}

const libsqlClient = createClient({ url, authToken });

const adapter = new PrismaLibSql(libsqlClient as any);

const prisma = new PrismaClient({ adapter });

export { prisma };