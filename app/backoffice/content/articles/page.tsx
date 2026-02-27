"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { 
  BookOpen, Plus, Search, Pencil, Trash2, X, Eye, EyeOff, Tag,
  Upload, FileText, ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ArticleItem {
  id: number;
  title: string;
  slug: string;
  description: string;
  content: string | null;
  imageUrl: string | null;
  pdfUrl: string | null;
  category: string | null;
  status: string;
  authorId: number;
  author: { id: number; name: string; email: string };
  createdAt: string;
  updatedAt: string;
}

export default function ArticlesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const userRole = session?.user?.role || "USER";
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<ArticleItem | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);

  // Form state
  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formImageUrl, setFormImageUrl] = useState("");
  const [formPdfUrl, setFormPdfUrl] = useState("");
  const [formPdfName, setFormPdfName] = useState("");
  const [formCategory, setFormCategory] = useState("press_release");
  const [formStatus, setFormStatus] = useState(["ADMIN", "CONTENT_ADMIN"].includes(userRole) ? "PUBLISHED" : "PENDING_REVIEW");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const fetchArticles = async () => {
    try {
      const res = await fetch("/api/articles");
      const data = await res.json();
      if (Array.isArray(data)) setArticles(data);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const handleImageUpload = async (file: File) => {
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "articles");
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (res.ok) {
        const { url } = await res.json();
        setFormImageUrl(url);
      } else {
        alert("Gagal mengupload gambar");
      }
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setUploadingImage(false);
    }
  };

  const handlePdfUpload = async (file: File) => {
    setUploadingPdf(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "press-release");
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (res.ok) {
        const { url, fileName } = await res.json();
        setFormPdfUrl(url);
        setFormPdfName(fileName || file.name);
      } else {
        alert("Gagal mengupload PDF");
      }
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setUploadingPdf(false);
    }
  };

  const openCreate = () => {
    setEditingItem(null);
    setFormTitle("");
    setFormDesc("");
    setFormContent("");
    setFormImageUrl("");
    setFormPdfUrl("");
    setFormPdfName("");
    setFormCategory("press_release");
    setFormStatus(["ADMIN", "CONTENT_ADMIN"].includes(userRole) ? "PUBLISHED" : "PENDING_REVIEW");
    setShowModal(true);
  };

  const openEdit = (item: ArticleItem) => {
    setEditingItem(item);
    setFormTitle(item.title);
    setFormDesc(item.description);
    setFormContent(item.content || "");
    setFormImageUrl(item.imageUrl || "");
    setFormPdfUrl(item.pdfUrl || "");
    setFormPdfName(item.pdfUrl ? "Dokumen PDF" : "");
    setFormCategory(item.category || "press_release");
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
        pdfUrl: formPdfUrl || null,
        category: formCategory,
        status: formStatus,
      };

      if (editingItem) {
        await fetch(`/api/articles/${editingItem.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch("/api/articles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      setShowModal(false);
      fetchArticles();
    } catch (error) {
      console.error("Save error:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Yakin ingin menghapus artikel ini?")) return;
    setDeleting(id);
    try {
      await fetch(`/api/articles/${id}`, { method: "DELETE" });
      fetchArticles();
    } catch (error) {
      console.error("Delete error:", error);
    } finally {
      setDeleting(null);
    }
  };

  const filteredArticles = articles.filter(
    (a) =>
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.description.toLowerCase().includes(search.toLowerCase())
  );

  const publishedCount = articles.filter((a) => a.status === "PUBLISHED").length;
  const draftCount = articles.filter((a) => a.status === "DRAFT").length;
  const pendingCount = articles.filter((a) => a.status === "PENDING_REVIEW").length;
  const pressReleaseCount = articles.filter((a) => a.category === "press_release").length;
  const withPdfCount = articles.filter((a) => a.pdfUrl).length;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
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
          <h1 className="text-3xl font-bold text-gray-900">Artikel & Press Release</h1>
          <p className="text-gray-500 mt-1">
            Kelola publikasi resmi dan artikel informatif
          </p>
        </div>
        <Button onClick={openCreate} className="gap-2 self-start bg-purple-600 hover:bg-purple-700">
          <Plus className="h-4 w-4" />
          Tambah Artikel
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-xl border shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{articles.length}</p>
              <p className="text-sm text-gray-500">Total Artikel</p>
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
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Tag className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{pressReleaseCount}</p>
              <p className="text-sm text-gray-500">Press Release</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <FileText className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{withPdfCount}</p>
              <p className="text-sm text-gray-500">Punya PDF</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Cari artikel..."
          className="pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      {filteredArticles.length === 0 ? (
        <div className="bg-white rounded-xl border shadow-sm p-12">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <BookOpen className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {search ? "Tidak Ditemukan" : "Belum Ada Artikel"}
            </h3>
            <p className="text-gray-500 mb-6 max-w-sm">
              {search
                ? "Tidak ada artikel yang cocok dengan pencarian Anda"
                : "Mulai tambahkan artikel pertama untuk ditampilkan di website"}
            </p>
            {!search && (
              <Button onClick={openCreate} className="gap-2">
                <Plus className="h-4 w-4" />
                Tambah Artikel Pertama
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
                  <th className="text-left text-sm font-medium text-gray-500 px-6 py-4">PDF</th>
                  <th className="text-left text-sm font-medium text-gray-500 px-6 py-4">Status</th>
                  <th className="text-left text-sm font-medium text-gray-500 px-6 py-4">Tanggal</th>
                  <th className="text-right text-sm font-medium text-gray-500 px-6 py-4">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredArticles.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        <p className="font-medium text-gray-900 line-clamp-1">{item.title}</p>
                        <p className="text-xs text-gray-400 font-mono">/{item.slug}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${
                        item.category === "press_release" 
                          ? "bg-emerald-100 text-emerald-700" 
                          : "bg-blue-100 text-blue-700"
                      }`}>
                        {item.category === "press_release" ? "Press Release" : "Artikel"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {item.pdfUrl ? (
                        <a href={item.pdfUrl} target="_blank" className="inline-flex items-center gap-1 text-red-600 hover:underline text-xs">
                          <FileText className="h-3 w-3" /> PDF
                        </a>
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </td>
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
                          href={`/artikel/${item.slug}`}
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
                {editingItem ? "Edit Artikel" : "Tambah Artikel Baru"}
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
                  placeholder="Masukkan judul artikel..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi Singkat *</label>
                <textarea
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Masukkan deskripsi singkat..."
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Konten (Opsional)</label>
                <textarea
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="Masukkan konten lengkap..."
                  rows={6}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gambar (Opsional)</label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-lg cursor-pointer hover:bg-purple-100 transition-colors text-sm font-medium border border-purple-200">
                    <Upload className="h-4 w-4" />
                    {uploadingImage ? "Mengupload..." : "Upload"}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={uploadingImage}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(file);
                      }}
                    />
                  </label>
                  <Input
                    value={formImageUrl}
                    onChange={(e) => setFormImageUrl(e.target.value)}
                    placeholder="Atau paste URL gambar..."
                    className="flex-1"
                  />
                </div>
                {formImageUrl && (
                  <div className="relative mt-2 w-full h-32 bg-gray-100 rounded-lg overflow-hidden border">
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

              {/* PDF Upload (for Press Release) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  File PDF Press Release (Opsional)
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 px-4 py-3 bg-red-50 text-red-700 rounded-lg cursor-pointer hover:bg-red-100 transition-colors text-sm font-medium border border-red-200 w-fit">
                    <FileText className="h-4 w-4" />
                    {uploadingPdf ? "Mengupload PDF..." : "Upload PDF"}
                    <input
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      disabled={uploadingPdf}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handlePdfUpload(file);
                      }}
                    />
                  </label>
                  {formPdfUrl && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
                      <FileText className="h-5 w-5 text-red-500 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-700 truncate">{formPdfName || "Dokumen PDF"}</p>
                        <a href={formPdfUrl} target="_blank" className="text-xs text-blue-600 hover:underline">
                          Lihat PDF →
                        </a>
                      </div>
                      <button
                        onClick={() => { setFormPdfUrl(""); setFormPdfName(""); }}
                        className="text-red-400 hover:text-red-600"
                      >
                        <X className="h-4 w-4" />
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
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="press_release">Press Release</option>
                    <option value="artikel">Artikel</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                className="flex-1 bg-purple-600 hover:bg-purple-700"
              >
                {saving ? "Menyimpan..." : editingItem ? "Simpan Perubahan" : "Tambah Artikel"}
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
