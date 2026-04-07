"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import Autoplay from "embla-carousel-autoplay";
import { Header } from "@/components/Header";

export default function CitraRadarPage() {
  const [currentTime, setCurrentTime] = useState<{ utc: string; wita: string }>({ utc: "", wita: "" });
  const [imageTimestamp, setImageTimestamp] = useState<number | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [radarUpdates, setRadarUpdates] = useState<Record<string, any>>({});

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // UTC
      const utc = now.toLocaleTimeString("en-GB", { timeZone: "UTC", hour: '2-digit', minute: '2-digit', second: '2-digit' });
      // WITA (Asia/Makassar)
      const wita = now.toLocaleTimeString("en-GB", { timeZone: "Asia/Makassar", hour: '2-digit', minute: '2-digit', second: '2-digit' });
      
      setCurrentTime({ utc: `${utc} UTC`, wita: `${wita} WITA` });
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Fetch info about last generated images from DB
    const fetchUpdates = async () => {
      try {
        const res = await fetch("/api/radar/list");
        if (res.ok) {
          const data = await res.json();
          const updates: Record<string, any> = {};
          data.forEach((item: any) => {
            updates[item.type] = item;
          });
          setRadarUpdates(updates);
        }
      } catch (e) {
        console.error("Failed to fetch radar updates", e);
      }
    };

    // Set initial timestamp on mount (client-side only) to avoid hydration mismatch
    setImageTimestamp(Date.now());
    fetchUpdates();
    
    // Refresh images and metadata every 1 minute
    const interval = setInterval(() => {
      setImageTimestamp(Date.now());
      fetchUpdates();
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const slideData = [
    {
      id: "CMAX_Balikpapan",
      title: "CMAX (Column Max)",
      description: "Produk CMAX menampilkan nilai reflektivitas maksimum dalam kolom vertikal. Informasi ini berguna untuk mengidentifikasi intensitas curah hujan tertinggi di suatu wilayah, yang dapat mengindikasikan potensi cuaca buruk seperti badai guntur atau hujan lebat."
    },
    {
      id: "CMAX-HWIND_Balikpapan",
      title: "HWIND 0.5 km",
      description: "Produk HWIND 0.5 km menyajikan informasi kecepatan dan arah angin horizontal pada ketinggian 0.5 km. Data ini penting untuk analisis pola angin permukaan dan potensi pergeseran awan di lapisan rendah atmosfer."
    },
    {
      id: "PAC06H_Balikpapan",
      title: "PAC 6h",
      description: "Produk PAC 6h menunjukkan estimasi akumulasi curah hujan selama 6 jam terakhir. Informasi ini membantu dalam pemantauan potensi banjir dan evaluasi distribusi hujan jangka pendek."
    },
    {
      id: "PAC24H_Balikpapan",
      title: "PAC 24h",
      description: "Produk PAC 24h memberikan gambaran akumulasi curah hujan selama 24 jam terakhir. Data ini sangat vital untuk analisis hidrologi, peringatan dini banjir, dan pemahaman tren curah hujan harian."
    },
  ];

  return (
    <div className="container mx-auto py-10 px-4 mt-20">
         <Header />
      <div className="text-center mb-12">
        <Image 
          src="/BMKG.png" 
          alt="Logo BMKG" 
          width={100} 
          height={100} 
          className="mx-auto mb-4 object-contain"
        />
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-4">Informasi Citra Radar</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Pemantauan cuaca real-time menggunakan citra radar untuk wilayah Balikpapan dan sekitarnya.
        </p>
      </div>

      <div className="flex flex-col md:flex-row justify-center items-center gap-6 mb-12">
        <div className="bg-white px-6 py-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center min-w-[200px]">
           <span className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Waktu UTC</span>
           <span className="text-2xl font-bold font-mono text-blue-600">{currentTime.utc}</span>
        </div>
        <div className="hidden md:block w-px h-12 bg-gray-200"></div>
        <div className="bg-white px-6 py-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center min-w-[200px]">
           <span className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Waktu WITA</span>
           <span className="text-2xl font-bold font-mono text-green-600">{currentTime.wita}</span>
        </div>
      </div>

      <div className="relative w-full max-w-4xl mx-auto">
        <Carousel
          opts={{
            align: "center",
            loop: true,
          }}
          plugins={[
            Autoplay({
              delay: 5000,
              stopOnInteraction: false,
              stopOnMouseEnter: true
            }),
          ]}
          className="w-full"
        >
          <CarouselContent className="-ml-4">
            {slideData.map((slide, index) => {
              const radarInfo = radarUpdates[slide.id];
              const src = radarInfo ? `/api/radar/image/${radarInfo.filename}` : `/api/radar/image/${slide.id}.png`;
              // Format updated time nicely
              let updatedTimeDisplay = "Belum ada pembaruan";
              if (radarInfo && radarInfo.updatedAt) {
                const updatedDate = new Date(radarInfo.updatedAt);
                updatedTimeDisplay = "Diperbarui: " + updatedDate.toLocaleTimeString("id-ID", { timeZone: "Asia/Makassar", hour: '2-digit', minute: '2-digit' }).replace(':', '.') + " WITA (" + updatedDate.toLocaleDateString("id-ID", { timeZone: "Asia/Makassar" }) + ")";
              }

              return (
              <CarouselItem key={index} className="pl-4 basis-full">
                <div className="h-full">
                  <Card className="overflow-hidden border-0 shadow-xl rounded-2xl h-full bg-white dark:bg-gray-900">
                    <CardContent className="flex flex-col p-0 h-full">
                       <div className="relative w-full bg-gray-50 overflow-hidden group border-b border-gray-100">
                         <img 
                            src={imageTimestamp ? `${src}?t=${imageTimestamp}` : src}
                            alt={slide.title} 
                            onClick={() => setSelectedImage(src)}
                            className="w-full h-[450px] object-contain transition-transform duration-500 group-hover:scale-105 cursor-zoom-in"
                          />
                       </div>
                       <div className="p-6 md:p-8">
                          <div className="flex flex-col xl:flex-row xl:justify-between xl:items-center mb-3 gap-2">
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 transition-colors">
                              {slide.title}
                            </h3>
                            <span className="inline-block w-fit bg-blue-50 dark:bg-gray-800 border border-blue-100 dark:border-gray-700 px-3 py-1 rounded-full text-xs font-semibold text-blue-700 dark:text-blue-400 font-mono shadow-sm">
                              {updatedTimeDisplay}
                            </span>
                          </div>
                          <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-base">
                            {slide.description}
                          </p>
                       </div>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            )})}
          </CarouselContent>
          <div className="hidden md:block">
            <CarouselPrevious className="-left-12 h-12 w-12 border-2" />
            <CarouselNext className="-right-12 h-12 w-12 border-2" />
          </div>
        </Carousel>
      </div>

      {/* Image Modal/Lightbox */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-[95vw] max-h-[95vh] w-full h-full flex items-center justify-center">
             <button 
                className="absolute top-4 right-4 text-white hover:text-gray-300 z-10 bg-black/50 rounded-full p-2 transition-colors"
                onClick={() => setSelectedImage(null)}
             >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
             </button>
             <img 
               src={imageTimestamp ? `${selectedImage}?t=${imageTimestamp}` : selectedImage}
               alt="Full size view" 
               className="max-w-full max-h-full object-contain shadow-2xl rounded-sm"
               onClick={(e) => e.stopPropagation()} 
             />
          </div>
        </div>
      )}
    </div>
  );
}
