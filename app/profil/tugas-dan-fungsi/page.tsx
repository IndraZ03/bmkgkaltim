"use client";

import React from "react";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function TugasDanFungsiPage() {
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
          {/* Section 1: Pengolaan Data */}
          <Card className="border-0 shadow-lg overflow-hidden bg-white">
            <div className="h-2 bg-blue-600 w-full"></div>
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                <span className="bg-blue-100 text-blue-600 p-2 rounded-lg text-lg font-bold w-10 h-10 flex items-center justify-center">
                  1
                </span>
                Pengolaan Data
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
              <ul className="space-y-2">
                <li>Melaksanakan pengiriman berita data sandi meteorologi permukaan pada jam-jam 00, 03, 06, 09, 12, 15, 18, 21, UTC secara tepat waktu.</li>
                <li>Melaksanakan monitoring dan kualiti kontrol pengiriman berita data sandi meteorologi permukaan dan udara atas sebagaimana dimaksud pada huruf a dan huruf b.</li>
                <li>Melaksanakan pengumpulan data meteorologi permukaan untuk keperluan pemetaan dan analisis cuaca.</li>
                <li>Melaksanakan pengumpulan produk informasi dan prakiraan cuaca, produk Numerical Weather Prediction (NWP) dan/atau peringatan dini dari Badan Meteorologi, Klimatologi, dan Geofisika Pusat.</li>
                <li>Melaksanakan pertukaran data dan informasi cuaca penerbangan, sesuai ketentuan dan kebutuhan operasi penerbangan yang menjadi tanggung jawabnya.</li>
                <li>Melaporkan kejadian-kejadian cuaca ekstrim di wilayah pelayanan yang menjadi tanggung jawabnya ke Badan Meteorologi, Klimatologi, dan Geofisika Pusat.</li>
                <li>Melaporkan keadaan cuaca pada saat terjadinya kecelakaan pesawat ke Kepala Pusat Meteorologi Penerbangan dan Maritim Badan Meteorologi, Klimatologi, dan Geofisika.</li>
                <li>Melaksanakan pengiriman data hasil pengamatan lainnya menggunakan Sistem Pengelolaan Database Meteorologi, Klimatologi, Kualitas Udara dan Geofisika (MKKuG) yang telah ditentukan.</li>
              </ul>
              
              <div className="mt-8 bg-blue-50/50 p-6 rounded-xl border border-blue-100">
                <p className="font-semibold text-gray-900 mb-4">Secara lebih rinci, maksud dari pernyataan misi di atas adalah sebagai berikut:</p>
                <ul className="space-y-3">
                  <li>
                    <strong>Mengamati dan memahami fenomena meteorologi, klimatologi, kualitas udara, dan geofisika</strong> artinya BMKG melaksanakan operasional pengamatan dan pengumpulan data secara teratur, lengkap dan akurat guna dipakai untuk mengenali dan memahami karakteristik unsur-unsur meteorologi, klimatologi, kualitas udara, dan geofisika guna membuat prakiraan dan informasi yang akurat.
                  </li>
                  <li>
                    <strong>Menyediakan data, informasi dan jasa meteorologi, klimatologi, kualitas udara, dan geofisika</strong> kepada para pengguna sesuai dengan kebutuhan dan keinginan mereka dengan tingkat akurasi tinggi dan tepat waktu.
                  </li>
                  <li>
                    <strong>Mengkoordinasi dan Memfasilitasi kegiatan</strong> sesuai dengan kewenangan BMKG, maka BMKG wajib mengawasi pelaksanaan operasional, memberi pedoman teknis, serta berwenang untuk mengkalibrasi peralatan meteorologi, klimatologi, kualitas udara, dan geofisika sesuai dengan peraturan yang berlaku.
                  </li>
                  <li>
                    <strong>Berpartisipasi aktif dalam kegiatan internasional</strong> artinya BMKG dalam melaksanakan kegiatan secara operasional selalu mengacu pada ketentuan internasional mengingat bahwa fenomena meteorologi, klimatologi, kualitas udara, dan geofisika tidak terbatas dan tidak terkait pada batas batas wilayah suatu negara manapun.
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Pengamatan */}
          <Card className="border-0 shadow-lg overflow-hidden bg-white">
            <div className="h-2 bg-green-600 w-full"></div>
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                <span className="bg-green-100 text-green-600 p-2 rounded-lg text-lg font-bold w-10 h-10 flex items-center justify-center">
                  2
                </span>
                Pengamatan
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
              <ul className="space-y-2">
                <li>Melaksanakan pengamatan meteorologi permukaan secara terus-menerus setiap 1 (satu) jam selama 24 (dua puluh empat) jam setiap hari berdasarkan waktu standar internasional.</li>
                <li>Melaksanakan penyandian data meteorologi permukaan setiap jam pengamatan.</li>
                <li>Melaksanakan pengamatan cuaca khusus sesuai kebutuhan jaringan, antara lain radar cuaca/hujan, dan penerima citra satelit cuaca.</li>
                <li>Melaksanakan pengamatan meteorologi permukaan menggunakan peralatan di taman alat dan landas pacu untuk pelayanan penerbangan (METAR, SPECI, MET REPORT, dan SPECIAL) sesuai dengan ketentuan yang berlaku bagi stasiun meteorologi yang memberikan layanan penerbangan.</li>
                <li>Melaksanakan pengamatan meteorologi paling sedikit terhadap unsur-unsur: radiasi matahari, suhu udara, tekanan udara, angin, kelembaban udara, awan, jarak pandang, curah hujan, penguapan di stasiun meteorologi.</li>
                <li>Melaksanakan kegiatan fam flight bagi stasiun meteorologi yang memberikan layanan penerbangan.</li>
              </ul>
            </CardContent>
          </Card>
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
