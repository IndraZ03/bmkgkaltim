"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  FileText, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Users, 
  Newspaper, 
  BookOpen, 
  Video,
  Database,
  ChevronDown,
  ChevronRight,
  BarChart3,
  ClipboardList,
  ClipboardCheck,
  Activity
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { signOut, useSession } from "next-auth/react";

interface MenuItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href?: string;
  roles?: string[];
  children?: {
    label: string;
    href: string;
    roles?: string[];
  }[];
}

const sidebarItems: MenuItem[] = [
  {
    icon: LayoutDashboard,
    label: "Beranda",
    href: "/backoffice",
    // All roles can see dashboard
  },
  {
    icon: Users,
    label: "Manajemen User",
    href: "/backoffice/users",
    roles: ["ADMIN"],
  },
  {
    icon: FileText,
    label: "Konten",
    roles: ["ADMIN", "CONTENT", "CONTENT_ADMIN"],
    children: [
      {
        label: "Berita & Kegiatan",
        href: "/backoffice/content/news",
        roles: ["ADMIN", "CONTENT", "CONTENT_ADMIN"],
      },
      {
        label: "Artikel & Press Release",
        href: "/backoffice/content/articles",
        roles: ["ADMIN", "CONTENT", "CONTENT_ADMIN"],
      },
      {
        label: "Galeri Video",
        href: "/backoffice/content/videos",
        roles: ["ADMIN", "CONTENT", "CONTENT_ADMIN"],
      },
    ],
  },
  {
    icon: ClipboardCheck,
    label: "Persetujuan",
    href: "/backoffice/approval",
    roles: ["ADMIN", "CONTENT_ADMIN"],
  },
  {
    icon: BarChart3,
    label: "IKM Stasiun",
    href: "/backoffice/ikm",
    roles: ["ADMIN", "DATIN"],
  },
  {
    icon: Activity,
    label: "Log Aktivitas",
    href: "/backoffice/activity-logs",
    roles: ["ADMIN"],
  },
  {
    icon: Database,
    label: "Permohonan Data",
    href: "/backoffice/datin",
    roles: ["DATIN", "ADMIN"],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>(["Konten"]);
  const { data: session } = useSession();
  const userRole = session?.user?.role || "USER";

  const toggleExpanded = (label: string) => {
    setExpandedMenus(prev => 
      prev.includes(label) 
        ? prev.filter(l => l !== label)
        : [...prev, label]
    );
  };

  const canAccess = (roles?: string[]) => {
    if (!roles) return true;
    return roles.includes(userRole);
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  const getRoleBadge = () => {
    switch (userRole) {
      case "ADMIN": return { label: "Administrator", color: "bg-red-500/20 text-red-300" };
      case "CONTENT": return { label: "Content Manager", color: "bg-blue-500/20 text-blue-300" };
      case "CONTENT_ADMIN": return { label: "Content Admin", color: "bg-purple-500/20 text-purple-300" };
      case "DATIN": return { label: "DATIN", color: "bg-emerald-500/20 text-emerald-300" };
      default: return { label: userRole, color: "bg-gray-500/20 text-gray-300" };
    }
  };

  const roleBadge = getRoleBadge();

  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className="flex flex-col h-full bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 text-white relative">
      {isMobile && (
        <button 
          onClick={() => setIsMobileOpen(false)}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
        >
          <X className="h-6 w-6" />
        </button>
      )}
      
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
          BMKG Kaltim
        </h1>
        <p className="text-xs text-slate-400 mt-1.5">Backoffice Dashboard</p>
      </div>

      {/* User Info */}
      <div className="px-4 py-3 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-sm font-bold">
            {session?.user?.name?.[0]?.toUpperCase() || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{session?.user?.name || "User"}</p>
            <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-medium rounded-full ${roleBadge.color}`}>
              {roleBadge.label}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {sidebarItems.map((item) => {
          if (!canAccess(item.roles)) return null;

          // Item with children (expandable)
          if (item.children) {
            const isExpanded = expandedMenus.includes(item.label);
            const hasActiveChild = item.children.some(
              (child) => pathname === child.href
            );
            
            return (
              <div key={item.label}>
                <button
                  onClick={() => toggleExpanded(item.label)}
                  className={cn(
                    "flex items-center w-full gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                    hasActiveChild
                      ? "bg-white/10 text-white"
                      : "text-slate-300 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  <span className="flex-1 text-left">{item.label}</span>
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>
                {isExpanded && (
                  <div className="ml-5 mt-1 space-y-0.5 border-l border-white/10 pl-4">
                    {item.children.map((child) => {
                      if (!canAccess(child.roles)) return null;
                      const isActive = pathname === child.href;
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={() => isMobile && setIsMobileOpen(false)}
                          className={cn(
                            "block px-3 py-2 text-sm rounded-lg transition-all duration-200",
                            isActive
                              ? "bg-blue-600/30 text-blue-300 font-medium"
                              : "text-slate-400 hover:text-white hover:bg-white/5"
                          )}
                        >
                          {child.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          // Regular menu item
          const isActive = item.href === "/backoffice"
            ? pathname === "/backoffice"
            : pathname?.startsWith(item.href || "");

          return (
            <Link
              key={item.label}
              href={item.href || "/backoffice"}
              onClick={() => isMobile && setIsMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-gradient-to-r from-blue-600/30 to-cyan-600/20 text-blue-300 shadow-sm"
                  : "text-slate-300 hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon
                className={cn(
                  "h-5 w-5 flex-shrink-0",
                  isActive ? "text-blue-400" : ""
                )}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-white/10 mt-auto">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200"
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          <span>Keluar</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile trigger button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden bg-white shadow-lg border"
        onClick={() => setIsMobileOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Mobile sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 z-50 h-full w-72 transition-transform duration-300 lg:hidden shadow-2xl",
        isMobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <SidebarContent isMobile />
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden lg:block fixed top-0 left-0 h-full w-72 shadow-xl z-30">
        <SidebarContent />
      </aside>
    </>
  );
}
