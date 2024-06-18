// importa o PrismaClient do pacote prisma, instancia o objeto PrismaClient e exporta o mesmo.

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default prisma