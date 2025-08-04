"use client"
import React, { useEffect, useState } from "react";
import type { JSX } from 'react';
import {
Building2,
  Plus,
  Download,
  Edit,
  Trash2,
  Users,
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  Star,
  FileText,
  Type,
  CheckCircle, 
  AlertCircle,
  Layers,
  MessageSquare,
  Lightbulb,
  Bell,
  Image as ImageIcon,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { supabase } from "../../../lib/supabase";
import { useAuth } from "../../../contexts/AuthContext";
import Modal from "../../../components/ui/Modal";
import DropzoneButton from "@/components/DropzoneButton";
import FilePreview from "@/components/FilePreview";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";

// 📅 Dynamically import calendar to reduce initial bundle size
const BigCalendar = dynamic(() => import("react-big-calendar").then(mod => mod.Calendar), {
  ssr: false,
  loading: () => <div className="p-4">Loading calendar...</div>
});

import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale";
import { dateFnsLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";

const ProjectProgressOverview = dynamic(() => import("@/components/ProjectProgressOverview"), {
  ssr: false,
  loading: () => <div className="p-4">Loading progress overview...</div>
});



/* -------------------------------------------------------------------------- */
/* 1   Types & helpers                                                        */
/* -------------------------------------------------------------------------- */

interface Project {
  id: string;
  user_id: string;
  title: string;
  category: string;
  location: string;
  year: string;
  duration: string;
  client: string;
  image: string;
  description?: string;
  status: string;
  priority: string;
  budget?: number;
  manager_id?: string;
  manager?: { name: string } | null;
  start_date?: string | null;
  end_date?: string | null;
  rating?: number;
  key_features?: string;
  challenge?: string;
  solution?: string;
  technical_details?: string;
  materials_used?: string;
  gallery?: string[];
  testimonial?: string;
  brochure_url?: string;
  created_at?: string;
  is_published?: boolean;
}

type ProjectForm = Partial<Project> & {
  gallery_raw: string;
  brochureFile?: File;
  imageFile?: File;
  galleryFiles?: File[];
  technical_details_list?: { key: string; value: string }[];
  materials_used_list?: { key: string; value: string }[];
  is_published?: boolean;

};

const EMPTY_FORM: ProjectForm = {
  title: "",
  category: "residential",
  location: "",
  year: "",
  duration: "",
  client: "",
  image: "",
  description: "",
  status: "planning",
  priority: "medium",
  key_features: "",
  challenge: "",
  solution: "",
  technical_details: "",
  materials_used: "",
  gallery_raw: "",
  testimonial: "",
  rating: 0,
  is_published: false,

};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales: { "en-US": enUS },
});


const sanitize = (data: Partial<Project> & { gallery_raw?: string }): Partial<Project> => {
  const cleaned: Record<string, any> = {};
  Object.entries(data).forEach(([k, v]) => {
    if (["gallery_raw", "brochureFile", "imageFile", "galleryFiles"].includes(k)) return;
    const isEmptyArr = Array.isArray(v) && v.length === 0;
    if (v === "" || v === null || v === undefined || isEmptyArr) return;
    cleaned[k] = ["budget", "rating", "year"].includes(k) ? Number(v) : v;
  });

  if (data.technical_details_list?.length) cleaned.technical_details = data.technical_details_list.map(i => `${i.key}: ${i.value}`).join("; ");
  if (data.materials_used_list?.length) cleaned.materials_used = data.materials_used_list.map(i => `${i.key}: ${i.value}`).join("; ");
  if (typeof data.gallery_raw === "string") {
    const arr = data.gallery_raw.split(",").map(s => s.trim()).filter(Boolean);
    if (arr.length) cleaned.gallery = arr;
  }
  return cleaned;
}; 
 
 
/* -------------------------------------------------------------------------- */
/* 2   UI helpers                                                             */
/* -------------------------------------------------------------------------- */

const StatusPill: React.FC<{ status: string }> = ({ status }) => {
  const map: Record<string, string> = {
    planning: "bg-blue-100 text-blue-700",
    in_progress: "bg-yellow-100 text-yellow-700",
    completed: "bg-green-100 text-green-700",
    on_hold: "bg-orange-100 text-orange-700",
  };
  return <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${map[status] ?? "bg-gray-100 text-gray-700"}`}>{status.replace("_", " ")}</span>;
};

const PriorityPill: React.FC<{ priority: string }> = ({ priority }) => {
  const map: Record<string, string> = {
    low: "bg-gray-100 text-gray-700",
    medium: "bg-yellow-100 text-yellow-700",
    high: "bg-red-100 text-red-700",
  };
  return <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${map[priority]}`}>{priority}</span>;
};

const SummaryCardButton: React.FC<{
  label: string;
  value: number;
  icon: React.ReactNode;
  onClick: () => void;
}> = ({ label, value, icon, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center justify-between p-4 bg-white rounded-lg shadow hover:ring-2 hover:ring-indigo-300 transition"
  >
    <div>
      <p className="text-sm text-gray-600">{label}</p>
      <p className="text-2xl font-semibold text-gray-800">{value}</p>
    </div>
    <div className="p-2 bg-slate-50 rounded-full">{icon}</div>
  </button>
);

const TopBar: React.FC = () => (
  <header className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white shadow-lg">
    <div className="px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Project Management</h1>
            <p className="text-blue-100 text-sm">Manage and track all construction projects</p>
          </div>
        </div>
        
        <nav className="hidden md:flex items-center gap-4">
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-sm">
            <MapPin className="w-4 h-4" /> 
            <span>Map View</span>
          </button>
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-sm">
            <FileText className="w-4 h-4" /> 
            <span>Reports</span>
          </button>
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-sm">
            <AlertCircle className="w-4 h-4" /> 
            <span>Issues</span>
          </button>
        </nav>
        
        <div className="flex items-center gap-3">
          <button className="p-2 hover:bg-white/10 rounded-lg transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  </header>
);

const Toast: React.FC<{ msg: string; type: "success" | "error" | "info" | "warning"; onClose: () => void }> = ({ msg, type, onClose }) => {
  const icons: Record<string, JSX.Element> = {
    success: <CheckCircle className="w-5 h-5 text-green-600" />,
    error: <AlertCircle className="w-5 h-5 text-red-600" />,
    info: <MessageSquare className="w-5 h-5 text-blue-600" />,
    warning: <AlertCircle className="w-5 h-5 text-yellow-600" />,
  };

  const bg: Record<string, string> = {
    success: "bg-green-50 border-green-200 text-green-800",
    error: "bg-red-50 border-red-200 text-red-800",
    info: "bg-blue-50 border-blue-200 text-blue-800",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
  };

  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
        className={`fixed top-4 left-1/2 -translate-x-1/2 max-w-xs w-full px-4 py-3 rounded-lg border shadow-md flex items-center gap-2 ${bg[type]}`}
      >
        {icons[type]}
        <span className="text-sm font-medium">{msg}</span>
      </motion.div>
    </AnimatePresence>
  );
};


