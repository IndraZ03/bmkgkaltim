"use client";

import React from "react";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function VisiMisiPage() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <Header />

      <main className="pt-24 pb-16 px-4 container mx-auto max-w-5xl">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.6 }}
           className="space-y-8"
        >
          <div className="text-center space-y-4 mb-10">
          </div>

          <div className="grid md:grid-cols-1 gap-8">
            <Card className="border-0 shadow-lg overflow-hidden bg-white">
              <div className="h-2 bg-blue-600 w-full"></div>
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <span className="bg-blue-100 text-blue-600 p-2 rounded-lg">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                     </svg>
                  </span>
                  Visi
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
                <p>
                  Mewujudkan peningkatan kualitas dan kuantitas pengamatan, pengumpulan,
                  penyebaran data dan informasi meteorologi penerbangan sesuai standar
                  Internasional.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg overflow-hidden bg-white">
              <div className="h-2 bg-green-600 w-full"></div>
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <span className="bg-green-100 text-green-600 p-2 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </span>
                  Misi
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
                <ul className="list-none space-y-4 pl-0">
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-green-50 text-green-600 font-bold text-sm border border-green-200">1</span>
                    <span>
                      Mewujudkan peningkatan kualitas dan kuantitas analisis pelayanan informasi
                      meteorologi penerbangan sesuai standar Internasional.
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-green-50 text-green-600 font-bold text-sm border border-green-200">2</span>
                    <span>
                      Mewujudkan koordinasi dengan BBMKG Wilayah III, Pemerintah Daerah /
                      Provinsi dan pengguna Layanan dalam penyelenggaraan kegiatan meteorologi
                      penerbangan.
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-green-50 text-green-600 font-bold text-sm border border-green-200">3</span>
                    <span>
                      Terwujudnya Stasiun Meteorologi Kelas I Sultan Aji Muhammad Sulaiman
                      Sepinggan Balikpapan Sebagai Sentra Pelayanan Informasi Meteorologi Penerbangan
                      yang Handal dan Terpercaya guna mendukung Keselamatan Penerbangan.
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </main>

      <footer className="bg-gradient-to-r from-blue-900 to-blue-800 text-white py-12 px-4 mt-auto">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Tentang Kami</h3>
              <p className="text-blue-100">
                Stasiun Meteorologi Kelas I Sultan Aji Muhammad Sulaiman
                Sepinggan Balikpapan melayani informasi cuaca dan iklim untuk
                wilayah Kalimantan Timur.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Kontak</h3>
              <p className="text-blue-100">
                Jl. Marsma R. Iswahyudi No.1
                <br />
                Sepinggan, Balikpapan
                <br />
                Kalimantan Timur 76115
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Layanan</h3>
              <ul className="space-y-2 text-blue-100">
                <li>Prakiraan Cuaca</li>
                <li>Informasi Iklim</li>
                <li>Data Meteorologi Penerbangan</li>
                <li>Pelayanan Data</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-blue-700 text-center text-blue-200">
            <p>
              © 2026 BMKG Stasiun Meteorologi Kelas I Sultan Aji Muhammad
              Sulaiman Sepinggan Balikpapan. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
