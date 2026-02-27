"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";

interface IkmStation {
  id: number;
  stationName: string;
  ikmValue: number;
  rating: string;
}

export function IKMSection() {
  const [stations, setStations] = useState<IkmStation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/ikm")
      .then((res) => res.json())
      .then((data) => {
        setStations(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-80 rounded-2xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (stations.length === 0) return null;

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stations.map((station) => (
            <div
              key={station.id}
              className="group relative h-full rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col items-center text-center overflow-hidden bg-white border-2 border-[#002050]"
            >
              
              {/* Content Container */}
              <div className="relative flex flex-col items-center w-full h-full p-6 z-10">
                 {/* Logo */}
                 <div className="relative w-16 h-16 mb-2 transform group-hover:scale-110 transition-transform duration-300">
                   <Image
                     src="/BMKG.png"
                     alt="BMKG Logo"
                     fill
                     className="object-contain drop-shadow-sm"
                   />
                 </div>

                 {/* Title */}
                 <h3 className="text-sm font-bold text-[#002050] mb-2 tracking-wide uppercase">
                   INDEKS KEPUASAN MASYARAKAT
                 </h3>

                 {/* Station Name */}
                 <p className="text-gray-700 text-sm font-medium leading-relaxed mb-4 flex-grow px-1 min-h-[3rem]">
                   {station.stationName}
                 </p>

                 {/* Large Sip Image */}
                 <div className="relative w-28 h-28 mb-4 transform group-hover:rotate-6 transition-transform duration-300">
                   <Image
                     src="/sip.png"
                     alt={station.rating}
                     fill
                     className="object-contain"
                   />
                 </div>

                 {/* Rating Badge - Text only */}
                 <div className="mt-auto flex items-center justify-center bg-gray-50 px-6 py-2 rounded-full border border-gray-200 shadow-sm">
                   <span className="text-[#002050] font-extrabold text-base">
                     Nilai IKM : {station.ikmValue}
                   </span>
                 </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
