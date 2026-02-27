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

export function Header() {
  const [currentDate, setCurrentDate] = useState<string>("");
  const [currentTime, setCurrentTime] = useState<string>("");

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

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Left Section - Logo and Title */}
          <Link href="/" className="flex items-center gap-3 flex-shrink-0 min-w-0">
            <Image
              src="/BMKG.png"
              alt="BMKG Logo"
              width={48}
              height={48}
              className="object-contain flex-shrink-0"
            />
            <div className="flex flex-col min-w-0">
              <h1 className="text-sm font-bold text-gray-700 leading-tight">
                Badan Meteorologi, Klimatologi dan Geofisika
              </h1>
              <p className="text-xs text-gray-500 leading-tight">
                Wilayah Provinsi Kalimantan Timur
              </p>
            </div>
          </Link>

          {/* Center Section - Navigation Menu */}
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

          {/* Right Section - Real-time Clock */}
          <div className="flex-shrink-0 text-gray-800 flex flex-col items-end">
            <div className="text-[10px] sm:text-xs font-medium text-gray-500 leading-tight">{currentDate}</div>
            <div className="text-xs sm:text-sm font-bold text-gray-900 tabular-nums leading-tight">{currentTime}</div>
          </div>
        </div>
      </div>
    </header>
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
