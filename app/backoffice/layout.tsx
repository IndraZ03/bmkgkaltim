import { Sidebar } from "@/components/backoffice/Sidebar";

export default function BackofficeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      
      <main className="flex-1 lg:ml-72 p-8 transition-all duration-300 ease-in-out">
        <div className="max-w-7xl mx-auto space-y-8 mt-12 md:mt-0">
          {children}
        </div>
      </main>
    </div>
  );
}
