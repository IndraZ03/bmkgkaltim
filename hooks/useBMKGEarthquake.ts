"use client";

import { useState, useEffect } from "react";

export interface EarthquakeData {
  Tanggal: string;
  Jam: string;
  DateTime: string;
  Coordinates: string;
  Lintang: string;
  Bujur: string;
  Magnitude: string;
  Kedalaman: string;
  Wilayah: string;
  Potensi: string;
  Dirasakan: string;
  Shakemap: string;
}

export function useBMKGEarthquake() {
  const [data, setData] = useState<EarthquakeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEarthquake = async () => {
      try {
        const response = await fetch("https://data.bmkg.go.id/DataMKG/TEWS/autogempa.json");
        
        if (!response.ok) {
          throw new Error("Failed to fetch earthquake data");
        }

        const result = await response.json();
        if (result?.Infogempa?.gempa) {
          setData(result.Infogempa.gempa);
        } else {
          throw new Error("Invalid data format");
        }
      } catch (err) {
        console.error(err);
        setError("Gagal memuat data gempa bumi");
      } finally {
        setLoading(false);
      }
    };

    fetchEarthquake();
  }, []);

  return { data, loading, error };
}
