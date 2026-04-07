import React from "react";

export function Footer() {
  return (
    <footer className="bg-[url('/background.png')] bg-cover bg-center text-white py-8 md:py-12 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
          <div>
            <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4">Tentang Kami</h3>
            <p className="text-sm md:text-base text-blue-100">
              Badan Meteorologi, Klimatologi dan Geofisika Wilayah Provinsi Kalimantan Timur melayani informasi cuaca dan iklim untuk
              wilayah Kalimantan Timur.
            </p>
          </div>
          <div>
            <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4">Kontak</h3>
            <p className="text-sm md:text-base text-blue-100">
              Jl. Marsma R. Iswahyudi No.1
              <br />
              Sepinggan, Balikpapan
              <br />
              Kalimantan Timur 76115 (Stasiun Meteorologi Kelas I Sultan Aji Muhammad Sulaiman Sepinggan Balikpapan)
            </p>
          </div>
          <div className="sm:col-span-2 md:col-span-1">
            <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4">Layanan</h3>
            <ul className="space-y-2 text-sm md:text-base text-blue-100">
              <li>Prakiraan Cuaca</li>
              <li>Informasi Iklim</li>
              <li>Data Meteorologi Penerbangan</li>
              <li>Pelayanan Data</li>
            </ul>
          </div>
        </div>
        <div className="mt-6 md:mt-8 pt-6 md:pt-8 border-t border-white/70 text-center text-xs md:text-sm text-blue-200">
          <p>
            © 2026 BMKG Provinsi Kalimantan Timur. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
