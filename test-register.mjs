import { PrismaClient } from "@prisma/client"
import { PrismaLibSql } from "@prisma/adapter-libsql"
import bcrypt from "bcryptjs"

const client = new PrismaClient({
  adapter: new PrismaLibSql({
    url: "libsql://unaysale-herdianc.aws-ap-northeast-1.turso.io",
    authToken: "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODkwMDkwODYsImlkIjoiMDFhMDg5M2UtMjAwMS03OTMzLTk5YjMtMTc5ZjllZjk2YTM4Iiwia2lkIjoiUGg0blV4WEJGd3pyVU1YdXdFakhmR2dETFpDNFhkU081cExpa3FYbTRFOCIsInJpZCI6IjhlZDE0MWNhLWI2YWItNDM2ZS04NzNhLWVlMmQ1OTdiMGIwMSJ9.q1YIbw2YGzk0OC7bJTIdfIbjl0XGa18QPi32j_O8V-18zSEqtkXaAyCC5BBz1KzWAF9f4nIVLQTC0Er1UjRNDw"
  })
})

try {
  const hashed = await bcrypt.hash("Test1234", 12)
  const user = await client.user.create({
    data: {
      name: "TestDirect",
      email: `test${Date.now()}@test.com`,
      password: hashed,
      phone: "085775443119"
    }
  })
  console.log("created", user.email)
  const count = await client.user.count()
  console.log("count", count)
} catch(e) {
  console.error("ERROR", e)
  console.error(e.message)
} finally {
  await client.$disconnect()
}
