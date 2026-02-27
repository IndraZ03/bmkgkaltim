"use client";

import { useState, useEffect } from "react";

export interface WeatherData {
  datetime: string;
  temp: number;
  humidity: number;
  weather_desc: string;
  wind_speed: number;
  wind_dir: number;
  clouds: number;
  visibility: string;
  image: string;
}

// Balikpapan district codes (based on Kemendagri/BMKG ADM4 format)
export const BALIKPAPAN_DISTRICTS = [
  { name: "Balikpapan Utara", code: "64.71.03.1001" }, // Batu Ampar
  { name: "Balikpapan Tengah", code: "64.71.04.1001" }, // Gunung Sari Ulu
  { name: "Balikpapan Selatan", code: "64.71.05.1002" }, // Sepinggan
  { name: "Balikpapan Barat", code: "64.71.02.1001" }, // Baru Ulu
  { name: "Balikpapan Timur", code: "64.71.01.1001" }, // Manggar
  { name: "Balikpapan Kota", code: "64.71.06.1001" }, // Telaga Sari
];

export function useBMKGWeather(districtCode: string) {
  const [data, setData] = useState<WeatherData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4=${districtCode}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        // Extract the forecast data (Array of Arrays)
        const cuacaList = result?.data?.[0]?.cuaca;

        if (!cuacaList || !Array.isArray(cuacaList)) {
          throw new Error("No weather data available");
        }

        // Flatten the array of arrays to get a continuous list of time slots
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const flatData = cuacaList.flat().map((item: any) => ({
          datetime: item.local_datetime.replace(" ", "T"), // Ensure ISO format
          temp: parseFloat(item.t) || 0,
          humidity: parseFloat(item.hu) || 0,
          weather_desc: item.weather_desc || "Tidak tersedia",
          wind_speed: parseFloat(item.ws) || 0,
          wind_dir: parseFloat(item.wd_deg) || 0, // Use wd_deg for degrees
          clouds: parseFloat(item.tcc) || 0,
          visibility: item.vs_text || "Baik",
          image: item.image || "",
        }));

        setData(flatData);
      } catch (err) {
        console.error("Failed to fetch weather data:", err);
        setError("Gagal memuat data cuaca. Silakan coba lagi nanti.");
        setData([]); 
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [districtCode]);

  return { data, loading, error };
}
