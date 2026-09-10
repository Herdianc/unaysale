import { PrismaClient } from "@prisma/client"
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3"
import { PrismaLibSQL } from "@prisma/adapter-libsql"
import bcrypt from "bcryptjs"
import path from "path"

function getPrismaClient() {
  const tursoUrl = process.env.TURSO_DATABASE_URL
  const tursoToken = process.env.TURSO_AUTH_TOKEN
  if (tursoUrl && tursoToken) {
    return new PrismaClient({ adapter: new PrismaLibSQL({ url: tursoUrl, authToken: tursoToken }) })
  }
  if (process.env.DATABASE_URL?.startsWith("libsql://") || process.env.DATABASE_URL?.startsWith("https://")) {
    return new PrismaClient({ adapter: new PrismaLibSQL({ url: process.env.DATABASE_URL!, authToken: tursoToken }) })
  }
  const dbPath = process.env.DATABASE_URL?.startsWith("file:")
    ? process.env.DATABASE_URL.replace("file:", "")
    : path.join(process.cwd(), "dev.db")
  const url = dbPath.startsWith("/") || dbPath.includes(":") ? dbPath : path.join(process.cwd(), dbPath)
  return new PrismaClient({ adapter: new PrismaBetterSqlite3({ url }) })
}
const prisma = getPrismaClient()

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

