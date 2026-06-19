"use client";

import React, { useState } from "react";
import { toggleBlockUser, resetUserPassword, deleteUser } from "@/app/actions/admin";
import { createStudent, createAdminUser, assignSeries, unassignSeries } from "@/app/actions/test-series";
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
  User,
  UserPlus,
  Layers3,
  Plus,
  X
} from "lucide-react";
import * as XLSX from "xlsx";
import { formatDate } from "@/lib/utils";

interface SeriesAccess {
  testSeriesId: string;
  testSeries: { id: string; title: string };
}

interface UserItem {
  id: string;
  name: string | null;
  email: string;
  role: "STUDENT" | "ADMIN" | "SUPERADMIN";
  isBlocked: boolean;
  createdAt: string | Date;
  seriesAccess?: SeriesAccess[];
}

interface SeriesOption {
  id: string;
  title: string;
  category?: { name: string } | null;
}

export function UserManager({
  initialUsers,
  allSeries = [],
  currentRole = "ADMIN",
}: {
  initialUsers: UserItem[];
  allSeries?: SeriesOption[];
  currentRole?: "STUDENT" | "ADMIN" | "SUPERADMIN";
}) {
  const isSuperAdmin = currentRole === "SUPERADMIN";
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

  // Create-student dialog
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [cName, setCName] = useState("");
  const [cEmail, setCEmail] = useState("");
  const [cPassword, setCPassword] = useState("");
  const [cPhone, setCPhone] = useState("");
  const [cSeriesIds, setCSeriesIds] = useState<string[]>([]);

  // Create-admin dialog (super admin only)
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [aName, setAName] = useState("");
  const [aEmail, setAEmail] = useState("");
  const [aPassword, setAPassword] = useState("");

  // Manage-series dialog
  const [isSeriesOpen, setIsSeriesOpen] = useState(false);

  const toggleCreateSeries = (id: string) => {
    setCSeriesIds((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
  };

  const openCreateStudent = () => {
    setCName("");
    setCEmail("");
    setCPassword("");
    setCPhone("");
    setCSeriesIds([]);
    setError("");
    setSuccess(false);
    setIsCreateOpen(true);
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);
    try {
      const res = await createStudent({
        name: cName,
        email: cEmail,
        password: cPassword,
        phone: cPhone,
        seriesIds: cSeriesIds,
      });
      if (res.error) {
        setError(res.error);
      } else {
        setSuccess(true);
        setTimeout(() => {
          setIsCreateOpen(false);
          window.location.reload();
        }, 800);
      }
    } catch {
      setError("Failed to create student.");
    } finally {
      setLoading(false);
    }
  };

  const openCreateAdmin = () => {
    setAName("");
    setAEmail("");
    setAPassword("");
    setError("");
    setSuccess(false);
    setIsAdminOpen(true);
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);
    try {
      const res = await createAdminUser({ name: aName, email: aEmail, password: aPassword });
      if (res.error) {
        setError(res.error);
      } else {
        setSuccess(true);
        setTimeout(() => {
          setIsAdminOpen(false);
          window.location.reload();
        }, 800);
      }
    } catch {
      setError("Failed to create admin.");
    } finally {
      setLoading(false);
    }
  };

  const openSeriesModal = (user: UserItem) => {
    setSelectedUser(user);
    setError("");
    setIsSeriesOpen(true);
  };

  const handleAssign = async (seriesId: string) => {
    if (!selectedUser) return;
    const res = await assignSeries(selectedUser.id, seriesId);
    if (res.error) {
      alert(res.error);
      return;
    }
    const found = allSeries.find((s) => s.id === seriesId);
    const updated: UserItem = {
      ...selectedUser,
      seriesAccess: [
        ...(selectedUser.seriesAccess || []),
        { testSeriesId: seriesId, testSeries: { id: seriesId, title: found?.title || "" } },
      ],
    };
    setSelectedUser(updated);
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
  };

  const handleUnassign = async (seriesId: string) => {
    if (!selectedUser) return;
    const res = await unassignSeries(selectedUser.id, seriesId);
    if (res.error) {
      alert(res.error);
      return;
    }
    const updated: UserItem = {
      ...selectedUser,
      seriesAccess: (selectedUser.seriesAccess || []).filter((a) => a.testSeriesId !== seriesId),
    };
    setSelectedUser(updated);
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
  };

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
          <p className="text-xs text-muted-foreground">Create students, assign test series, reset passwords, or export datasets.</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            onClick={handleExportToExcel}
            variant="outline"
            className="flex items-center gap-1.5 font-semibold text-xs h-9"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" /> Export
          </Button>
          {isSuperAdmin && (
            <Button
              onClick={openCreateAdmin}
              variant="secondary"
              className="flex items-center gap-1.5 font-semibold text-xs h-9"
            >
              <ShieldCheck className="h-4 w-4" /> New Admin
            </Button>
          )}
          <Button
            onClick={openCreateStudent}
            className="flex items-center gap-1.5 font-semibold text-xs h-9"
          >
            <UserPlus className="h-4 w-4" /> New Student
          </Button>
        </div>
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
                <th className="p-4 text-center">Series</th>
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
                  <td className="p-4 text-center">
                    {u.role === "STUDENT" ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-foreground">
                        <Layers3 className="h-3.5 w-3.5 text-primary" />
                        {u.seriesAccess?.length ?? 0}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
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
                    {u.role === "STUDENT" && (
                      <button
                        onClick={() => openSeriesModal(u)}
                        className="inline-flex p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-primary cursor-pointer"
                        title="Manage test series"
                      >
                        <Layers3 className="h-4 w-4" />
                      </button>
                    )}
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

      {/* Create Student Modal */}
      <Dialog isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create Student">
        <form onSubmit={handleCreateStudent} className="space-y-4 text-sm">
          {error && (
            <div className="flex items-center gap-2 bg-danger/10 border border-danger/20 p-3 rounded text-danger">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 bg-success/10 border border-success/20 p-3 rounded text-success">
              <CheckCircle className="h-4 w-4 shrink-0" />
              <span>Student created!</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Full Name</label>
            <Input type="text" placeholder="Student name" value={cName} onChange={(e) => setCName(e.target.value)} required />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email (login id)</label>
              <Input type="email" placeholder="student@example.com" value={cEmail} onChange={(e) => setCEmail(e.target.value)} required />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Mobile (optional)</label>
              <Input type="tel" placeholder="10-digit number" value={cPhone} onChange={(e) => setCPhone(e.target.value)} />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Password (min 6 chars)</label>
            <Input type="text" placeholder="Set a password to share with the student" value={cPassword} onChange={(e) => setCPassword(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Assign Test Series</label>
            {allSeries.length === 0 ? (
              <p className="text-xs text-muted-foreground">No test series yet. Create one first to assign it here.</p>
            ) : (
              <div className="max-h-44 overflow-y-auto space-y-1.5 border border-border/60 rounded-md p-2">
                {allSeries.map((s) => (
                  <label key={s.id} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      className="h-4 w-4"
                      checked={cSeriesIds.includes(s.id)}
                      onChange={() => toggleCreateSeries(s.id)}
                    />
                    <span className="text-sm text-foreground">{s.title}</span>
                    {s.category?.name && (
                      <span className="text-[10px] text-muted-foreground ml-auto">{s.category.name}</span>
                    )}
                  </label>
                ))}
              </div>
            )}
            <p className="text-[11px] text-muted-foreground">{cSeriesIds.length} selected. You can change this later from the directory.</p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1 font-semibold text-xs" onClick={() => setIsCreateOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1 font-semibold text-xs" disabled={loading}>
              {loading ? "Creating..." : "Create Student"}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Create Admin Modal (super admin only) */}
      <Dialog isOpen={isAdminOpen} onClose={() => setIsAdminOpen(false)} title="Create Admin">
        <form onSubmit={handleCreateAdmin} className="space-y-4 text-sm">
          {error && (
            <div className="flex items-center gap-2 bg-danger/10 border border-danger/20 p-3 rounded text-danger">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 bg-success/10 border border-success/20 p-3 rounded text-success">
              <CheckCircle className="h-4 w-4 shrink-0" />
              <span>Admin created!</span>
            </div>
          )}

          <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 p-3 rounded text-xs text-blue-800 dark:text-blue-300">
            <ShieldCheck className="h-4 w-4 shrink-0" />
            <span>Admins can manage students, test series, quizzes and results — but cannot create other admins.</span>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Full Name</label>
            <Input type="text" placeholder="Admin name" value={aName} onChange={(e) => setAName(e.target.value)} required />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email (login id)</label>
            <Input type="email" placeholder="admin@example.com" value={aEmail} onChange={(e) => setAEmail(e.target.value)} required />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Password (min 6 chars)</label>
            <Input type="text" placeholder="Set a password to share with the admin" value={aPassword} onChange={(e) => setAPassword(e.target.value)} required />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1 font-semibold text-xs" onClick={() => setIsAdminOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1 font-semibold text-xs" disabled={loading}>
              {loading ? "Creating..." : "Create Admin"}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Manage Series Modal */}
      <Dialog isOpen={isSeriesOpen} onClose={() => setIsSeriesOpen(false)} title="Manage Test Series">
        <div className="space-y-4 text-sm">
          <p className="text-foreground">
            Series access for <span className="font-bold">{selectedUser?.name || selectedUser?.email}</span>
          </p>

          {allSeries.length === 0 ? (
            <p className="text-xs text-muted-foreground">No test series available. Create one first.</p>
          ) : (
            <div className="max-h-72 overflow-y-auto space-y-1.5 border border-border/60 rounded-md p-2">
              {allSeries.map((s) => {
                const assigned = (selectedUser?.seriesAccess || []).some((a) => a.testSeriesId === s.id);
                return (
                  <div key={s.id} className="flex items-center gap-2 px-2 py-1.5 rounded">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-foreground truncate">{s.title}</p>
                      {s.category?.name && <p className="text-[10px] text-muted-foreground">{s.category.name}</p>}
                    </div>
                    {assigned ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="text-xs font-semibold text-danger flex items-center gap-1"
                        onClick={() => handleUnassign(s.id)}
                      >
                        <X className="h-3.5 w-3.5" /> Remove
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        size="sm"
                        className="text-xs font-semibold flex items-center gap-1"
                        onClick={() => handleAssign(s.id)}
                      >
                        <Plus className="h-3.5 w-3.5" /> Add
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex justify-end pt-2">
            <Button type="button" variant="outline" className="font-semibold text-xs" onClick={() => setIsSeriesOpen(false)}>
              Done
            </Button>
          </div>
        </div>
      </Dialog>

    </div>
  );
}
