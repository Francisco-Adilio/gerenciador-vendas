import { prisma } from "../lib/prisma.js";

async function defaultEvent() {
  const event = await prisma.event.create({
    data: {
      name: "Festa Junina 2026"
    }
  })

  await prisma.sale.updateMany({
    data: { eventId: event.id }
  })
}

defaultEvent().finally(async () => await prisma.$disconnect())