async function main() {
  console.log("🌱 Seeding database...")

  const hashedPassword = await bcrypt.hash("Password123", 10)

  // ── USERS ──
  console.log("👤 Creating users...")

  const admin = await prisma.user.create({
    data: {
      name: "Admin UNAYSALE",
      email: "admin@unaysale.id",
      password: hashedPassword,
      phone: "+6281200000001",
      role: "SUPER_ADMIN",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
    },
  })

  const agentUserData = [
    { name: "Budi Santoso", email: "agent1@example.com", phone: "+6281200000002" },
    { name: "Siti Rahayu", email: "agent2@example.com", phone: "+6281200000003" },
    { name: "Andi Pratama", email: "agent3@example.com", phone: "+6281200000004" },
    { name: "Dewi Lestari", email: "agent4@example.com", phone: "+6281200000005" },
    { name: "Rizki Firmansyah", email: "agent5@example.com", phone: "+6281200000006" },
  ]

  const agentUsers = []
  for (const data of agentUserData) {
    const user = await prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
        role: "AGENT",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
      },
    })
    agentUsers.push(user)
  }

  const regularUserData = [
    { name: "Rina Wulandari", email: "user1@example.com", phone: "+6281200000007" },
    { name: "Hendra Kusuma", email: "user2@example.com", phone: "+6281200000008" },
    { name: "Maya Putri", email: "user3@example.com", phone: "+6281200000009" },
    { name: "Arief Budiman", email: "user4@example.com", phone: "+6281200000010" },
  ]

  const regularUsers = []
  for (const data of regularUserData) {
    const user = await prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
        role: "USER",
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200",
      },
    })
    regularUsers.push(user)
  }

  // ── AGENT PROFILES ──
  console.log("🏢 Creating agent profiles...")

  const agentProfilesData = [
    {
      userId: agentUsers[0].id,
      companyName: "Properti Jaya Abadi",
      bio: "Agen properti berpengalaman lebih dari 10 tahun melayani klien di area Jabodetabek. Spesialis rumah dan apartemen premium.",
      license: "SIUP-2024-001",
      isVerified: true,
      rating: 4.8,
      totalSales: 156,
    },
    {
      userId: agentUsers[1].id,
      companyName: "Rumah Sejahtera",
      bio: "Ahli properti residential dengan fokus pada rumah keluarga modern. Selalu mengutamakan kepuasan pelanggan.",
      license: "SIUP-2024-002",
      isVerified: true,
      rating: 4.6,
      totalSales: 98,
    },
    {
      userId: agentUsers[2].id,
      companyName: "Properti Mas Syariah",
      bio: "Spesialis properti syariah di area Jawa Barat dan Banten. Transaksi aman sesuai prinsip syariah.",
      license: "SIUP-2024-003",
      isVerified: true,
      rating: 4.7,
      totalSales: 72,
    },
    {
      userId: agentUsers[3].id,
      companyName: "Griya Nusantara Property",
      bio: "Agen muda berbakat dengan pengetahuan luas tentang pasar properti Jakarta Selatan dan Depok.",
      license: "SIUP-2024-004",
      isVerified: false,
      rating: 4.3,
      totalSales: 34,
    },
    {
      userId: agentUsers[4].id,
      companyName: "Sentosa Property Group",
      bio: "Tim agen profesional yang melayani jual beli dan sewa properti komersial serta residensial.",
      license: "SIUP-2024-005",
      isVerified: false,
      rating: 4.1,
      totalSales: 21,
    },
  ]

  const agents = []
  for (const data of agentProfilesData) {
    const agent = await prisma.agent.create({ data })
    agents.push(agent)
  }

  // ── CATEGORIES ──
  console.log("📂 Creating categories...")

  const categoriesData = [
    { name: "Rumah", slug: "rumah", description: "Rumah tinggal atau hunian", icon: "Home" },
    { name: "Apartemen", slug: "apartemen", description: "Unit apartemen dan flat", icon: "Building" },
    { name: "Tanah", slug: "tanah", description: "Lahan dan tanah kosong", icon: "Mountain" },
    { name: "Ruko", slug: "ruko", description: "Rumah toko komersial", icon: "Store" },
    { name: "Villa", slug: "villa", description: "Villa dan penginapan", icon: "Castle" },
    { name: "Gudang", slug: "gudang", description: "Gudang dan pergudangan", icon: "Warehouse" },
    { name: "Kantor", slug: "kantor", description: "Ruang kantor dan perkantoran", icon: "Briefcase" },
    { name: "Pabrik", slug: "pabrik", description: "Pabrik dan industri", icon: "Factory" },
    { name: "Kost", slug: "kost", description: "Rumah kost dan kos-kosan", icon: "BedDouble" },
    { name: "Properti Lainnya", slug: "properti-lainnya", description: "Jenis properti lainnya", icon: "Building2" },
  ]

  const categories = []
  for (const data of categoriesData) {
    const cat = await prisma.category.create({ data })
    categories.push(cat)
  }
  const catBySlug = Object.fromEntries(categories.map((c) => [c.slug, c]))

  // ── PROVINCES ──
  console.log("🗺️  Creating provinces...")

  const provincesData = [
    { name: "DKI Jakarta", slug: "dki-jakarta" },
    { name: "Jawa Barat", slug: "jawa-barat" },
    { name: "Banten", slug: "banten" },
    { name: "Jawa Timur", slug: "jawa-timur" },
    { name: "Jawa Tengah", slug: "jawa-tengah" },
    { name: "DIY", slug: "diy" },
  ]

  const provinces = []
  for (const data of provincesData) {
    const prov = await prisma.province.create({ data })
    provinces.push(prov)
  }
  const provBySlug = Object.fromEntries(provinces.map((p) => [p.slug, p]))

  // ── CITIES ──
  console.log("🏙️  Creating cities...")

  const citiesData: Record<string, { name: string; slug: string }[]> = {
    "dki-jakarta": [
      { name: "Jakarta Pusat", slug: "jakarta-pusat" },
      { name: "Jakarta Selatan", slug: "jakarta-selatan" },
      { name: "Jakarta Barat", slug: "jakarta-barat" },
      { name: "Jakarta Timur", slug: "jakarta-timur" },
      { name: "Jakarta Utara", slug: "jakarta-utara" },
    ],
    "jawa-barat": [
      { name: "Bekasi", slug: "bekasi" },
      { name: "Bogor", slug: "bogor" },
      { name: "Depok", slug: "depok" },
      { name: "Bandung", slug: "bandung" },
      { name: "Cimahi", slug: "cimahi" },
    ],
    banten: [
      { name: "Tangerang", slug: "tangerang" },
      { name: "Tangerang Selatan", slug: "tangerang-selatan" },
      { name: "Serang", slug: "serang" },
      { name: "Cilegon", slug: "cilegon" },
    ],
    "jawa-timur": [
      { name: "Surabaya", slug: "surabaya" },
      { name: "Malang", slug: "malang" },
      { name: "Sidoarjo", slug: "sidoarjo" },
    ],
    "jawa-tengah": [
      { name: "Semarang", slug: "semarang" },
      { name: "Solo", slug: "solo" },
    ],
    diy: [
      { name: "Yogyakarta", slug: "yogyakarta" },
      { name: "Sleman", slug: "sleman" },
      { name: "Bantul", slug: "bantul" },
    ],
  }

  const allCities: { id: string; name: string; slug: string; provinceSlug: string }[] = []
  for (const [provSlug, cities] of Object.entries(citiesData)) {
    for (const city of cities) {
      const c = await prisma.city.create({
        data: { ...city, provinceId: provBySlug[provSlug].id },
      })
      allCities.push({ ...c, provinceSlug: provSlug })
    }
  }

  // ── DISTRICTS ──
  console.log("📍 Creating districts...")

  const districtMap: Record<string, { name: string; slug: string }[]> = {
    "jakarta-pusat": [
      { name: "Menteng", slug: "menteng" },
      { name: "Tanah Abang", slug: "tanah-abang" },
      { name: "Senen", slug: "senen" },
    ],
    "jakarta-selatan": [
      { name: "Kebayoran Baru", slug: "kebayoran-baru" },
      { name: "Pancoran", slug: "pancoran" },
      { name: "Tebet", slug: "tebet" },
    ],
    "jakarta-barat": [
      { name: "Grogol Petamburan", slug: "grogol-petamburan" },
      { name: "Kembangan", slug: "kembangan" },
      { name: "Palmerah", slug: "palmerah" },
    ],
    "jakarta-timur": [
      { name: "Matraman", slug: "matraman" },
      { name: "Jatinegara", slug: "jatinegara" },
      { name: "Kramat Jati", slug: "kramat-jati" },
    ],
    "jakarta-utara": [
      { name: "Kelapa Gading", slug: "kelapa-gading" },
      { name: "Tanjung Priok", slug: "tanjung-priok" },
      { name: "Koja", slug: "koja" },
    ],
    bekasi: [
      { name: "Bekasi Timur", slug: "bekasi-timur" },
      { name: "Bekasi Barat", slug: "bekasi-barat" },
      { name: "Bekasi Utara", slug: "bekasi-utara" },
      { name: "Bekasi Selatan", slug: "bekasi-selatan" },
    ],
    bogor: [
      { name: "Bogor Tengah", slug: "bogor-tengah" },
      { name: "Bogor Utara", slug: "bogor-utara" },
      { name: "Bogor Selatan", slug: "bogor-selatan" },
    ],
    depok: [
      { name: "Depok Timur", slug: "depok-timur" },
      { name: "Depok Barat", slug: "depok-barat" },
      { name: "Pancoran Mas", slug: "pancoran-mas" },
      { name: "Sukmajaya", slug: "sukmajaya" },
    ],
    bandung: [
      { name: "Bandung Kulon", slug: "bandung-kulon" },
      { name: "Coblong", slug: "coblong" },
      { name: "Batununggal", slug: "batununggal" },
    ],
    cimahi: [
      { name: "Cimahi Tengah", slug: "cimahi-tengah" },
      { name: "Cimahi Utara", slug: "cimahi-utara" },
      { name: "Cimahi Selatan", slug: "cimahi-selatan" },
    ],
    tangerang: [
      { name: "Tangerang Kota", slug: "tangerang-kota" },
      { name: "Karawaci", slug: "karawaci" },
      { name: "Cipondoh", slug: "cipondoh" },
    ],
    "tangerang-selatan": [
      { name: "Serpong", slug: "serpong" },
      { name: "Pamulang", slug: "pamulang" },
      { name: "Bintaro", slug: "bintaro" },
      { name: "Ciputat", slug: "ciputat" },
    ],
    serang: [
      { name: "Serang Kota", slug: "serang-kota" },
      { name: "Kasemen", slug: "kasemen" },
      { name: "Taktakan", slug: "taktakan" },
    ],
    cilegon: [
      { name: "Cilegon Kota", slug: "cilegon-kota" },
      { name: "Jombang", slug: "jombang" },
      { name: "Pulomerak", slug: "pulomerak" },
    ],
    surabaya: [
      { name: "Gubeng", slug: "gubeng" },
      { name: "Wonokromo", slug: "wonokromo" },
      { name: "Tandes", slug: "tandes" },
    ],
    malang: [
      { name: "Klojen", slug: "klojen" },
      { name: "Sukun", slug: "sukun" },
      { name: "Blimbing", slug: "blimbing" },
    ],
    sidoarjo: [
      { name: "Sidoarjo Kota", slug: "sidoarjo-kota" },
      { name: "Griya Penta", slug: "griya-penta" },
      { name: "Taman", slug: "taman" },
    ],
    semarang: [
      { name: "Semarang Tengah", slug: "semarang-tengah" },
      { name: "Semarang Selatan", slug: "semarang-selatan" },
      { name: "Gajah Mungkur", slug: "gajah-mungkur" },
    ],
    solo: [
      { name: "Banjarsari", slug: "banjarsari" },
      { name: "Jebres", slug: "jebres" },
      { name: "Laweyan", slug: "laweyan" },
    ],
    yogyakarta: [
      { name: "Gondokusuman", slug: "gondokusuman" },
      { name: "Danurejan", slug: "danurejan" },
      { name: "Ngampilan", slug: "ngampilan" },
    ],
    sleman: [
      { name: "Depok", slug: "depok-sleman" },
      { name: "Godean", slug: "godean" },
      { name: "Mlati", slug: "mlati" },
    ],
    bantul: [
      { name: "Bantul Kota", slug: "bantul-kota" },
      { name: "Sewon", slug: "sewon" },
      { name: "Banguntapan", slug: "banguntapan" },
    ],
  }

  const allDistricts: {
    id: string
    name: string
    slug: string
    citySlug: string
    provinceSlug: string
  }[] = []

  for (const city of allCities) {
    const districts = districtMap[city.slug] || [
      { name: `${city.name} Pusat`, slug: `${city.slug}-pusat` },
    ]
    for (const dist of districts) {
      const d = await prisma.district.create({
        data: { ...dist, cityId: city.id },
      })
      allDistricts.push({ ...d, citySlug: city.slug, provinceSlug: city.provinceSlug })
    }
  }

  // ── VILLAGES ──
  console.log("🏘️  Creating villages...")

  const allVillages: { id: string; name: string; slug: string; districtId: string }[] = []
  const villageSuffixes = [" Utara", " Selatan", " Barat", " Timur", ""]
  for (const dist of allDistricts) {
    const numVillages = 3 + (Math.abs(dist.id.charCodeAt(0)) % 3)
    for (let i = 0; i < numVillages; i++) {
      const vName = `${dist.name}${villageSuffixes[i] || ""}`.trim()
      const vSlug = slugify(vName)
      const v = await prisma.village.create({
        data: { name: vName, slug: vSlug, districtId: dist.id },
      })
      allVillages.push(v)
    }
  }

  // ── FACILITIES ──
  console.log("🏊 Creating facilities...")

  const facilitiesData = [
    { name: "Carport", slug: "carport", icon: "Car" },
    { name: "Garasi", slug: "garasi", icon: "ParkingSquare" },
    { name: "Kolam Renang", slug: "kolam-renang", icon: "Waves" },
    { name: "Taman", slug: "taman", icon: "TreePine" },
    { name: "Balkon", slug: "balkon", icon: "Landmark" },
    { name: "CCTV", slug: "cctv", icon: "Camera" },
    { name: "AC", slug: "ac", icon: "Snowflake" },
    { name: "Furnished", slug: "furnished", icon: "Armchair" },
    { name: "Security", slug: "security", icon: "ShieldCheck" },
    { name: "One Gate System", slug: "one-gate-system", icon: "DoorOpen" },
    { name: "Gym", slug: "gym", icon: "Dumbbell" },
    { name: "Jogging Track", slug: "jogging-track", icon: "Footprints" },
    { name: "Club House", slug: "club-house", icon: "Users" },
    { name: "Masjid", slug: "masjid", icon: "Landmark" },
    { name: "Lapangan", slug: "lapangan", icon: "RectangleHorizontal" },
  ]

  const facilities: { id: string; name: string; slug: string; icon: string | null }[] = []
  for (const data of facilitiesData) {
    const fac = await prisma.facility.create({ data })
    facilities.push(fac)
  }

  // ── PROPERTIES ──
  console.log("🏠 Creating properties...")

  const propertyImages = [
    "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800",
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800",
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800",
    "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800",
  ]

  const cityCoords: Record<string, [number, number]> = {
    "jakarta-pusat": [-6.1751, 106.865],
    "jakarta-selatan": [-6.2615, 106.8106],
    "jakarta-barat": [-6.1681, 106.7595],
    "jakarta-timur": [-6.225, 106.9],
    "jakarta-utara": [-6.1219, 106.8748],
    bekasi: [-6.2349, 106.9896],
    bogor: [-6.5944, 106.7892],
    depok: [-6.4025, 106.7942],
    bandung: [-6.9175, 107.6191],
    cimahi: [-6.8822, 107.5369],
    tangerang: [-6.1781, 106.6319],
    "tangerang-selatan": [-6.2939, 106.7333],
    serang: [-6.1203, 106.1503],
    cilegon: [-6.0034, 106.0481],
    surabaya: [-7.2575, 112.7521],
    malang: [-7.9666, 112.6326],
    sidoarjo: [-7.4478, 112.7184],
    semarang: [-6.9666, 110.4196],
    solo: [-7.5755, 110.8243],
    yogyakarta: [-7.7956, 110.3695],
    sleman: [-7.7166, 110.3556],
    bantul: [-7.8888, 110.3289],
  }

  function jitterCoord(coord: number, range: number): number {
    return coord + (Math.random() - 0.5) * range
  }

  function jitterCoords(base: [number, number]): [number, number] {
    return [jitterCoord(base[0], 0.02), jitterCoord(base[1], 0.02)]
  }

  function findDistrict(citySlug: string) {
    return allDistricts.find((d) => d.citySlug === citySlug)!
  }

  function findVillage(districtId: string) {
    return allVillages.find((v) => v.districtId === districtId)!
  }

  const allUserIds = [...agentUsers.map((u) => u.id), ...regularUsers.map((u) => u.id)]

  interface PropertySeed {
    title: string
    slug: string
    description: string
    transactionType: "DIJUAL" | "DISEWA"
    status: "ACTIVE" | "PENDING" | "DRAFT"
    price: number
    priceNegotiable: boolean
    isFeatured: boolean
    categorySlug: string
    userIndex: number
    agentIndex: number | null
    citySlug: string
    address: string
    views: number
    specs: {
      landArea: number
      buildingArea: number
      bedrooms: number
      bathrooms: number
      floors: number
      carport: number
      garage: number
    }
    legalities: { certificate: string; pbb: boolean; imb: boolean }
    facilityIndices: number[]
    imageIndices: number[]
  }

  const propertiesData: PropertySeed[] = [
    // ─── RUMAH (12) ───
    {
      title: "Rumah Minimalis Modern 3 Kamar di Bekasi Timur",
      slug: "rumah-minimalis-modern-3-kamar-bekasi-timur",
      description:
        "Rumah minimalis modern dengan 3 kamar tidur dan 2 kamar mandi. Lokasi strategis dekat tol Bekasi Timur, akses mudah ke pusat perbelanjaan dan sekolah. Lingkungan aman dan nyaman untuk keluarga.",
      transactionType: "DIJUAL",
      status: "ACTIVE",
      price: 850000000,
      priceNegotiable: true,
      isFeatured: true,
      categorySlug: "rumah",
      userIndex: 0,
      agentIndex: 0,
      citySlug: "bekasi",
      address: "Jl. Raya Bekasi Timur No. 45, Bekasi",
      views: 234,
      specs: { landArea: 120, buildingArea: 90, bedrooms: 3, bathrooms: 2, floors: 2, carport: 1, garage: 0 },
      legalities: { certificate: "SHM", pbb: true, imb: true },
      facilityIndices: [0, 3, 8, 9],
      imageIndices: [0, 1, 2],
    },
    {
      title: "Rumah Mewah 2 Lantai Jakarta Selatan",
      slug: "rumah-mewah-2-lantai-jakarta-selatan",
      description:
        "Rumah mewah 2 lantai di kawasan premium Jakarta Selatan. Dilengkapi kolam renang pribadi, taman asri, dan garasi mobil. Dekat dengan Mall Pondok Indah dan RS Pondok Indah.",
      transactionType: "DIJUAL",
      status: "ACTIVE",
      price: 3500000000,
      priceNegotiable: true,
      isFeatured: true,
      categorySlug: "rumah",
      userIndex: 1,
      agentIndex: 1,
      citySlug: "jakarta-selatan",
      address: "Jl. Ampera Raya No. 12, Kebayoran Baru, Jakarta Selatan",
      views: 567,
      specs: { landArea: 300, buildingArea: 250, bedrooms: 4, bathrooms: 3, floors: 2, carport: 2, garage: 1 },
      legalities: { certificate: "SHM", pbb: true, imb: true },
      facilityIndices: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
      imageIndices: [0, 3, 4, 5],
    },
    {
      title: "Rumah Tropis Hijau Depok Barat",
      slug: "rumah-tropis-hijau-depok-barat",
      description:
        "Rumah tropis dengan konsep hijau di Depok Barat. Suasana asri dengan pepohonan rindang, cocok untuk keluarga yang menginginkan ketenangan. Dekat stasiun KRL dan universitas.",
      transactionType: "DIJUAL",
      status: "ACTIVE",
      price: 650000000,
      priceNegotiable: false,
      isFeatured: false,
      categorySlug: "rumah",
      userIndex: 2,
      agentIndex: 2,
      citySlug: "depok",
      address: "Jl. Mawar Indah No. 8, Depok Barat",
      views: 123,
      specs: { landArea: 100, buildingArea: 72, bedrooms: 2, bathrooms: 2, floors: 1, carport: 1, garage: 0 },
      legalities: { certificate: "SHGB", pbb: true, imb: false },
      facilityIndices: [3, 8],
      imageIndices: [1, 2, 3],
    },
    {
      title: "Rumah Cluster Modern Bogor Utara",
      slug: "rumah-cluster-modern-bogor-utara",
      description:
        "Rumah cluster modern di kawasan Bogor Utara dengan one gate system dan keamanan 24 jam. Desain contemporary minimalis, cocok untuk first home buyer. Harga promo untuk 5 pembeli pertama.",
      transactionType: "DIJUAL",
      status: "ACTIVE",
      price: 750000000,
      priceNegotiable: true,
      isFeatured: true,
      categorySlug: "rumah",
      userIndex: 3,
      agentIndex: 3,
      citySlug: "bogor",
      address: "Jl. Cimahpar Raya No. 23, Bogor Utara",
      views: 345,
      specs: { landArea: 110, buildingArea: 80, bedrooms: 3, bathrooms: 2, floors: 2, carport: 1, garage: 0 },
      legalities: { certificate: "SHM", pbb: true, imb: true },
      facilityIndices: [0, 9, 8, 3],
      imageIndices: [0, 4, 5],
    },
    {
      title: "Rumah Subsidi Bersubsidi Cimahi",
      slug: "rumah-subsidi-cimahi",
      description:
        "Rumah subsidi harga terjangkau di Cimahi. Cicilan ringan mulai 800 ribuan per bulan. Akses dekat jalan raya utama dan terminal Cimahi. Ideal untuk investasi atau hunian pertama.",
      transactionType: "DIJUAL",
      status: "ACTIVE",
      price: 350000000,
      priceNegotiable: false,
      isFeatured: false,
      categorySlug: "rumah",
      userIndex: 4,
      agentIndex: 4,
      citySlug: "cimahi",
      address: "Jl. Pahlawan No. 7, Cimahi Tengah",
      views: 89,
      specs: { landArea: 60, buildingArea: 45, bedrooms: 2, bathrooms: 1, floors: 1, carport: 0, garage: 0 },
      legalities: { certificate: "SHGB", pbb: false, imb: false },
      facilityIndices: [],
      imageIndices: [2, 3],
    },
    {
      title: "Rumah Mungil Nyaman Tangerang",
      slug: "rumah-mungil-nyaman-tangerang",
      description:
        "Rumah mungil namun nyaman di Tangerang dekat BSD City. Cocok untuk pasangan muda atau ekspatriat. Area komersial berkembang pesat dengan ROI properti yang tinggi.",
      transactionType: "DIJUAL",
      status: "ACTIVE",
      price: 900000000,
      priceNegotiable: true,
      isFeatured: false,
      categorySlug: "rumah",
      userIndex: 0,
      agentIndex: 0,
      citySlug: "tangerang",
      address: "Jl. BSD Raya No. 31, Tangerang",
      views: 178,
      specs: { landArea: 90, buildingArea: 65, bedrooms: 2, bathrooms: 1, floors: 1, carport: 1, garage: 0 },
      legalities: { certificate: "SHM", pbb: true, imb: true },
      facilityIndices: [0, 3, 9],
      imageIndices: [4, 5, 0],
    },
    {
      title: "Rumah Hook Sudut Jakarta Timur",
      slug: "rumah-hook-sudut-jakarta-timur",
      description:
        "Rumah hook sudut di kawasan ramai Jakarta Timur. Luas tanah lebih besar dari unit lainnya, ventilasi udara dan cahaya alami sangat baik. Cocok untuk investasi jangka panjang.",
      transactionType: "DIJUAL",
      status: "ACTIVE",
      price: 1200000000,
      priceNegotiable: false,
      isFeatured: false,
      categorySlug: "rumah",
      userIndex: 1,
      agentIndex: 1,
      citySlug: "jakarta-timur",
      address: "Jl. Pemuda Raya No. 99, Matraman, Jakarta Timur",
      views: 201,
      specs: { landArea: 150, buildingArea: 110, bedrooms: 3, bathrooms: 2, floors: 2, carport: 1, garage: 1 },
      legalities: { certificate: "SHM", pbb: true, imb: true },
      facilityIndices: [0, 1, 3, 8],
      imageIndices: [5, 0, 1],
    },
    {
      title: "Rumah Type 36 Hemat Bandung",
      slug: "rumah-type-36-hemat-bandung",
      description:
        "Rumah Type 36 hemat energi di Bandung Kulon. Harga sangat terjangkau untuk mahasiswa dan pekerja. Dekat kampus ITB dan Unpad, akses transportasi umum mudah.",
      transactionType: "DIJUAL",
      status: "PENDING",
      price: 420000000,
      priceNegotiable: false,
      isFeatured: false,
      categorySlug: "rumah",
      userIndex: 2,
      agentIndex: 2,
      citySlug: "bandung",
      address: "Jl. Cipedes No. 14, Bandung Kulon",
      views: 67,
      specs: { landArea: 72, buildingArea: 36, bedrooms: 2, bathrooms: 1, floors: 1, carport: 0, garage: 0 },
      legalities: { certificate: "SHGB", pbb: false, imb: false },
      facilityIndices: [],
      imageIndices: [1, 2],
    },
    {
      title: "Rumah Baru Renovasi Surabaya",
      slug: "rumah-baru-renovasi-surabaya",
      description:
        "Rumah baru selesai renovasi total di Surabaya. Plafon baru, keramik granit, dan sanitary ware modern. Siap huni tanpa perlu tambahan biaya lagi.",
      transactionType: "DIJUAL",
      status: "ACTIVE",
      price: 580000000,
      priceNegotiable: true,
      isFeatured: false,
      categorySlug: "rumah",
      userIndex: 3,
      agentIndex: 3,
      citySlug: "surabaya",
      address: "Jl. Ketintang No. 56, Wonokromo, Surabaya",
      views: 145,
      specs: { landArea: 90, buildingArea: 60, bedrooms: 2, bathrooms: 1, floors: 1, carport: 1, garage: 0 },
      legalities: { certificate: "SHM", pbb: true, imb: true },
      facilityIndices: [0, 3],
      imageIndices: [3, 4, 0],
    },
    {
      title: "Rumah Asri Depan Taman Yogyakarta",
      slug: "rumah-asri-depan-taman-yogyakarta",
      description:
        "Rumah asri tepat di depan taman kota Yogyakarta. Lokasi sangat strategis dekan Malioboro dan kampus UGM. Cocok untuk hunian sekaligus investasi kost-kostan.",
      transactionType: "DIJUAL",
      status: "ACTIVE",
      price: 750000000,
      priceNegotiable: true,
      isFeatured: true,
      categorySlug: "rumah",
      userIndex: 4,
      agentIndex: 4,
      citySlug: "yogyakarta",
      address: "Jl. Cik Di Tiro No. 22, Gondokusuman, Yogyakarta",
      views: 312,
      specs: { landArea: 120, buildingArea: 90, bedrooms: 3, bathrooms: 2, floors: 1, carport: 1, garage: 0 },
      legalities: { certificate: "SHM", pbb: true, imb: true },
      facilityIndices: [3, 8, 14],
      imageIndices: [2, 3, 4],
    },
    {
      title: "Rumah Disewakan Bulanan Jakarta Utara",
      slug: "rumah-disewakan-bulanan-jakarta-utara",
      description:
        "Rumah nyaman disewakan bulanan di Jakarta Utara. Furniture lengkap, tinggal bawa koper. Cocok untuk ekspatriat atau profesional muda yang bekerja di kawasan Sunter dan Kelapa Gading.",
      transactionType: "DISEWA",
      status: "ACTIVE",
      price: 15000000,
      priceNegotiable: false,
      isFeatured: false,
      categorySlug: "rumah",
      userIndex: 0,
      agentIndex: 0,
      citySlug: "jakarta-utara",
      address: "Jl. Danau Sunter Utara No. 45, Tanjung Priok",
      views: 89,
      specs: { landArea: 100, buildingArea: 80, bedrooms: 2, bathrooms: 2, floors: 1, carport: 1, garage: 0 },
      legalities: { certificate: "SHM", pbb: true, imb: true },
      facilityIndices: [6, 7, 8],
      imageIndices: [4, 5, 1],
    },
    {
      title: "Rumah Klasik Eropa Serpong Tangerang Selatan",
      slug: "rumah-klasik-eropa-serpong-tangerang-selatan",
      description:
        "Rumah bergaya klasik Eropa di perumahan elit Serpong. Kolam renang pribadi, taman luas, dan akses langsung ke toll Serpong - Bintaro. Kawasan premium dengan fasilitas lengkap.",
      transactionType: "DIJUAL",
      status: "ACTIVE",
      price: 4500000000,
      priceNegotiable: true,
      isFeatured: true,
      categorySlug: "rumah",
      userIndex: 1,
      agentIndex: 1,
      citySlug: "tangerang-selatan",
      address: "Jl. Scientia Boulevard No. 1, Serpong, Tangerang Selatan",
      views: 678,
      specs: { landArea: 400, buildingArea: 350, bedrooms: 5, bathrooms: 4, floors: 3, carport: 3, garage: 1 },
      legalities: { certificate: "SHM", pbb: true, imb: true },
      facilityIndices: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      imageIndices: [0, 1, 3, 4, 5],
    },

    // ─── APARTEMEN (5) ───
    {
      title: "Apartemen Luxury View Kota Jakarta Pusat",
      slug: "apartemen-luxury-view-kota-jakarta-pusat",
      description:
        "Apartemen mewah lantai tinggi dengan pemandangan kota Jakarta yang spektakuler. Fully furnished, akses langsung ke MRT dan mall. Fasilitas premium rooftop pool dan gym.",
      transactionType: "DIJUAL",
      status: "ACTIVE",
      price: 1500000000,
      priceNegotiable: true,
      isFeatured: true,
      categorySlug: "apartemen",
      userIndex: 2,
      agentIndex: 2,
      citySlug: "jakarta-pusat",
      address: "Thamrin Residence Tower A Lt. 28, Jakarta Pusat",
      views: 432,
      specs: { landArea: 0, buildingArea: 65, bedrooms: 2, bathrooms: 2, floors: 0, carport: 0, garage: 0 },
      legalities: { certificate: "HGB", pbb: true, imb: true },
      facilityIndices: [2, 6, 7, 8, 10, 11, 12],
      imageIndices: [0, 2, 4],
    },
    {
      title: "Apartemen Studio Strategis Bekasi",
      slug: "apartemen-studio-strategis-bekasi",
      description:
        "Apartemen studio strategis dekat Stasiun Bekasi. Harga terjangkau untuk investasi atau hunian. Tenanted ready, langsung dapat passive income.",
      transactionType: "DIJUAL",
      status: "ACTIVE",
      price: 500000000,
      priceNegotiable: false,
      isFeatured: false,
      categorySlug: "apartemen",
      userIndex: 3,
      agentIndex: 3,
      citySlug: "bekasi",
      address: "Bekasi Junction Tower Lt. 12, Bekasi Timur",
      views: 234,
      specs: { landArea: 0, buildingArea: 30, bedrooms: 0, bathrooms: 1, floors: 0, carport: 0, garage: 0 },
      legalities: { certificate: "HGB", pbb: false, imb: true },
      facilityIndices: [8, 10, 12],
      imageIndices: [1, 3],
    },
    {
      title: "Apartemen 2BR Fully Furnished Bandung",
      slug: "apartemen-2br-fully-furnished-bandung",
      description:
        "Apartemen 2 bedroom fully furnished di Coblong Bandung. Dekat Factory Outlet Riau dan kampus ITB. Ideal untuk mahasiswa S2 atau profesional muda.",
      transactionType: "DISEWA",
      status: "ACTIVE",
      price: 2500000000,
      priceNegotiable: true,
      isFeatured: false,
      categorySlug: "apartemen",
      userIndex: 0,
      agentIndex: 0,
      citySlug: "bandung",
      address: "Gatsu Premium Tower Lt. 18, Coblong, Bandung",
      views: 156,
      specs: { landArea: 0, buildingArea: 55, bedrooms: 2, bathrooms: 1, floors: 0, carport: 0, garage: 0 },
      legalities: { certificate: "HGB", pbb: true, imb: true },
      facilityIndices: [6, 7, 8, 10],
      imageIndices: [2, 4, 5],
    },
    {
      title: "Apartemen Mungil Dekat Stasiun Depok",
      slug: "apartemen-mungil-dekat-stasiun-depok",
      description:
        "Apartemen compact dekat Stasiun Depok Barat. Harga paling terjangkau di area ini. Cocok untuk pengajar atau mahasiswa UI yang mencari hunian praktis.",
      transactionType: "DIJUAL",
      status: "ACTIVE",
      price: 380000000,
      priceNegotiable: false,
      isFeatured: false,
      categorySlug: "apartemen",
      userIndex: 4,
      agentIndex: 4,
      citySlug: "depok",
      address: "Depok Town Square Lt. 5, Pancoran Mas, Depok",
      views: 78,
      specs: { landArea: 0, buildingArea: 25, bedrooms: 0, bathrooms: 1, floors: 0, carport: 0, garage: 0 },
      legalities: { certificate: "HGB", pbb: false, imb: true },
      facilityIndices: [8],
      imageIndices: [0, 1],
    },
    {
      title: "Apartemen Mewah 3BR Surabaya Pusat",
      slug: "apartemen-mewah-3br-surabaya-pusat",
      description:
        "Apartemen mewah 3 kamar tidur di jantung Surabaya. Pemandangan laut dari balkon, akses ke Pakuwon Mall dan Tunjungan Plaza. Lingkungan premium dan aman.",
      transactionType: "DIJUAL",
      status: "PENDING",
      price: 2000000000,
      priceNegotiable: true,
      isFeatured: true,
      categorySlug: "apartemen",
      userIndex: 0,
      agentIndex: 0,
      citySlug: "surabaya",
      address: "Ciputra World Tower Lt. 35, Gubeng, Surabaya",
      views: 298,
      specs: { landArea: 0, buildingArea: 90, bedrooms: 3, bathrooms: 2, floors: 0, carport: 0, garage: 0 },
      legalities: { certificate: "HGB", pbb: true, imb: true },
      facilityIndices: [2, 6, 7, 8, 10, 11, 12, 14],
      imageIndices: [3, 4, 5, 0],
    },

    // ─── TANAH (4) ───
    {
      title: "Tanah Strategis Dekat Tol Bekasi",
      slug: "tanah-strategis-dekat-tol-bekasi",
      description:
        "Tanah kavling strategis dekat gerbang tol Bekasi Timur. Cocok untuk dibangun perumahan cluster atau ruko. Akses jalan lebar 12 meter, legalitas sudah SHM.",
      transactionType: "DIJUAL",
      status: "ACTIVE",
      price: 2000000000,
      priceNegotiable: true,
      isFeatured: true,
      categorySlug: "tanah",
      userIndex: 1,
      agentIndex: 1,
      citySlug: "bekasi",
      address: "Jl. Ir. H. Juanda No. 100, Bekasi Timur",
      views: 345,
      specs: { landArea: 500, buildingArea: 0, bedrooms: 0, bathrooms: 0, floors: 0, carport: 0, garage: 0 },
      legalities: { certificate: "SHM", pbb: true, imb: false },
      facilityIndices: [],
      imageIndices: [2],
    },
    {
      title: "Tanah Kavling siap Bangun Bogor",
      slug: "tanah-kavling-siap-bangun-bogor",
      description:
        "Tanah kavling siap bangun di area perumahan Bogor Selatan. View pegunungan yang indah, udara sejuk. Sudah ada IMB untuk perumahan, cocok untuk developer.",
      transactionType: "DIJUAL",
      status: "ACTIVE",
      price: 450000000,
      priceNegotiable: false,
      isFeatured: false,
      categorySlug: "tanah",
      userIndex: 2,
      agentIndex: 2,
      citySlug: "bogor",
      address: "Jl. Puncak Raya Km 5, Bogor Selatan",
      views: 189,
      specs: { landArea: 200, buildingArea: 0, bedrooms: 0, bathrooms: 0, floors: 0, carport: 0, garage: 0 },
      legalities: { certificate: "SHGB", pbb: true, imb: true },
      facilityIndices: [],
      imageIndices: [3],
    },
    {
      title: "Tanah Murah Pinggir Jalan Serang",
      slug: "tanah-murah-pinggir-jalan-serang",
      description:
        "Tanah murah pinggir jalan raya Serang, lokasi sangat strategis untuk toko atau usaha. Lebar muka 15 meter, cocok untuk investasi jangka panjang.",
      transactionType: "DIJUAL",
      status: "ACTIVE",
      price: 300000000,
      priceNegotiable: true,
      isFeatured: false,
      categorySlug: "tanah",
      userIndex: 3,
      agentIndex: 3,
      citySlug: "serang",
      address: "Jl. Raya Pandeglang Km 3, Kasemen, Serang",
      views: 67,
      specs: { landArea: 150, buildingArea: 0, bedrooms: 0, bathrooms: 0, floors: 0, carport: 0, garage: 0 },
      legalities: { certificate: "SHM", pbb: false, imb: false },
      facilityIndices: [],
      imageIndices: [4],
    },
    {
      title: "Tanah Luas 2 Hektar Sleman Yogyakarta",
      slug: "tanah-luas-2-hektar-sleman-yogyakarta",
      description:
        "Tanah sangat luas 2 hektar di Sleman, cocok untuk proyek perumahan atau villa. Lokasi di pinggir jalan utama, akses kendaraan besar. Harga nego untuk pembeli serius.",
      transactionType: "DIJUAL",
      status: "ACTIVE",
      price: 3000000000,
      priceNegotiable: true,
      isFeatured: false,
      categorySlug: "tanah",
      userIndex: 4,
      agentIndex: 4,
      citySlug: "sleman",
      address: "Jl. Solo - Yogyakarta Km 8, Godean, Sleman",
      views: 123,
      specs: { landArea: 20000, buildingArea: 0, bedrooms: 0, bathrooms: 0, floors: 0, carport: 0, garage: 0 },
      legalities: { certificate: "SHM", pbb: true, imb: false },
      facilityIndices: [],
      imageIndices: [5, 0],
    },

    // ─── RUKO (3) ───
    {
      title: "Ruko 3 Lantai Strategis Jakarta Barat",
      slug: "ruko-3-lantai-strategis-jakarta-barat",
      description:
        "Ruko 3 lantai di kawasan bisnis Grogol, Jakarta Barat. Lokasi ramai, dekat RS Satria dan Universitas Tarumanegara. Cocok untuk klinik, kantor, atau toko.",
      transactionType: "DIJUAL",
      status: "ACTIVE",
      price: 2500000000,
      priceNegotiable: true,
      isFeatured: true,
      categorySlug: "ruko",
      userIndex: 0,
      agentIndex: 0,
      citySlug: "jakarta-barat",
      address: "Jl. S. Parman No. 77, Grogol Petamburan, Jakarta Barat",
      views: 456,
      specs: { landArea: 100, buildingArea: 200, bedrooms: 0, bathrooms: 3, floors: 3, carport: 2, garage: 0 },
      legalities: { certificate: "SHM", pbb: true, imb: true },
      facilityIndices: [5, 6, 8],
      imageIndices: [0, 1, 2],
    },
    {
      title: "Ruko Komersial Tangerang Kota",
      slug: "ruko-komersial-tangerang-kota",
      description:
        "Ruko komersial 2 lantai di jalan utama Tangerang. Ramai dengan aktivitas bisnis dan dekat Alam Sutera. Investasi menguntungkan dengan penyewa existing.",
      transactionType: "DISEWA",
      status: "ACTIVE",
      price: 80000000,
      priceNegotiable: false,
      isFeatured: false,
      categorySlug: "ruko",
      userIndex: 1,
      agentIndex: 1,
      citySlug: "tangerang",
      address: "Jl. Jendral Sudirman No. 44, Tangerang Kota",
      views: 234,
      specs: { landArea: 80, buildingArea: 120, bedrooms: 0, bathrooms: 2, floors: 2, carport: 1, garage: 0 },
      legalities: { certificate: "SHM", pbb: true, imb: true },
      facilityIndices: [6, 8],
      imageIndices: [3, 4],
    },
    {
      title: "Ruko Modern Cluster Bekasi Barat",
      slug: "ruko-modern-cluster-bekasi-barat",
      description:
        "Ruko modern di dalam cluster perumahan Bekasi Barat. Target market jelas dari ribuan penghuni cluster. Cocok untuk minimarket, laundry, atau cafe.",
      transactionType: "DIJUAL",
      status: "ACTIVE",
      price: 1100000000,
      priceNegotiable: false,
      isFeatured: false,
      categorySlug: "ruko",
      userIndex: 2,
      agentIndex: 2,
      citySlug: "bekasi",
      address: "Jl. Raya Mitra Harapan No. 12, Bekasi Barat",
      views: 178,
      specs: { landArea: 60, buildingArea: 80, bedrooms: 0, bathrooms: 1, floors: 2, carport: 1, garage: 0 },
      legalities: { certificate: "SHM", pbb: true, imb: true },
      facilityIndices: [0, 5],
      imageIndices: [5, 0],
    },

    // ─── KOST (1) ───
    {
      title: "Rumah Kost 10 Kamar Depok",
      slug: "rumah-kost-10-kamar-depok",
      description:
        "Rumah kost 10 kamar strategis dekat kampus UI dan UNJ. Setiap kamar dilengkapi AC dan kamar mandi dalam. Sudah ada penyewa tetap, langsung dapat penghasilan bulanan.",
      transactionType: "DIJUAL",
      status: "ACTIVE",
      price: 1800000000,
      priceNegotiable: true,
      isFeatured: false,
      categorySlug: "kost",
      userIndex: 3,
      agentIndex: 3,
      citySlug: "depok",
      address: "Jl. Kesehatan Raya No. 5, Sukmajaya, Depok",
      views: 267,
      specs: { landArea: 180, buildingArea: 150, bedrooms: 10, bathrooms: 10, floors: 2, carport: 0, garage: 0 },
      legalities: { certificate: "SHM", pbb: true, imb: true },
      facilityIndices: [6, 8],
      imageIndices: [1, 2, 3],
    },

    // ─── VILLA (1) ───
    {
      title: "Villa Mewah Puncak Bogor",
      slug: "villa-mewah-puncak-bogor",
      description:
        "Villa mewah di kawasan Puncak Bogor dengan pemandangan gunung yang memukau. Kolam renang outdoor, taman luas, dan akses privasi. Cocok untuk homestay atau liburan keluarga.",
      transactionType: "DIJUAL",
      status: "ACTIVE",
      price: 2800000000,
      priceNegotiable: true,
      isFeatured: true,
      categorySlug: "villa",
      userIndex: 4,
      agentIndex: 4,
      citySlug: "bogor",
      address: "Jl. Raya Puncak No. 200, Bogor Selatan",
      views: 389,
      specs: { landArea: 500, buildingArea: 200, bedrooms: 4, bathrooms: 3, floors: 2, carport: 2, garage: 1 },
      legalities: { certificate: "SHM", pbb: true, imb: true },
      facilityIndices: [0, 1, 2, 3, 5, 6, 7, 8, 9, 10, 11, 12],
      imageIndices: [0, 1, 2, 3, 4],
    },

    // ─── DRAFT & SOLD status properties ───
    {
      title: "Rumah Minimalis Sleman (Draft)",
      slug: "rumah-minimalis-sleman-draft",
      description: "Rumah minimalis di Sleman, Yogyakarta. Sedang dalam proses pemotretan profesional.",
      transactionType: "DIJUAL",
      status: "DRAFT",
      price: 550000000,
      priceNegotiable: false,
      isFeatured: false,
      categorySlug: "rumah",
      userIndex: 4,
      agentIndex: null,
      citySlug: "sleman",
      address: "Jl. Wates Km 4, Mlati, Sleman",
      views: 0,
      specs: { landArea: 90, buildingArea: 60, bedrooms: 2, bathrooms: 1, floors: 1, carport: 1, garage: 0 },
      legalities: { certificate: "SHM", pbb: false, imb: false },
      facilityIndices: [0],
      imageIndices: [2],
    },
  ]

  let propertyCount = 0

  for (const prop of propertiesData) {
    const district = findDistrict(prop.citySlug)
    const village = findVillage(district.id)
    const baseCoord = cityCoords[prop.citySlug] || [-6.2, 106.8]
    const [lat, lng] = jitterCoords(baseCoord)
    const user = allUserIds[prop.userIndex]
    const agent = prop.agentIndex !== null ? agents[prop.agentIndex] : null
    const category = catBySlug[prop.categorySlug]
    const randomViews = prop.views + Math.floor(Math.random() * 50)

    const created = await prisma.property.create({
      data: {
        title: prop.title,
        slug: prop.slug,
        description: prop.description,
        transactionType: prop.transactionType,
        status: prop.status,
        price: prop.price,
        priceNegotiable: prop.priceNegotiable,
        isFeatured: prop.isFeatured,
        categoryId: category.id,
        userId: user,
        agentId: agent?.id || null,
        districtId: district.id,
        villageId: village.id,
        address: prop.address,
        latitude: lat,
        longitude: lng,
        views: randomViews,
        metaTitle: `${prop.title} - UNAYSALE`,
        metaDescription: `${prop.description.slice(0, 155)}...`,
        images: {
          create: prop.imageIndices.map((idx, i) => ({
            url: propertyImages[idx],
            alt: `${prop.title} - Foto ${i + 1}`,
            isPrimary: i === 0,
            sortOrder: i,
          })),
        },
        specs: {
          create: prop.specs,
        },
        legalities: {
          create: prop.legalities,
        },
        facilities: {
          create: prop.facilityIndices.map((idx) => ({
            facilityId: facilities[idx].id,
          })),
        },
      },
    })

    propertyCount++
    console.log(`  ✅ ${created.title}`)
  }

  console.log("")
  console.log("═══════════════════════════════════════════")
  console.log("  🎉 Database seeded successfully!")
  console.log("═══════════════════════════════════════════")
  console.log(`  👤 Users:           ${1 + agentUsers.length + regularUsers.length}`)
  console.log(`  🏢 Agent Profiles:  ${agents.length}`)
  console.log(`  📂 Categories:      ${categories.length}`)
  console.log(`  🗺️  Provinces:       ${provinces.length}`)
  console.log(`  🏙️  Cities:          ${allCities.length}`)
  console.log(`  📍 Districts:       ${allDistricts.length}`)
  console.log(`  🏘️  Villages:        ${allVillages.length}`)
  console.log(`  🏊 Facilities:      ${facilities.length}`)
  console.log(`  🏠 Properties:      ${propertyCount}`)
  console.log("═══════════════════════════════════════════")
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error("❌ Seed failed:", e)
    await prisma.$disconnect()
    process.exit(1)
  })
