import { z } from "zod"

export const registerSchema = z
  .object({
    name: z.string().min(2, "Nama harus minimal 2 karakter").max(100),
    email: z.string().email("Email tidak valid"),
    password: z
      .string()
      .min(8, "Password harus minimal 8 karakter")
      .regex(/[A-Z]/, "Harus mengandung minimal 1 huruf besar")
      .regex(/[0-9]/, "Harus mengandung minimal 1 angka"),
    confirmPassword: z.string(),
    phone: z.string().min(10, "Nomor telepon minimal 10 digit").max(15).regex(/^[0-9]+$/, "Hanya boleh angka"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password tidak cocok",
    path: ["confirmPassword"],
  })

export const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
})

export const propertyCreateSchema = z.object({
  title: z.string().min(10, "Judul minimal 10 karakter").max(200),
  description: z.string().min(20, "Deskripsi minimal 20 karakter").max(5000),
  transactionType: z.enum(["DIJUAL", "DISEWA"]),
  categoryId: z.string().min(1, "Kategori wajib dipilih"),
  price: z.number().positive("Harga harus positif"),
  priceNegotiable: z.boolean().default(false),
  address: z.string().min(5, "Alamat minimal 5 karakter"),
  districtId: z.string().optional(),
  villageId: z.string().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  landArea: z.number().positive().optional(),
  buildingArea: z.number().positive().optional(),
  bedrooms: z.number().int().min(0).max(50).optional(),
  bathrooms: z.number().int().min(0).max(50).optional(),
  floors: z.number().int().min(1).max(20).optional(),
  carport: z.number().int().min(0).max(20).optional(),
  garage: z.number().int().min(0).max(20).optional(),
  certificate: z.string().optional(),
  pbb: z.boolean().default(false),
  imb: z.boolean().default(false),
  facilityIds: z.array(z.string()).optional(),
  imageUrls: z
    .array(z.string().min(1).max(2048))
    .min(1, "Minimal 1 gambar")
    .max(5, "Maksimal 5 gambar per properti"),
  primaryImageIndex: z.number().int().min(0).default(0),
})

export const leadCreateSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  phone: z.string().min(10, "Nomor telepon minimal 10 digit").max(15).regex(/^[0-9]+$/),
  email: z.string().email("Email tidak valid").optional(),
  message: z.string().min(10, "Pesan minimal 10 karakter").max(1000),
  propertyId: z.string().min(1),
})

export const categoryCreateSchema = z.object({
  name: z.string().min(2).max(50),
  slug: z.string().min(2).max(60).regex(/^[a-z0-9-]+$/),
  description: z.string().max(200).optional(),
  icon: z.string().optional(),
})

export const searchParamsSchema = z.object({
  q: z.string().optional(),
  t: z.enum(["DIJUAL", "DISEWA"]).optional(),
  kategori: z.string().optional(),
  lokasi: z.string().optional(),
  harga_min: z.coerce.number().positive().optional(),
  harga_max: z.coerce.number().positive().optional(),
  kamar_tidur: z.coerce.number().int().min(0).optional(),
  kamar_mandi: z.coerce.number().int().min(0).optional(),
  tanah_min: z.coerce.number().positive().optional(),
  tanah_max: z.coerce.number().positive().optional(),
  bangunan_min: z.coerce.number().positive().optional(),
  bangunan_max: z.coerce.number().positive().optional(),
  sertifikat: z.string().optional(),
  sort: z.enum(["newest", "price_asc", "price_desc", "popular"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
})
