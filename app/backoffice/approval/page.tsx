"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  XCircle,
  Newspaper,
  BookOpen,
  Video,
  Clock,
  Eye,
  Loader2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NewsItem {
  id: number;
  title: string;
  description: string;
  content: string | null;
  imageUrl: string | null;
  status: string;
  author: { id: number; name: string; email: string };
  createdAt: string;
}

interface ArticleItem {
  id: number;
  title: string;
  description: string;
  content: string | null;
  imageUrl: string | null;
  category: string;
  status: string;
  author: { id: number; name: string; email: string };
  createdAt: string;
}

interface VideoItem {
  id: number;
  title: string;
  youtubeId: string;
  description: string | null;
  status: string;
  createdAt: string;
}

type ContentTab = "all" | "news" | "articles" | "videos";

export default function ApprovalPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ContentTab>("all");
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [confirmAction, setConfirmAction] = useState<{
    type: string;
    id: number;
    action: "approve" | "reject";
    title: string;
  } | null>(null);

  useEffect(() => {
    if (!["ADMIN", "CONTENT_ADMIN"].includes(session?.user?.role || "")) return;
    fetchPending();
  }, [session]);

  const fetchPending = async () => {
    try {
      const res = await fetch("/api/approval");
      if (res.ok) {
        const data = await res.json();
        setNews(data.news || []);
        setArticles(data.articles || []);
        setVideos(data.videos || []);
      }
    } catch (err) {
      console.error("Error fetching pending:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (contentType: string, contentId: number, action: "approve" | "reject") => {
    const key = `${contentType}-${contentId}`;
    setProcessing(key);

    try {
      const res = await fetch("/api/approval", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentType, contentId, action }),
      });

      if (res.ok) {
        // Remove from pending lists
        if (contentType === "news") setNews((prev) => prev.filter((n) => n.id !== contentId));
        else if (contentType === "articles") setArticles((prev) => prev.filter((a) => a.id !== contentId));
        else if (contentType === "videos") setVideos((prev) => prev.filter((v) => v.id !== contentId));
      }
    } catch (err) {
      console.error("Error processing action:", err);
    } finally {
      setProcessing(null);
      setConfirmAction(null);
    }
  };

  const toggleExpand = (key: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  if (!["ADMIN", "CONTENT_ADMIN"].includes(session?.user?.role || "")) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Akses Ditolak</h2>
          <p className="text-gray-500">Hanya Administrator dan Content Admin yang dapat mengakses halaman persetujuan.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
          <p className="text-gray-500">Memuat konten menunggu persetujuan...</p>
        </div>
      </div>
    );
  }

  const totalPending = news.length + articles.length + videos.length;

  const tabs: { key: ContentTab; label: string; count: number; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: "all", label: "Semua", count: totalPending, icon: Clock },
    { key: "news", label: "Berita & Kegiatan", count: news.length, icon: Newspaper },
    { key: "articles", label: "Artikel & Press Release", count: articles.length, icon: BookOpen },
    { key: "videos", label: "Video", count: videos.length, icon: Video },
  ];

  const filteredNews = activeTab === "all" || activeTab === "news" ? news : [];
  const filteredArticles = activeTab === "all" || activeTab === "articles" ? articles : [];
  const filteredVideos = activeTab === "all" || activeTab === "videos" ? videos : [];

  const ContentCard = ({
    contentType,
    id,
    title,
    description,
    author,
    createdAt,
    imageUrl,
    extraContent,
    badge,
    badgeColor,
  }: {
    contentType: string;
    id: number;
    title: string;
    description: string;
    author?: { name: string; email: string };
    createdAt: string;
    imageUrl?: string | null;
    extraContent?: React.ReactNode;
    badge: string;
    badgeColor: string;
  }) => {
    const key = `${contentType}-${id}`;
    const isExpanded = expandedItems.has(key);
    const isProcessing = processing === key;

    return (
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden hover:shadow-md transition-shadow">
        <div className="p-5">
          <div className="flex items-start gap-4">
            {imageUrl && (
              <img
                src={imageUrl}
                alt={title}
                className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className={cn("px-2 py-0.5 text-xs font-medium rounded-full", badgeColor)}>
                  {badge}
                </span>
                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-amber-100 text-amber-700 border border-amber-200">
                  <Clock className="inline h-3 w-3 mr-0.5 -mt-0.5" />
                  Menunggu Persetujuan
                </span>
              </div>
              <h3 className="font-semibold text-gray-900 text-base truncate">{title}</h3>
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{description}</p>
              <div className="flex items-center gap-3 mt-2 text-xs text-gray-400 flex-wrap">
                {author && (
                  <span>
                    Oleh: <strong className="text-gray-600">{author.name}</strong>
                  </span>
                )}
                <span>
                  {new Date(createdAt).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Expand/Preview */}
          {extraContent && (
            <button
              onClick={() => toggleExpand(key)}
              className="flex items-center gap-1 mt-3 text-xs text-blue-600 hover:text-blue-800 transition-colors"
            >
              <Eye className="h-3.5 w-3.5" />
              {isExpanded ? "Sembunyikan" : "Lihat Detail"}
              {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>
          )}

          {isExpanded && extraContent && (
            <div className="mt-3 p-4 bg-gray-50 rounded-lg border text-sm text-gray-700 max-h-60 overflow-y-auto">
              {extraContent}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 px-5 py-3 bg-gray-50 border-t">
          {isProcessing ? (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Memproses...
            </div>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                onClick={() => setConfirmAction({ type: contentType, id, action: "reject", title })}
              >
                <XCircle className="h-4 w-4 mr-1.5" />
                Tolak
              </Button>
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() => setConfirmAction({ type: contentType, id, action: "approve", title })}
              >
                <CheckCircle2 className="h-4 w-4 mr-1.5" />
                Setujui
              </Button>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Persetujuan Konten</h1>
          <p className="text-gray-500 text-sm mt-1">
            Review dan setujui konten yang diajukan oleh Content Manager
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 text-amber-700 rounded-full text-sm font-medium border border-amber-200">
            <Clock className="h-4 w-4" />
            {totalPending} menunggu
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all",
                activeTab === tab.key
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-white text-gray-600 border hover:bg-gray-50"
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
              {tab.count > 0 && (
                <span
                  className={cn(
                    "px-1.5 py-0.5 text-xs rounded-full font-bold",
                    activeTab === tab.key
                      ? "bg-white/20 text-white"
                      : "bg-amber-100 text-amber-700"
                  )}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Content Lists */}
      {totalPending === 0 ? (
        <div className="bg-white rounded-2xl border shadow-sm p-12 text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Semua Sudah Disetujui</h2>
          <p className="text-gray-500">
            Tidak ada konten yang menunggu persetujuan saat ini.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* News */}
          {filteredNews.map((item) => (
            <ContentCard
              key={`news-${item.id}`}
              contentType="news"
              id={item.id}
              title={item.title}
              description={item.description}
              author={item.author}
              createdAt={item.createdAt}
              imageUrl={item.imageUrl}
              badge="Berita & Kegiatan"
              badgeColor="bg-blue-100 text-blue-700"
              extraContent={
                item.content ? (
                  <div dangerouslySetInnerHTML={{ __html: item.content }} />
                ) : null
              }
            />
          ))}

          {/* Articles */}
          {filteredArticles.map((item) => (
            <ContentCard
              key={`articles-${item.id}`}
              contentType="articles"
              id={item.id}
              title={item.title}
              description={item.description}
              author={item.author}
              createdAt={item.createdAt}
              imageUrl={item.imageUrl}
              badge={item.category === "press_release" ? "Press Release" : "Artikel"}
              badgeColor="bg-purple-100 text-purple-700"
              extraContent={
                item.content ? (
                  <div dangerouslySetInnerHTML={{ __html: item.content }} />
                ) : null
              }
            />
          ))}

          {/* Videos */}
          {filteredVideos.map((item) => (
            <ContentCard
              key={`videos-${item.id}`}
              contentType="videos"
              id={item.id}
              title={item.title}
              description={item.description || ""}
              createdAt={item.createdAt}
              badge="Video"
              badgeColor="bg-rose-100 text-rose-700"
              extraContent={
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">YouTube ID: <strong>{item.youtubeId}</strong></p>
                  <div className="aspect-video rounded-lg overflow-hidden bg-black">
                    <iframe
                      src={`https://www.youtube.com/embed/${item.youtubeId}`}
                      className="w-full h-full"
                      allowFullScreen
                    />
                  </div>
                  {item.description && <p className="text-sm">{item.description}</p>}
                </div>
              }
            />
          ))}
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmAction && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-4">
              {confirmAction.action === "approve" ? (
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                </div>
              ) : (
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <XCircle className="h-6 w-6 text-red-600" />
                </div>
              )}
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {confirmAction.action === "approve" ? "Setujui Konten?" : "Tolak Konten?"}
                </h3>
                <p className="text-sm text-gray-500">
                  {confirmAction.action === "approve"
                    ? "Konten akan dipublikasikan dan ditampilkan di website."
                    : "Konten akan dikembalikan ke status draft."}
                </p>
              </div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg mb-4">
              <p className="text-sm font-medium text-gray-900 truncate">&ldquo;{confirmAction.title}&rdquo;</p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setConfirmAction(null)}
              >
                Batal
              </Button>
              <Button
                className={cn(
                  "flex-1",
                  confirmAction.action === "approve"
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-red-600 hover:bg-red-700"
                )}
                onClick={() =>
                  handleAction(confirmAction.type, confirmAction.id, confirmAction.action)
                }
              >
                {confirmAction.action === "approve" ? "Ya, Setujui" : "Ya, Tolak"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
