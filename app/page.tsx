"use client";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import Image from "next/image";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { WeatherCard } from "@/components/weather/WeatherCard";
import { useBMKGWeather, BALIKPAPAN_DISTRICTS } from "@/hooks/useBMKGWeather";
import Autoplay from "embla-carousel-autoplay";
import { useRef, useState, useEffect } from "react";
import { LoaderFive } from "@/components/ui/loader";
// Import LayoutTextFlip component
import { LayoutTextFlip } from "@/components/ui/layout-text-flip";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { TypewriterEffectSmooth } from "@/components/ui/typewriter-effect";
import { Highlight } from "@/components/ui/hero-highlight";
import { motion } from "framer-motion";
import { SelectCustom } from "@/components/ui/select-custom";
import { EarthquakeCard } from "@/components/earthquake/EarthquakeCard";
import { useBMKGEarthquake } from "@/hooks/useBMKGEarthquake";
import { WeatherAlertBanner } from "@/components/weather/WeatherAlertBanner";
import { IKMSection } from "@/components/IKMSection";
import { NewsSection } from "@/components/NewsSection";
import { ArticleSection } from "@/components/ArticleSection";
import { VideoSection } from "@/components/VideoSection";
import { HotspotSection, WaveForecastSection, ClimateInfoSection } from "@/components/InfoGraphicSections";








