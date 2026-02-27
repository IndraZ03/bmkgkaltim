import React from "react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { 
  Users, 
  Newspaper, 
  BookOpen, 
  Video, 
  TrendingUp, 
  ArrowUpRight,
  Calendar,
  BarChart3,
  Activity,
  Clock,
  FileText,
  Plus,
  User,
  Pencil,
  Trash2,
  LogIn
} from "lucide-react";
import Link from "next/link";

export default async function BackofficePage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const isAdmin = session.user?.role === "ADMIN";
  const isContent = ["ADMIN", "CONTENT", "CONTENT_ADMIN"].includes(session.user?.role || "");
  const isDatin = ["ADMIN", "DATIN"].includes(session.user?.role || "");

  // Fetch real counts from DB
  const [
    totalUsers,
    totalNews, 
    totalArticles,
    totalVideos,
    ikmStationsCount,
    recentLogs,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.news.count(),
    prisma.article.count(),
    prisma.videoGallery.count(),
    prisma.ikmStation.count(),
    prisma.activityLog.findMany({
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
  ]);

  const statsCards = [
    {
      title: "Total Users",
      value: totalUsers.toString(),
      icon: Users,
      color: "from-blue-500 to-blue-600",
      href: "/backoffice/users",
      show: isAdmin,
    },
    {
      title: "Berita & Kegiatan",
      value: totalNews.toString(),
      icon: Newspaper,
      color: "from-green-500 to-green-600",
      href: "/backoffice/content/news",
      show: isContent,
    },
    {
      title: "Artikel & Press Release",
      value: totalArticles.toString(),
      icon: BookOpen,
      color: "from-purple-500 to-purple-600",
      href: "/backoffice/content/articles",
      show: isContent,
    },
    {
      title: "Galeri Video",
      value: totalVideos.toString(),
      icon: Video,
      color: "from-orange-500 to-orange-600",
      href: "/backoffice/content/videos",
      show: isContent,
    },
    {
      title: "Stasiun IKM",
      value: ikmStationsCount.toString(),
      icon: BarChart3,
      color: "from-cyan-500 to-cyan-600",
      href: "/backoffice/ikm",
      show: isAdmin || isDatin,
    },
  ];

  const getActionIcon = (action: string) => {
    switch (action) {
      case "CREATE": return <Plus className="h-3 w-3" />;
      case "UPDATE": return <Pencil className="h-3 w-3" />;
      case "DELETE": return <Trash2 className="h-3 w-3" />;
      case "LOGIN": return <LogIn className="h-3 w-3" />;
      default: return <Activity className="h-3 w-3" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case "CREATE": return "bg-green-100 text-green-600";
      case "UPDATE": return "bg-blue-100 text-blue-600";
      case "DELETE": return "bg-red-100 text-red-600";
      case "LOGIN": return "bg-purple-100 text-purple-600";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return "Baru saja";
    if (minutes < 60) return `${minutes} menit lalu`;
    if (hours < 24) return `${hours} jam lalu`;
    return `${days} hari lalu`;
  };

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-500/10 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="relative">
          <div className="flex items-center gap-2 text-blue-400 text-sm mb-2">
            <Calendar className="h-4 w-4" />
            {new Date().toLocaleDateString("id-ID", { 
              weekday: "long", 
              day: "numeric", 
              month: "long", 
              year: "numeric" 
            })}
          </div>
          <h1 className="text-3xl font-bold mb-2">Selamat Datang, {session.user?.name}!</h1>
          <p className="text-slate-300">
            Kelola konten dan data website BMKG Kalimantan Timur dari panel ini
          </p>
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full text-sm">
            <div className={`w-2 h-2 rounded-full ${
              session.user?.role === "ADMIN" ? "bg-red-400" :
              session.user?.role === "CONTENT" ? "bg-green-400" :
              session.user?.role === "DATIN" ? "bg-blue-400" : "bg-gray-400"
            }`} />
            {session.user?.role}
          </div>
        </div>
      </div>



      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {statsCards.filter(card => card.show).map((card) => {
          return (
            <Link
              key={card.title}
              href={card.href}
              className="group bg-white rounded-xl border shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
            >
              <div className={`h-1 bg-gradient-to-r ${card.color}`} />
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center shadow-lg`}>
                    <card.icon className="h-6 w-6 text-white" />
                  </div>
                  <ArrowUpRight className="h-5 w-5 text-gray-300 group-hover:text-gray-500 transition-colors" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                <p className="text-sm text-gray-500 mt-1">{card.title}</p>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        {!isDatin && isContent && (
          <div className="lg:col-span-2 bg-white rounded-xl border shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Akses Cepat</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {isContent && (
                <>
                  <Link 
                    href="/backoffice/content/news"
                    className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gray-50 hover:bg-blue-50 border border-transparent hover:border-blue-200 transition-all group"
                  >
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Newspaper className="h-6 w-6 text-blue-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700 text-center">Berita & Kegiatan</span>
                  </Link>
                  <Link 
                    href="/backoffice/content/articles"
                    className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gray-50 hover:bg-purple-50 border border-transparent hover:border-purple-200 transition-all group"
                  >
                    <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <BookOpen className="h-6 w-6 text-purple-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-purple-700 text-center">Artikel & Press Release</span>
                  </Link>
                  <Link 
                    href="/backoffice/content/videos"
                    className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gray-50 hover:bg-orange-50 border border-transparent hover:border-orange-200 transition-all group"
                  >
                    <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Video className="h-6 w-6 text-orange-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-orange-700">Galeri Video</span>
                  </Link>
                </>
              )}
              {isAdmin && (
                <>
                  <Link 
                    href="/backoffice/users"
                    className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gray-50 hover:bg-green-50 border border-transparent hover:border-green-200 transition-all group"
                  >
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Users className="h-6 w-6 text-green-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-green-700">Kelola User</span>
                  </Link>
                  <Link 
                    href="/backoffice/ikm"
                    className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gray-50 hover:bg-cyan-50 border border-transparent hover:border-cyan-200 transition-all group"
                  >
                    <div className="w-12 h-12 rounded-full bg-cyan-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <BarChart3 className="h-6 w-6 text-cyan-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-cyan-700">IKM Stasiun</span>
                  </Link>
                  <Link 
                    href="/backoffice/activity-logs"
                    className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gray-50 hover:bg-amber-50 border border-transparent hover:border-amber-200 transition-all group"
                  >
                    <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Activity className="h-6 w-6 text-amber-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-amber-700">Log Aktivitas</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}

        {/* Recent Activity (Real from DB) */}
        <div className="bg-white rounded-xl border shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Aktivitas Terbaru</h2>
            {isAdmin && (
              <Link href="/backoffice/activity-logs" className="text-xs text-blue-600 hover:text-blue-800">
                Lihat Semua
              </Link>
            )}
          </div>
          <div className="space-y-4">
            {recentLogs.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">Belum ada aktivitas</p>
            ) : (
              recentLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-3">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${getActionColor(log.action)}`}>
                    {getActionIcon(log.action)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 line-clamp-1">{log.details || log.target}</p>
                    <p className="text-xs text-gray-500">{log.user.name} · {formatTimeAgo(log.createdAt)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Ringkasan Konten */}
      <div className="bg-white rounded-xl border shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Ringkasan Konten Website</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-xl">
            <div className="w-10 h-10 mx-auto mb-2 bg-blue-100 rounded-full flex items-center justify-center">
              <Newspaper className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{totalNews}</p>
            <p className="text-sm text-gray-500">Berita & Kegiatan</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-xl">
            <div className="w-10 h-10 mx-auto mb-2 bg-purple-100 rounded-full flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{totalArticles}</p>
            <p className="text-sm text-gray-500">Artikel & Press Release</p>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-xl">
            <div className="w-10 h-10 mx-auto mb-2 bg-orange-100 rounded-full flex items-center justify-center">
              <Video className="h-5 w-5 text-orange-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{totalVideos}</p>
            <p className="text-sm text-gray-500">Galeri Video</p>
          </div>
          <div className="text-center p-4 bg-cyan-50 rounded-xl">
            <div className="w-10 h-10 mx-auto mb-2 bg-cyan-100 rounded-full flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-cyan-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{ikmStationsCount}</p>
            <p className="text-sm text-gray-500">Stasiun IKM</p>
          </div>
        </div>
      </div>
    </div>
  );
}