interface ProjectCardProps {
  project: Project;
  onEdit: (p: Project) => void;
  onDelete: (p: Project) => void;
   onPreview:(p: Project) => void; 
  isAdmin: boolean;
} 

  
const ProjectCard: React.FC<ProjectCardProps> = ({ project, onEdit, onDelete, onPreview, isAdmin }) => (
  <motion.div 
    layout
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    whileHover={{ y: -5 }}
    className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 group relative overflow-hidden border border-slate-100"
  >
    {/* Status & Published Badges */}
    <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
      <StatusPill status={project.status} />
      <PriorityPill priority={project.priority} />
      {project.is_published && (
        <span className="bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded-full shadow-lg">
          ✓ Published
        </span>
      )}
    </div>

    {/* Action Buttons */}
    <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
      <button 
        onClick={() => onPreview(project)} 
        className="p-2 bg-white/90 hover:bg-white text-slate-600 hover:text-slate-800 rounded-lg shadow-sm transition-all"
        title="Preview Project"
      >
        <Eye className="w-4 h-4" />
      </button>
      <button 
        onClick={() => onEdit(project)} 
        className="p-2 bg-white/90 hover:bg-white text-blue-600 hover:text-blue-800 rounded-lg shadow-sm transition-all"
        title="Edit Project"
      >
        <Edit className="w-4 h-4" />
      </button>
      {isAdmin && (
        <button 
          onClick={() => onDelete(project)} 
          className="p-2 bg-white/90 hover:bg-white text-red-600 hover:text-red-800 rounded-lg shadow-sm transition-all"
          title="Delete Project"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>

    {/* Project Image */}
    {project.image && (
      <div className="h-48 w-full overflow-hidden rounded-t-xl">
        <img
          src={project.image}
          alt={project.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
      </div>
    )}

    {/* Project Content */}
    <div className="p-5">
      <div className="mb-3">
        <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
          {project.title}
        </h3>
        <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
          {project.description || "No description provided"}
        </p>
      </div>

      {/* Project Details */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <MapPin className="w-4 h-4 text-slate-400" />
          <span>{project.location}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span>{project.year}</span>
          {project.duration && (
            <>
              <span className="text-slate-300">•</span>
              <span>{project.duration}</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Users className="w-4 h-4 text-slate-400" />
          <span>{project.client}</span>
        </div>
        {project.budget && (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <DollarSign className="w-4 h-4 text-slate-400" />
            <span className="font-semibold">${project.budget.toLocaleString()}</span>
          </div>
        )}
      </div>

      {/* Rating */}
      {project.rating && project.rating > 0 && (
        <div className="flex items-center gap-1 mb-3">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${
                i < project.rating! ? 'text-yellow-400 fill-current' : 'text-slate-300'
              }`}
            />
          ))}
          <span className="text-sm text-slate-600 ml-1">({project.rating}/5)</span>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <span className="text-xs text-slate-500 capitalize">
          {project.category.replace('_', ' ')}
        </span>
        <div className="flex items-center gap-1 text-xs text-slate-400">
          <Clock className="w-3 h-3" />
          <span>Updated recently</span>
        </div>
      </div>
    </div>
  </motion.div>
);

const exportToCSV = (data: Project[], filename = "projects_export") => {
  const headers = ["title", "client", "status", "category", "location", "budget", "year"];
  const rows = data.map((p) => [
    p.title,
    p.client,
    p.status,
    p.category,
    p.location,
    p.budget ?? "",
    p.year ?? "",
  ]);

  const csvContent = [headers, ...rows]
    .map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}_${new Date().toISOString()}.csv`);
  link.click();
};


/* -------------------------------------------------------------------------- */
/* 3   Main component                                                         */
/* -------------------------------------------------------------------------- */




const ProjectManagement: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [searchTerm, setSearchTerm] = useState("");
const [sortBy, setSortBy] = useState<"latest" | "oldest" | "status" | "client">("latest");

  const [previewProject, setPreviewProject] = useState<Project | null>(null);

  const openPreview = (p: Project) => setPreviewProject(p);
const closePreview = () => setPreviewProject(null);


  const [projects, setProjects] = useState<Project[]>([]);
 const [users, setUsers] = useState<{id:string;name:string}[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [statusModal, setStatusModal] = useState<null | "planning" | "in_progress" | "completed" | "on_hold" | "all">(null);
  const [modalCategoryFilter, setModalCategoryFilter] = useState<string>("all");

  const [formData, setFormData] = useState<ProjectForm>(EMPTY_FORM);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const [toast, setToast] = useState<null | { msg: string; type: "success" | "error" | "info" | "warning" }>(null);

  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; project: Project | null }>({ open: false, project: null });
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [projectsPerPage] = useState(6);
 
 const reloadProjects = async () => {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      console.error(error);
      setToast({ type: "error", msg: "Reload failed." });
      return;
    }
    setProjects(data as Project[]);
  };

 useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        const [projRes, usrRes] = await Promise.all([
          supabase.from("projects").select("*"),
          supabase.from("users").select("id, name"),
        ]);
        if (projRes.error || usrRes.error) throw projRes.error || usrRes.error;
        setProjects(projRes.data ?? []);
        setUsers(usrRes.data ?? []);
      } catch (err) {
        console.error(err); setToast({ type: "error", msg: "Failed to load data." });
      } finally { setIsLoading(false); }
    })();
  }, []);

    const [viewMode, setViewMode] = useState<"cards" | "calendar">("cards");

const [showExportDropdown, setShowExportDropdown] = useState(false);

// optional: close dropdown when clicking outside
useEffect(() => {
  const handleClick = (e: MouseEvent) => {
    if (!(e.target as HTMLElement).closest("#export-dropdown")) {
      setShowExportDropdown(false);
    }
  };
  document.addEventListener("click", handleClick);
  return () => document.removeEventListener("click", handleClick);
}, []);



 /* ---- handlers for status modal ---- */
 const openStatusModal = (status: "planning" | "in_progress" | "completed" | "on_hold" | "all") => {
    setModalCategoryFilter("all");
    setStatusModal(status);
  };
  const closeStatusModal = () => setStatusModal(null);
 

  /* -------------- UI state filters -------------- */
  
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const filtered = projects.filter(
    (p) =>
      (!search || p.title.toLowerCase().includes(search.toLowerCase())) &&
      (statusFilter === "all" || p.status === statusFilter) &&
      (categoryFilter === "all" || p.category === categoryFilter) &&
      (priorityFilter === "all" || p.priority === priorityFilter)
  );

  // Pagination calculations
  const totalPages = Math.ceil(filtered.length / projectsPerPage);
  const indexOfLastProject = currentPage * projectsPerPage;
  const indexOfFirstProject = indexOfLastProject - projectsPerPage;
  const currentProjects = filtered.slice(indexOfFirstProject, indexOfLastProject);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, categoryFilter, priorityFilter]);
  
  const openCreate = () => { setEditingProject(null); setFormData({ ...EMPTY_FORM }); setShowModal(true); };
  const openEdit = (p: Project) => { setEditingProject(p); setFormData({ ...p, gallery_raw: (p.gallery ?? []).join(", ") }); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setFormData({ ...EMPTY_FORM }); setEditingProject(null); };

  /* ------------------------------ save form ------------------------------ */
  const saveProject = async () => {
    if (!formData.image && !formData.imageFile) {
      setToast({ type: "error", msg: "Please provide a Hero image (URL or file)." });
      return;
    }

    setIsLoading(true);
    try {
      /* ---------- 1. handle uploads (hero, gallery, brochure) ---------- */
      // hero
      if (formData.imageFile) {
        const ext = formData.imageFile.name.split(".").pop();
        const safeTitle = (formData.title ?? "untitled")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");
        const filePath = `hero-images/${safeTitle}-${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("project-images")
          .upload(filePath, formData.imageFile, { upsert: true });
        if (upErr) throw upErr;
        const { data: urlData, error: urlErr } = supabase.storage
          .from("project-images")
          .getPublicUrl(filePath);
        if (urlErr) throw urlErr;
        formData.image = urlData.publicUrl;
      }

      // gallery
   


       
// gallery
if (formData.galleryFiles && formData.galleryFiles.length > 0) {
  const galleryUrls: string[] = [];

  for (const file of formData.galleryFiles) {
  const ext = file.name.split(".").pop();
  
  const cleanFilename = file.name
    .toLowerCase()
    .replace(/\s+/g, "-")             // replace spaces with hyphens
    .replace(/[^a-z0-9.-]/g, "");     // remove special characters except dot and dash

  const safeCat = (formData.category ?? "uncategorized")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-");

  const safeTitle = (formData.title ?? "untitled")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-");

  const filePath = `gallery/${safeCat}/${safeTitle}/${safeTitle}-${Date.now()}-${cleanFilename}`;

    
    const { error: uploadError } = await supabase.storage.from("project-gallery").upload(filePath, file, {
      upsert: true,
    });
    if (uploadError) throw uploadError;

    const { data: urlData, error: urlErr } = supabase.storage
      .from("project-gallery")
      .getPublicUrl(filePath);
    if (urlErr) throw urlErr;

    galleryUrls.push(urlData.publicUrl);
  }

  formData.gallery = galleryUrls;
}


      
      // brochure
      if (editingProject?.brochure_url && formData.brochureFile) {
        const old = editingProject.brochure_url.split("/project-brochures/")[1];
        if (old) await supabase.storage.from("project-brochures").remove([old]);
      }
      if (formData.brochureFile) {
        const ext = formData.brochureFile.name.split(".").pop();
        const safeCat = (formData.category ?? "uncategorized")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-");
        const safeTitle = (formData.title ?? "untitled")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-");
        const filePath = `brochures/${safeCat}/${safeTitle}/${safeTitle}-${Date.now()}.${ext}`;
        const { error: brErr } = await supabase.storage.from("project-brochures").upload(filePath, formData.brochureFile, {
          upsert: true,
          cacheControl: "3600",
          contentType: "application/pdf",
        });
        if (brErr) throw brErr;
        const { data: brUrl, error: brUrlErr } = supabase.storage.from("project-brochures").getPublicUrl(filePath);
        if (brUrlErr) throw brUrlErr;
        formData.brochure_url = brUrl.publicUrl;
      }

      

console.log("Inserting project with user_id:", user?.id);

      /* ---------- 2. build payload ---------- */
 const payload: Partial<Project> = {
  user_id: user?.id,
  title: formData.title?.trim() || 'Untitled Project',
  category: formData.category || 'residential',
  location: formData.location?.trim() || 'Unspecified',
  year: formData.year,
  duration: formData.duration,
  client: formData.client, 
  image: formData.image ?? "",
  description: formData.description,
  status: formData.status,
  priority: formData.priority,
  budget: formData.budget,
  manager_id: formData.manager_id,
  start_date: formData.start_date,
  end_date: formData.end_date,
  rating: formData.rating,
  key_features: formData.key_features,
  challenge: formData.challenge, 
  solution: formData.solution,
  technical_details: formData.technical_details,
  materials_used: formData.materials_used,
  testimonial: formData.testimonial,
  gallery: formData.gallery ?? [],
  brochure_url: formData.brochure_url ?? "",
    specifications: formData.technical_details_list?.filter(({ key, value }) => key && value) ?? [],
  materials: formData.materials_used_list?.filter(({ key, value }) => key && value) ?? [],
    is_published: formData.is_published ?? false,
}; 



    
   
/* ---------- 3. DB write ---------- */
if (editingProject) {
  const { error } = await supabase
    .from("projects")
    .update(payload)
    .eq("id", editingProject.id);
  if (error) throw error;
} else {
  const { error } = await supabase
    .from("projects")
    .insert(payload, { returning: "minimal" }); // one safe insert
  if (error) throw error;
}



      await reloadProjects();
      setToast({ type: "success", msg: editingProject ? "Project updated." : "Project created." });

      // close ONLY on success
      setTimeout(closeModal, 800);
  } catch (err: unknown) {
  console.error('[saveProject]', err);          // keep this
  const msg =
    typeof err === 'string'
      ? err
      : (err as { message?: string })?.message ??
        JSON.stringify(err, null, 2);          // stringify if it’s a plain object
  setToast({ type: 'error', msg });
} finally {
  setIsLoading(false);
}

  };

  /* ------------------------------ delete row ----------------------------- */
  const deleteProject = async (p: Project) => {
  if (user?.role !== "admin") return;

 

  setIsLoading(true);
  try {
    if (p.brochure_url) {
      const path = p.brochure_url.split("/project-brochures/")[1];
      if (path) await supabase.storage.from("project-brochures").remove([path]);
    }

    const { error } = await supabase.from("projects").delete().eq("id", p.id);

    if (error) {
      console.error("[deleteProject] Supabase error:", error); // 👈 this helps debugging
      throw error;
    }

    await reloadProjects();
    setToast({ type: "success", msg: "Project deleted." });

  } catch (err) {
    console.error("[deleteProject] JS error:", err);
    setToast({ type: "error", msg: "Delete failed." });
  } finally {
    setIsLoading(false);
  }
};

     /* ------------------- derived counts ------------------- */
const total       = projects.length;
 const planning    = projects.filter(p => p.status === "planning").length;
 const in_progress = projects.filter(p => p.status === "in_progress").length;
 const completed   = projects.filter(p => p.status === "completed").length;
 const onHold      = projects.filter(p => p.status === "on_hold").length;

 const counts = { total, planning, in_progress, completed, onHold };


  const filteredProjects = projects
  .filter((p) =>
    (statusModal === "all" || p.status === statusModal) &&
    (modalCategoryFilter === "all" || p.category === modalCategoryFilter) &&
    (p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.client?.toLowerCase().includes(searchTerm.toLowerCase()))
  )
  .sort((a, b) => {
    if (sortBy === "latest") {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
    if (sortBy === "oldest") {
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    }
    if (sortBy === "status") {
      return a.status.localeCompare(b.status);
    }
    if (sortBy === "client") {
      return (a.client || "").localeCompare(b.client || "");
    }
    return 0;
  });

  const ProjectCalendarView: React.FC<{
  projects: Project[];
  onSelect: (p: Project) => void;
}> = ({ projects, onSelect }) => {
  // transform rows that have both dates
  const events = projects
    .filter((p) => p.start_date && p.end_date)
    .map((p) => ({
      id: p.id,
      title: p.title,
      start: new Date(p.start_date as string),
      end: new Date(p.end_date as string),
      resource: p, // keep original row handy
    }));

  return (
    <BigCalendar
      localizer={localizer}
      events={events}
      startAccessor="start"
      endAccessor="end"
      style={{ height: "70vh", backgroundColor: "#f5f7fa" }}
      onSelectEvent={(e) => onSelect(e.resource as Project)}
    />
  ); 
};  
 


  /* ------------------- rendering ------------------- */
  return (
    <div className="h-screen overflow-hidden flex flex-col bg-slate-50">
      {toast && (
        <Toast
          msg={toast.msg}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
       
      <TopBar />
      
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Enhanced Header with Search and Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Building2 className="w-6 h-6 text-blue-600"/>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">Project Management</h1>
                  <p className="text-slate-600">Manage and track all construction projects</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <button 
                  onClick={openCreate} 
                  className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg flex items-center gap-2 font-medium"
                >
                  <Plus className="w-5 h-5"/>
                  New Project
                </button>
                
                <div className="relative" id="export-dropdown">
                  <button
                    onClick={() => setShowExportDropdown(!showExportDropdown)}
                    className="bg-slate-600 text-white px-4 py-3 rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Export
                  </button>

                  {showExportDropdown && (
                    <div className="absolute top-full right-0 z-20 mt-2 bg-white border border-slate-200 shadow-xl rounded-lg min-w-[200px] overflow-hidden">
                      <button
                        className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors text-sm"
                        onClick={() => {
                          exportToCSV(projects, "all_projects");
                          setShowExportDropdown(false);
                        }}
                      >
                        Export All Projects
                      </button>
                      <button
                        className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors text-sm"
                        onClick={() => {
                          exportToCSV(projects.filter((p) => p.status === "planning"), "planning_projects");
                          setShowExportDropdown(false);
                        }}
                      >
                        Export Planning Projects
                      </button>
                      <button
                        className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors text-sm"
                        onClick={() => {
                          exportToCSV(projects.filter((p) => p.status === "in_progress"), "in_progress_projects");
                          setShowExportDropdown(false);
                        }}
                      >
                        Export Active Projects
                      </button>
                      <button
                        className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors text-sm"
                        onClick={() => {
                          exportToCSV(projects.filter((p) => p.status === "completed"), "completed_projects");
                          setShowExportDropdown(false);
                        }}
                      >
                        Export Completed Projects
                      </button>
                    </div>
                  )}
                </div>
                
                <button
                  onClick={() => setViewMode(viewMode === "cards" ? "calendar" : "cards")}
                  className="bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  {viewMode === "cards" ? "Calendar" : "Cards"}
                </button>
              </div>
            </div>

            {/* Enhanced Search and Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-800"
                />
                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              </div>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-800"
              >
                <option value="all">All Status</option>
                <option value="planning">Planning</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="on_hold">On Hold</option>
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-800"
              >
                <option value="all">All Categories</option>
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
                <option value="infrastructure">Infrastructure</option>
                <option value="healthcare">Healthcare</option>
                <option value="education">Education</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-800"
              >
                <option value="latest">Latest First</option>
                <option value="oldest">Oldest First</option>
                <option value="status">By Status</option>
                <option value="client">By Client</option>
              </select>
            </div>
          </div>

          {/* Enhanced Statistics Dashboard */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <motion.div
              whileHover={{ y: -2 }}
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 cursor-pointer hover:shadow-md transition-all"
              onClick={() => openStatusModal("all")}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Total Projects</p>
                  <p className="text-3xl font-bold text-slate-900">{total}</p>
                  <p className="text-xs text-green-600">↗ Active</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Building2 className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -2 }}
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 cursor-pointer hover:shadow-md transition-all"
              onClick={() => openStatusModal("planning")}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Planning</p>
                  <p className="text-3xl font-bold text-slate-900">{planning}</p>
                  <p className="text-xs text-blue-600">In planning phase</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Lightbulb className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -2 }}
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 cursor-pointer hover:shadow-md transition-all"
              onClick={() => openStatusModal("in_progress")}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Active</p>
                  <p className="text-3xl font-bold text-slate-900">{in_progress}</p>
                  <p className="text-xs text-green-600">In progress</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -2 }}
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 cursor-pointer hover:shadow-md transition-all"
              onClick={() => openStatusModal("completed")}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Completed</p>
                  <p className="text-3xl font-bold text-slate-900">{completed}</p>
                  <p className="text-xs text-yellow-600">Finished</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Star className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -2 }}
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 cursor-pointer hover:shadow-md transition-all"
              onClick={() => openStatusModal("on_hold")}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">On Hold</p>
                  <p className="text-3xl font-bold text-slate-900">{onHold}</p>
                  <p className="text-xs text-orange-600">Paused</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Enhanced Projects Display */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">Recent Projects</h2>
              <span className="text-sm text-slate-600">
                Showing {indexOfFirstProject + 1}-{Math.min(indexOfLastProject, filtered.length)} of {filtered.length} projects
              </span>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-slate-600">Loading projects...</span>
              </div>
            ) : viewMode === "calendar" ? (
              <ProjectCalendarView projects={filtered} onSelect={openPreview} />
            ) : (
              <motion.div 
                layout
                className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
              >
                <AnimatePresence>
                  {currentProjects.map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      onEdit={openEdit}
                      onDelete={(p) => setDeleteConfirm({ open: true, project: p })}
                      onPreview={openPreview}
                      isAdmin={isAdmin}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
            )}

            {filtered.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">No projects found</h3>
                <p className="text-slate-600 mb-4">Get started by creating your first project</p>
                <button
                  onClick={openCreate}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Project
                </button>
              </div>
            )}

            {/* Pagination Controls */}
            {filtered.length > projectsPerPage && (
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-200">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </button>
                  
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-600">
                    Page {currentPage} of {totalPages}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  {/* Page numbers */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Project Progress Overview */}
          {projects.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Project Analytics</h2>
              <div className="h-64 flex items-center justify-center bg-slate-50 rounded-lg">
                <p className="text-slate-500">Analytics dashboard coming soon</p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modals and overlays */}

         
         {/* ---- Status modal ---- */}
         
  {statusModal !== null && ( 
  <Modal
    title={
      statusModal === "all"
        ? "All Projects"
        : `${statusModal.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())} Projects`
    }
    onClose={closeStatusModal} 
  >
    <div className="mb-4 flex justify-end">
<div className="flex flex-col sm:flex-row sm:items-center gap-4">
  {/* Search */}
  <input
    type="text"
    placeholder="Search projects..."
    className="w-full sm:w-auto border rounded p-2"
  />

  <div className="flex gap-2">
    <select
      value={modalCategoryFilter}
      onChange={(e) => setModalCategoryFilter(e.target.value)}
      className="border rounded px-3 py-1 text-sm"
    >
      <option value="all">All Categories</option>
      {[...new Set(projects.map((p) => p.category))].map((cat) => (
        <option key={cat} value={cat}>
          {cat}
        </option>
      ))}
    </select>

  {/* Sort */}
 <select
  value={sortBy}
  onChange={(e) => setSortBy(e.target.value as "latest" | "oldest" | "status" | "client")}
  className="border rounded px-3 py-1 text-sm"
>
  <option value="latest">Newest First</option>
  <option value="oldest">Oldest First</option>
  <option value="status">Status</option>
  <option value="client">Client Name</option>
</select>

</div>
</div>

    </div>

    <div className="grid gap-6 md:grid-cols-1">
  {projects
  .filter((p) =>
    (statusModal === "all" || p.status === statusModal) &&
    (modalCategoryFilter === "all" || p.category === modalCategoryFilter) &&
    (p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     p.client?.toLowerCase().includes(searchTerm.toLowerCase()))
  )
 .sort((a, b) => {
  if (sortBy === "latest") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  if (sortBy === "oldest") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  if (sortBy === "status") return a.status.localeCompare(b.status);
  if (sortBy === "client") return (a.client || "").localeCompare(b.client || "");
  return 0;
})
 
  .map((p) => ( 
    <ProjectCard 
      key={p.id}
      project={p}
      onEdit={openEdit}
     onDelete={(p) => setDeleteConfirm({ open: true, project: p })}
      onPreview={openPreview}
      isAdmin={user?.role === "admin"}
    />
))}

    </div> 
  </Modal>
)}

      {/* Preview Modal */}
      {previewProject && (
  <Modal title={`Preview: ${previewProject.title}`} onClose={closePreview}>
    <div className="space-y-6 max-h-[80vh] overflow-y-auto pr-1">

      {/* Hero Image */}
      {previewProject.image && (
        <img 
          src={previewProject.image}
          alt={previewProject.title}
          className="w-full h-56 object-cover rounded"
        />
      )}

      {/* Project Meta */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-800">
        <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {previewProject.location}</div>
        <div className="flex items-center gap-2"><Calendar className="w-4 h-4" /> Year: {previewProject.year}</div>
        <div className="flex items-center gap-2"><Clock className="w-4 h-4" /> Duration: {previewProject.duration}</div>
        <div className="flex items-center gap-2"><Users className="w-4 h-4" /> Client: {previewProject.client}</div>
        <div className="flex items-center gap-2"><Layers className="w-4 h-4" /> Category: {previewProject.category}</div>
        <div className="flex items-center gap-2"><AlertCircle className="w-4 h-4" /> Priority: {previewProject.priority}</div>
        <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Status: {previewProject.status}</div>
        {previewProject.budget && (
          <div className="flex items-center gap-2"><DollarSign className="w-4 h-4" /> Budget: ${previewProject.budget.toLocaleString()}</div>
        )}
        {previewProject.rating !== undefined && (
          <div className="flex items-center gap-2"><Star className="w-4 h-4" /> Rating: {previewProject.rating} / 5</div>
        )}
      </div>

      {/* Description */}
      <div>
        <h4 className="font-semibold text-gray-900 mb-1">Description</h4>
        <p className="text-gray-700 whitespace-pre-line">{previewProject.description}</p>
      </div>

      {/* Key Features */}
      {previewProject.key_features && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-1">Key Features</h4>
          <p className="text-gray-700 whitespace-pre-line">{previewProject.key_features}</p>
        </div>
      )}

      {/* Challenge */}
      {previewProject.challenge && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-1">Challenge</h4>
          <p className="text-gray-700 whitespace-pre-line">{previewProject.challenge}</p>
        </div>
      )}

      {/* Solution */}
      {previewProject.solution && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-1">Solution</h4>
          <p className="text-gray-700 whitespace-pre-line">{previewProject.solution}</p>
        </div>
      )}

      {/* Technical Details */}
      {previewProject.technical_details && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-1">Technical Details</h4>
          <p className="text-gray-700 whitespace-pre-line">{previewProject.technical_details}</p>
        </div>
      )}

      {/* Materials Used */}
      {previewProject.materials_used && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-1">Materials Used</h4>
          <p className="text-gray-700 whitespace-pre-line">{previewProject.materials_used}</p>
        </div>
      )}

      {/* Testimonial */}
      {previewProject.testimonial && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-1">Client Testimonial</h4>
          <blockquote className="text-gray-600 italic border-l-4 pl-4 border-blue-400">
            {previewProject.testimonial}
          </blockquote>
        </div>
      )}

      {/* Brochure Download */}
      {previewProject.brochure_url && (
        <div className="mt-2">
          <a
            href={previewProject.brochure_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700"
          >
            <Download className="w-4 h-4 mr-2" />
            Download Brochure
          </a>
        </div>
      )}

      {/* Gallery */}
      {previewProject.gallery?.length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-2">Gallery</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {previewProject.gallery.map((img, i) => (
              <img key={i} src={img} alt={`Gallery ${i}`} className="rounded object-cover h-32 w-full" />
            ))}
          </div>
        </div>
      )}
    </div>
  </Modal>
)}



      {showModal && (
        <Modal title={editingProject ? "Edit Project" : "New Project"} onClose={closeModal}>
          {/* form JSX identical to previous implementation */}

           <form onSubmit={(e) => { e.preventDefault(); saveProject(); }} className="space-y-4 max-h-[80vh] overflow-y-auto pr-2">
            {/* --- BASIC INFO --- */}
          <div className="space-y-1">
<label className="block text-sm font-medium text-gray-700">
  Project Title <span className="text-red-500">*</span>
</label>

  <div className="flex items-center border px-3 py-2 rounded">
    <Type className="w-4 h-4 text-gray-500 mr-2" />
    <input
      required
      className="w-full outline-none"
      placeholder="E.g., Central Plaza Tower Renovation"
      value={formData.title ?? ""}
      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
    />
  </div>
</div>
 

    <div className="space-y-1">
<label className="block text-sm font-medium text-gray-700">
  Description <span className="text-red-500">*</span>
</label>
  <div className="flex items-start border px-3 py-2 rounded">
    <FileText className="w-4 h-4 text-gray-500 mr-2 mt-1" />
    <textarea
      required
      className="w-full outline-none"
      placeholder="Brief overview of the project scope, objectives, or achievements"
      value={formData.description ?? ""}
      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
    />
  </div>
</div>



            <div className="grid grid-cols-2 gap-4">
         <div className="space-y-1">
<label className="block text-sm font-medium text-gray-700">
  Category <span className="text-red-500">*</span>
</label>

  <div className="flex items-center border px-3 py-2 rounded">
    <Layers className="w-4 h-4 text-gray-500 mr-2" />
    <select
       required
      className="w-full outline-none bg-transparent"
      value={formData.category ?? "residential"}
      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
    >
      <option value="residential">Residential</option>
      <option value="commercial">Commercial</option>
      <option value="infrastructure">Infrastructure</option>
      <option value="healthcare">Healthcare</option>
      <option value="education">Education</option>
    </select>
  </div>
</div>
               
   <div className="space-y-1">
<label className="block text-sm font-medium text-gray-700">
  Client <span className="text-red-500">*</span>
</label>

  <div className="flex items-center border px-3 py-2 rounded">
    <Users className="w-4 h-4 text-gray-500 mr-2" />
    <input
       required
      className="w-full outline-none"
      placeholder="E.g., ABC Construction Co., Ltd."
      value={formData.client ?? ""}
      onChange={(e) => setFormData({ ...formData, client: e.target.value })}
    />
  </div>
</div>


            <div className="space-y-1">
<label className="block text-sm font-medium text-gray-700">
  Status <span className="text-red-500">*</span>
</label>

  <div className="flex items-center border px-3 py-2 rounded">
    <CheckCircle className="w-4 h-4 text-gray-500 mr-2" />
    <select
       required
      className="w-full outline-none bg-transparent"
      value={formData.status ?? "planning"}
      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
    >
      <option value="planning">Planning</option>
      <option value="in_progress">In Progress</option>
      <option value="completed">Completed</option>
  <option value="on_hold">On Hold</option>
    </select>
  </div>
</div>

             <div className="space-y-1">
<label className="block text-sm font-medium text-gray-700">
  Priority <span className="text-red-500">*</span>
</label>

  <div className="flex items-center border px-3 py-2 rounded">
    <AlertCircle className="w-4 h-4 text-gray-500 mr-2" />
    <select
       required
      className="w-full outline-none bg-transparent"
      value={formData.priority ?? "medium"}
      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
    >
      <option value="low">Low</option>
      <option value="medium">Medium</option>
      <option value="high">High</option>
    </select>
  </div>
</div>


 <div className="space-y-1">
  <label className="block text-sm font-medium text-gray-700">Budget</label>
  <div className="flex items-center border px-3 py-2 rounded">
    <DollarSign className="w-4 h-4 text-gray-500 mr-2" />
    <input
      type="number"
      className="w-full outline-none"
      placeholder="E.g., 500000"
      value={formData.budget ?? ""}
      onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })}
    />
  </div>
</div>


      <div className="space-y-1">
 <label className="block text-sm font-medium text-gray-700">
  Location <span className="text-red-500">*</span>
</label>

  <div className="flex items-center border px-3 py-2 rounded">
    <MapPin className="w-4 h-4 text-gray-500 mr-2" />
    <input
       required
      className="w-full outline-none"
      placeholder="E.g., Vientiane Capital, Laos"
      value={formData.location ?? ""}
      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
    />
  </div>
</div>

            <div className="space-y-1">
<label className="block text-sm font-medium text-gray-700">
  Completed Year <span className="text-red-500">*</span>
</label>

  <div className="flex items-center border px-3 py-2 rounded">
    <Calendar className="w-4 h-4 text-gray-500 mr-2" />
    <input
       required
      className="w-full outline-none"
      placeholder="E.g., 2025"
      value={formData.year ?? ""}
      onChange={(e) => setFormData({ ...formData, year: e.target.value })}
    />
  </div>
</div>


       <div className="space-y-1">
  <label className="block text-sm font-medium text-gray-700">Duration</label>
  <div className="flex items-center border px-3 py-2 rounded">
    <Clock className="w-4 h-4 text-gray-500 mr-2" />
    <input
      className="w-full outline-none"
      placeholder="E.g., 8 months"
      value={formData.duration ?? ""}
      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
    />
  </div>
</div>


            </div> 

            
 {/* --- DETAILS with Icons --- */}

{/* Key Features */}
<div className="space-y-1">
  <label className="block text-sm font-medium text-gray-700">Key Features</label>
  <div className="flex items-start border px-3 py-2 rounded">
    <CheckCircle className="w-4 h-4 text-gray-500 mr-2 mt-1" />
    <textarea
      className="w-full outline-none"
      rows={3}
      placeholder="E.g., Earthquake resistant, Energy-efficient lighting, LEED-certified"
      value={formData.key_features ?? ""}
      onChange={(e) => setFormData({ ...formData, key_features: e.target.value })}
    />
  </div>
</div>

{/* Challenge */}
<div className="space-y-1">
  <label className="block text-sm font-medium text-gray-700">The Challenge</label>
  <div className="flex items-start border px-3 py-2 rounded">
    <AlertCircle className="w-4 h-4 text-gray-500 mr-2 mt-1" />
    <textarea
      className="w-full outline-none"
      rows={3}
      placeholder="Describe the project's initial problem or unique challenge..."
      value={formData.challenge ?? ""}
      onChange={(e) => setFormData({ ...formData, challenge: e.target.value })}
    />
  </div>
</div>

{/* Solution */}
<div className="space-y-1">
  <label className="block text-sm font-medium text-gray-700">Our Solution</label>
  <div className="flex items-start border px-3 py-2 rounded">
    <Lightbulb className="w-4 h-4 text-gray-500 mr-2 mt-1" />
    <textarea
      className="w-full outline-none"
      rows={3}
      placeholder="Briefly explain the implemented solution or strategy..."
      value={formData.solution ?? ""}
      onChange={(e) => setFormData({ ...formData, solution: e.target.value })}
    />
  </div>
</div>

{/* Technical Details */}
<div className="space-y-1">
  <label className="block text-sm font-medium text-gray-700">Technical Details</label>
  <div className="space-y-2">
    {(formData.technical_details_list ?? []).map((item, index) => (
      <div key={index} className="flex gap-2 items-center">
        <input
          type="text"
          placeholder="Label"
          className="w-1/2 px-2 py-1 border rounded"
          value={item.key}
          onChange={(e) => {
            const updated = [...(formData.technical_details_list ?? [])];
            updated[index].key = e.target.value;
            setFormData({ ...formData, technical_details_list: updated });
          }}
        />
        <input
          type="text"
          placeholder="Value"
          className="w-1/2 px-2 py-1 border rounded"
          value={item.value}
          onChange={(e) => {
            const updated = [...(formData.technical_details_list ?? [])];
            updated[index].value = e.target.value;
            setFormData({ ...formData, technical_details_list: updated });
          }}
        />
        <button
          type="button"
          className="text-red-500 text-sm"
          onClick={() => {
            const updated = (formData.technical_details_list ?? []).filter((_, i) => i !== index);
            setFormData({ ...formData, technical_details_list: updated });
          }}
        >
          ✕
        </button>
      </div>
    ))}
    <button
      type="button"
      className="text-sm text-blue-600 underline"
      onClick={() =>
        setFormData({
          ...formData,
          technical_details_list: [...(formData.technical_details_list ?? []), { key: "", value: "" }],
        })
      }
    >
      + Add Technical Detail
    </button>
  </div>
</div>


{/* Materials Used */}
<div className="space-y-1">
  <label className="block text-sm font-medium text-gray-700">Materials Used</label>
  <div className="space-y-2">
    {(formData.materials_used_list ?? []).map((item, index) => (
      <div key={index} className="flex gap-2 items-center">
        <input
          type="text"
          placeholder="Material"
          className="w-1/2 px-2 py-1 border rounded"
          value={item.key}
          onChange={(e) => {
            const updated = [...(formData.materials_used_list ?? [])];
            updated[index].key = e.target.value;
            setFormData({ ...formData, materials_used_list: updated });
          }}
        />
        <input
          type="text"
          placeholder="Specification"
          className="w-1/2 px-2 py-1 border rounded"
          value={item.value}
          onChange={(e) => {
            const updated = [...(formData.materials_used_list ?? [])];
            updated[index].value = e.target.value;
            setFormData({ ...formData, materials_used_list: updated });
          }}
        />
        <button
          type="button"
          className="text-red-500 text-sm"
          onClick={() => {
            const updated = (formData.materials_used_list ?? []).filter((_, i) => i !== index);
            setFormData({ ...formData, materials_used_list: updated });
          }}
        >
          ✕
        </button>
      </div>
    ))}
    <button
      type="button"
      className="text-sm text-blue-600 underline"
      onClick={() =>
        setFormData({
          ...formData,
          materials_used_list: [...(formData.materials_used_list ?? []), { key: "", value: "" }],
        })
      }
    >
      + Add Material
    </button>
  </div>
</div>


{/* Client Testimonial */}
<div className="space-y-1">
  <label className="block text-sm font-medium text-gray-700">Client Testimonial</label>
  <div className="flex items-start border px-3 py-2 rounded">
    <MessageSquare className="w-4 h-4 text-gray-500 mr-2 mt-1" />
    <textarea
      className="w-full outline-none"
      rows={3}
      placeholder='E.g., "We were impressed by the professionalism and attention to detail..."'
      value={formData.testimonial ?? ""}
      onChange={(e) => setFormData({ ...formData, testimonial: e.target.value })}
    />
  </div>
</div>

         {/* Rating */}
<div className="space-y-1">
  <label className="block text-sm font-medium text-gray-700">Rating (0–5)</label>
  <div className="flex items-center border px-3 py-2 rounded">
    <Star className="w-4 h-4 text-gray-500 mr-2" />
    <input
      type="number"
      min={0}
      max={5}
      step={1}
      className="w-full outline-none"
      placeholder="E.g., 4"
      value={formData.rating ?? ""}
      onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
    />
  </div>
</div>

{/* Hero Image URL – now full-width under Rating */}
{/* <div className="space-y-1">
<label className="block text-sm font-medium text-gray-700">
  Hero Image URL <span className="text-red-500">*</span>
</label>

  <div className="flex items-center border px-3 py-2 rounded">
    <ImageIcon className="w-4 h-4 text-gray-500 mr-2" />
    <input
      className="w-full outline-none"
      placeholder="E.g., https://example.com/images/project-hero.jpg"
      value={formData.image ?? ""}
      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
    />
  </div> 
</div> */}

{/*Upload Hero Image */}
<div className="md:col-span-2">
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Upload Hero Image <span className="text-red-500">*</span>
  </label>

  <DropzoneButton
    accept={{ "image/*": [] }}
    onFiles={(files) => setFormData({ ...formData, imageFile: files[0] })}
  >
    <ImageIcon className="w-4 h-4 text-blue-700" />
    <span>{formData.imageFile ? "Replace Hero Image" : "Select / Drop Hero Image"}</span>
  </DropzoneButton>

  {formData.imageFile && (
    <FilePreview
      file={formData.imageFile}
      onRemove={() => setFormData({ ...formData, imageFile: undefined })}
    />
  )}
</div>

     
{/* <div className="space-y-1"> 
  <label className="block text-sm font-medium text-gray-700">Project Gallery</label>
  <div className="flex items-start border px-3 py-2 rounded">
    <ImageIcon className="w-4 h-4 text-gray-500 mr-2 mt-1" />
    <textarea
      rows={3}
      className="w-full outline-none"
      placeholder="Paste comma-separated image URLs. 
      E.g., https://img1.jpg, https://img2.jpg"
      value={formData.gallery_raw}
      onChange={(e) =>
        setFormData({ ...formData, gallery_raw: e.target.value })
      }
    />
  </div>
</div> */}

{/* Upload Gallery Images */}
<div className="md:col-span-2 mt-4">
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Upload Gallery Images
  </label>

  <DropzoneButton
    multiple
    accept={{ "image/*": [] }}
    className="bg-purple-50 border-purple-300 hover:bg-purple-100"
    onFiles={(files) =>
      setFormData({
        ...formData,
        galleryFiles: [...(formData.galleryFiles ?? []), ...files],
      })
    }
  >
    <Layers className="w-4 h-4 text-purple-700" />
    <span>Select / Drop Gallery Images</span>
  </DropzoneButton>

  {(formData.galleryFiles ?? []).length > 0 && (
    <div className="flex flex-wrap mt-2">
      {formData.galleryFiles!.map((f, i) => (
        <FilePreview
          key={i}
          file={f}
          onRemove={() =>
            setFormData({
              ...formData,
              galleryFiles: formData.galleryFiles!.filter((_, idx) => idx !== i),
            })
          }
        />
      ))}
    </div>
  )}
</div>

 {/* Upload Project Brochure PDF */}
<div className="md:col-span-2 mt-4">
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Upload Project Brochure (PDF)
  </label>

  <DropzoneButton
    accept={{ "application/pdf": [] }}
    className="bg-[#e6f7f7] border-[#3d9392] hover:bg-[#d1f0ee] text-[#3d9392]"
    onFiles={(files) => setFormData({ ...formData, brochureFile: files[0] })}
  >
    <FileText className="w-4 h-4" />
    <span>Select / Drop Brochure PDF</span>
  </DropzoneButton>

  {formData.brochureFile && (
    <FilePreview
      file={formData.brochureFile}
      onRemove={() => setFormData({ ...formData, brochureFile: undefined })}
    />
  )}
</div>

             {/* Mark Publish to Website */}
             
             <div className="space-y-1">
  <label className="block text-sm font-medium text-gray-700">Publish to Website?</label>
  <div className="flex items-center gap-3">
    <input
      required
      type="checkbox" 
      id="is_published"
      checked={formData.is_published ?? false}
      onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
      className="h-5 w-5 text-blue-600 border-gray-300 rounded"
    />
    <label htmlFor="is_published" className="text-sm text-gray-700">
      Yes, make this project public on the website.
    </label>
  </div>
</div>


              {/* --- Actions --- */}
              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {isLoading
                    ? editingProject
                      ? "Updating..."
                      : "Creating..."
                    : editingProject
                    ? "Update"
                    : "Create"}
                </button>
              </div>
          </form>  
        </Modal>
      )}

      <AnimatePresence>
  {deleteConfirm.open && deleteConfirm.project && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full"
      >
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Delete Project</h2>
        <p className="text-sm text-gray-600 mb-4">
          Are you sure you want to delete "{deleteConfirm.project.title}"?
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setDeleteConfirm({ open: false, project: null })}
            className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            Cancel 
          </button>
          <button
            onClick={async () => {
              if (deleteConfirm.project) {
                setDeleteConfirm({ open: false, project: null });
                await deleteProject(deleteConfirm.project);
              }
            }}
            className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
    </div>
  );
};

export default ProjectManagement;
 