import { prisma } from "@/lib/prisma"

export function propertyPrefix(transactionType: string): string {
  return transactionType === "DIJUAL" ? "RMJL" : "RMSW"
}

export async function generatePropertyCode(
  transactionType: string
): Promise<string> {
  const prefix = propertyPrefix(transactionType)
  const last = await prisma.property.findFirst({
    where: { code: { startsWith: prefix } },
    orderBy: { code: "desc" },
    select: { code: true },
  })
  let num = 0
  if (last?.code) {
    num = parseInt(last.code.slice(prefix.length), 10) || 0
  }
  let code = `${prefix}${String(num + 1).padStart(4, "0")}`
  while (await prisma.property.findUnique({ where: { code } })) {
    num += 1
    code = `${prefix}${String(num + 1).padStart(4, "0")}`
  }
  return code
}
