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

/**
 * Fetch 1-hour resolution weather forecast from BMKG cuaca API.
 * @param adm1 Province code (e.g. "64" for Kalimantan Timur)
 * @param adm2 Kabupaten/Kota code (e.g. "64.71")
 * @param adm3 Kecamatan code (e.g. "64.71.05")
 */
export function useBMKGWeather(adm1: string, adm2: string, adm3: string) {
  const [data, setData] = useState<WeatherData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Don't fetch if codes are not set
    if (!adm1 || !adm2 || !adm3) {
      setData([]);
      setLoading(false);
      return;
    }

    const fetchWeather = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `https://cuaca.bmkg.go.id/api/df/v1/forecast/adm?adm1=${adm1}&adm2=${adm2}&adm3=${adm3}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        // The new API returns { lokasi, data: [ { lokasi, cuaca: [[...], [...]] } ] }
        // Each inner array in cuaca is a group of hourly entries
        const cuacaList = result?.data?.[0]?.cuaca;

        if (!cuacaList || !Array.isArray(cuacaList)) {
          throw new Error("No weather data available");
        }

        // Flatten the array of arrays to get a continuous list of hourly time slots
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const flatData = cuacaList.flat().map((item: any) => ({
          datetime: item.local_datetime
            ? item.local_datetime.replace(" ", "T")
            : item.datetime || "",
          temp: parseFloat(item.t) || 0,
          humidity: parseFloat(item.hu) || 0,
          weather_desc: item.weather_desc || "Tidak tersedia",
          wind_speed: parseFloat(item.ws) || 0,
          wind_dir: parseFloat(item.wd_deg) || 0,
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
  }, [adm1, adm2, adm3]);

  return { data, loading, error };
}
