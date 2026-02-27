"use client";

import { useState, useEffect } from "react";

export interface WeatherAlert {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  image?: string;
  imageText?: string;
}

export function useBMKGAlerts() {
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        // We use a CORS proxy or rely on Next.js rewrites if direct access fails. 
        // For local dev, direct access might be blocked by CORS.
        // Let's try direct first, if it fails, we might need a server action or proxy.
        // Since we are in a 'use client' component, we are subject to browser CORS.
        // BMKG APIs usually allow CORS, but let's see.
        
        const response = await fetch("https://www.bmkg.go.id/alerts/nowcast/id");
        
        if (!response.ok) {
          throw new Error("Failed to fetch alerts");
        }

        const text = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(text, "text/xml");
        
        const items = xmlDoc.getElementsByTagName("item");
        // const parsedAlerts: WeatherAlert[] = []; << Removed this line

        const validItems = [];
        for (let i = 0; i < items.length; i++) {
          const title = items[i].getElementsByTagName("title")[0]?.textContent || "";

          // Filter for Kalimantan Timur specifically for this app
          if (title.includes("Kalimantan Timur")) {
            validItems.push(items[i]);
          }
        }

        const parsedAlerts = await Promise.all(validItems.map(async (item) => {
          const link = item.getElementsByTagName("link")[0]?.textContent || "";
          let image = "";
          let imageText = "";

          if (link) {
            try {
              const detailResponse = await fetch(link);
              if (detailResponse.ok) {
                const detailText = await detailResponse.text();
                // Regex to find infographic links (infografis.jpg)
                // This matches the link found in <web> tag or body
                const imageMatch = detailText.match(/https?:\/\/[^"'\s<>]+\/infografis\.jpg/i);
                
                if (imageMatch) {
                  image = imageMatch[0];
                  // Construct the text version URL by replacing infografis.jpg with infografis_text.jpg
                  // User reported the format is infografis_text.jpg
                  imageText = image.replace("infografis.jpg", "infografis_text.jpg");
                }
              }
            } catch (e) {
              console.warn("Failed to fetch alert details:", e);
            }
          }

          return {
            title: item.getElementsByTagName("title")[0]?.textContent || "",
            link: link,
            description: item.getElementsByTagName("description")[0]?.textContent || "",
            pubDate: item.getElementsByTagName("pubDate")[0]?.textContent || "",
            image,
            imageText
          } as WeatherAlert;
        }));

        setAlerts(parsedAlerts);
        setError(null);
      } catch (err) {
        console.error("Error fetching BMKG alerts:", err);
        setError("Gagal memuat peringatan dini");
        // Fallback or empty is fine, we just don't show the banner
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
    
    // Refresh every 5 minutes
    const interval = setInterval(fetchAlerts, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return { alerts, loading, error };
}
