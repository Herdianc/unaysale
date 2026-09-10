import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import path from 'path';
const dbPath = path.join(process.cwd(), 'dev.db');
const adapter = new PrismaBetterSqlite3({ url: dbPath });
const prisma = new PrismaClient({ adapter });

const popularCities = [
  { name: "Bekasi", slug: "bekasi" },
  { name: "Jakarta", slug: "jakarta" },
  { name: "Bogor", slug: "bogor" },
  { name: "Depok", slug: "depok" },
  { name: "Tangerang", slug: "tangerang" },
  { name: "Bandung", slug: "bandung" },
]

const propertyInclude = {
  images: { where: { isPrimary: true }, take: 1 },
  category: true,
  district: { include: { city: { include: { province: true } } } },
  village: true,
  specs: true,
}

console.log('starting queries...');
const start = Date.now();
try {
  const [latestProperties, featuredProperties, categories, cityPropertyCounts] =
    await Promise.all([
      prisma.property.findMany({
        where: { status: "ACTIVE" },
        include: propertyInclude,
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
      prisma.property.findMany({
        where: { status: "ACTIVE", isFeatured: true },
        include: propertyInclude,
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
      prisma.category.findMany({
        where: { isActive: true },
        include: { _count: { select: { properties: true } } },
        orderBy: { name: "asc" },
      }),
      Promise.all(
        popularCities.map(async (city) => {
          const district = await prisma.district.findFirst({
            where: { slug: city.slug },
            select: { id: true },
          })
          if (!district) return { ...city, count: 0 }
          const count = await prisma.property.count({
            where: { districtId: district.id, status: "ACTIVE" },
          })
          return { ...city, count }
        })
      ),
    ])
  console.log('done in', Date.now()-start, 'ms');
  console.log('latest', latestProperties.length);
  console.log('featured', featuredProperties.length);
  console.log('categories', categories.length);
  console.log('cityCounts', cityPropertyCounts);
} catch(e) {
  console.error('ERR', e);
  console.error(e.stack);
}
