"use client";

import React, { useState } from "react";
import { createCategory, updateCategory, deleteCategory } from "@/app/actions/admin";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Input } from "../ui/input";
import { Dialog } from "../ui/dialog";
import { Select } from "../ui/select";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Brain, 
  Globe, 
  BookOpen, 
  Map, 
  Atom, 
  Percent, 
  GitBranch, 
  PenTool, 
  Languages, 
  Laptop,
  CheckCircle,
  AlertCircle
} from "lucide-react";

const iconMap: Record<string, React.ComponentType<any>> = {
  Brain,
  Globe,
  BookOpen,
  Map,
  Atom,
  Percent,
  GitBranch,
  PenTool,
  Languages,
  Laptop
};

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  totalTests: number;
  totalQuestions: number;
  metaTitle: string | null;
  metaDescription: string | null;
}

export function CategoryManager({ initialCategories }: { initialCategories: Category[] }) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedCat, setSelectedCat] = useState<Category | null>(null);
  
  // Form values
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [icon, setIcon] = useState("Brain");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const openCreateDialog = () => {
    setSelectedCat(null);
    setName("");
    setSlug("");
    setIcon("Brain");
    setMetaTitle("");
    setMetaDescription("");
    setError("");
    setSuccess(false);
    setIsOpen(true);
  };

  const openEditDialog = (cat: Category) => {
    setSelectedCat(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setIcon(cat.icon || "Brain");
    setMetaTitle(cat.metaTitle || "");
    setMetaDescription(cat.metaDescription || "");
    setError("");
    setSuccess(false);
    setIsOpen(true);
  };

  const openDeleteDialog = (cat: Category) => {
    setSelectedCat(cat);
    setIsDeleteOpen(true);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (!selectedCat) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("slug", slug);
    formData.append("icon", icon);
    formData.append("metaTitle", metaTitle);
    formData.append("metaDescription", metaDescription);

    try {
      let res;
      if (selectedCat) {
        res = await updateCategory(selectedCat.id, formData);
      } else {
        res = await createCategory(formData);
      }

      if (res.error) {
        setError(res.error);
      } else {
        setSuccess(true);
        setTimeout(() => {
          setIsOpen(false);
          window.location.reload(); // reload to get fresh server data
        }, 1000);
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedCat) return;
    setLoading(true);
    setError("");

    try {
      const res = await deleteCategory(selectedCat.id);
      if (res.error) {
        alert(res.error);
      } else {
        setIsDeleteOpen(false);
        window.location.reload();
      }
    } catch (err) {
      alert("Failed to delete category.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Controls */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-foreground">Manage Categories</h2>
          <p className="text-xs text-muted-foreground">Add, edit, or delete test sections.</p>
        </div>
        <Button onClick={openCreateDialog} className="flex items-center gap-1 font-semibold text-xs h-9">
          <Plus className="h-4 w-4" /> Add Category
        </Button>
      </div>

      {/* Grid listing */}
      <Card>
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950 border-b border-border/40 font-semibold text-xs text-muted-foreground uppercase tracking-wider">
                <th className="p-4">Icon</th>
                <th className="p-4">Name</th>
                <th className="p-4">Slug</th>
                <th className="p-4 text-center">Tests</th>
                <th className="p-4 text-center">Questions</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {categories.map((cat) => {
                const IconComponent = iconMap[cat.icon || "Brain"] || Brain;
                return (
                  <tr key={cat.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20 text-sm">
                    <td className="p-4">
                      <div className="h-8 w-8 rounded bg-blue-100 dark:bg-blue-950 text-primary flex items-center justify-center">
                        <IconComponent className="h-4 w-4" />
                      </div>
                    </td>
                    <td className="p-4 font-bold text-foreground">{cat.name}</td>
                    <td className="p-4 font-mono text-xs text-muted-foreground">{cat.slug}</td>
                    <td className="p-4 text-center font-semibold">{cat.totalTests}</td>
                    <td className="p-4 text-center font-semibold">{cat.totalQuestions}</td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => openEditDialog(cat)}
                        className="inline-flex p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-foreground cursor-pointer"
                        title="Edit category"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => openDeleteDialog(cat)}
                        className="inline-flex p-1.5 rounded hover:bg-danger/5 text-slate-500 hover:text-danger cursor-pointer"
                        title="Delete category"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create / Edit Modal */}
      <Dialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={selectedCat ? "Edit Category" : "Add Category"}
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          {error && (
            <div className="flex items-center gap-2 bg-danger/10 border border-danger/20 p-3 rounded text-danger">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 bg-success/10 border border-success/20 p-3 rounded text-success">
              <CheckCircle className="h-4 w-4 shrink-0" />
              <span>Saved successfully!</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Category Name</label>
            <Input
              type="text"
              placeholder="e.g. History"
              value={name}
              onChange={handleNameChange}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Category Slug</label>
            <Input
              type="text"
              placeholder="e.g. history"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Icon</label>
            <Select value={icon} onChange={(e) => setIcon(e.target.value)}>
              <option value="Brain">Brain (General Knowledge)</option>
              <option value="Globe">Globe (Current Affairs)</option>
              <option value="BookOpen">BookOpen (History)</option>
              <option value="Map">Map (Geography)</option>
              <option value="Atom">Atom (Science)</option>
              <option value="Percent">Percent (Mathematics)</option>
              <option value="GitBranch">GitBranch (Reasoning)</option>
              <option value="PenTool">PenTool (Marathi Grammar)</option>
              <option value="Languages">Languages (English Grammar)</option>
              <option value="Laptop">Laptop (Computer Knowledge)</option>
            </Select>
          </div>

          <div className="h-px bg-border/40 my-4" />
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">SEO Configuration</span>

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Meta Title</label>
            <Input
              type="text"
              placeholder="Google search listing title"
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Meta Description</label>
            <textarea
              placeholder="Google search summary card text"
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-foreground min-h-20"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1 font-semibold text-xs"
              onClick={() => setIsOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 font-semibold text-xs"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Category"}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Delete Category"
      >
        <div className="space-y-4 text-sm">
          <div className="flex items-center gap-3 text-danger bg-danger/10 p-3 rounded border border-danger/20">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p>Warning: Deleting this category will delete all associated quizzes and question logs. This cannot be undone!</p>
          </div>
          <p className="text-foreground">Are you sure you want to delete the category &ldquo;{selectedCat?.name}&rdquo;?</p>
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
              onClick={handleDelete}
              disabled={loading}
            >
              {loading ? "Deleting..." : "Delete Category"}
            </Button>
          </div>
        </div>
      </Dialog>

    </div>
  );
}
