// Administrative location data for Kalimantan Timur (adm1 = 64)
// Source: BMKG API cuaca.bmkg.go.id

export const ADM1_KALTIM = "64";

export interface KabKota {
  code: string;
  name: string;
}

export interface Kecamatan {
  code: string;
  name: string;
}

export const KAB_KOTA_KALTIM: KabKota[] = [
  { code: "64.01", name: "Kabupaten Paser" },
  { code: "64.02", name: "Kabupaten Kutai Kartanegara" },
  { code: "64.03", name: "Kabupaten Berau" },
  { code: "64.07", name: "Kabupaten Kutai Barat" },
  { code: "64.08", name: "Kabupaten Kutai Timur" },
  { code: "64.09", name: "Kabupaten Penajam Paser Utara" },
  { code: "64.11", name: "Kabupaten Mahakam Ulu" },
  { code: "64.71", name: "Kota Balikpapan" },
  { code: "64.72", name: "Kota Samarinda" },
  { code: "64.74", name: "Kota Bontang" },
];

export const KECAMATAN_KALTIM: Record<string, Kecamatan[]> = {
  "64.01": [
    { code: "64.01.01", name: "Batu Sopang" },
    { code: "64.01.02", name: "Tanjung Harapan" },
    { code: "64.01.03", name: "Paser Belengkong" },
    { code: "64.01.04", name: "Tanah Grogot" },
    { code: "64.01.05", name: "Kuaro" },
    { code: "64.01.06", name: "Long Ikis" },
    { code: "64.01.07", name: "Muara Komam" },
    { code: "64.01.08", name: "Long Kali" },
    { code: "64.01.09", name: "Batu Engau" },
    { code: "64.01.10", name: "Muara Samu" },
  ],
  "64.07": [  // Kutai Barat (sebelumnya key 64.02)
    { code: "64.07.05", name: "Long Iram" },
    { code: "64.07.06", name: "Melak" },
    { code: "64.07.07", name: "Barong Tongkok" },
    { code: "64.07.08", name: "Damai" },
    { code: "64.07.09", name: "Muara Lawa" },
    { code: "64.07.10", name: "Muara Pahu" },
    { code: "64.07.11", name: "Jempang" },
    { code: "64.07.12", name: "Bongan" },
    { code: "64.07.13", name: "Penyinggahan" },
    { code: "64.07.14", name: "Bentian Besar" },
    { code: "64.07.15", name: "Linggang Bigung" },
    { code: "64.07.16", name: "Nyuatan" },
    { code: "64.07.17", name: "Siluq Ngurai" },
    { code: "64.07.18", name: "Mook Manaar Bulatn" },
    { code: "64.07.19", name: "Tering" },
    { code: "64.07.20", name: "Sekolaq Darat" },
  ],
  "64.02": [  // Kutai Kartanegara (sebelumnya key 64.03)
    { code: "64.02.01", name: "Muara Muntai" },
    { code: "64.02.02", name: "Loa Kulu" },
    { code: "64.02.03", name: "Loa Janan" },
    { code: "64.02.04", name: "Anggana" },
    { code: "64.02.05", name: "Muara Badak" },
    { code: "64.02.06", name: "Tenggarong" },
    { code: "64.02.07", name: "Sebulu" },
    { code: "64.02.08", name: "Kota Bangun" },
    { code: "64.02.09", name: "Kenohan" },
    { code: "64.02.10", name: "Kembang Janggut" },
    { code: "64.02.11", name: "Muara Kaman" },
    { code: "64.02.12", name: "Tabang" },
    { code: "64.02.13", name: "Samboja" },
    { code: "64.02.14", name: "Muara Jawa" },
    { code: "64.02.15", name: "Sanga-Sanga" },
    { code: "64.02.16", name: "Tenggarong Seberang" },
    { code: "64.02.17", name: "Marang Kayu" },
    { code: "64.02.18", name: "Muara Wis" },
  ],
  "64.08": [  // Kutai Timur (sebelumnya key 64.04)
    { code: "64.08.01", name: "Muara Ancalong" },
    { code: "64.08.02", name: "Muara Wahau" },
    { code: "64.08.03", name: "Muara Bengkal" },
    { code: "64.08.04", name: "Sangatta Utara" },
    { code: "64.08.05", name: "Sangkulirang" },
    { code: "64.08.06", name: "Busang" },
    { code: "64.08.07", name: "Telen" },
    { code: "64.08.08", name: "Kongbeng" },
    { code: "64.08.09", name: "Bengalon" },
    { code: "64.08.10", name: "Kaliorang" },
    { code: "64.08.11", name: "Sandaran" },
    { code: "64.08.12", name: "Sangatta Selatan" },
    { code: "64.08.13", name: "Teluk Pandan" },
    { code: "64.08.14", name: "Rantau Pulung" },
    { code: "64.08.15", name: "Kaubun" },
    { code: "64.08.16", name: "Karangan" },
    { code: "64.08.17", name: "Batu Ampar" },
    { code: "64.08.18", name: "Long Mesangat" },
  ],
  "64.03": [  // Berau (sebelumnya key 64.05)
    { code: "64.03.01", name: "Kelay" },
    { code: "64.03.02", name: "Talisayan" },
    { code: "64.03.03", name: "Sambaliung" },
    { code: "64.03.04", name: "Segah" },
    { code: "64.03.05", name: "Tanjung Redeb" },
    { code: "64.03.06", name: "Gunung Tabur" },
    { code: "64.03.07", name: "Pulau Derawan" },
    { code: "64.03.08", name: "Biduk-Biduk" },
    { code: "64.03.09", name: "Teluk Bayur" },
    { code: "64.03.10", name: "Tabalar" },
    { code: "64.03.11", name: "Maratua" },
    { code: "64.03.12", name: "Batu Putih" },
    { code: "64.03.13", name: "Biatan" },
  ],
  "64.09": [  // Penajam Paser Utara (sebelumnya key 64.06)
    { code: "64.09.01", name: "Penajam" },
    { code: "64.09.02", name: "Waru" },
    { code: "64.09.03", name: "Babulu" },
    { code: "64.09.04", name: "Sepaku" },
  ],
  "64.11": [  // Mahakam Ulu (sebelumnya key 64.09)
    { code: "64.11.01", name: "Long Bagun" },
    { code: "64.11.02", name: "Long Hubung" },
    { code: "64.11.03", name: "Laham" },
    { code: "64.11.04", name: "Long Apari" },
    { code: "64.11.05", name: "Long Pahangai" },
  ],
  "64.71": [
    { code: "64.71.01", name: "Balikpapan Timur" },
    { code: "64.71.02", name: "Balikpapan Barat" },
    { code: "64.71.03", name: "Balikpapan Utara" },
    { code: "64.71.04", name: "Balikpapan Tengah" },
    { code: "64.71.05", name: "Balikpapan Selatan" },
    { code: "64.71.06", name: "Balikpapan Kota" },
  ],
  "64.72": [
    { code: "64.72.01", name: "Palaran" },
    { code: "64.72.02", name: "Samarinda Seberang" },
    { code: "64.72.03", name: "Samarinda Ulu" },
    { code: "64.72.04", name: "Samarinda Ilir" },
    { code: "64.72.05", name: "Samarinda Utara" },
    { code: "64.72.06", name: "Sungai Kunjang" },
    { code: "64.72.07", name: "Sambutan" },
    { code: "64.72.08", name: "Sungai Pinang" },
    { code: "64.72.09", name: "Samarinda Kota" },
    { code: "64.72.10", name: "Loa Janan Ilir" },
  ],
  "64.74": [
    { code: "64.74.01", name: "Bontang Utara" },
    { code: "64.74.02", name: "Bontang Selatan" },
    { code: "64.74.03", name: "Bontang Barat" },
  ],
};

// Helper to get Kecamatan list for a given Kab/Kota code
export function getKecamatanByKabKota(kabKotaCode: string): Kecamatan[] {
  return KECAMATAN_KALTIM[kabKotaCode] || [];
}

// Helper to find a Kab/Kota name by code
export function getKabKotaName(code: string): string {
  return KAB_KOTA_KALTIM.find((k) => k.code === code)?.name || "";
}

// Helper to find a Kecamatan name by code
export function getKecamatanName(kabKotaCode: string, kecCode: string): string {
  return KECAMATAN_KALTIM[kabKotaCode]?.find((k) => k.code === kecCode)?.name || "";
}
