"use client";

import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Thermometer,
  Droplet,
  Navigation,
  Cloud,
  Eye,
  MapPin,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { WeatherData } from "@/hooks/useBMKGWeather";
import { cn } from "@/lib/utils";

interface WeatherCardProps {
  location: string;
  data: WeatherData | null;
  loading: boolean;
  error: string | null;
}

interface TimeOfDay {
  greeting: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
}

function getTimeOfDay(datetime: string): TimeOfDay {
  const date = new Date(datetime);
  const hour = date.getHours();

  if (hour >= 5 && hour < 10) {
    return {
      greeting: "Selamat Pagi",
      bgColor: "bg-gradient-to-br from-blue-50 to-blue-100",
      borderColor: "border-blue-300",
      textColor: "text-blue-900",
    };
  } else if (hour >= 10 && hour <= 15) {
    return {
      greeting: "Selamat Siang",
      bgColor: "bg-gradient-to-br from-yellow-50 to-yellow-100",
      borderColor: "border-yellow-300",
      textColor: "text-yellow-900",
    };
  } else if (hour > 15 && hour <= 18) {
    return {
      greeting: "Selamat Sore",
      bgColor: "bg-gradient-to-br from-orange-50 to-orange-100",
      borderColor: "border-orange-300",
      textColor: "text-orange-900",
    };
  } else {
    return {
      greeting: "Selamat Malam",
      bgColor: "bg-gradient-to-br from-gray-700 to-gray-800",
      borderColor: "border-gray-600",
      textColor: "text-white",
    };
  }
}

function formatDateTime(datetime: string): string {
  const date = new Date(datetime);
  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return date.toLocaleDateString("id-ID", options);
}

function getWindDirection(degrees: number): string {
  const directions = ["U", "TL", "T", "TG", "S", "BD", "B", "BL"];
  const index = Math.round(degrees / 45) % 8;
  return directions[index];
}

export function WeatherCard({
  location,
  data,
  loading,
  error,
}: WeatherCardProps) {
  if (loading) {
    return (
      <Card className="w-full min-h-[400px] flex items-center justify-center">
        <CardContent className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <p className="text-sm text-gray-600">Memuat data cuaca...</p>
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card className="w-full min-h-[400px] flex items-center justify-center border-red-200 bg-red-50">
        <CardContent className="flex flex-col items-center gap-3">
          <AlertCircle className="h-8 w-8 text-red-500" />
          <p className="text-sm text-red-600">
            {error || "Data tidak tersedia"}
          </p>
        </CardContent>
      </Card>
    );
  }

  const timeOfDay = getTimeOfDay(data.datetime);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <Card
        className={cn(
          "overflow-hidden border-2 transition-all duration-300 hover:shadow-xl",
          timeOfDay.bgColor,
          timeOfDay.borderColor
        )}
      >
        <CardHeader className="pb-3">

          <p
            className={cn(
              "text-sm mt-1",
              timeOfDay.textColor === "text-white"
                ? "text-gray-300"
                : "text-gray-600"
            )}
          >
            {formatDateTime(data.datetime)}
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Weather Icon and Description */}
          <div className="flex flex-col items-center justify-center py-4">
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            >
              {data.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img 
                  src={data.image} 
                  alt={data.weather_desc}
                  className="h-20 w-20 mb-3"
                />
              ) : (
                <Cloud className={cn("h-20 w-20 mb-3", timeOfDay.textColor)} />
              )}
            </motion.div>
            <p className={cn("text-lg font-semibold", timeOfDay.textColor)}>
              {data.weather_desc}
            </p>
          </div>

          {/* Weather Metrics Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Temperature */}
            <div
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg",
                timeOfDay.textColor === "text-white"
                  ? "bg-white/10 backdrop-blur-sm"
                  : "bg-white/50"
              )}
            >
              <Thermometer className={cn("h-6 w-6", timeOfDay.textColor)} />
              <div>
                <p
                  className={cn(
                    "text-xs",
                    timeOfDay.textColor === "text-white"
                      ? "text-gray-300"
                      : "text-gray-600"
                  )}
                >
                  Suhu
                </p>
                <p className={cn("text-xl font-bold", timeOfDay.textColor)}>
                  {data.temp}°C
                </p>
              </div>
            </div>

            {/* Humidity */}
            <div
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg",
                timeOfDay.textColor === "text-white"
                  ? "bg-white/10 backdrop-blur-sm"
                  : "bg-white/50"
              )}
            >
              <Droplet className={cn("h-6 w-6", timeOfDay.textColor)} />
              <div>
                <p
                  className={cn(
                    "text-xs",
                    timeOfDay.textColor === "text-white"
                      ? "text-gray-300"
                      : "text-gray-600"
                  )}
                >
                  Kelembaban
                </p>
                <p className={cn("text-xl font-bold", timeOfDay.textColor)}>
                  {data.humidity}%
                </p>
              </div>
            </div>

            {/* Wind */}
            <div
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg",
                timeOfDay.textColor === "text-white"
                  ? "bg-white/10 backdrop-blur-sm"
                  : "bg-white/50"
              )}
            >
              <div className="bg-black/10 rounded-full p-1">
                <motion.div
                  animate={{ rotate: data.wind_dir }}
                  transition={{ duration: 0.5, type: "spring" }}
                  style={{ originX: 0.5, originY: 0.5 }}
                >
                  <Navigation className={cn("h-6 w-6 fill-current", timeOfDay.textColor)} />
                </motion.div>
              </div>
              <div>

                <p
                  className={cn(
                    "text-xs",
                    timeOfDay.textColor === "text-white"
                      ? "text-gray-300"
                      : "text-gray-600"
                  )}
                >
                  Angin
                </p>
                <p className={cn("text-xl font-bold", timeOfDay.textColor)}>
                  {data.wind_speed} kt
                </p>
              </div>
            </div>

            {/* Cloud Cover */}
            <div
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg",
                timeOfDay.textColor === "text-white"
                  ? "bg-white/10 backdrop-blur-sm"
                  : "bg-white/50"
              )}
            >
              <Cloud className={cn("h-6 w-6", timeOfDay.textColor)} />
              <div>
                <p
                  className={cn(
                    "text-xs",
                    timeOfDay.textColor === "text-white"
                      ? "text-gray-300"
                      : "text-gray-600"
                  )}
                >
                  Tutupan Awan
                </p>
                <p className={cn("text-xl font-bold", timeOfDay.textColor)}>
                  {data.clouds}%
                </p>
              </div>
            </div>
          </div>

          {/* Visibility */}
          <div
            className={cn(
              "flex items-center gap-3 p-3 rounded-lg",
              timeOfDay.textColor === "text-white"
                ? "bg-white/10 backdrop-blur-sm"
                : "bg-white/50"
            )}
          >
            <Eye className={cn("h-6 w-6", timeOfDay.textColor)} />
            <div>
              <p
                className={cn(
                  "text-xs",
                  timeOfDay.textColor === "text-white"
                    ? "text-gray-300"
                    : "text-gray-600"
                )}
              >
                Jarak Pandang
              </p>
              <p className={cn("text-lg font-semibold", timeOfDay.textColor)}>
                {data.visibility}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
