"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  MapPin,
  X,
  Save,
  Loader2,
  ChevronRight,
  Search,
} from "lucide-react";

interface Province {
  id: string;
  name: string;
  code: string;
  _count?: { cities: number };
}

interface City {
  id: string;
  name: string;
  code: string;
  provinceId: string;
  province?: Province;
  _count?: { districts: number };
}

interface District {
  id: string;
  name: string;
  code: string;
  cityId: string;
  city?: City;
  _count?: { subDistricts: number };
}

interface SubDistrict {
  id: string;
  name: string;
  code: string;
  districtId: string;
  district?: District;
}

type TabType = "provinsi" | "kota" | "kecamatan" | "kelurahan";

export default function LocationManagement() {
  const [activeTab, setActiveTab] = useState<TabType>("provinsi");

  const [provinces, setProvinces] = useState<Province[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [subDistricts, setSubDistricts] = useState<SubDistrict[]>([]);

  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedProvince, setSelectedProvince] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState({ name: "", code: "" });
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fetchProvinces = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/locations/provinces");
      if (res.ok) {
        const data = await res.json();
        setProvinces(data.provinces || data);
      }
    } catch (error) {
      console.error("Failed to fetch provinces:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCities = async (provinceId?: string) => {
    setLoading(true);
    try {
      const params = provinceId ? `?provinceId=${provinceId}` : "";
      const res = await fetch(`/api/admin/locations/cities${params}`);
      if (res.ok) {
        const data = await res.json();
        setCities(data.cities || data);
      }
    } catch (error) {
      console.error("Failed to fetch cities:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDistricts = async (cityId?: string) => {
    setLoading(true);
    try {
      const params = cityId ? `?cityId=${cityId}` : "";
      const res = await fetch(`/api/admin/locations/districts${params}`);
      if (res.ok) {
        const data = await res.json();
        setDistricts(data.districts || data);
      }
    } catch (error) {
      console.error("Failed to fetch districts:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubDistricts = async (districtId?: string) => {
    setLoading(true);
    try {
      const params = districtId ? `?districtId=${districtId}` : "";
      const res = await fetch(`/api/admin/locations/sub-districts${params}`);
      if (res.ok) {
        const data = await res.json();
        setSubDistricts(data.subDistricts || data);
      }
    } catch (error) {
      console.error("Failed to fetch sub-districts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProvinces();
    fetchCities();
    fetchDistricts();
    fetchSubDistricts();
  }, []);

  useEffect(() => {
    if (activeTab === "kota" && selectedProvince) {
      fetchCities(selectedProvince);
    }
  }, [activeTab, selectedProvince]);

  useEffect(() => {
    if (activeTab === "kecamatan" && selectedCity) {
      fetchDistricts(selectedCity);
    }
  }, [activeTab, selectedCity]);

  useEffect(() => {
    if (activeTab === "kelurahan" && selectedDistrict) {
      fetchSubDistricts(selectedDistrict);
    }
  }, [activeTab, selectedDistrict]);

  const openModal = (tab: TabType, item?: any) => {
    if (item) {
      setEditingItem(item);
      setFormData({ name: item.name, code: item.code || "" });
    } else {
      setEditingItem(null);
      setFormData({ name: "", code: "" });
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingItem(null);
    setFormData({ name: "", code: "" });
  };

  const getApiEndpoint = () => {
    switch (activeTab) {
      case "provinsi":
        return "/api/admin/locations/provinces";
      case "kota":
        return "/api/admin/locations/cities";
      case "kecamatan":
        return "/api/admin/locations/districts";
      case "kelurahan":
        return "/api/admin/locations/sub-districts";
    }
  };

  const getRefreshFunction = () => {
    switch (activeTab) {
      case "provinsi":
        return fetchProvinces;
      case "kota":
        return () => fetchCities(selectedProvince || undefined);
      case "kecamatan":
        return () => fetchDistricts(selectedCity || undefined);
      case "kelurahan":
        return () => fetchSubDistricts(selectedDistrict || undefined);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const endpoint = getApiEndpoint();
      const url = editingItem ? `${endpoint}/${editingItem.id}` : endpoint;
      const method = editingItem ? "PUT" : "POST";

      const body: any = { name: formData.name, code: formData.code };
      if (activeTab === "kota" && selectedProvince) {
        body.provinceId = selectedProvince;
      }
      if (activeTab === "kecamatan" && selectedCity) {
        body.cityId = selectedCity;
      }
      if (activeTab === "kelurahan" && selectedDistrict) {
        body.districtId = selectedDistrict;
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        getRefreshFunction()();
        closeModal();
      }
    } catch (error) {
      console.error("Failed to save:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const endpoint = getApiEndpoint();
      const res = await fetch(`${endpoint}/${id}`, { method: "DELETE" });

      if (res.ok) {
        getRefreshFunction()();
        setDeleteConfirm(null);
      }
    } catch (error) {
      console.error("Failed to delete:", error);
    }
  };

  const tabs: { key: TabType; label: string; parent?: TabType }[] = [
    { key: "provinsi", label: "Provinsi" },
    { key: "kota", label: "Kota", parent: "provinsi" },
    { key: "kecamatan", label: "Kecamatan", parent: "kota" },
    { key: "kelurahan", label: "Kelurahan", parent: "kecamatan" },
  ];

  const getParentLabel = () => {
    switch (activeTab) {
      case "provinsi":
        return null;
      case "kota":
        return "Provinsi";
      case "kecamatan":
        return "Kota";
      case "kelurahan":
        return "Kecamatan";
    }
  };

  const getParentOptions = () => {
    switch (activeTab) {
      case "kota":
        return provinces.map((p) => ({ value: p.id, label: p.name }));
      case "kecamatan":
        return cities.map((c) => ({ value: c.id, label: c.name }));
      case "kelurahan":
        return districts.map((d) => ({ value: d.id, label: d.name }));
      default:
        return [];
    }
  };

  const getSelectedParent = () => {
    switch (activeTab) {
      case "kota":
        return selectedProvince;
      case "kecamatan":
        return selectedCity;
      case "kelurahan":
        return selectedDistrict;
      default:
        return "";
    }
  };

  const setSelectedParent = (value: string) => {
    switch (activeTab) {
      case "kota":
        setSelectedProvince(value);
        break;
      case "kecamatan":
        setSelectedCity(value);
        break;
      case "kelurahan":
        setSelectedDistrict(value);
        break;
    }
  };

  const getCurrentItems = () => {
    const items =
      activeTab === "provinsi"
        ? provinces
        : activeTab === "kota"
        ? cities
        : activeTab === "kecamatan"
        ? districts
        : subDistricts;

    if (!searchQuery) return items;
    return items.filter((item: any) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const getCountLabel = (item: any) => {
    switch (activeTab) {
      case "provinsi":
        return `${item._count?.cities || 0} kota`;
      case "kota":
        return `${item._count?.districts || 0} kecamatan`;
      case "kecamatan":
        return `${item._count?.subDistricts || 0} kelurahan`;
      default:
        return "";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Lokasi</h1>
          <p className="text-gray-500 text-sm mt-1">
            Kelola hierarki lokasi properti
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="border-b border-gray-100">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveTab(tab.key);
                  setSearchQuery("");
                }}
                className={`px-6 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row gap-3">
            {activeTab !== "provinsi" && (
              <select
                value={getSelectedParent()}
                onChange={(e) => setSelectedParent(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="">Semua {getParentLabel()}</option>
                {getParentOptions().map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            )}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder={`Cari ${tabs.find((t) => t.key === activeTab)?.label.toLowerCase()}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <button
              onClick={() => openModal(activeTab)}
              className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Tambah
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Nama
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Kode
                </th>
                {activeTab !== "kelurahan" && (
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Jumlah
                  </th>
                )}
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  </td>
                </tr>
              ) : getCurrentItems().length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-gray-500">
                    <MapPin className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                    Tidak ada data
                  </td>
                </tr>
              ) : (
                getCurrentItems().map((item: any) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium text-gray-900">
                        {item.name}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {item.code || "-"}
                      </span>
                    </td>
                    {activeTab !== "kelurahan" && (
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-600">
                          {getCountLabel(item)}
                        </span>
                      </td>
                    )}
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {activeTab !== "provinsi" && (
                          <button
                            onClick={() => {
                              const nextTab =
                                activeTab === "kota"
                                  ? "kecamatan"
                                  : "kelurahan";
                              setActiveTab(nextTab);
                              if (activeTab === "kota") setSelectedCity(item.id);
                              if (activeTab === "kecamatan")
                                setSelectedDistrict(item.id);
                            }}
                            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-blue-600"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => openModal(activeTab, item)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-blue-600"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        {deleteConfirm === item.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="px-2 py-1 text-xs text-white bg-red-600 rounded hover:bg-red-700"
                            >
                              Ya
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="px-2 py-1 text-xs text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
                            >
                              Tidak
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(item.id)}
                            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingItem ? "Edit" : "Tambah"}{" "}
                {tabs.find((t) => t.key === activeTab)?.label}
              </h3>
              <button
                onClick={closeModal}
                className="p-1 rounded-lg hover:bg-gray-100"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {activeTab !== "provinsi" && !editingItem && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {getParentLabel()} *
                  </label>
                  <select
                    value={getSelectedParent()}
                    onChange={(e) => setSelectedParent(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    required
                  >
                    <option value="">Pilih {getParentLabel()}</option>
                    {getParentOptions().map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="Masukkan nama"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kode
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, code: e.target.value }))
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="Contoh: 31, 3171"
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving || !formData.name}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {editingItem ? "Simpan Perubahan" : "Tambah"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
