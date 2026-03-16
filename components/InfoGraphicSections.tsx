"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { X, ZoomIn } from "lucide-react";

// --- Types ---
interface GraphicItem {
  id: string;
  title: string;
  imageUrl: string;
}

// --- Data based on User Request ---

// Section 1 Data: Hotspot & Fire Potential
// Note: "https://www.bmkgsamarinda.com/#prettyPhoto" is not a direct image link. 
// Using a placeholder for visual presentation, but keeping the intent clear.
const hotspotItems: GraphicItem[] = [
  {
    id: "hotspot-1",
    title: "Peta Sebaran Titik Panas (Hotspot)",
    imageUrl: "http://202.90.198.22/IMAGE/HOTSPOT/Hotspot_Kaltim.png",
  },
  {
    id: "hotspot-2",
    title: "GeoHotspot Kaltim",
    // Fallback/Placeholder since provided link was a webpage fragment
    imageUrl: "https://inderaja.bmkg.go.id/IMAGE/GEOHOTSPOT/H08_GH_Kaltim.png", 
  },
];

// Section 2 Data: Wave Forecast
// We use a dynamic URL below instead, but keep this array structured for future structural reference.
const waveItems: GraphicItem[] = [
  {
    id: "wave-1",
    title: "Prakiraan Tinggi Gelombang",
    imageUrl: "https://maritim.bmkg.go.id/render-static/inawave/2026/03/2026031312/metwilpro/kalimantan_timur/swh_2026031312.png",
  },
  {
    id: "wave-2",
    title: "Prakiraan Cuaca Pelabuhan", // User requested this specific image in this section
    imageUrl: "https://maritim.bmkg.go.id/api/download/eyJjb2RlIjoiUC5ZLjA1IiwidHlwZSI6InBuZyIsImNhdGVnb3J5IjoicGVyYWlyYW4iLCJ0aW1lc3RhbXAiOjE3NzM0NDc1MTMyODksImhhc2giOiI2MDg5ZjkwMDQ4ZmFiMDAwIn0",
  },
];

// --- Components ---

// --- Components ---

function ImageModal({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  if (!src) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors bg-white/10 rounded-full p-2"
      >
        <X size={32} />
      </button>
      <div className="relative max-w-5xl max-h-[90vh] w-full h-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
        {/* We use standard img tag for external sources to avoid domain config issues with dynamic/unsafe user links */}
        <img 
          src={src} 
          alt={alt} 
          className="max-w-full max-h-full object-contain rounded-lg shadow-2xl bg-white"
        />
      </div>
    </div>
  );
}

function GraphicCard({ item, onClick }: { item: GraphicItem; onClick: () => void }) {
  return (
    <div 
      className="group relative bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 cursor-pointer"
      onClick={onClick}
    >
      {/* Increased height by changing aspect ratio to square or larger */}
      <div className="relative aspect-square w-full bg-white overflow-hidden p-2">
        {/* Standard img tag for flexibility with external unconfigured domains */}
        <img 
          src={item.imageUrl} 
          alt={item.title} 
          className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "https://placehold.co/600x400?text=Gambar+Tidak+Tersedia";
          }}
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
           <div className="bg-white/90 rounded-full p-3 shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
             <ZoomIn className="text-blue-600 w-6 h-6" />
           </div>
        </div>
      </div>
      <div className="p-4 border-t border-gray-50">
        <h3 className="text-center font-bold text-gray-800 text-sm md:text-base line-clamp-2">
          {item.title}
        </h3>
      </div>
    </div>
  );
}

export function HotspotSection() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <>
      <section className="py-12 bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Peta Sebaran Titik Panas & Potensi Kebakaran Hutan
            </h2>
            <div className="h-1 w-24 bg-red-500 mx-auto rounded-full"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
             {hotspotItems.map(item => (
                <GraphicCard 
                  key={item.id} 
                  item={item} 
                  onClick={() => setSelectedImage(item.imageUrl)} 
                />
             ))}
          </div>
        </div>
      </section>
      {selectedImage && (
        <ImageModal 
          src={selectedImage} 
          alt="Preview" 
          onClose={() => setSelectedImage(null)} 
        />
      )}
    </>
  );
}

