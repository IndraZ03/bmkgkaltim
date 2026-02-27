import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Calendar, User, ArrowLeft, Tag, FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ArticleDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ArticleDetailPageProps) {
  const { slug } = await params;
  const article = await prisma.article.findUnique({
    where: { slug },
  });

  if (!article) {
    return {
      title: "Artikel Tidak Ditemukan",
    };
  }

  return {
    title: `${article.title} | BMKG Kalimantan Timur`,
    description: article.description,
  };
}

export default async function ArticleDetailPage({ params }: ArticleDetailPageProps) {
  const { slug } = await params;
  const article = await prisma.article.findUnique({
    where: { slug },
    include: {
      author: {
        select: { name: true },
      },
    },
  });

  if (!article) {
    notFound();
  }

  // Fetch recent articles for sidebar
  const recentArticles = await prisma.article.findMany({
    where: { 
        status: "PUBLISHED", 
        NOT: { id: article.id } 
    },
    orderBy: { createdAt: "desc" },
    take: 5,
    select: { title: true, slug: true, createdAt: true, category: true }
  });

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <Header />
      
      {/* Spacer for fixed Header */}
      <div className="pt-[88px]"></div>

      <div className="container mx-auto max-w-7xl px-4 py-8 md:py-12">
        <Link href="/" className="inline-flex items-center text-emerald-600 hover:text-emerald-800 mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali ke Beranda
        </Link>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <main className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Featured Image */}
                {article.imageUrl && (
                    <div className="relative w-full h-[300px] md:h-[400px]">
                        <Image 
                            src={article.imageUrl} 
                            alt={article.title}
                            fill
                            className="object-cover"
                            priority
                        />
                    </div>
                )}

                <div className="p-6 md:p-10">
                    <div className="flex flex-col gap-4 mb-6">
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 font-medium">
                            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full ${
                                article.category === "press_release" 
                                    ? "bg-emerald-50 text-emerald-700" 
                                    : "bg-blue-50 text-blue-700"
                            }`}>
                                <Tag className="h-3.5 w-3.5" />
                                <span className="capitalize">{article.category === "press_release" ? "Press Release" : "Artikel"}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Calendar className="h-4 w-4" />
                                {new Date(article.createdAt).toLocaleDateString("id-ID", {
                                    weekday: "long",
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric",
                                })}
                            </div>
                            <div className="flex items-center gap-1.5">
                                <User className="h-4 w-4" />
                                {article.author.name}
                            </div>
                        </div>

                        {/* PDF Download Button for Press Release */}
                        {article.pdfUrl && (
                            <div className="flex items-center gap-4 bg-red-50 p-4 rounded-xl border border-red-100">
                                <div className="p-2 bg-red-100 rounded-lg">
                                    <FileText className="h-6 w-6 text-red-600" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-semibold text-gray-900 text-sm">Dokumen Terlampir</h4>
                                    <p className="text-xs text-gray-500">Unduh dokumen PDF asli untuk detail lebih lengkap.</p>
                                </div>
                                <a href={article.pdfUrl} target="_blank" rel="noopener noreferrer">
                                    <Button variant="outline" className="border-red-200 text-red-700 hover:bg-red-100 hover:text-red-800 gap-2">
                                        <Download className="h-4 w-4" />
                                        Unduh PDF
                                    </Button>
                                </a>
                            </div>
                        )}
                    </div>

                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
                        {article.title}
                    </h1>

                    <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed whitespace-pre-line">
                        {article.content || article.description}
                    </div>
                </div>
            </main>

            {/* Sidebar */}
            <aside className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Artikel Terbaru Lainnya</h3>
                    <div className="space-y-4">
                        {recentArticles.length > 0 ? (
                            recentArticles.map((item) => (
                                <Link 
                                    key={item.slug} 
                                    href={`/artikel/${item.slug}`}
                                    className="block group"
                                >
                                    <h4 className="font-medium text-gray-800 group-hover:text-emerald-600 transition-colors line-clamp-2">
                                        {item.title}
                                    </h4>
                                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-2">
                                        <span>{item.category === "press_release" ? "Press Release" : "Artikel"}</span>
                                        <span>•</span>
                                        <span>{new Date(item.createdAt).toLocaleDateString("id-ID", {
                                            day: "numeric",
                                            month: "short",
                                            year: "numeric"
                                        })}</span>
                                    </p>
                                </Link>
                            ))
                        ) : (
                            <p className="text-gray-500 text-sm">Belum ada artikel lainnya.</p>
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
