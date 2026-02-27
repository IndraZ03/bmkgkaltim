import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { UsersManagement } from "@/components/backoffice/users/UsersManagement";

export default async function UsersPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  // Only ADMIN can access this page
  if (session.user?.role !== "ADMIN") {
    redirect("/backoffice");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Manajemen User</h1>
        <p className="text-gray-500 mt-1">Kelola pengguna dan hak akses sistem</p>
      </div>
      
      <UsersManagement />
    </div>
  );
}