export function WaveForecastSection() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [waveImageUrl, setWaveImageUrl] = useState<string>(
    "https://maritim.bmkg.go.id/render-static/inawave/2026/03/2026031312/metwilpro/kalimantan_timur/swh_2026031312.png"
  );

  useEffect(() => {
    let isMounted = true;

    const findLatestImage = async () => {
      const now = new Date();
      const candidates: { folder: string, file: string }[] = [];
      
      // Generate candidates for the last 3 days (12 and 00 runs)
      for (let i = 0; i < 4; i++) {
        const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const year = d.getFullYear().toString();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        
        const nextDay = new Date(d.getTime() + 24 * 60 * 60 * 1000);
        const nextYear = nextDay.getFullYear().toString();
        const nextMonth = String(nextDay.getMonth() + 1).padStart(2, "0");
        const nextDate = String(nextDay.getDate()).padStart(2, "0");

        candidates.push({
          folder: `${year}${month}${day}12`,
          file: `${nextYear}${nextMonth}${nextDate}12`
        });
        candidates.push({
          folder: `${year}${month}${day}00`,
          file: `${nextYear}${nextMonth}${nextDate}00`
        });
      }
      
      // Sort descending so we check the most recent dates first
      candidates.sort((a, b) => b.folder.localeCompare(a.folder));

      for (const item of candidates) {
        if (!isMounted) break;
        const c = item.folder;
        const f = item.file;
        const year = c.slice(0, 4);
        const month = c.slice(4, 6);
        const url = `https://maritim.bmkg.go.id/render-static/inawave/${year}/${month}/${c}/metwilpro/kalimantan_timur/swh_${f}.png`;
        
        const success = await new Promise((resolve) => {
          const img = new window.Image();
          img.onload = () => resolve(true);
          img.onerror = () => resolve(false);
          img.src = url;
        });

        if (success && isMounted) {
          setWaveImageUrl(url);
          break;
        }
      }
    };

    findLatestImage();
    
    return () => { isMounted = false; };
  }, []);

  const waveItemsFiltered = [
    {
      id: "wave-1",
      title: "Prakiraan Tinggi Gelombang",
      imageUrl: waveImageUrl,
    },
    {
       // Strictly following user instruction to put this image in the "Wave" section group 
       id: "hotspot-extra",
       title: "Prakiraan Cuaca Pelabuhan", 
       imageUrl: "https://maritim.bmkg.go.id/api/download/eyJjb2RlIjoiUC5ZLjA1IiwidHlwZSI6InBuZyIsImNhdGVnb3J5IjoicGVyYWlyYW4iLCJ0aW1lc3RhbXAiOjE3NzM0NDc1MTMyODksImhhc2giOiI2MDg5ZjkwMDQ4ZmFiMDAwIn0",
    }
  ];

  return (
    <>
      <section className="py-12 bg-blue-50/50">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Prakiraan Cuaca Maritim
            </h2>
            <div className="h-1 w-24 bg-blue-600 mx-auto rounded-full"></div>
          </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
             {waveItemsFiltered.map(item => (
                <GraphicCard 
                  key={item.id} 
                  item={item} 
                  onClick={() => setSelectedImage(item.imageUrl)} 
                />
             ))}
          </div>
        </div>
      </section>
      {selectedImage && (
        <ImageModal 
          src={selectedImage} 
          alt="Preview" 
          onClose={() => setSelectedImage(null)} 
        />
      )}
    </>
  );
}

export function ClimateInfoSection() {
  return (
    <section className="py-16 bg-white border-t border-gray-100">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Prediksi Curah Hujan Dasarian
          </h2>
          <div className="h-1 w-24 bg-green-500 mx-auto rounded-full"></div>
        </div>
        
        <div className="w-full max-w-5xl mx-auto bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
             {/* Iframe Widget */}
             <div className="relative w-full h-[350px]">
               <iframe 
                 src="https://www.bmkgsamarinda.com/view/hh-hth-map-widget.php#" 
                 title="Peta Info Iklim"
                 className="absolute inset-0 w-full h-full border-0"
                 allowFullScreen
               />
             </div>
        </div>
      </div>
    </section>
  );
}
