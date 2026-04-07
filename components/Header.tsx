"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { Menu, X, ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export function Header() {
  const [currentDate, setCurrentDate] = useState<string>("");
  const [currentTime, setCurrentTime] = useState<string>("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      
      const optionsTime: Intl.DateTimeFormatOptions = {
        timeZone: "Asia/Makassar", // WITA timezone
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      };
      const optionsDate: Intl.DateTimeFormatOptions = {
        timeZone: "Asia/Makassar",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      };
      const timeString = now.toLocaleTimeString("en-GB", optionsTime);
      const dateString = now.toLocaleDateString("en-GB", optionsDate);
      setCurrentDate(dateString);
      setCurrentTime(`${timeString} WITA`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  // Track scroll for backdrop effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  type MenuItem = {
    label: string;
    subItems?: { label: string; href: string; isExternal?: boolean }[];
    groups?: { title: string; items: { label: string; href: string; isExternal?: boolean }[] }[];
  };

  const menuItems: MenuItem[] = [
    {
      label: "Profil",
      subItems: [
        { label: "Visi dan Misi", href: "/profil/visi-dan-misi" },
        { label: "Tugas dan Fungsi", href: "/profil/tugas-dan-fungsi" },
        { label: "Struktur Organisasi", href: "/profil/struktur-organisasi" },
        { label: "Motto", href: "/profil/pelayanan-jasa" },
         { label: "Profil Pegawai", href: "/profil/profil-pegawai" },
        { label: "Transparasi Kerja", href: "/profil/transparasi-kerja" },
         { label: "Sejarah", href: "/profil/sejarah" },
          { label: "Penghargaan", href: "/profil/penghargaan" },
      ],
    },
    {
      label: "Meteorologi",
      groups: [
        {
          title: "Meteorologi Publik",
          items: [
            { label: "Cuaca Kota Balikpapan", href: "/cuaca/cuaca-kota-balikpapan" },
            { label: "Cuaca Wisata", href: "/cuaca/cuaca-wisata" },
            { label: "Titik Panas", href: "/cuaca/titik-panas" },
          ],
        },
        {
          title: "Meteorologi Maritim",
          items: [
            { label: "INAWIS", href: "https://maritim.bmkg.go.id/inawis" },
             {
              label: "Cuaca Kelautan",
              href: "https://maritim.bmkg.go.id/cuaca/perairan/perairan-penajam-balikpapan",
              isExternal: true,
            },
             { label: "Ocean Forecast System", href: "https://peta-maritim.bmkg.go.id/ofs/", isExternal: true },
          ],
        },
        {
          title: "Meteorologi Penerbangan",
          items: [
            { label: "Pengamatan Udara Atas", href: "https://web-aviation.bmkg.go.id/web/upper_air.php", isExternal: true },
            { label: "Prakiraan (TAF)", href: "/penerbangan/prakiraan-taf" },
            { label: " Data Radiosonde", href: "https://web-aviation.bmkg.go.id/maps", isExternal: true },
            {
              label: "Wind Temp",
              href: "https://web-aviation.bmkg.go.id/web/windtemp_full.php",
              isExternal: true,
            },
            {
              label: "SIGWX",
              href: "https://web-aviation.bmkg.go.id/web/sigwx_high_level.php",
              isExternal: true,
            },
            {
              label: "Citra Satelit",
              href: "https://web-aviation.bmkg.go.id/web/satellite_vs.php",
              isExternal: true,
            },
            { label: "Citra Radar", href: "/penerbangan/citra-radar" },
            {
              label: "INISIAM BMKG",
              href: "https://inasiam.bmkg.go.id/#7.14/-1.25/116.559",
              isExternal: true,
            },
          ],
        },
      ],
    },
     {
      label: "Klimatologi",
      subItems: [
       
      ],
    },
    {
      label: "Geofisika",
      subItems: [
       
      ],
    },
    {
      label: "Info Publik",
      subItems: [
         { label: "Survei Kepuasan Masyarakat & Indeks Persepsi Korupsi", href: "/publikasi/survei-kepuasan" },
       { label: "Lelang BMN", href: "/publikasi/lelang-bmn" },
        { label: "Laporan dan Aduan", href: "/publikasi/laporan-dan-aduan" },
      ],
    },
    {
      label: "Publikasi",
      subItems: [
        { label: "Buletin", href: "/publikasi/buletin" },
        { label: "Artikel", href: "/publikasi/artikel" },
        { label: "Makalah/Tulisan", href: "/publikasi/makalah-tulisan" },
        { label: "Galeri/Kegiatan", href: "/publikasi/galeri-kegiatan" },
        { label: "Ikhtisar Cuaca", href: "/publikasi/ikhtisar-cuaca" },
      ],
    },
  ];

  const [activeGroup, setActiveGroup] = useState<string | null>(null);

  const toggleMobileMenu = (label: string) => {
    setExpandedMenu(expandedMenu === label ? null : label);
    setExpandedGroup(null);
  };

  const toggleMobileGroup = (title: string) => {
    setExpandedGroup(expandedGroup === title ? null : title);
  };

  return (
    <>
      <header className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled 
          ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100" 
          : "bg-white border-b border-gray-100"
      )}>
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            {/* Left Section - Logo and Title */}
            <Link href="/" className="flex items-center gap-2 sm:gap-3 flex-shrink-0 min-w-0">
              <Image
                src="/BMKG.png"
                alt="BMKG Logo"
                width={48}
                height={48}
                className="object-contain flex-shrink-0 w-9 h-9 sm:w-12 sm:h-12"
              />
              <div className="flex flex-col min-w-0">
                <h1 className="text-xs sm:text-sm font-bold text-gray-700 leading-tight truncate">
                  BMKG Kalimantan Timur
                </h1>
                <p className="text-[10px] sm:text-xs text-gray-500 leading-tight hidden sm:block">
                  Wilayah Provinsi Kalimantan Timur
                </p>
              </div>
            </Link>

            {/* Center Section - Navigation Menu (Desktop Only) */}
            <div className="hidden xl:flex items-center gap-6">
              <NavigationMenu>
                <NavigationMenuList className="flex gap-4">
                  {menuItems.map((item) => (
                    <NavigationMenuItem key={item.label}>
                      <NavigationMenuTrigger className="text-sm font-medium text-gray-700 bg-transparent hover:bg-transparent hover:text-gray-900 data-[state=open]:bg-transparent focus:bg-transparent px-2">
                        {item.label}
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        {item.groups ? (
                          <div className="flex w-[800px] min-h-[300px]">
                            <div className="w-1/3 bg-slate-50 p-3 border-r border-slate-100 flex flex-col gap-1">
                              {item.groups.map((group) => (
                                <button
                                  key={group.title}
                                  className={cn(
                                    "w-full text-left px-4 py-3 text-sm font-medium rounded-md transition-all duration-200",
                                    (activeGroup === group.title || (!activeGroup && item.groups![0].title === group.title))
                                      ? "bg-white shadow-sm text-blue-600 ring-1 ring-black/5"
                                      : "text-slate-600 hover:bg-slate-200/50 hover:text-slate-900"
                                  )}
                                  onMouseEnter={() => setActiveGroup(group.title)}
                                  onFocus={() => setActiveGroup(group.title)}
                                >
                                  {group.title}
                                </button>
                              ))}
                            </div>
                            <div className="w-2/3 p-6 bg-white">
                              {(() => {
                                const selectedGroup = item.groups.find(g => g.title === activeGroup) || item.groups[0];
                                return (
                                  <div className="space-y-4 animate-in fade-in slide-in-from-left-2 duration-200">
                                    <div className="border-b border-slate-100 pb-3">
                                      <div className="flex items-center gap-2 mb-1">
                                      </div>
                                      <h4 className="text-lg font-bold text-slate-900">{selectedGroup.title}</h4>
                                    </div>
                                    <ul className="grid grid-cols-2 gap-3">
                                      {selectedGroup.items.map((subItem) => (
                                        <ListItem
                                          key={subItem.label}
                                          title={subItem.label}
                                          href={subItem.href}
                                          target={subItem.isExternal ? "_blank" : undefined}
                                          rel={subItem.isExternal ? "noopener noreferrer" : undefined}
                                        />
                                      ))}
                                    </ul>
                                  </div>
                                );
                              })()}
                            </div>
                          </div>
                        ) : (
                          <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                            {item.subItems?.map((subItem) => (
                              <ListItem
                                key={subItem.label}
                                title={subItem.label}
                                href={subItem.href}
                                target={subItem.isExternal ? "_blank" : undefined}
                                rel={subItem.isExternal ? "noopener noreferrer" : undefined}
                              />
                            ))}
                          </ul>
                        )}
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                  ))}
                </NavigationMenuList>
              </NavigationMenu>
              
              <Link href="/pelayanan-data" className="text-sm font-medium text-gray-700 hover:text-gray-900 px-2 transition-colors">
                Pelayanan Data
              </Link>
            </div>

            {/* Right Section - Clock + Mobile Menu Button */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <div className="text-gray-800 flex flex-col items-end">
                <div className="text-[9px] sm:text-xs font-medium text-gray-500 leading-tight">{currentDate}</div>
                <div className="text-[10px] sm:text-sm font-bold text-gray-900 tabular-nums leading-tight">{currentTime}</div>
              </div>
              
              {/* Mobile Menu Button */}
              <button
                className="xl:hidden flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 xl:hidden"
              onClick={() => setMobileOpen(false)}
            />
            
            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 w-[85%] max-w-[320px] bg-white z-50 xl:hidden shadow-2xl flex flex-col"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Image src="/BMKG.png" alt="BMKG" width={32} height={32} className="object-contain" />
                  <span className="text-sm font-bold text-gray-800">Menu</span>
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              {/* Drawer Content - Scrollable */}
              <div className="flex-1 overflow-y-auto overscroll-contain">
                <nav className="py-2">
                  {menuItems.map((item) => {
                    const hasChildren = (item.subItems && item.subItems.length > 0) || (item.groups && item.groups.length > 0);
                    const isExpanded = expandedMenu === item.label;
                    
                    return (
                      <div key={item.label} className="border-b border-gray-50">
                        <button
                          onClick={() => hasChildren ? toggleMobileMenu(item.label) : setMobileOpen(false)}
                          className="w-full flex items-center justify-between px-5 py-3.5 text-sm font-medium text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors"
                        >
                          <span>{item.label}</span>
                          {hasChildren && (
                            <ChevronDown className={cn(
                              "w-4 h-4 text-gray-400 transition-transform duration-200",
                              isExpanded && "rotate-180"
                            )} />
                          )}
                        </button>
                        
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden bg-gray-50/50"
                            >
                              {/* Simple subItems */}
                              {item.subItems?.map((sub) => (
                                <Link
                                  key={sub.label}
                                  href={sub.href}
                                  target={sub.isExternal ? "_blank" : undefined}
                                  onClick={() => setMobileOpen(false)}
                                  className="block px-8 py-2.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100/50 active:bg-gray-100 transition-colors"
                                >
                                  {sub.label}
                                </Link>
                              ))}
                              
                              {/* Groups (nested accordion) */}
                              {item.groups?.map((group) => {
                                const isGroupExpanded = expandedGroup === group.title;
                                return (
                                  <div key={group.title}>
                                    <button
                                      onClick={() => toggleMobileGroup(group.title)}
                                      className="w-full flex items-center justify-between px-8 py-2.5 text-sm font-medium text-blue-700 hover:bg-gray-100/50 transition-colors"
                                    >
                                      <span>{group.title}</span>
                                      <ChevronDown className={cn(
                                        "w-3.5 h-3.5 text-blue-400 transition-transform duration-200",
                                        isGroupExpanded && "rotate-180"
                                      )} />
                                    </button>
                                    <AnimatePresence>
                                      {isGroupExpanded && (
                                        <motion.div
                                          initial={{ height: 0, opacity: 0 }}
                                          animate={{ height: "auto", opacity: 1 }}
                                          exit={{ height: 0, opacity: 0 }}
                                          transition={{ duration: 0.15 }}
                                          className="overflow-hidden"
                                        >
                                          {group.items.map((gItem) => (
                                            <Link
                                              key={gItem.label}
                                              href={gItem.href}
                                              target={gItem.isExternal ? "_blank" : undefined}
                                              onClick={() => setMobileOpen(false)}
                                              className="block px-11 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100/50 active:bg-gray-100 transition-colors"
                                            >
                                              {gItem.label}
                                            </Link>
                                          ))}
                                        </motion.div>
                                      )}
                                    </AnimatePresence>
                                  </div>
                                );
                              })}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                  
                  {/* Pelayanan Data - Direct Link */}
                  <div className="border-b border-gray-50">
                    <Link
                      href="/pelayanan-data"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center px-5 py-3.5 text-sm font-medium text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors"
                    >
                      Pelayanan Data
                    </Link>
                  </div>
                </nav>
              </div>
              
              {/* Drawer Footer */}
              <div className="border-t border-gray-100 px-5 py-3 bg-gray-50">
                <p className="text-[10px] text-gray-400 text-center">
                  © 2026 BMKG Kalimantan Timur
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a"> & { title: string }
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          {children && (
            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
              {children}
            </p>
          )}
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";
