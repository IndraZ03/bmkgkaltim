"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { 
  Video, Plus, Search, Trash2, X, Play, Pencil 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface VideoItem {
  id: number;
  title: string;
  youtubeId: string;
  description: string | null;
  status: string;
  createdAt: string;
}

function extractYouTubeId(input: string): string {
  // If it's already just an ID (no slash or dot), return as-is
  if (/^[a-zA-Z0-9_-]{11}$/.test(input)) return input;
  
  // Try to extract from URL
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  ];
  
  for (const pattern of patterns) {
    const match = input.match(pattern);
    if (match) return match[1];
  }
  
  return input; // Return as-is if no pattern matches
}

export default function VideosPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const userRole = session?.user?.role || "USER";
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<VideoItem | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formTitle, setFormTitle] = useState("");
  const [formYoutubeUrl, setFormYoutubeUrl] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formStatus, setFormStatus] = useState(["ADMIN", "CONTENT_ADMIN"].includes(userRole) ? "PUBLISHED" : "PENDING_REVIEW");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const fetchVideos = async () => {
    try {
      const res = await fetch("/api/videos");
      const data = await res.json();
      if (Array.isArray(data)) setVideos(data);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const openCreate = () => {
    setEditingItem(null);
    setFormTitle("");
    setFormYoutubeUrl("");
    setFormDesc("");
    setFormStatus(["ADMIN", "CONTENT_ADMIN"].includes(userRole) ? "PUBLISHED" : "PENDING_REVIEW");
    setShowModal(true);
  };

  const openEdit = (item: VideoItem) => {
    setEditingItem(item);
    setFormTitle(item.title);
    setFormYoutubeUrl(item.youtubeId);
    setFormDesc(item.description || "");
    setFormStatus(item.status);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formTitle.trim() || !formYoutubeUrl.trim()) return;
    setSaving(true);

    try {
      const youtubeId = extractYouTubeId(formYoutubeUrl.trim());
      const payload = {
        title: formTitle,
        youtubeId,
        description: formDesc || null,
        status: formStatus,
      };

      if (editingItem) {
        await fetch(`/api/videos/${editingItem.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch("/api/videos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      setShowModal(false);
      fetchVideos();
    } catch (error) {
      console.error("Save error:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Yakin ingin menghapus video ini?")) return;
    setDeleting(id);
    try {
      await fetch(`/api/videos/${id}`, { method: "DELETE" });
      fetchVideos();
    } catch (error) {
      console.error("Delete error:", error);
    } finally {
      setDeleting(null);
    }
  };

  const filteredVideos = videos.filter(
    (v) => v.title.toLowerCase().includes(search.toLowerCase())
  );

  const publishedCount = videos.filter((v) => v.status === "PUBLISHED").length;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="aspect-video bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Galeri Video</h1>
          <p className="text-gray-500 mt-1">
            Kelola video dari YouTube untuk ditampilkan di website
          </p>
        </div>
        <Button onClick={openCreate} className="gap-2 self-start bg-orange-600 hover:bg-orange-700">
          <Plus className="h-4 w-4" />
          Tambah Video
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-xl border shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Video className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{videos.length}</p>
              <p className="text-sm text-gray-500">Total Video</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Play className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{publishedCount}</p>
              <p className="text-sm text-gray-500">Dipublikasi</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Cari video..."
          className="pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Video Grid */}
      {filteredVideos.length === 0 ? (
        <div className="bg-white rounded-xl border shadow-sm p-12">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Video className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {search ? "Tidak Ditemukan" : "Belum Ada Video"}
            </h3>
            <p className="text-gray-500 mb-6 max-w-sm">
              {search
                ? "Tidak ada video yang cocok dengan pencarian Anda"
                : "Tambahkan video YouTube pertama untuk ditampilkan di website"}
            </p>
            {!search && (
              <Button onClick={openCreate} className="gap-2">
                <Plus className="h-4 w-4" />
                Tambah Video Pertama
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos.map((video) => (
            <div
              key={video.id}
              className="bg-white rounded-xl border shadow-sm overflow-hidden group hover:shadow-lg transition-all"
            >
              {/* Thumbnail */}
              <div className="relative aspect-video bg-black">
                <img
                  src={`https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`}
                  alt={video.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <a
                    href={`https://www.youtube.com/watch?v=${video.youtubeId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center"
                  >
                    <Play className="h-6 w-6 text-gray-900 ml-1" />
                  </a>
                </div>
                {video.status === "DRAFT" && (
                  <div className="absolute top-2 left-2 px-2 py-1 bg-yellow-500 rounded text-xs text-white font-medium">
                    Draft
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2">
                  {video.title}
                </h3>
                {video.description && (
                  <p className="text-sm text-gray-500 line-clamp-2 mb-3">{video.description}</p>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">
                    {new Date(video.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => openEdit(video)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(video.id)}
                      disabled={deleting === video.id}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Hapus"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto m-4 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {editingItem ? "Edit Video" : "Tambah Video Baru"}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Judul Video *</label>
                <Input
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Masukkan judul video..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  YouTube URL atau ID *
                </label>
                <Input
                  value={formYoutubeUrl}
                  onChange={(e) => setFormYoutubeUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=xxxx atau ID video"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Bisa berupa URL lengkap YouTube atau hanya ID video (11 karakter)
                </p>
              </div>
              {formYoutubeUrl && (
                <div className="rounded-lg overflow-hidden border">
                  <img
                    src={`https://img.youtube.com/vi/${extractYouTubeId(formYoutubeUrl)}/mqdefault.jpg`}
                    alt="Preview"
                    className="w-full aspect-video object-cover"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi (Opsional)</label>
                <textarea
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Deskripsi singkat video..."
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {["ADMIN", "CONTENT_ADMIN"].includes(userRole) && <option value="PUBLISHED">Dipublikasi</option>}
                  <option value="PENDING_REVIEW">Ajukan Review</option>
                  <option value="DRAFT">Draft</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                onClick={handleSave}
                disabled={saving || !formTitle.trim() || !formYoutubeUrl.trim()}
                className="flex-1 bg-orange-600 hover:bg-orange-700"
              >
                {saving ? "Menyimpan..." : editingItem ? "Simpan Perubahan" : "Tambah Video"}
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
