import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Calendar, User, ArrowLeft, Tag } from "lucide-react";

interface NewsDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: NewsDetailPageProps) {
  const { slug } = await params;
  const news = await prisma.news.findUnique({
    where: { slug },
  });

  if (!news) {
    return {
      title: "Berita Tidak Ditemukan",
    };
  }

  return {
    title: `${news.title} | BMKG Kalimantan Timur`,
    description: news.description,
  };
}

export default async function NewsDetailPage({ params }: NewsDetailPageProps) {
  const { slug } = await params;
  const news = await prisma.news.findUnique({
    where: { slug },
    include: {
      author: {
        select: { name: true },
      },
    },
  });

  if (!news) {
    notFound();
  }

  // Fetch recent news for sidebar
  const recentNews = await prisma.news.findMany({
    where: { 
        status: "PUBLISHED", 
        NOT: { id: news.id } 
    },
    orderBy: { createdAt: "desc" },
    take: 5,
    select: { title: true, slug: true, createdAt: true }
  });

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <Header />
      
      {/* Spacer for fixed Header */}
      <div className="pt-[88px]"></div>

      <div className="container mx-auto max-w-7xl px-4 py-8 md:py-12">
        <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali ke Beranda
        </Link>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <main className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Featured Image */}
                {news.imageUrl && (
                    <div className="relative w-full h-[300px] md:h-[400px]">
                        <Image 
                            src={news.imageUrl} 
                            alt={news.title}
                            fill
                            className="object-cover"
                            priority
                        />
                    </div>
                )}

                <div className="p-6 md:p-10">
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6 font-medium">
                        <div className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
                            <Tag className="h-3.5 w-3.5" />
                            <span className="capitalize">{news.category}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Calendar className="h-4 w-4" />
                            {new Date(news.createdAt).toLocaleDateString("id-ID", {
                                weekday: "long",
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                            })}
                        </div>
                        <div className="flex items-center gap-1.5">
                            <User className="h-4 w-4" />
                            {news.author.name}
                        </div>
                    </div>

                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
                        {news.title}
                    </h1>

                    <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed whitespace-pre-line">
                        {news.content || news.description}
                    </div>
                </div>
            </main>

            {/* Sidebar */}
            <aside className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Berita Terbaru Lainnya</h3>
                    <div className="space-y-4">
                        {recentNews.length > 0 ? (
                            recentNews.map((item) => (
                                <Link 
                                    key={item.slug} 
                                    href={`/berita/${item.slug}`}
                                    className="block group"
                                >
                                    <h4 className="font-medium text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-2">
                                        {item.title}
                                    </h4>
                                    <p className="text-xs text-gray-400 mt-1">
                                        {new Date(item.createdAt).toLocaleDateString("id-ID", {
                                            day: "numeric",
                                            month: "short",
                                            year: "numeric"
                                        })}
                                    </p>
                                </Link>
                            ))
                        ) : (
                            <p className="text-gray-500 text-sm">Belum ada berita lainnya.</p>
                        )}
                    </div>
                </div>
            </aside>
        </div>
      </div>
      <Footer />
    </div>
  );
}
