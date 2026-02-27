import React from "react";

export function Footer() {
  return (
    <footer className="bg-[url('/background.png')] bg-cover bg-center text-white py-12 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Tentang Kami</h3>
            <p className="text-blue-100">
              Badan Meteorologi, Klimatologi dan Geofisika Wilayah Provinsi Kalimantan Timur melayani informasi cuaca dan iklim untuk
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
              Kalimantan Timur 76115 (Stasiun Meteorologi Kelas I Sultan Aji Muhammad Sulaiman Sepinggan Balikpapan)
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
        <div className="mt-8 pt-8 border-t border-white/70 text-center text-blue-200">
          <p>
            © 2026 BMKG Provinsi Kalimantan Timur. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
