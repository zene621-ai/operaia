import { PrismaClient } from '@prisma/client'
const db = new PrismaClient()
const clientes = await db.cliente.findMany()
console.log('Clientes:', JSON.stringify(clientes))
await db.$disconnect()