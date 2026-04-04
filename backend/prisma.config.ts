import path from 'path'
import { defineConfig } from 'prisma/config'
import * as dotenv from 'dotenv'

dotenv.config({ path: path.join(__dirname, '.env') })

export default defineConfig({
  earlyAccess: true,
  schema: path.join(__dirname, 'prisma', 'schema.prisma'),
  datasource: {
    url: process.env.DATABASE_URL as string,
  },
})