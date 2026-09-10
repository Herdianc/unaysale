"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  X,
  Plus,
  Upload,
} from "lucide-react";

interface Category {
  id: string;
  name: string;
}

interface District {
  id: string;
  name: string;
  villages: { id: string; name: string }[];
}

interface Facility {
  id: string;
  name: string;
}

const steps = [
  { title: "Informasi Dasar", description: "Judul, deskripsi, tipe, kategori, harga" },
  { title: "Lokasi", description: "Alamat, kecamatan, desa, koordinat" },
  { title: "Spesifikasi", description: "Luas tanah, bangunan, kamar, dll" },
  { title: "Legalitas", description: "Sertifikat, PBB, IMB" },
  { title: "Fasilitas", description: "Daftar fasilitas properti" },
  { title: "Foto", description: "Upload foto properti" },
];

export default function TambahPropertiPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [categories, setCategories] = useState<Category[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);

  const [form, setForm] = useState({
    title: "",
    description: "",
    transactionType: "DIJUAL",
    categoryId: "",
    price: "",
    priceNegotiable: false,
    address: "",
    districtId: "",
    villageId: "",
    latitude: "",
    longitude: "",
    landArea: "",
    buildingArea: "",
    bedrooms: "",
    bathrooms: "",
    floors: "",
    carport: "",
    certificate: "",
    pbb: false,
    imb: false,
    facilityIds: [] as string[],
    imageUrls: [] as string[],
  });

  const [newImageUrl, setNewImageUrl] = useState("");
  const [newFacility, setNewFacility] = useState("");
  const [addingFacility, setAddingFacility] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedDistrictVillages, setSelectedDistrictVillages] = useState<
    { id: string; name: string }[]
  >([]);

  useEffect(() => {
    async function loadRefs() {
      try {
        const [catRes, distRes, facRes] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/districts?include=villages"),
          fetch("/api/facilities"),
        ]);
        if (catRes.ok) setCategories(await catRes.json());
        if (distRes.ok) setDistricts(await distRes.json());
        if (facRes.ok) setFacilities(await facRes.json());
      } catch (e) {
        console.error("Failed to load references:", e);
      }
    }
    loadRefs();
  }, []);

  useEffect(() => {
    if (form.districtId) {
      const dist = districts.find((d) => d.id === form.districtId);
      setSelectedDistrictVillages(dist?.villages || []);
      setForm((prev) => ({ ...prev, villageId: "" }));
    }
  }, [form.districtId, districts]);

  const updateForm = (fields: Partial<typeof form>) => {
    setForm((prev) => ({ ...prev, ...fields }));
    setError("");
  };

  const toggleFacility = (id: string) => {
    setForm((prev) => ({
      ...prev,
      facilityIds: prev.facilityIds.includes(id)
        ? prev.facilityIds.filter((f) => f !== id)
        : [...prev.facilityIds, id],
    }));
  };

  const addCustomFacility = async () => {
    const name = newFacility.trim();
    if (name.length < 2) {
      setError("Nama fasilitas minimal 2 karakter");
      return;
    }
    setAddingFacility(true);
    setError("");
    try {
      const res = await fetch("/api/facilities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error || "Gagal menambah fasilitas");
        return;
      }
      if (!facilities.some((f) => f.id === data.id)) {
        setFacilities((prev) => [...prev, data]);
      }
      setForm((prev) => ({
        ...prev,
        facilityIds: prev.facilityIds.includes(data.id)
          ? prev.facilityIds
          : [...prev.facilityIds, data.id],
      }));
      setNewFacility("");
    } catch {
      setError("Gagal menambah fasilitas");
    } finally {
      setAddingFacility(false);
    }
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError("");
    try {
      for (const file of Array.from(files)) {
        if (form.imageUrls.length >= 20) {
          setError("Maksimal 20 foto");
          break;
        }
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        const data = await res.json().catch(() => null);
        if (!res.ok) {
          setError(data?.error || `Gagal upload ${file.name}`);
          continue;
        }
        const url = new URL(data.url, window.location.origin).toString();
        setForm((prev) =>
          prev.imageUrls.includes(url)
            ? prev
            : { ...prev, imageUrls: [...prev.imageUrls, url] }
        );
      }
    } catch {
      setError("Gagal mengupload foto");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const addImageUrl = () => {
    const url = newImageUrl.trim();
    if (!url) return;
    if (form.imageUrls.includes(url)) {
      setError("URL foto sudah ditambahkan");
      return;
    }
    setForm((prev) => ({ ...prev, imageUrls: [...prev.imageUrls, url] }));
    setNewImageUrl("");
    setError("");
  };

  const removeImageUrl = (url: string) => {
    setForm((prev) => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((u) => u !== url),
    }));
  };

  const validateStep = (): boolean => {
    switch (currentStep) {
      case 0:
        if (!form.title.trim()) { setError("Judul wajib diisi"); return false; }
        if (!form.categoryId) { setError("Kategori wajib dipilih"); return false; }
        if (!form.price) { setError("Harga wajib diisi"); return false; }
        return true;
      case 1:
        if (!form.address.trim()) { setError("Alamat wajib diisi"); return false; }
        if (!form.districtId) { setError("Kecamatan wajib dipilih"); return false; }
        return true;
      case 5:
        if (form.imageUrls.length === 0) {
          setError("Minimal 1 foto properti (upload atau URL)");
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (!validateStep()) return;
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
    setError("");
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        transactionType: form.transactionType,
        categoryId: form.categoryId,
        price: parseInt(form.price, 10),
        priceNegotiable: form.priceNegotiable,
        address: form.address.trim(),
        districtId: form.districtId || undefined,
        villageId: form.villageId || undefined,
        latitude: form.latitude ? parseFloat(form.latitude) : undefined,
        longitude: form.longitude ? parseFloat(form.longitude) : undefined,
        landArea: form.landArea ? parseInt(form.landArea, 10) : undefined,
        buildingArea: form.buildingArea ? parseInt(form.buildingArea, 10) : undefined,
        bedrooms: form.bedrooms ? parseInt(form.bedrooms, 10) : undefined,
        bathrooms: form.bathrooms ? parseInt(form.bathrooms, 10) : undefined,
        floors: form.floors ? parseInt(form.floors, 10) : 1,
        carport: form.carport ? parseInt(form.carport, 10) : undefined,
        certificate: form.certificate || undefined,
        pbb: form.pbb,
        imb: form.imb,
        facilityIds: form.facilityIds,
        imageUrls: form.imageUrls,
      };

      const res = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        let msg = data?.error || "Gagal menyimpan properti";
        if (data?.details) {
          try {
            const issues = JSON.parse(data.details);
            const first = Array.isArray(issues) ? issues[0] : null;
            if (first?.message) {
              const path = Array.isArray(first.path)
                ? first.path.join(".")
                : "";
              msg = `${msg}: ${path ? path + " — " : ""}${first.message}`;
            }
          } catch {}
        }
        setError(msg);
        return;
      }

      router.push("/dashboard/properti");
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (val: string) => {
    const num = val.replace(/\D/g, "");
    setForm((prev) => ({ ...prev, price: num }));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tambah Properti</h1>
            <p className="text-sm text-gray-500 mt-1">Langkah {currentStep + 1} dari {steps.length}</p>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            {steps.map((_, i) => (
              <div key={i} className="flex-1">
                <div
                  className={`h-2 rounded-full transition-colors ${
                    i <= currentStep ? "bg-primary" : "bg-gray-200"
                  }`}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>{steps[currentStep].title}</span>
            <span>{steps[currentStep].description}</span>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="min-h-[300px]">
          {currentStep === 0 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Judul Properti *</label>
                <Input
                  placeholder="Contoh: Rumah Minimalis di Cimanggis"
                  value={form.title}
                  onChange={(e) => updateForm({ title: e.target.value })}
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">Deskripsi</label>
                  <span className={`text-xs ${form.description.trim().length >= 20 ? "text-green-600" : "text-gray-400"}`}>
                    {form.description.trim().length}/20 min
                  </span>
                </div>
                <Textarea
                  placeholder="Jelaskan detail properti Anda (minimal 20 karakter)..."
                  rows={4}
                  value={form.description}
                  onChange={(e) => updateForm({ description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipe Transaksi *</label>
                  <select
                    className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    value={form.transactionType}
                    onChange={(e) => updateForm({ transactionType: e.target.value })}
                  >
                    <option value="DIJUAL">Dijual</option>
                    <option value="DISEWA">Disewa</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kategori *</label>
                  <select
                    className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    value={form.categoryId}
                    onChange={(e) => updateForm({ categoryId: e.target.value })}
                  >
                    <option value="">Pilih kategori</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Harga (IDR) *</label>
                <Input
                  type="text"
                  placeholder="Contoh: 500000000"
                  value={form.price ? new Intl.NumberFormat("id-ID").format(parseInt(form.price) || 0) : ""}
                  onChange={(e) => formatPrice(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="negotiable"
                  checked={form.priceNegotiable}
                  onChange={(e) => updateForm({ priceNegotiable: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label htmlFor="negotiable" className="text-sm text-gray-700">
                  Harga nego
                </label>
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Alamat Lengkap *</label>
                <Textarea
                  placeholder="Jl. Contoh No. 123, RT 01/RW 02"
                  rows={3}
                  value={form.address}
                  onChange={(e) => updateForm({ address: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kecamatan *</label>
                  <select
                    className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    value={form.districtId}
                    onChange={(e) => updateForm({ districtId: e.target.value })}
                  >
                    <option value="">Pilih kecamatan</option>
                    {districts.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Desa/Kelurahan</label>
                  <select
                    className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    value={form.villageId}
                    onChange={(e) => updateForm({ villageId: e.target.value })}
                    disabled={!form.districtId}
                  >
                    <option value="">Pilih desa/kelurahan</option>
                    {selectedDistrictVillages.map((v) => (
                      <option key={v.id} value={v.id}>{v.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                  <Input
                    type="number"
                    step="any"
                    placeholder="-6.xxxx"
                    value={form.latitude}
                    onChange={(e) => updateForm({ latitude: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                  <Input
                    type="number"
                    step="any"
                    placeholder="106.xxxx"
                    value={form.longitude}
                    onChange={(e) => updateForm({ longitude: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Luas Tanah (m²)</label>
                  <Input
                    type="number"
                    placeholder="Contoh: 120"
                    value={form.landArea}
                    onChange={(e) => updateForm({ landArea: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Luas Bangunan (m²)</label>
                  <Input
                    type="number"
                    placeholder="Contoh: 80"
                    value={form.buildingArea}
                    onChange={(e) => updateForm({ buildingArea: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kamar Tidur</label>
                  <Input
                    type="number"
                    placeholder="3"
                    value={form.bedrooms}
                    onChange={(e) => updateForm({ bedrooms: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kamar Mandi</label>
                  <Input
                    type="number"
                    placeholder="2"
                    value={form.bathrooms}
                    onChange={(e) => updateForm({ bathrooms: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lantai</label>
                  <Input
                    type="number"
                    placeholder="1"
                    value={form.floors}
                    onChange={(e) => updateForm({ floors: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Carport (mobil)</label>
                <Input
                  type="number"
                  placeholder="1"
                  value={form.carport}
                  onChange={(e) => updateForm({ carport: e.target.value })}
                />
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Sertifikat</label>
                <select
                  className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  value={form.certificate}
                  onChange={(e) => updateForm({ certificate: e.target.value })}
                >
                  <option value="">Pilih sertifikat</option>
                  <option value="SHM">SHM</option>
                  <option value="HGB">HGB</option>
                  <option value="SHRS">SHRS</option>
                  <option value="GIRIK">Girik</option>
                  <option value="ADAT">Hak Adat</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="pbb"
                  checked={form.pbb}
                  onChange={(e) => updateForm({ pbb: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label htmlFor="pbb" className="text-sm text-gray-700">
                  PBB Lunas
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="imb"
                  checked={form.imb}
                  onChange={(e) => updateForm({ imb: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label htmlFor="imb" className="text-sm text-gray-700">
                  IMB / PBG ada
                </label>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">Pilih fasilitas yang tersedia di properti ini:</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {facilities.map((fac) => (
                  <label
                    key={fac.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      form.facilityIds.includes(fac.id)
                        ? "border-primary bg-primary/5"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={form.facilityIds.includes(fac.id)}
                      onChange={() => toggleFacility(fac.id)}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-gray-700">{fac.name}</span>
                  </label>
                ))}
              </div>
              {facilities.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-8">Memuat fasilitas...</p>
              )}
              <div className="pt-3 border-t border-gray-100">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tambah fasilitas lain (tidak ada di daftar)
                </label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Contoh: Kolam Renang Pribadi"
                    value={newFacility}
                    onChange={(e) => setNewFacility(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addCustomFacility();
                      }
                    }}
                  />
                  <Button type="button" variant="outline" onClick={addCustomFacility} disabled={addingFacility}>
                    {addingFacility ? "..." : (
                      <>
                        <Plus className="h-4 w-4 mr-1" />
                        Tambah
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Fasilitas baru otomatis dicentang dan tersedia untuk properti lain juga.
                </p>
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                Upload foto dari perangkat Anda atau tempel URL. Foto pertama akan menjadi foto utama.
              </p>
              <div className="rounded-xl border-2 border-dashed border-gray-300 p-6 text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  multiple
                  className="hidden"
                  onChange={(e) => handleFileUpload(e.target.files)}
                />
                <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-500 mb-3">
                  JPG, PNG, WebP, atau GIF — maks 5MB per foto
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? "Mengunggah..." : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Pilih Foto
                    </>
                  )}
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400">atau via URL</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="https://contoh.com/foto.jpg"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addImageUrl();
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={addImageUrl}>
                  <Plus className="h-4 w-4 mr-1" />
                  Tambah
                </Button>
              </div>
              {form.imageUrls.length > 0 && (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                  {form.imageUrls.map((url, index) => (
                    <div
                      key={url}
                      className="group relative aspect-square overflow-hidden rounded-lg border-2 border-gray-200 hover:border-gray-300"
                    >
                      <img
                        src={url}
                        alt={`Foto ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                      {index === 0 && (
                        <div className="absolute top-2 left-2 flex items-center gap-1 rounded-full bg-[#F5A623] px-2 py-0.5 text-xs font-medium text-white">
                          Utama
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImageUrl(url)}
                        className="absolute top-2 right-2 rounded-full bg-white/90 p-1.5 text-red-500 opacity-0 transition-opacity hover:bg-white group-hover:opacity-100"
                        title="Hapus foto"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 0}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Sebelumnya
        </Button>

        {currentStep < steps.length - 1 ? (
          <Button onClick={nextStep}>
            Selanjutnya
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={loading || uploading}>
            {uploading ? (
              "Mengunggah foto..."
            ) : loading ? (
              "Menyimpan..."
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                Publikasikan
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
