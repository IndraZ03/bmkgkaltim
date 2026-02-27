"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { 
  Newspaper, Plus, Search, Pencil, Trash2, X, Eye, EyeOff, Calendar, 
  Upload, Image as ImageIcon, Link as LinkIcon, ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface NewsItem {
  id: number;
  title: string;
  slug: string;
  description: string;
  content: string | null;
  imageUrl: string | null;
  category: string | null;
  status: string;
  authorId: number;
  author: { id: number; name: string; email: string };
  createdAt: string;
  updatedAt: string;
}

export default function NewsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const userRole = session?.user?.role || "USER";
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<NewsItem | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Form state
  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formImageUrl, setFormImageUrl] = useState("");
  const [formCategory, setFormCategory] = useState("berita");
  const [formStatus, setFormStatus] = useState(["ADMIN", "CONTENT_ADMIN"].includes(userRole) ? "PUBLISHED" : "PENDING_REVIEW");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const fetchNews = async () => {
    try {
      const res = await fetch("/api/news");
      const data = await res.json();
      if (Array.isArray(data)) setNews(data);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "news");
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (res.ok) {
        const { url } = await res.json();
        setFormImageUrl(url);
      } else {
        alert("Gagal mengupload gambar");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Gagal mengupload gambar");
    } finally {
      setUploading(false);
    }
  };

  const openCreate = () => {
    setEditingItem(null);
    setFormTitle("");
    setFormDesc("");
    setFormContent("");
    setFormImageUrl("");
    setFormCategory("berita");
    setFormStatus(["ADMIN", "CONTENT_ADMIN"].includes(userRole) ? "PUBLISHED" : "PENDING_REVIEW");
    setShowModal(true);
  };

  const openEdit = (item: NewsItem) => {
    setEditingItem(item);
    setFormTitle(item.title);
    setFormDesc(item.description);
    setFormContent(item.content || "");
    setFormImageUrl(item.imageUrl || "");
    setFormCategory(item.category || "berita");
    setFormStatus(item.status);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formTitle.trim() || !formDesc.trim()) return;
    setSaving(true);

    try {
      const payload = {
        title: formTitle,
        description: formDesc,
        content: formContent,
        imageUrl: formImageUrl || null,
        category: formCategory,
        status: formStatus,
      };

      if (editingItem) {
        await fetch(`/api/news/${editingItem.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch("/api/news", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      setShowModal(false);
      fetchNews();
    } catch (error) {
      console.error("Save error:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Yakin ingin menghapus berita ini?")) return;
    setDeleting(id);
    try {
      await fetch(`/api/news/${id}`, { method: "DELETE" });
      fetchNews();
    } catch (error) {
      console.error("Delete error:", error);
    } finally {
      setDeleting(null);
    }
  };

  const filteredNews = news.filter(
    (n) =>
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.description.toLowerCase().includes(search.toLowerCase())
  );

  const publishedCount = news.filter((n) => n.status === "PUBLISHED").length;
  const draftCount = news.filter((n) => n.status === "DRAFT").length;
  const pendingCount = news.filter((n) => n.status === "PENDING_REVIEW").length;
  const beritaCount = news.filter((n) => n.category === "berita").length;
  const kegiatanCount = news.filter((n) => n.category === "kegiatan").length;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="h-96 bg-gray-200 rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Berita & Kegiatan</h1>
          <p className="text-gray-500 mt-1">
            Kelola konten berita dan kegiatan terkini
          </p>
        </div>
        <Button onClick={openCreate} className="gap-2 self-start bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4" />
          Tambah Berita
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-xl border shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Newspaper className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{news.length}</p>
              <p className="text-sm text-gray-500">Total</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Eye className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{publishedCount}</p>
              <p className="text-sm text-gray-500">Dipublikasi</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <EyeOff className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{draftCount}</p>
              <p className="text-sm text-gray-500">Draft</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-sky-100 rounded-lg flex items-center justify-center">
              <Newspaper className="h-6 w-6 text-sky-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{beritaCount}</p>
              <p className="text-sm text-gray-500">Berita</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
              <Calendar className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{kegiatanCount}</p>
              <p className="text-sm text-gray-500">Kegiatan</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Cari berita..."
          className="pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      {filteredNews.length === 0 ? (
        <div className="bg-white rounded-xl border shadow-sm p-12">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Newspaper className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {search ? "Tidak Ditemukan" : "Belum Ada Berita"}
            </h3>
            <p className="text-gray-500 mb-6 max-w-sm">
              {search
                ? "Tidak ada berita yang cocok dengan pencarian Anda"
                : "Mulai tambahkan berita pertama untuk ditampilkan di website"}
            </p>
            {!search && (
              <Button onClick={openCreate} className="gap-2">
                <Plus className="h-4 w-4" />
                Tambah Berita Pertama
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left text-sm font-medium text-gray-500 px-6 py-4">Judul</th>
                  <th className="text-left text-sm font-medium text-gray-500 px-6 py-4">Kategori</th>
                  <th className="text-left text-sm font-medium text-gray-500 px-6 py-4">Penulis</th>
                  <th className="text-left text-sm font-medium text-gray-500 px-6 py-4">Status</th>
                  <th className="text-left text-sm font-medium text-gray-500 px-6 py-4">Tanggal</th>
                  <th className="text-right text-sm font-medium text-gray-500 px-6 py-4">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredNews.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {item.imageUrl && (
                          <img src={item.imageUrl} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                        )}
                        <div className="max-w-xs">
                          <p className="font-medium text-gray-900 line-clamp-1">{item.title}</p>
                          <p className="text-xs text-gray-400 font-mono">/{item.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${
                        item.category === "kegiatan" 
                          ? "bg-amber-100 text-amber-700" 
                          : "bg-sky-100 text-sky-700"
                      }`}>
                        {item.category === "kegiatan" ? "Kegiatan" : "Berita"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{item.author.name}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${
                          item.status === "PUBLISHED"
                            ? "bg-green-100 text-green-700"
                            : item.status === "DRAFT"
                            ? "bg-yellow-100 text-yellow-700"
                            : item.status === "PENDING_REVIEW"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {item.status === "PUBLISHED" ? "Dipublikasi" : item.status === "DRAFT" ? "Draft" : item.status === "PENDING_REVIEW" ? "Menunggu Review" : "Diarsipkan"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(item.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <a
                          href={`/berita/${item.slug}`}
                          target="_blank"
                          className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Lihat"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                        <button
                          onClick={() => openEdit(item)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          disabled={deleting === item.id}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Hapus"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {editingItem ? "Edit Berita" : "Tambah Berita Baru"}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Judul *</label>
                <Input
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Masukkan judul berita..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi Singkat *</label>
                <textarea
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Masukkan deskripsi singkat..."
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Konten (Opsional)</label>
                <textarea
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="Masukkan konten lengkap..."
                  rows={6}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gambar</label>
                <div className="space-y-3">
                  {/* Upload Button */}
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors text-sm font-medium border border-blue-200">
                      <Upload className="h-4 w-4" />
                      {uploading ? "Mengupload..." : "Upload Gambar"}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={uploading}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(file);
                        }}
                      />
                    </label>
                    <span className="text-xs text-gray-400">atau</span>
                    <Input
                      value={formImageUrl}
                      onChange={(e) => setFormImageUrl(e.target.value)}
                      placeholder="Paste URL gambar..."
                      className="flex-1"
                    />
                  </div>
                  {/* Image Preview */}
                  {formImageUrl && (
                    <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden border">
                      <img src={formImageUrl} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        onClick={() => setFormImageUrl("")}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="berita">Berita</option>
                    <option value="kegiatan">Kegiatan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {["ADMIN", "CONTENT_ADMIN"].includes(userRole) && <option value="PUBLISHED">Dipublikasi</option>}
                    <option value="PENDING_REVIEW">Ajukan Review</option>
                    <option value="DRAFT">Draft</option>
                    {["ADMIN", "CONTENT_ADMIN"].includes(userRole) && <option value="ARCHIVED">Diarsipkan</option>}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                onClick={handleSave}
                disabled={saving || !formTitle.trim() || !formDesc.trim()}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {saving ? "Menyimpan..." : editingItem ? "Simpan Perubahan" : "Tambah Berita"}
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
