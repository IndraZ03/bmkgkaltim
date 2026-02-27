"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { 
  BarChart3, Plus, Pencil, Trash2, X, Award 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface IkmStation {
  id: number;
  stationName: string;
  ikmValue: number;
  rating: string;
  updatedAt: string;
}

function getRatingFromValue(value: number): string {
  if (value >= 88.31) return "Sangat Baik";
  if (value >= 76.61) return "Baik";
  if (value >= 65.00) return "Kurang Baik";
  return "Tidak Baik";
}

function getRatingColor(rating: string): string {
  switch (rating) {
    case "Sangat Baik": return "bg-green-100 text-green-700";
    case "Baik": return "bg-blue-100 text-blue-700";
    case "Kurang Baik": return "bg-yellow-100 text-yellow-700";
    case "Tidak Baik": return "bg-red-100 text-red-700";
    default: return "bg-gray-100 text-gray-700";
  }
}

export default function IkmPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stations, setStations] = useState<IkmStation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<IkmStation | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formStationName, setFormStationName] = useState("");
  const [formIkmValue, setFormIkmValue] = useState("");
  const [formRating, setFormRating] = useState("Sangat Baik");

  const isAdmin = session?.user?.role === "ADMIN";
  // DATIN role can view but not edit

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
    // Allow ADMIN and DATIN
    if (status === "authenticated" && !["ADMIN", "DATIN"].includes(session?.user?.role || "")) {
      router.push("/backoffice");
    }
  }, [status, session, router]);

  const fetchStations = async () => {
    try {
      const res = await fetch("/api/ikm");
      const data = await res.json();
      if (Array.isArray(data)) setStations(data);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStations();
  }, []);

  const openCreate = () => {
    setEditingItem(null);
    setFormStationName("");
    setFormIkmValue("");
    setFormRating("Sangat Baik");
    setShowModal(true);
  };

  const openEdit = (item: IkmStation) => {
    setEditingItem(item);
    setFormStationName(item.stationName);
    setFormIkmValue(item.ikmValue.toString());
    setFormRating(item.rating);
    setShowModal(true);
  };

  const handleIkmValueChange = (value: string) => {
    setFormIkmValue(value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      setFormRating(getRatingFromValue(numValue));
    }
  };

  const handleSave = async () => {
    if (!formStationName.trim() || !formIkmValue.trim()) return;
    setSaving(true);

    try {
      const payload = {
        stationName: formStationName,
        ikmValue: parseFloat(formIkmValue),
        rating: formRating,
      };

      if (editingItem) {
        await fetch(`/api/ikm/${editingItem.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch("/api/ikm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      setShowModal(false);
      fetchStations();
    } catch (error) {
      console.error("Save error:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Yakin ingin menghapus data IKM stasiun ini?")) return;
    setDeleting(id);
    try {
      await fetch(`/api/ikm/${id}`, { method: "DELETE" });
      fetchStations();
    } catch (error) {
      console.error("Delete error:", error);
    } finally {
      setDeleting(null);
    }
  };

  const averageIkm = stations.length > 0
    ? (stations.reduce((sum, s) => sum + s.ikmValue, 0) / stations.length).toFixed(2)
    : "0";

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="h-64 bg-gray-200 rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Indeks Kepuasan Masyarakat</h1>
          <p className="text-gray-500 mt-1">
            {isAdmin 
              ? "Kelola nilai IKM per stasiun yang ditampilkan di halaman utama"
              : "Ringkasan nilai IKM stasiun BMKG Kaltim"
            }
          </p>
        </div>
        {isAdmin && (
          <Button onClick={openCreate} className="gap-2 self-start bg-cyan-600 hover:bg-cyan-700">
            <Plus className="h-4 w-4" />
            Tambah Stasiun
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-xl border shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-cyan-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stations.length}</p>
              <p className="text-sm text-gray-500">Total Stasiun</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Award className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{averageIkm}</p>
              <p className="text-sm text-gray-500">Rata-rata IKM</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stations Grid */}
      {stations.length === 0 ? (
        <div className="bg-white rounded-xl border shadow-sm p-12">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <BarChart3 className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Belum Ada Stasiun</h3>
            <p className="text-gray-500 mb-6 max-w-sm">
              Tambahkan data IKM untuk stasiun-stasiun BMKG
            </p>
            {isAdmin && (
              <Button onClick={openCreate} className="gap-2">
                <Plus className="h-4 w-4" />
                Tambah Stasiun Pertama
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {stations.map((station) => (
            <div
              key={station.id}
              className="bg-white rounded-xl border shadow-sm p-6 hover:shadow-lg transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-sm leading-relaxed">
                    {station.stationName}
                  </h3>
                </div>
                {isAdmin && (
                  <div className="flex gap-1 ml-4 flex-shrink-0">
                    <button
                      onClick={() => openEdit(station)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(station.id)}
                      disabled={deleting === station.id}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Hapus"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-3xl font-bold text-[#002050]">{station.ikmValue}</div>
                  <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getRatingColor(station.rating)}`}>
                    {station.rating}
                  </span>
                </div>
              </div>

              <div className="mt-3">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-cyan-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(station.ikmValue, 100)}%` }}
                  />
                </div>
              </div>

              <p className="text-xs text-gray-400 mt-2">
                Diperbarui: {new Date(station.updatedAt).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Modal - only show if isAdmin is true, though the button is hidden anyway */}
      {showModal && isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto m-4 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {editingItem ? "Edit Data IKM" : "Tambah Stasiun IKM"}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Stasiun *</label>
                <Input
                  value={formStationName}
                  onChange={(e) => setFormStationName(e.target.value)}
                  placeholder="Nama stasiun BMKG..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nilai IKM *</label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formIkmValue}
                  onChange={(e) => handleIkmValueChange(e.target.value)}
                  placeholder="0.00 - 100.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Predikat</label>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1.5 text-sm font-medium rounded-full ${getRatingColor(formRating)}`}>
                    {formRating}
                  </span>
                  <span className="text-xs text-gray-400">(otomatis berdasarkan nilai)</span>
                </div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg text-xs text-gray-500 space-y-1">
                <p className="font-medium text-gray-700 mb-1">Pedoman Nilai IKM:</p>
                <p>88.31 - 100.00 → Sangat Baik (A)</p>
                <p>76.61 - 88.30 → Baik (B)</p>
                <p>65.00 - 76.60 → Kurang Baik (C)</p>
                <p>25.00 - 64.99 → Tidak Baik (D)</p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                onClick={handleSave}
                disabled={saving || !formStationName.trim() || !formIkmValue.trim()}
                className="flex-1 bg-cyan-600 hover:bg-cyan-700"
              >
                {saving ? "Menyimpan..." : editingItem ? "Simpan Perubahan" : "Tambah Stasiun"}
              </Button>
              <Button variant="outline" onClick={() => setShowModal(false)}>
                Batal
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
