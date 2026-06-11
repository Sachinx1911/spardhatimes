"use client";

import React, { useState } from "react";
import { toggleBlockUser, resetUserPassword, deleteUser } from "@/app/actions/admin";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Input } from "../ui/input";
import { Dialog } from "../ui/dialog";
import { Select } from "../ui/select";
import { 
  Users, 
  Search, 
  Ban, 
  Unlock, 
  KeyRound, 
  Trash2, 
  FileSpreadsheet,
  AlertCircle,
  CheckCircle,
  ShieldCheck,
  User
} from "lucide-react";
import * as XLSX from "xlsx";
import { formatDate } from "@/lib/utils";

interface UserItem {
  id: string;
  name: string | null;
  email: string;
  role: "STUDENT" | "ADMIN" | "SUPERADMIN";
  isBlocked: boolean;
  createdAt: string | Date;
}

export function UserManager({ initialUsers }: { initialUsers: UserItem[] }) {
  const [users, setUsers] = useState<UserItem[]>(initialUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  
  // Modals state
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Filter logic
  const filteredUsers = users.filter((u) => {
    const matchesSearch = 
      (u.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = roleFilter ? u.role === roleFilter : true;
    
    let matchesStatus = true;
    if (statusFilter === "BLOCKED") {
      matchesStatus = u.isBlocked === true;
    } else if (statusFilter === "ACTIVE") {
      matchesStatus = u.isBlocked === false;
    } else if (statusFilter === "NEW") {
      // Registered within the last 7 days.
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      matchesStatus = new Date(u.createdAt).getTime() >= sevenDaysAgo;
    }

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Toggle block/unblock
  const handleToggleBlock = async (userId: string) => {
    if (!confirm("Are you sure you want to change this user's block status?")) return;
    try {
      const res = await toggleBlockUser(userId);
      if (res.error) {
        alert(res.error);
      } else {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, isBlocked: res.isBlocked! } : u))
        );
      }
    } catch (err) {
      alert("Failed to toggle block status.");
    }
  };

  // Open reset password modal
  const openResetModal = (user: UserItem) => {
    setSelectedUser(user);
    setNewPassword("");
    setError("");
    setSuccess(false);
    setIsResetOpen(true);
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const res = await resetUserPassword(selectedUser.id, newPassword);
      if (res.error) {
        setError(res.error);
      } else {
        setSuccess(true);
        setTimeout(() => {
          setIsResetOpen(false);
        }, 1200);
      }
    } catch (err) {
      setError("Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  // Open delete user modal
  const openDeleteModal = (user: UserItem) => {
    setSelectedUser(user);
    setIsDeleteOpen(true);
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    setLoading(true);

    try {
      const res = await deleteUser(selectedUser.id);
      if (res.error) {
        alert(res.error);
      } else {
        setUsers((prev) => prev.filter((u) => u.id !== selectedUser.id));
        setIsDeleteOpen(false);
      }
    } catch (err) {
      alert("Failed to delete user.");
    } finally {
      setLoading(false);
    }
  };

  // Export Users to Excel (SheetJS)
  const handleExportToExcel = () => {
    // Format JSON array for export
    const dataToExport = filteredUsers.map((u) => ({
      ID: u.id,
      Name: u.name || "Anonymous",
      Email: u.email,
      Role: u.role,
      Status: u.isBlocked ? "Blocked" : "Active",
      Created_At: formatDate(u.createdAt)
    }));

    // Create sheet
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "User Directory");

    // Write file
    XLSX.writeFile(workbook, "quiz_platform_users.xlsx");
  };

  return (
    <div className="space-y-6">
      
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">User Management Directory</h2>
          <p className="text-xs text-muted-foreground">Block users, reset passwords, delete accounts, or export datasets.</p>
        </div>
        <Button 
          onClick={handleExportToExcel} 
          variant="outline" 
          className="flex items-center gap-1.5 font-semibold text-xs h-9 shrink-0"
        >
          <FileSpreadsheet className="h-4 w-4 text-emerald-600" /> Export to Excel
        </Button>
      </div>

      {/* Filter and search card */}
      <Card className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search name or email..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="">All Roles</option>
          <option value="STUDENT">Student</option>
          <option value="ADMIN">Admin</option>
          <option value="SUPERADMIN">Super Admin</option>
        </Select>

        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="ACTIVE">Active Users</option>
          <option value="BLOCKED">Blocked Users</option>
          <option value="NEW">New (last 7 days)</option>
        </Select>
      </Card>

      {/* Table list */}
      <Card>
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950 border-b border-border/40 font-semibold text-xs text-muted-foreground uppercase tracking-wider">
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>
                <th className="p-4">Join Date</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20 text-sm">
                  <td className="p-4 font-bold text-foreground flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" /> {u.name || "Anonymous User"}
                  </td>
                  <td className="p-4 font-mono text-xs text-muted-foreground">{u.email}</td>
                  <td className="p-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                      u.role === "SUPERADMIN" ? "border-purple-200 bg-purple-50 text-purple-700" :
                      u.role === "ADMIN" ? "border-blue-200 bg-blue-50 text-blue-700" :
                      "border-slate-200 bg-slate-50 text-slate-700"
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4 text-muted-foreground text-xs">
                    {formatDate(u.createdAt)}
                  </td>
                  <td className="p-4 text-center">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${
                      u.isBlocked 
                        ? "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400" 
                        : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400"
                    }`}>
                      {u.isBlocked ? "Blocked" : "Active"}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-1 shrink-0">
                    <button
                      onClick={() => handleToggleBlock(u.id)}
                      className={`inline-flex p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer ${
                        u.isBlocked ? "text-emerald-600" : "text-red-600"
                      }`}
                      title={u.isBlocked ? "Unblock user" : "Block user"}
                      disabled={u.role === "SUPERADMIN"}
                    >
                      {u.isBlocked ? <Unlock className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => openResetModal(u)}
                      className="inline-flex p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-foreground cursor-pointer"
                      title="Reset password"
                    >
                      <KeyRound className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => openDeleteModal(u)}
                      className="inline-flex p-1.5 rounded hover:bg-danger/5 text-slate-500 hover:text-danger cursor-pointer"
                      title="Delete account"
                      disabled={u.role === "SUPERADMIN"}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Password Reset Modal */}
      <Dialog
        isOpen={isResetOpen}
        onClose={() => setIsResetOpen(false)}
        title="Reset Password"
      >
        <form onSubmit={handleResetPasswordSubmit} className="space-y-4 text-sm">
          {error && (
            <div className="flex items-center gap-2 bg-danger/10 border border-danger/20 p-3 rounded text-danger">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 bg-success/10 border border-success/20 p-3 rounded text-success">
              <CheckCircle className="h-4 w-4 shrink-0" />
              <span>Password updated successfully!</span>
            </div>
          )}

          <p className="text-foreground">Reset credentials password for <span className="font-bold">{selectedUser?.email}</span>:</p>

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">New Password (Min 6 characters)</label>
            <Input
              type="password"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1 font-semibold text-xs"
              onClick={() => setIsResetOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 font-semibold text-xs"
              disabled={loading}
            >
              {loading ? "Resetting..." : "Save Password"}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Delete User Confirmation Modal */}
      <Dialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Delete User Account"
      >
        <div className="space-y-4 text-sm">
          <div className="flex items-center gap-3 text-danger bg-danger/10 p-3 rounded border border-danger/20">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p>Warning: Deleting this user account will permanently remove all their mock attempt history, bookmarks, and certificates. This action is irreversible!</p>
          </div>
          <p className="text-foreground">Are you sure you want to delete the user account &ldquo;{selectedUser?.name} ({selectedUser?.email})&rdquo;?</p>
          <div className="flex gap-3 mt-6">
            <Button
              variant="outline"
              className="flex-1 font-semibold text-xs"
              onClick={() => setIsDeleteOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="flex-1 font-semibold text-xs"
              onClick={handleDeleteUser}
              disabled={loading}
            >
              {loading ? "Deleting..." : "Delete User"}
            </Button>
          </div>
        </div>
      </Dialog>

    </div>
  );
}
