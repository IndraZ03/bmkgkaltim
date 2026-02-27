"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { 
  Activity, Plus, Pencil, Trash2, LogIn, Search, RefreshCw, User, Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ActivityLogItem {
  id: number;
  action: string;
  target: string;
  details: string | null;
  ipAddress: string | null;
  createdAt: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
}

function getActionIcon(action: string) {
  switch (action) {
    case "CREATE": return <Plus className="h-4 w-4" />;
    case "UPDATE": return <Pencil className="h-4 w-4" />;
    case "DELETE": return <Trash2 className="h-4 w-4" />;
    case "LOGIN": return <LogIn className="h-4 w-4" />;
    default: return <Activity className="h-4 w-4" />;
  }
}

function getActionColor(action: string) {
  switch (action) {
    case "CREATE": return "bg-green-100 text-green-600";
    case "UPDATE": return "bg-blue-100 text-blue-600";
    case "DELETE": return "bg-red-100 text-red-600";
    case "LOGIN": return "bg-purple-100 text-purple-600";
    default: return "bg-gray-100 text-gray-600";
  }
}

function getActionLabel(action: string) {
  switch (action) {
    case "CREATE": return "Tambah";
    case "UPDATE": return "Edit";
    case "DELETE": return "Hapus";
    case "LOGIN": return "Login";
    case "SYSTEM": return "Sistem";
    default: return action;
  }
}

function getRoleColor(role: string) {
  switch (role) {
    case "ADMIN": return "bg-red-50 text-red-600 border-red-200";
    case "CONTENT": return "bg-green-50 text-green-600 border-green-200";
    case "CONTENT_ADMIN": return "bg-purple-50 text-purple-600 border-purple-200";
    case "DATIN": return "bg-blue-50 text-blue-600 border-blue-200";
    case "PELAYANAN": return "bg-orange-50 text-orange-600 border-orange-200";
    default: return "bg-gray-50 text-gray-600 border-gray-200";
  }
}

export default function ActivityLogsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [logs, setLogs] = useState<ActivityLogItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const limit = 20;

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
    if (status === "authenticated" && session?.user?.role !== "ADMIN") {
      router.push("/backoffice");
    }
  }, [status, session, router]);

  const fetchLogs = async (offset = 0) => {
    try {
      const res = await fetch(`/api/activity-logs?limit=${limit}&offset=${offset}`);
      const data = await res.json();
      setLogs(data.logs || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(page * limit);
  }, [page]);

  const filteredLogs = logs.filter(
    (log) =>
      (log.details || "").toLowerCase().includes(search.toLowerCase()) ||
      log.target.toLowerCase().includes(search.toLowerCase()) ||
      log.user.name.toLowerCase().includes(search.toLowerCase()) ||
      log.user.email.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(total / limit);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
        <div className="h-96 bg-gray-200 rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Log Aktivitas</h1>
          <p className="text-gray-500 mt-1">
            Riwayat aktivitas pengguna di backoffice ({total} total log)
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => { setLoading(true); fetchLogs(page * limit); }}
          className="gap-2 self-start"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Cari berdasarkan nama, email, aksi..."
          className="pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Activity Log List */}
      {filteredLogs.length === 0 ? (
        <div className="bg-white rounded-xl border shadow-sm p-12">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Activity className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Tidak Ada Log</h3>
            <p className="text-gray-500 max-w-sm">
              Belum ada aktivitas yang tercatat di sistem
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left text-sm font-medium text-gray-500 px-6 py-4">Waktu</th>
                  <th className="text-left text-sm font-medium text-gray-500 px-6 py-4">Pengguna</th>
                  <th className="text-left text-sm font-medium text-gray-500 px-6 py-4">Aksi</th>
                  <th className="text-left text-sm font-medium text-gray-500 px-6 py-4">Target</th>
                  <th className="text-left text-sm font-medium text-gray-500 px-6 py-4">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="h-3.5 w-3.5 flex-shrink-0" />
                        <span className="whitespace-nowrap">
                          {new Date(log.createdAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                        <span className="text-gray-400">
                          {new Date(log.createdAt).toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="h-4 w-4 text-slate-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{log.user.name}</p>
                          <div className="flex items-center gap-2">
                            <p className="text-xs text-gray-500">{log.user.email}</p>
                            <span className={`inline-flex px-1.5 py-0.5 text-[10px] font-medium rounded border ${getRoleColor(log.user.role)}`}>
                              {log.user.role}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${getActionColor(log.action)}`}>
                        {getActionIcon(log.action)}
                        {getActionLabel(log.action)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{log.target}</td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-500 line-clamp-2 max-w-xs">
                        {log.details || "-"}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50">
              <p className="text-sm text-gray-500">
                Menampilkan {page * limit + 1} - {Math.min((page + 1) * limit, total)} dari {total} log
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 0}
                  onClick={() => setPage(page - 1)}
                >
                  Sebelumnya
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage(page + 1)}
                >
                  Selanjutnya
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
