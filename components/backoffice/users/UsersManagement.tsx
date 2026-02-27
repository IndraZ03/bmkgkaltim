"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Trash2, Search, UserCog } from "lucide-react";
import { cn } from "@/lib/utils";

interface Station {
  id: number;
  name: string;
  code: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: "USER" | "ADMIN" | "CONTENT" | "CONTENT_ADMIN" | "DATIN" | "PELAYANAN";
  stationId: number | null;
  station: Station | null;
  createdAt: string;
}

const roleLabels: Record<string, { label: string; color: string }> = {
  USER: { label: "User", color: "bg-gray-100 text-gray-800" },
  ADMIN: { label: "Administrator", color: "bg-red-100 text-red-800" },
  CONTENT: { label: "Content Manager", color: "bg-green-100 text-green-800" },
  CONTENT_ADMIN: { label: "Content Admin", color: "bg-purple-100 text-purple-800" },
  DATIN: { label: "Data & Informasi", color: "bg-blue-100 text-blue-800" },
  PELAYANAN: { label: "Umum", color: "bg-orange-100 text-orange-800" },
};

// Roles that should be assigned to a station
const stationRoles = ["ADMIN", "CONTENT", "CONTENT_ADMIN", "DATIN"];

export function UsersManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "USER" as User["role"],
    stationId: "" as string,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchUsers();
    fetchStations();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStations = async () => {
    try {
      const res = await fetch("/api/stations");
      if (res.ok) {
        const data = await res.json();
        setStations(data);
      }
    } catch (error) {
      console.error("Error fetching stations:", error);
    }
  };

  const handleAddUser = async () => {
    setError("");
    setSuccess("");

    if (!formData.name || !formData.email || !formData.password) {
      setError("Semua field harus diisi");
      return;
    }

    try {
      const payload = {
        ...formData,
        stationId: formData.stationId ? parseInt(formData.stationId) : null,
      };
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSuccess("User berhasil ditambahkan");
        setIsAddDialogOpen(false);
        setFormData({ name: "", email: "", password: "", role: "USER", stationId: "" });
        fetchUsers();
      } else {
        const data = await res.json();
        setError(data.message || "Gagal menambahkan user");
      }
    } catch (error) {
      setError("Terjadi kesalahan");
    }
  };

  const handleEditUser = async () => {
    if (!selectedUser) return;
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`/api/users/${selectedUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          role: formData.role,
          stationId: formData.stationId ? parseInt(formData.stationId) : null,
          ...(formData.password && { password: formData.password }),
        }),
      });

      if (res.ok) {
        setSuccess("User berhasil diupdate");
        setIsEditDialogOpen(false);
        setSelectedUser(null);
        setFormData({ name: "", email: "", password: "", role: "USER", stationId: "" });
        fetchUsers();
      } else {
        const data = await res.json();
        setError(data.message || "Gagal mengupdate user");
      }
    } catch (error) {
      setError("Terjadi kesalahan");
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm("Yakin ingin menghapus user ini?")) return;

    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchUsers();
      }
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const openEditDialog = (user: User) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
      stationId: user.stationId ? user.stationId.toString() : "",
    });
    setIsEditDialogOpen(true);
  };

  const getRoleDisplayLabel = (user: User) => {
    const roleInfo = roleLabels[user.role] || { label: user.role, color: "bg-gray-100 text-gray-800" };
    if (user.station && stationRoles.includes(user.role)) {
      return `${roleInfo.label} - ${user.station.name}`;
    }
    return roleInfo.label;
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Cari user..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            autoComplete="off"
            name="search-users"
            id="search-users"
          />
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Tambah User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Tambah User Baru</DialogTitle>
              <DialogDescription>
                Masukkan informasi user baru untuk sistem backoffice
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {error && (
                <div className="p-3 text-sm text-red-500 bg-red-50 rounded-lg">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="name">Nama Lengkap</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="john@bmkg.go.id"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder="••••••••"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) =>
                    setFormData({ ...formData, role: value as User["role"] })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USER">User</SelectItem>
                    <SelectItem value="ADMIN">Administrator</SelectItem>
                    <SelectItem value="CONTENT">Content Manager</SelectItem>
                    <SelectItem value="CONTENT_ADMIN">Content Admin</SelectItem>
                    <SelectItem value="DATIN">Data & Informasi</SelectItem>
                    <SelectItem value="PELAYANAN">Umum</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {stationRoles.includes(formData.role) && (
                <div className="space-y-2">
                  <Label htmlFor="station">Stasiun</Label>
                  <Select
                    value={formData.stationId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, stationId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih stasiun" />
                    </SelectTrigger>
                    <SelectContent>
                      {stations.map((station) => (
                        <SelectItem key={station.id} value={station.id.toString()}>
                          {station.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
              >
                Batal
              </Button>
              <Button onClick={handleAddUser}>Simpan</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Success Message */}
      {success && (
        <div className="p-3 text-sm text-green-600 bg-green-50 rounded-lg">
          {success}
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="font-semibold">Nama</TableHead>
              <TableHead className="font-semibold">Email</TableHead>
              <TableHead className="font-semibold">Role</TableHead>
              <TableHead className="font-semibold">Dibuat</TableHead>
              <TableHead className="font-semibold text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <div className="flex items-center justify-center gap-2 text-gray-500">
                    <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
                    Memuat data...
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <div className="flex flex-col items-center gap-2 text-gray-500">
                    <UserCog className="h-8 w-8" />
                    <p>Tidak ada user ditemukan</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell className="text-gray-600">{user.email}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span
                        className={cn(
                          "px-2.5 py-1 text-xs font-medium rounded-full inline-block w-fit",
                          (roleLabels[user.role] || { color: "bg-gray-100 text-gray-800" }).color
                        )}
                      >
                        {(roleLabels[user.role] || { label: user.role }).label}
                      </span>
                      {user.station && stationRoles.includes(user.role) && (
                        <span className="text-xs text-gray-500 truncate max-w-[200px]" title={user.station.name}>
                          {user.station.name}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {new Date(user.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openEditDialog(user)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Perbarui informasi user
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 rounded-lg">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nama Lengkap</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-password">
                Password Baru{" "}
                <span className="text-gray-400 font-normal">
                  (kosongkan jika tidak ingin mengubah)
                </span>
              </Label>
              <Input
                id="edit-password"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder="••••••••"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role">Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value) =>
                  setFormData({ ...formData, role: value as User["role"] })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USER">User</SelectItem>
                  <SelectItem value="ADMIN">Administrator</SelectItem>
                  <SelectItem value="CONTENT">Content Manager</SelectItem>
                  <SelectItem value="CONTENT_ADMIN">Content Admin</SelectItem>
                  <SelectItem value="DATIN">Data & Informasi</SelectItem>
                  <SelectItem value="PELAYANAN">Umum</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {stationRoles.includes(formData.role) && (
              <div className="space-y-2">
                <Label htmlFor="edit-station">Stasiun</Label>
                <Select
                  value={formData.stationId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, stationId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih stasiun" />
                  </SelectTrigger>
                  <SelectContent>
                    {stations.map((station) => (
                      <SelectItem key={station.id} value={station.id.toString()}>
                        {station.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Batal
            </Button>
            <Button onClick={handleEditUser}>Simpan Perubahan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
