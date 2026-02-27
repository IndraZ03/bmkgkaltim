"use client";

import React from "react";
import { EarthquakeData } from "@/hooks/useBMKGEarthquake";
import { Card, CardContent } from "@/components/ui/card";
import { Activity, MapPin, Waves, Globe, ArrowRight } from "lucide-react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface EarthquakeCardProps {
  data: EarthquakeData | null;
  loading: boolean;
  error: string | null;
}

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, ZoomIn } from "lucide-react";

// ... previous imports ...

export function EarthquakeCard({ data, loading, error }: EarthquakeCardProps) {
  const [isZoomed, setIsZoomed] = useState(false);

  if (loading) return null; // Or a skeleton
  if (error || !data) return null;

  const imageUrl = `https://data.bmkg.go.id/DataMKG/TEWS/${data.Shakemap}`;

  return (
    <>
      <Card className="overflow-hidden border-none shadow-lg bg-white">
        <CardContent className="p-0">
          <div className="flex flex-col md:flex-row">
            {/* Left Side - Shakemap Image */}
            <div 
              className="w-full md:w-1/3 relative min-h-[300px] md:min-h-full bg-gray-100 cursor-zoom-in group"
              onClick={() => setIsZoomed(true)}
            >
              <Image
                src={imageUrl}
                alt="Shakemap Gempa"
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                unoptimized
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                <ZoomIn className="text-white h-10 w-10 drop-shadow-md" />
              </div>
            </div>

            {/* Right Side - Details */}
            <div className="w-full md:w-2/3 p-6 md:p-8 flex flex-col justify-center">
              {/* ... details ... */}
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Gempa Bumi Terkini</h2>
                <p className="text-gray-500 text-lg">
                  {data.Tanggal}, {data.Jam}
                </p>
              </div>

              <div className="mb-6">
                <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200 px-4 py-1.5 text-sm font-medium rounded-full">
                  Gempa Dirasakan
                </Badge>
              </div>

              <div className="mb-8">
                <p className="text-xl font-semibold text-gray-900 leading-relaxed">
                  {data.Wilayah}
                </p>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {/* Magnitude */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <div className="flex items-center gap-2 mb-2 text-gray-500">
                    <Activity className="h-4 w-4" />
                    <span className="text-sm font-medium">Magnitudo</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{data.Magnitude}</p>
                </div>

                {/* Kedalaman */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <div className="flex items-center gap-2 mb-2 text-gray-500">
                    <Waves className="h-4 w-4" />
                    <span className="text-sm font-medium">Kedalaman</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{data.Kedalaman}</p>
                </div>

                {/* Koordinat */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <div className="flex items-center gap-2 mb-2 text-gray-500">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm font-medium">Koordinat</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900 whitespace-nowrap">
                    {data.Lintang} - {data.Bujur}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-2 text-gray-600">
                  <span className="font-semibold text-gray-900 shrink-0">Saran BMKG:</span>
                  <p className="leading-relaxed">{data.Potensi}</p>
                </div>
                
                <Link
                  href="https://www.bmkg.go.id/gempabumi/gempabumi-terkini.bmkg"
                  target="_blank"
                  className="inline-flex items-center text-blue-600 font-semibold hover:text-blue-700 transition-colors"
                >
                  Selengkapnya
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Image Zoom Modal */}
      <AnimatePresence>
        {isZoomed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 p-4 md:p-8"
            onClick={() => setIsZoomed(false)}
          >
            <button
              className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-[210]"
              onClick={() => setIsZoomed(false)}
            >
              <X className="h-8 w-8" />
            </button>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-5xl h-full max-h-[90vh] rounded-lg overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={imageUrl}
                alt="Shakemap Gempa Detail"
                fill
                className="object-contain"
                unoptimized
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
