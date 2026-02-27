"use client";

import { useBMKGAlerts } from "@/hooks/useBMKGAlerts";
import { AlertTriangle, X } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function WeatherAlertBanner() {
  const { alerts, loading } = useBMKGAlerts();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<number | null>(null);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  // Auto-open modal when alerts are loaded for the first time
  useEffect(() => {
    if (!loading && alerts.length > 0) {
      // Check if we already showed it this session to avoid annoyance
      const hasShown = sessionStorage.getItem("weather-alert-shown");
      if (!hasShown) {
        setSelectedAlert(0);
        setIsOpen(true);
        sessionStorage.setItem("weather-alert-shown", "true");
      }
    }
  }, [loading, alerts]);

  if (loading || alerts.length === 0) return null;

  // Show the latest alert in the banner
  const latestAlert = alerts[0];

  return (
    <>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="w-full bg-red-600 text-white cursor-pointer relative overflow-hidden"
        onClick={() => {
          setSelectedAlert(0);
          setIsOpen(true);
        }}
      >
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <div className="container mx-auto max-w-7xl px-4 py-3 relative z-10 flex items-center justify-center gap-3">
          <AlertTriangle className="h-5 w-5 animate-pulse shrink-0" />
          <p className="font-medium text-sm md:text-base text-center line-clamp-1">
             {latestAlert.title}
          </p>
          <span className="text-xs bg-white/20 px-2 py-0.5 rounded hidden md:inline-block hover:bg-white/30 transition-colors">
            Klik untuk detail
          </span>
        </div>
      </motion.div>

      {/* Main Alert Modal */}
      <AnimatePresence>
        {isOpen && selectedAlert !== null && alerts[selectedAlert] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-red-600 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-3 text-white">
                  <AlertTriangle className="h-6 w-6" />
                  <h3 className="text-lg font-bold">Peringatan Dini Cuaca</h3>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white/80 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)]">
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 text-lg mb-1">
                      {alerts[selectedAlert].title}
                    </h4>
                    <p className="text-sm text-gray-500">
                      Dipublikasikan: {alerts[selectedAlert].pubDate.replace(/\s\+0800(\s\+0800)?/g, " WITA")}
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* Infographic Images */}
                    {(alerts[selectedAlert].image || alerts[selectedAlert].imageText) ? (
                      <div className="flex flex-col md:flex-row gap-2 justify-center items-center">
                        {alerts[selectedAlert].image && (
                          <div className="flex justify-center">
                             <img 
                               src={alerts[selectedAlert].image} 
                               alt="Infografis Peringatan Cuaca" 
                               className="h-[398px] w-auto max-w-full object-contain cursor-zoom-in hover:scale-[1.02] transition-transform duration-200"
                               onClick={() => setZoomedImage(alerts[selectedAlert].image || null)}
                             />
                          </div>
                        )}
                        {alerts[selectedAlert].imageText && (
                          <div className="flex justify-center">
                             <img 
                               src={alerts[selectedAlert].imageText} 
                               alt="Detail Infografis" 
                               className="h-[398px] w-auto max-w-full object-contain cursor-zoom-in hover:scale-[1.02] transition-transform duration-200"
                               onClick={() => setZoomedImage(alerts[selectedAlert].imageText || null)}
                             />
                          </div>
                        )}
                      </div>
                    ) : (
                      // If no images, show description
                      <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                        <p className="text-gray-800 leading-relaxed whitespace-pre-line">
                          {alerts[selectedAlert].description}
                        </p>
                      </div>
                    )}
                  </div>

                  {alerts.length > 1 && (
                    <div className="mt-8 pt-6 border-t border-gray-100">
                      <h5 className="font-medium text-gray-900 mb-3">Peringatan Lainnya:</h5>
                      <div className="space-y-2">
                        {alerts.map((alert, idx) => (
                           idx !== selectedAlert && (
                             <button
                               key={idx}
                               onClick={() => setSelectedAlert(idx)}
                               className="w-full text-left p-3 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all text-sm text-gray-700 flex items-center gap-2"
                             >
                               <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                               {alert.title}
                             </button>
                           )
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Lightbox Modal */}
      <AnimatePresence>
        {zoomedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[250] flex items-center justify-center bg-black/95 backdrop-blur-md p-4"
            onClick={() => setZoomedImage(null)}
          >
            <button
               onClick={() => setZoomedImage(null)}
               className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors p-2 rounded-full bg-white/10 hover:bg-white/20 z-[260]"
            >
              <X className="h-8 w-8" />
            </button>
            <motion.img
              src={zoomedImage}
              alt="Zoomed Review"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-full max-h-[90vh] object-contain select-none"
              onClick={(e) => e.stopPropagation()} // Optional: keeping it open if clicking image? User said "bisa memperbesar gambar". Usually click outside closes.
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