function EarthquakeWrapper() {
  const { data, loading, error } = useBMKGEarthquake();
  return <EarthquakeCard data={data} loading={loading} error={error} />;
}

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [showHighlight, setShowHighlight] = useState(false);
  const [greeting, setGreeting] = useState("");
  const [greetingColor, setGreetingColor] = useState("text-blue-600");
  const [selectedDistrictCode, setSelectedDistrictCode] = useState(BALIKPAPAN_DISTRICTS[2].code); // Default to Sepinggan (Airport)
  
  const { data: forecastData, loading: weatherLoading, error: weatherError } = useBMKGWeather(selectedDistrictCode);
  const selectedDistrictName = BALIKPAPAN_DISTRICTS.find(d => d.code === selectedDistrictCode)?.name || "Balikpapan";

  const plugin = useRef(
    Autoplay({ delay: 2000, stopOnInteraction: false, stopOnMouseEnter: false })
  );

  useEffect(() => {
    const updateGreeting = () => {
      const hour = new Date().getHours();
      if (hour >= 5 && hour < 10) {
        setGreeting("Selamat Pagi!");
        setGreetingColor("text-blue-600");
      } else if (hour >= 10 && hour <= 15) {
        setGreeting("Selamat Siang!");
        setGreetingColor("text-yellow-600");
      } else if (hour > 15 && hour <= 18) {
        setGreeting("Selamat Sore!");
        setGreetingColor("text-orange-600");
      } else {
        setGreeting("Selamat Malam!");
         setGreetingColor("text-gray-800");
      }
    };
    updateGreeting();
  }, []);

  useEffect(() => {
    const highlightTimer = setTimeout(() => {
      setShowHighlight(true);
    }, 3000);
    return () => clearTimeout(highlightTimer);
  }, []);

  useEffect(() => {
    // Simulate initial loading time for the app shell
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500); // Reduced slightly as we have real data loading too

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <LoaderFive 
        text={`Badan Meteorologi, Klimatologi dan Geofisika Wilayah Provinsi Kalimantan Timur`} 
      />
    );
  }

  const displayedForecast = forecastData.slice(0, 24);

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      <Header />
      
      {/* Spacer for fixed Header & Alert Banner Area */}
      <div className="pt-[88px]">
        <WeatherAlertBanner />
      </div>

      {/* Hero Section */}
      <section className="relative pt-8 pb-16 min-h-[85vh] flex flex-col justify-center items-center text-center px-4 bg-[url('/background.png')] bg-cover bg-center text-white overflow-hidden">
        {/* Floating Decorations */}
        <motion.img
          src="/weatherstation.png"
          alt="Aplikasi"
          className="absolute left-[5%] top-[20%] w-16 md:w-24 lg:w-32 opacity-90 pointer-events-none hidden md:block"
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.img
          src="/weather.png"
          alt="Weather"
          className="absolute right-[5%] top-[15%] w-20 md:w-28 lg:w-40 opacity-90 pointer-events-none hidden md:block"
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
        <motion.img
          src="/stiker.png"
          alt="Weather Station"
          className="absolute left-[5%] bottom-[15%] w-20 md:w-28 lg:w-36 opacity-90 pointer-events-none hidden md:block"
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
        <motion.img
          src="/aplikasi.png"
          alt="Stiker"
          className="absolute right-[5%] bottom-[20%] w-18 md:w-24 lg:w-32 opacity-90 pointer-events-none hidden md:block"
          animate={{ y: [0, 15, 0] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
        />

        {/* Top Left Logo - Absolute Positioned relative to Section */}
        <div className="absolute top-5 left-5 hidden lg:flex items-center z-20">
             <div className="relative w-24 h-auto">
                <Image 
                  src="/logo/nokorupsi1.png"
                  alt="No Korupsi"
                  width={96}
                  height={96}
                  className="object-contain drop-shadow-lg"
                />
             </div>
        </div>

        {/* Top Right Logos - Absolute Positioned relative to Section */}
        <div className="absolute top-5 right-5 hidden lg:flex flex-row items-center gap-4 z-20">
             <div className="relative w-32 h-auto">
                <Image 
                  src="/logo/Logo_BerAKHLAK.svg.png"
                  alt="BerAKHLAK"
                  width={128}
                  height={64}
                  className="object-contain drop-shadow-lg"
                />
             </div>
             <div className="relative w-24 h-auto">
                <Image 
                  src="/logo/image.png"
                  alt="Bangga Melayani Bangsa"
                  width={76}
                  height={35}
                  className="object-contain drop-shadow-lg"
                />
             </div>
        </div>

        <div className="w-full max-w-7xl space-y-12 flex flex-col items-center relative z-10">
         
          
          {/* Main Greeting - Centered */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col items-center justify-center text-center"
          >
            
            
            <div className="text-4xl md:text-6xl font-bold text-white mb-2 flex flex-wrap justify-center gap-2 md:gap-3 leading-normal items-center">
               <span className="drop-shadow-md">Halo</span>
               <LayoutTextFlip
                text=""
                words={["Bubuhan Metam!", "Sobat Metam!"]}
                className="text-white"
                flipClassName="text-white border border-white/50 rounded-xl px-4 py-2 bg-white/10 backdrop-blur-sm shadow-sm"
              />
            </div>
          </motion.div>

          {/* Welcome Text - TextGenerateEffect */}
          <div className="w-full max-w-4xl mx-auto">
            <TextGenerateEffect
              words={`Selamat Datang
 di Badan Meteorologi, Klimatologi dan Geofisika Wilayah Provinsi Kalimantan Timur`}
              className="text-xl md:text-2xl font-semibold leading-relaxed text-white text-center"
            />
          </div>

          {/* Mission Statements - TypewriterEffectSmooth */}
          <div className="w-full flex flex-col items-center gap-8 mt-1 overflow-hidden">
             <div className="max-w-5xl">
               {showHighlight ? (
                 <div className="text-base text-white/90 font-normal leading-relaxed tracking-wide">
                   Pelayanan informasi Meteorologi, Klimatologi dan Geofisika secara{" "}
                   <Highlight className="text-black">luas</Highlight>,{" "}
                   <Highlight className="text-black">cepat</Highlight>,{" "}
                   <Highlight className="text-black">tepat</Highlight>,{" "}
                   <Highlight className="text-black">akurat</Highlight> dan{" "}
                   <Highlight className="text-black">mudah dipahami</Highlight>
                 </div>
               ) : (
                 <TypewriterEffectSmooth
                    words={[
                      { text: "Pelayanan " },
                      { text: "informasi " },
                      { text: "Meteorologi, " },
                      { text: "Klimatologi " },
                      { text: "dan " },
                      { text: "Geofisika " },
                      { text: "secara " },
                      { text: "luas, " },
                      { text: "cepat, " },
                      { text: "tepat, " },
                      { text: "akurat " },
                      { text: "dan " },
                      { text: "mudah " },
                      { text: "dipahami" },
                    ]}
                    className="text-base text-white/90 font-normal leading-relaxed tracking-wide"
                    cursorClassName="bg-blue-500 h-5 md:h-7"
                 />
               )}
             </div>

             <div className="max-w-5xl">
               {showHighlight ? (
                 <div className="text-base text-white/90 font-normal leading-relaxed tracking-wide">
                   Menuju Wilayah Bebas Korupsi <Highlight className="text-black">(WBK)</Highlight> dan Wilayah Birokrasi Bersih dan Melayani <Highlight className="text-black">(WBBM)</Highlight>
                 </div>
               ) : (
                 <TypewriterEffectSmooth
                    words={[
                      { text: "Menuju " },
                      { text: "Wilayah " },
                      { text: "Bebas " },
                      { text: "Korupsi " },
                      { text: "(WBK) " },
                      { text: "dan " },
                      { text: "Wilayah " },
                      { text: "Birokrasi " },
                      { text: "Bersih " },
                      { text: "dan " },
                      { text: "Melayani " },
                      { text: "(WBBM)" },
                    ]}
                    className="text-base text-white/90 font-normal leading-relaxed tracking-wide"
                    cursorClassName="bg-green-500 h-5 md:h-7"
                 />
               )}
             </div>
          </div>



        </div>
      </section>



      {/* IKM Section */}
      <IKMSection />

       {/* Earthquake Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Informasi Gempa Bumi Terkini
            </h2>
            <p className="text-gray-600">
              Data gempa bumi terkini (M ≥ 5.0) yang dirasakan dari BMKG
            </p>
          </div>
          
          <EarthquakeWrapper />
        </div>
      </section>

      {/* Weather Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col items-center justify-center text-center mb-12 gap-6">
            <div className="w-full max-w-2xl">
              <h2 className="text-4xl font-bold text-gray-900 mb-2">
                Prakiraan Cuaca
              </h2>
              <p className="text-lg text-gray-600">
                Prakiraan cuaca 3 hari ke depan untuk wilayah Balikpapan
              </p>
              <p className={`text-xl font-medium mt-2 ${greetingColor}`}>
                {greeting}
              </p>
              
              <div className="mt-6 flex flex-col items-center justify-center">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pilih Lokasi (Kecamatan)
                </label>
                <SelectCustom 
                  options={BALIKPAPAN_DISTRICTS.map(d => ({ label: d.name, value: d.code }))}
                  value={selectedDistrictCode}
                  onChange={setSelectedDistrictCode}
                  className="w-full max-w-xs"
                />
              </div>
            </div>
          </div>

          {!weatherLoading && !weatherError && (
             <Carousel
               plugins={[plugin.current]}
               opts={{
                 loop: true,
               }}
               className="w-full max-w-6xl mx-auto"
             >
               <CarouselContent className="-ml-2 md:-ml-4">
                 {displayedForecast.map((weather, index) => (
                   <CarouselItem key={index} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                     <div className="p-1">
                       <WeatherCard
                         location={selectedDistrictName}
                         data={weather}
                         loading={false}
                         error={null}
                       />
                     </div>
                   </CarouselItem>
                 ))}
               </CarouselContent>
               <CarouselPrevious className="hidden md:flex ml-4" />
               <CarouselNext className="hidden md:flex mr-4" />
             </Carousel>
          )}
          
          {weatherLoading && (
            <div className="min-h-[400px] flex items-center justify-center">
               <LoaderFive text="Memuat Data Cuaca..." />
            </div>
          )}

          {weatherError && (
            <div className="min-h-[300px] flex flex-col items-center justify-center text-center p-8 bg-red-50 rounded-xl border border-red-100">
              <p className="text-red-500 font-semibold mb-2">Terjadi Kesalahan</p>
              <p className="text-red-400">{weatherError}</p>
            </div>
          )}

        </div>
      </section>

      {/* Hotspot Section */}
      <HotspotSection />

      {/* Wave Forecast Section */}
      <WaveForecastSection />

      {/* Climate Info Section */}
      <ClimateInfoSection />

      {/* Berita & Kegiatan Terkini */}
      <NewsSection />

      {/* Artikel & Press Release */}
      <ArticleSection />

      {/* Video Section */}
      <VideoSection />


      {/* Footer */}
      <Footer />
    </div>
  );
}
