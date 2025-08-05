"use client";
import React, { useEffect, useMemo, useState } from "react";
import {
  Package,
  Plus,
  Edit,
  Trash2, 
  ArrowUpDown, 
  Layers,
  Layers3, 
  Image as ImageIcon,
  FileText,
  Eye,
  DollarSign,
  Star,
  ShieldCheck,
  CheckCircle, 
  Lightbulb,
  AlertCircle,
  Wrench,
  Dribbble,
  ChevronDown,
  ChevronLeft,
  ChevronRight, 
} from "lucide-react";
import { supabase } from "../../../lib/supabase";
import { useAuth } from "../../../contexts/AuthContext";
import Modal from "../../../components/ui/Modal";
import DropzoneButton from "@/components/DropzoneButton";
import FilePreview from "@/components/FilePreview";
import { motion, AnimatePresence } from "framer-motion";

/* ───────── helpers ───────── */
const slugify = (str: string) =>
  str.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const explode = (txt?: string) =>
  txt ? txt.split('\n').map((s) => s.trim()).filter(Boolean) : [];

const sanitizeFileName = (fileName: string) => {
  return fileName
    .replace(/\s+/g, '-')             // Replace spaces with dashes
    .replace(/[^\w\-\.]/g, '')        // Remove special characters
    .replace(/-+/g, '-');             // Remove repeated dashes
};

/* ───────── DB TYPES ───────── */
export interface Category {
  id: string;
  name: string;
  subcategories: { id: string; name: string }[];
}

export interface CommercialSub {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  user_id: string;
  category_id: string | null;
  subcategory_id: string | null;
  commercial_subcategory?: string;
  commercial_subcategory_id?: string | null; 
  commercial_sub?: { id: string; name: string } | null;
  category?: { id: string; name: string } | null; 
  subcategory?: { id: string; name: string } | null; 
  categories?: { name: string } | null;
  subcategories?: { name: string } | null;
  name: string;
  manufacturer?: string;
  warranty?: string;
  price?: number;
  rating?: number;
  description?: string;
  long_description?: string;
  image: string;
  images?: string[];
  pdfUrl?: string;
  catalogueUrl?: string;
  features?: string[];
  applications?: string[];
  benefits?: string[];
  installation?: string[];
  specifications?: { name: string; value: string }[];
  colours?: { name: string; hex?: string; image?: string }[];
  relatedProducts?: string[];
  created_at?: string;
  categoryName?: string;
  is_featured?: boolean;
}

/* ───────── Form state ───────── */
interface ProductForm extends Partial<Product> {
  imageFile?: File;
  galleryFiles?: File[];
  pdfFile?: File;
  catalogueFile?: File;
  /* textarea helpers */
  features_raw?: string;
  is_featured?: boolean;
  applications_raw?: string;
  benefits_raw?: string;
  installation_raw?: string;
  related_raw?: string;
  specifications_list?: { key: string; value: string }[];
  colours_list?: { name: string; hex?: string }[];
}

const EMPTY_FORM: ProductForm = {
  name: "",
  category_id: "",
  subcategory_id: "",
  commercial_subcategory: "",
  manufacturer: "",
  warranty: "",
  description: "",
  long_description: "",
  image: "",
  pdfUrl: "",
  catalogueUrl: "",
  /* helpers */
  features_raw: "", 
  applications_raw: "",
  benefits_raw: "",
  installation_raw: "",
  related_raw: "",
  categoryName: "",
  specifications_list: [],
  colours_list: [],
  is_featured: false,
};

/* ───────── static fallback ───────── */
const STATIC_CATEGORIES: Category[] = [
  { id: "38a1d290-9862-4167-9ec3-845a77be11d8", name: "Waterproofing", subcategories: [] },
  {
    id: "e77abccf-f2bd-42bf-abae-2f766c382f4c",
    name: "Flooring",
    subcategories: [
      { id: "fe9c409d-aade-478d-9909-165d2f96e993", name: "Sport" },
      { id: "e7547aa4-6c4a-413b-a3c5-f9b2c1d133d2", name: "Commercial" },
      { id: "72cafc96-f77d-445a-94d2-07fca73e1ca8", name: "Interior‑Exterior" },
    ],
  },
  { id: "0789fbbe-70ec-4b30-92fb-e2554a199e0e", name: "Rocksoil", subcategories: [] },
];

const COMMERCIAL_SUBTYPES: CommercialSub[] = [
  {id:"d208cde3-2ec7-4542-ae36-a5bf074e1376" ,name: "Heterogeneous general use floors"},
  {id: "e71cff33-820e-4ced-9331-6e3b8b3bbe22", name: "SPC"},
  {id: "05d58f34-acd8-4bbc-a82f-bd2bc49787b4", name: "Heterogeneous semi-objective floors"},
  {id: "3baaf374-26da-4086-8e85-312187874477", name: "Vinyl floor tiles & planks"},
  {id: "78add440-cc91-4acd-9985-606d1e762d0c", name: "Sports floors – Heterogeneous"},
  {id: "37af009f-8dbb-4107-a3dd-781ef3bb3b63", name: "Sports parquet floor systems"},
  {id: "55e34882-a51f-4872-993f-5144b289351f", name: "Parquet floors"},
  {id: "ceb0b8a1-4228-40af-8d36-69e651e4b721", name: "Homogeneous flooring"},
  {id: "a7b3e5b8-f04a-483d-9bef-ee5340f91aaf", name: "Heterogeneous hard floors"},
  {id: "f94afe2c-ee56-4185-b9a1-a44a137a580b", name: "Heterogeneous show floors"},
  {id :"718a3f4b-c18a-4440-86e1-5cc4335eb4d9", name: "General-use vinyl floors"},
  {id: "3657536b-40a7-41d4-9885-1bd23d11e10d", name: "Heterogeneous non-slip floors"}, 
]; 

/* convert form —> DB payload */
const toPayload = (d: ProductForm, userId: string): Partial<Product> => {
  const p: Record<string, any> = {
    user_id: userId,
    category_id: d.category_id || null,
    subcategory_id: d.subcategory_id || null, 
    commercial_subcategory_id: d.commercial_subcategory_id || null,
    categoryName: d.categoryName || null,
  };

  [
    "name",
    "manufacturer",
    "warranty",
    "price", 
    "rating",
    "description",
    "long_description",
    "image",
    "pdfUrl",
    "catalogueUrl",
    "commercial_subcategory",
    "categoryName" 
  ].forEach((k) => {
    const val = (d as any)[k];
    if (val !== undefined && val !== "") p[k] = val;
  });
  
  p.is_featured = d.is_featured ?? false;
  p.features = explode(d.features_raw);
  p.applications = explode(d.applications_raw);
  p.benefits = explode(d.benefits_raw);
  p.installation = explode(d.installation_raw);
  p.relatedProducts = explode(d.related_raw);

  if (d.specifications_list?.length) {
    p.specifications = d.specifications_list
      .filter(({ key, value }) => key && value)
      .map(({ key, value }) => ({ name: key.trim(), value: value.trim() }));
  }

  if (d.colours_list?.length) {
    p.colours = d.colours_list
      .filter(({ name }) => name)
      .map(({ name, hex }) => ({ name: name.trim(), hex: hex?.trim() ?? undefined }));
  }
  
  if (d.images?.length) {
    p.images = d.images;
  }

  return p;
};

/* ─────────────────────────────────────────────────────────────
   COMPONENT
   ───────────────────────────────────────────────────────────── */
const ProductManagement: React.FC = () => {
  const { user } = useAuth();

  /* Client-side hydration check */
  const [isClient, setIsClient] = useState(false);

  /* data */
  const [products, setProducts] = useState<Product[]>([]);
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>(STATIC_CATEGORIES);
  const [commercialSubs, setCommercialSubs] = useState<CommercialSub[]>(COMMERCIAL_SUBTYPES);

  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'rating' | 'created_at'>('created_at');
  const [sortAsc, setSortAsc] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  /* pagination */
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 8;

  /* ui state */
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<null | { type: "success" | "error"; msg: string }>(null);
 
  /* modal */
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductForm>({ ...EMPTY_FORM });
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  // Client-side hydration check
  useEffect(() => {
    setIsClient(true);
  }, []);

  const openPreview = (product: Product) => {
    setPreviewProduct(product);
  };

  const closePreview = () => {
    setPreviewProduct(null);
  };

  const requestDelete = (product: Product) => {
    setDeleteTarget(product);
  };

  /* load categories */ 
  useEffect(() => {
    if (!isClient) return;
    
    const loadCategories = async () => {
      try {
        const { data, error } = await supabase
          .from("categories")
          .select("id,name, subcategories(id,name)")
          .order("name")
          .order("subcategories(name)"); 
        if (!error && data) setCategories(data as Category[]);
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    };

    loadCategories();
  }, [isClient]);

  /* load commercial sub‑types */
  useEffect(() => {
    if (!isClient) return;
    
    const loadCommercialSubs = async () => {
      try {
        const { data, error } = await supabase
          .from("commercial_subcategories")
          .select("id,name")
          .order("name");
        if (!error && data) setCommercialSubs(data as CommercialSub[]);
      } catch (error) {
        console.error('Error loading commercial subcategories:', error);
      }
    };

    loadCommercialSubs();
  }, [isClient]);

  const getCategoryDisplayName = (id: string): string => {
    switch (id) {
      case "38a1d290-9862-4167-9ec3-845a77be11d8": // Waterproofing
        return "Waterproofing Material";
      case "e77abccf-f2bd-42bf-abae-2f766c382f4c": // Flooring
        return "Flooring Material";
      case "0789fbbe-70ec-4b30-92fb-e2554a199e0e": // Rocksoil
        return "Rocksoil Material";
      default:
        return ""; 
    }
  }; 

  const getDisplayCategoryName = (categoryName: string): string => {
    switch (categoryName.toLowerCase()) {
      case "waterproofing":
        return "Waterproofing Material";
      case "flooring":
        return "Flooring Material";
      case "rocksoil":
        return "Rocksoil Material";
      default:
        return `${categoryName} Material`;
    }
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000); // hides after 4s
      return () => clearTimeout(timer);
    }
  }, [toast]);

  /* load products */
  const loadProducts = async () => {
    if (!isClient) return;
    
    try {
      let query = supabase
        .from("products")
        .select(`
          *,
          category:categories!fk_category(id,name),
          subcategory:subcategories!fk_subcategory(id,name),
          commercial_sub:commercial_subcategories!fk_commercial_subcategory(id,name)
        `);

      if (filterCategory !== 'all') {
        query = query.eq('category_id', filterCategory);
      }

      const { data, error } = await query.order(sortBy, { ascending: sortAsc });

      if (!error && data) {
        const filtered = data.filter(p =>
          p.name?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setProducts(filtered);
      } else if (error) {
        console.error(error.message);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    }
  }; 

  useEffect(() => {
    if (isClient) {
      loadProducts();
    }
  }, [searchTerm, sortBy, sortAsc, filterCategory, isClient]);

  /* sub‑category options */
  const subOptions = useMemo(() => {
    if (!form.category_id) return [];
    return categories.find((c) => c.id === form.category_id)?.subcategories ?? [];
  }, [form.category_id, categories]);

  const isFlooringCommercial = useMemo(() => {
    const flooring = categories.find((c) => c.name.toLowerCase() === "flooring");
    const commercial = subOptions.find((s) => s.name.toLowerCase() === "commercial");
    return form.category_id === flooring?.id && form.subcategory_id === commercial?.id;
  }, [form.category_id, form.subcategory_id, subOptions, categories]);

  /* pagination calculations */
  const totalPages = Math.ceil(products.length / productsPerPage);
  const currentProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    return products.slice(startIndex, endIndex);
  }, [products, currentPage, productsPerPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterCategory, sortBy, sortAsc]);

  /* clear dependent values when parent changes */
  useEffect(() => {
    setForm((prev) => {
      const subOk = subOptions.some((s) => s.id === prev.subcategory_id);
      return subOk ? prev : { ...prev, subcategory_id: "", commercial_subcategory_id: "" };
    });
  }, [subOptions]); 

  /* modal helpers */
  const openCreate = () => {
    setEditing(null);
    setForm({ ...EMPTY_FORM });
    setShowModal(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      ...p,
      category_id: p.category_id ?? "",
      subcategory_id: p.subcategory_id ?? "",
      commercial_subcategory_id: p.commercial_subcategory_id ?? "",
      /* rebuild textarea helpers */
      features_raw: p.features?.join("\n") ?? "",
      applications_raw: p.applications?.join("\n") ?? "",
      benefits_raw: p.benefits?.join("\n") ?? "",
      installation_raw: p.installation?.join("\n") ?? "",
      related_raw: p.relatedProducts?.join(",") ?? "",
      specifications_list: p.specifications ?? [],
      colours_list: p.colours ?? [],
    });
    setShowModal(true); 
  };

  const closeModal = () => {
    setEditing(null);
    setForm({ ...EMPTY_FORM });
    setShowModal(false);
  };

  /* save (insert/update) */
  const saveProduct = async () => {
    if (!user?.id) return setToast({ type: "error", msg: "Login required." });

    setIsLoading(true);
    try {
      /* uploads */
      if (form.imageFile) {
        const ext = form.imageFile.name.split(".").pop();
        const safe = slugify(form.name ?? "untitled");
        const path = `hero-images/${safe}-${Date.now()}.${ext}`;
        const { error } = await supabase.storage.from("product-images").upload(path, form.imageFile, { upsert: true });
        if (error) throw error;
        const { data } = supabase.storage.from("product-images").getPublicUrl(path);
        form.image = data.publicUrl;
      }

      if (form.galleryFiles?.length) {
        const urls: string[] = [];

        for (const f of form.galleryFiles) {
          const sanitized = sanitizeFileName(f.name);
          const path = `gallery/${Date.now()}-${sanitized}`;

          const { error } = await supabase.storage.from("product-gallery").upload(path, f, { upsert: true });
          if (error) throw error;

          const { data } = supabase.storage.from("product-gallery").getPublicUrl(path);
          urls.push(data.publicUrl);
        }

        form.images = urls;
      }

      if (form.pdfFile) {
        const ext = form.pdfFile.name.split(".").pop();
        const safe = slugify(form.name ?? "tech-sheet");
        const path = `pdfs/${safe}-${Date.now()}.${ext}`;
        const { error } = await supabase.storage.from("product-brochure").upload(path, form.pdfFile, { upsert: true, contentType: "application/pdf" });
        if (error) throw error;
        const { data } = supabase.storage.from("product-brochure").getPublicUrl(path);
        form.pdfUrl = data.publicUrl;
      }

      if (form.catalogueFile) {
        const ext = form.catalogueFile.name.split(".").pop();
        const safe = slugify(form.name ?? "catalogue");
        const path = `catalogue/${safe}-${Date.now()}.${ext}`;
        const { error } = await supabase.storage.from("product-catalogue").upload(path, form.catalogueFile, { upsert: true, contentType: "application/pdf" });
        if (error) throw error;
        const { data } = supabase.storage.from("product-catalogue").getPublicUrl(path);
        form.catalogueUrl = data.publicUrl;
      }

      // Ensure categoryName is correctly set before payload
      if (form.category_id) {
        const matchedCategory = categories.find((c) => c.id === form.category_id);
        form.categoryName = matchedCategory
          ? getCategoryDisplayName(form.category_id)
          : "";
      }

      /* payload */
      const payload = toPayload(form, user.id);

      /* insert/update */
      if (editing) {
        const { error } = await supabase.from("products").update(payload).eq("id", editing.id);
        if (error) throw error;
        setToast({ type: "success", msg: "Product updated." });
      } else {
        const { data, error } = await supabase.from("products").insert(payload).select().single();
        if (error) throw error;
        setToast({ type: "success", msg: "Product created." });
      } 

      closeModal();
      loadProducts();
    } catch (err: any) {
      setToast({ type: "error", msg: err.message ?? "Save failed." });
    } finally {
      setIsLoading(false);
    }
  };

  /* delete */
  const deleteProduct = async (id: string) => {
    if (typeof window === 'undefined') return;
    if (!window.confirm("Delete this product?")) return;
    
    try {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (!error) {
        setToast({ type: "success", msg: "Deleted." });
        loadProducts();
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      setToast({ type: "error", msg: "Delete failed." });
    }
  };

  /* export CSV */
  const exportCSV = () => {
    if (typeof window === 'undefined') return;
    if (!products.length) return setToast({ type: "error", msg: "Nothing to export." });
    
    const headers = ["Name", "Category", "Subcategory", "Price", "Rating"];
    const rows = products.map((p) => [
      p.name,
      p.categories?.name ?? "",
      p.subcategories?.name ?? "",
      p.price ?? "",
      p.rating ?? "",
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const href = URL.createObjectURL(blob);
    Object.assign(document.createElement("a"), { href, download: "products.csv" }).click();
    URL.revokeObjectURL(href);
  };

  // Don't render on server-side to prevent hydration issues
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  /* ───────── JSX ───────── */
  return (
    <div className="p-6 space-y-6">
      {/* Toast notification */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 rounded-md px-4 py-2 text-sm font-medium shadow-lg ${
            toast.type === "error"
              ? "bg-red-100 text-red-800 border border-red-300"
              : "bg-green-100 text-green-800 border border-green-300"
          }`}
        >
          {toast.msg}
        </div>
      )}

      {/* header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="flex text-left items-center gap-3 text-3xl font-bold text-gray-900 mb-2">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <Package className="h-6 w-6 text-white" />
              </div>
              Products Management
            </h1>
            <p className="text-gray-600 text-left text-lg">Manage your product catalog and inventory</p>
          </div>
          
          {/* Right-aligned buttons with same size */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button 
              onClick={openCreate} 
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-500 to-green-600 px-6 py-3 text-white font-semibold shadow-lg hover:shadow-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 min-w-[160px]"
            >
              <Plus className="h-5 w-5" /> 
              Add New Product
            </button>
            <button 
              onClick={exportCSV} 
              className="flex items-center justify-center gap-2 rounded-xl border-2 border-gray-200 bg-white px-6 py-3 text-gray-700 font-semibold shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 min-w-[160px]"
            >
              <ArrowUpDown className="h-5 w-5" /> 
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Search, Filter, and Sort Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
         <div className="grid lg:grid-cols-4 gap-8">
          {/* Search */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Search Products</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Package className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by product name..."
                className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-700 placeholder-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent focus:bg-white transition-all duration-200"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Filter by Category</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Layers className="h-5 w-5 text-gray-400" />
              </div>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="block w-full pl-10 pr-8 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent focus:bg-white transition-all duration-200 appearance-none"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <ChevronDown className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Sort Controls */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Sort Products</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <ArrowUpDown className="h-4 w-4 text-gray-400" />
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="block w-full pl-9 pr-3 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent focus:bg-white transition-all duration-200 appearance-none text-sm"
                >
                  <option value="created_at">Newest</option>
                  <option value="name">Name</option>
                  <option value="price">Price</option>
                  <option value="rating">Rating</option>
                </select>
              </div>
              
              <button
                onClick={() => setSortAsc(!sortAsc)}
                className={`px-4 py-3 rounded-xl border font-semibold text-sm transition-all duration-200 ${
                  sortAsc 
                    ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' 
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
                title={sortAsc ? 'Sort Ascending' : 'Sort Descending'}
              >
                {sortAsc ? '↑ ASC' : '↓ DESC'}
              </button>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="text-sm text-gray-600">
              <span className="font-semibold text-gray-900">
                {products.length > 0 
                  ? `Showing ${((currentPage - 1) * productsPerPage) + 1}-${Math.min(currentPage * productsPerPage, products.length)} of ${products.length}`
                  : '0'
                }
              </span> products
              {searchTerm && (
                <span> for "<span className="font-medium text-gray-900">{searchTerm}</span>"</span>
              )}
              {filterCategory !== 'all' && (
                <span> in <span className="font-medium text-gray-900">
                  {categories.find(c => c.id === filterCategory)?.name}
                </span></span>
              )}
            </div>
            
            {(searchTerm || filterCategory !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterCategory('all');
                }}
                className="text-sm text-gray-500 hover:text-gray-700 underline font-medium"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.length > 0 ? (
          currentProducts.map((p) => (
            <div key={p.id} className="relative rounded-xl bg-white shadow-lg border border-gray-200 p-4 flex flex-col justify-between min-h-[320px]">
              {/* Featured badge */}
              {p.is_featured && (
                <div className="absolute top-3 right-3 bg-amber-500 text-white text-xs font-semibold px-2 py-1 rounded-md shadow-sm z-10">
                  Featured
                </div>
              )}

              <div className="flex-1">
                {/* Product Image */}
                {p.image && (
                  <div className="mb-4">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-full h-40 object-cover rounded-lg border border-gray-100"
                    />
                  </div>
                )}

                {/* Product Title */}
                <h2 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 leading-tight">
                  {p.name}
                </h2>

                {/* Category Information */}
                <div className="mb-3 space-y-1">
                  <p className="text-sm font-medium text-gray-700">
                    {p.category?.name ?? "—"} / {p.subcategory?.name ?? "—"}
                  </p>
                  
                  {p.commercial_sub?.name && (
                    <p className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded-md inline-block">
                      Subtype: {p.commercial_sub.name}
                    </p>
                  )}
                </div>

                {/* Price */}
                <div className="mb-3">
                  <p className="text-lg font-bold text-green-600">
                    {p.price ? `$${p.price.toLocaleString()}` : "Price on request"}
                  </p>
                </div>

                {/* Rating and Features */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-medium text-gray-700">
                      {p.rating ? p.rating.toFixed(1) : "No rating"}
                    </span>
                  </div>
                  
                  {p.is_featured && (
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-amber-500 fill-current" />
                      <span className="text-xs font-medium text-amber-600">Featured</span>
                    </div>
                  )}
                </div>

                {/* Short Description */}
                {p.description && (
                  <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                    {p.description}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                <div className="flex gap-2">
                  <button
                    onClick={() => openPreview(p)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                    title="Preview"
                  >
                    <Eye className="w-3 h-3" />
                    Preview
                  </button>
                  
                  <button
                    onClick={() => openEdit(p)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-green-600 bg-green-50 hover:bg-green-100 rounded-md transition-colors"
                    title="Edit"
                  >
                    <Edit className="w-3 h-3" />
                    Edit
                  </button>
                </div>

                <button
                  onClick={() => requestDelete(p)}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-3 h-3" />
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || filterCategory !== 'all'
                  ? "Try adjusting your search terms or filters"
                  : "Get started by adding your first product"
                }
              </p>
              {(!searchTerm && filterCategory === 'all') && (
                <button
                  onClick={openCreate}
                  className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Add Your First Product
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {products.length > 0 && totalPages > 1 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Page Info */}
            <div className="text-sm text-gray-600">
              <span className="font-semibold text-gray-900">
                Showing {((currentPage - 1) * productsPerPage) + 1}-{Math.min(currentPage * productsPerPage, products.length)} of {products.length} products
              </span>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-2">
              {/* Previous Button */}
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border font-medium transition-all duration-200 ${
                  currentPage === 1
                    ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>

              {/* Page Numbers */}
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  const isCurrentPage = page === currentPage;
                  const isNearCurrentPage = Math.abs(page - currentPage) <= 2;
                  const isFirstOrLast = page === 1 || page === totalPages;
                  
                  if (totalPages <= 7 || isNearCurrentPage || isFirstOrLast) {
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
                          isCurrentPage
                            ? 'bg-green-600 text-white shadow-md'
                            : 'text-gray-700 hover:bg-gray-50 border border-gray-200'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  } else if (page === currentPage - 3 || page === currentPage + 3) {
                    return (
                      <span key={page} className="px-2 py-2 text-gray-400">
                        ...
                      </span>
                    );
                  }
                  return null;
                })}
              </div>

              {/* Next Button */}
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border font-medium transition-all duration-200 ${
                  currentPage === totalPages
                    ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                }`}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewProduct && (
        <Modal title="Product Preview" onClose={closePreview}>
          <div className="space-y-4">
            {previewProduct.image && (
              <img
                src={previewProduct.image}
                alt={previewProduct.name}
                className="w-full h-64 object-cover rounded-lg"
              />
            )}
            <h2 className="text-xl font-bold">{previewProduct.name}</h2>
            <p className="text-gray-500 text-sm">
              {previewProduct.category?.name ?? "—"} / {previewProduct.subcategory?.name ?? "—"}
            </p>
            {previewProduct.commercial_sub?.name && (
              <p className="text-xs text-gray-400">Subtype: {previewProduct.commercial_sub.name}</p>
            )}
            <p className="text-gray-700 mt-2 whitespace-pre-line">{previewProduct.description}</p>
            <p className="text-sm mt-2">
              <strong>Price:</strong> ${previewProduct.price ?? "—"} <br />
              <strong>Rating:</strong> {previewProduct.rating ?? "—"}
            </p>
            {previewProduct.features?.length && (
              <div>
                <strong className="block mb-1">Features:</strong>
                <ul className="list-disc list-inside text-sm text-gray-600">
                  {previewProduct.features.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              </div>
            )}
            {previewProduct.pdfUrl && (
              <a
                href={previewProduct.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-3 text-blue-600 underline"
              >
                View Technical Sheet (PDF)
              </a>
            )}
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <Modal title="Confirm Deletion" onClose={() => setDeleteTarget(null)}>
          <div className="space-y-4">
            <p className="text-gray-700">
              Are you sure you want to delete the product:
              <span className="font-semibold text-red-600"> {deleteTarget.name}</span>?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="rounded-lg border px-4 py-2 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  const { error } = await supabase
                    .from("products")
                    .delete()
                    .eq("id", deleteTarget.id);

                  if (!error) {
                    setToast({ type: "success", msg: "Deleted." });
                    loadProducts();
                  } else {
                    setToast({ type: "error", msg: "Delete failed." });
                  }

                  setDeleteTarget(null);
                }}
                className="rounded-lg bg-red-600 px-6 py-2 font-semibold text-white shadow-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <Modal 
          title={editing ? "Edit Product" : "Create Product"} 
          onClose={closeModal} 
          size="lg"  // Changed from fullScreen={true} to size="lg"
        >
          <div className="space-y-6 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Product Name */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Product Name *</label>
                <div className="flex items-center border border-gray-300 rounded-xl px-3 py-3 bg-gray-50 focus-within:bg-white focus-within:ring-2 focus-within:ring-green-500 focus-within:border-transparent transition-all">
                  <Package className="w-5 h-5 text-gray-400 mr-3" />
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Enter product name"
                    className="w-full outline-none bg-transparent text-gray-700 placeholder-gray-700"
                  />
                </div>
              </div>
              
              {/* Category */}
              <div className="col-span-1">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Category *</label>
                <div className="flex items-center border border-gray-300 rounded-xl px-3 py-3 bg-gray-50 focus-within:bg-white focus-within:ring-2 focus-within:ring-green-500 focus-within:border-transparent transition-all">
                  <Layers className="w-5 h-5 text-gray-400 mr-3" />
                  <select
                    value={form.category_id}
                    onChange={(e) => setForm({ ...form, category_id: e.target.value, subcategory_id: "", commercial_subcategory_id: "" })}
                    className="w-full outline-none bg-transparent text-gray-900"
                  >
                    <option value="">— choose category —</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              {/* Subcategory */}
              <div className="col-span-1">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Subcategory</label>
                <div className="flex items-center border border-gray-300 rounded-xl px-3 py-3 bg-gray-50 focus-within:bg-white focus-within:ring-2 focus-within:ring-green-500 focus-within:border-transparent transition-all">
                  <Layers className="w-5 h-5 text-gray-400 mr-3" />
                  <select
                    value={form.subcategory_id}
                    onChange={(e) => setForm({ ...form, subcategory_id: e.target.value, commercial_subcategory_id: "" })}
                    disabled={!subOptions.length}
                    className="w-full outline-none bg-transparent text-gray-900 disabled:text-gray-400"
                  >
                    <option value="">— choose subcategory —</option>
                    {subOptions.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </div>

              {/* Commercial Subtype */}
              {isFlooringCommercial && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Commercial Subtype</label>
                  <div className="flex items-center border border-gray-300 rounded-xl px-3 py-3 bg-gray-50 focus-within:bg-white focus-within:ring-2 focus-within:ring-green-500 focus-within:border-transparent transition-all">
                    <Layers className="w-5 h-5 text-gray-400 mr-3" />
                    <select
                      value={form.commercial_subcategory_id}
                      onChange={(e) => setForm({ ...form, commercial_subcategory_id: e.target.value })}
                      className="w-full outline-none bg-transparent text-gray-900"
                    >
                      <option value="">— choose commercial subtype —</option>
                      {commercialSubs.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>
              )}

              {/* Price & Rating Row */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Price (USD)</label>
                <div className="flex items-center border border-gray-300 rounded-xl px-3 py-3 bg-gray-50 focus-within:bg-white focus-within:ring-2 focus-within:ring-green-500 focus-within:border-transparent transition-all">
                  <DollarSign className="w-5 h-5 text-gray-400 mr-3" />
                  <input
                    type="number"
                    value={form.price ?? ""}
                    onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                    placeholder="0.00"
                    className="w-full outline-none bg-transparent text-gray-700 placeholder-gray-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Rating (0–5)</label>
                <div className="flex items-center border border-gray-300 rounded-xl px-3 py-3 bg-gray-50 focus-within:bg-white focus-within:ring-2 focus-within:ring-green-500 focus-within:border-transparent transition-all">
                  <Star className="w-5 h-5 text-gray-400 mr-3" />
                  <input
                    type="number"
                    min={0}
                    max={5}
                    step={0.1}
                    value={form.rating ?? ""}
                    onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
                    placeholder="0.0"
                    className="w-full outline-none bg-transparent text-gray-700 placeholder-gray-700"
                  />
                </div>
              </div>

              {/* Description Fields */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Short Description</label>
                <div className="border border-gray-300 rounded-xl p-3 bg-gray-50 focus-within:bg-white focus-within:ring-2 focus-within:ring-green-500 focus-within:border-transparent transition-all">
                  <textarea
                    rows={3}
                    value={form.description ?? ""}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Brief product description..."
                    className="w-full outline-none bg-transparent text-gray-700 placeholder-gray-700 resize-none"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Long Description</label>
                <div className="border border-gray-300 rounded-xl p-3 bg-gray-50 focus-within:bg-white focus-within:ring-2 focus-within:ring-green-500 focus-within:border-transparent transition-all">
                  <textarea
                    rows={4}
                    value={form.long_description ?? ""}
                    onChange={(e) => setForm({ ...form, long_description: e.target.value })}
                    placeholder="Detailed product description..."
                    className="w-full outline-none bg-transparent text-gray-700 placeholder-gray-700 resize-none"
                  />
                </div>
              </div>

              {/* Features */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Features (one per line)</label>
                <div className="border border-gray-300 rounded-xl p-3 bg-gray-50 focus-within:bg-white focus-within:ring-2 focus-within:ring-green-500 focus-within:border-transparent transition-all">
                  <textarea
                    rows={3}
                    value={form.features_raw ?? ""}
                    onChange={(e) => setForm({ ...form, features_raw: e.target.value })}
                    placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                    className="w-full outline-none bg-transparent text-gray-700 placeholder-gray-700 resize-none"
                  />
                </div>
              </div>

              {/* Featured Toggle */}
              <div className="md:col-span-2">
                <label className="flex items-center gap-3 p-4 border border-gray-300 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={form.is_featured ?? false}
                      onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                      className="sr-only"
                    />
                    <div className={`w-12 h-6 rounded-full transition-colors ${form.is_featured ? 'bg-yellow-400' : 'bg-gray-300'}`}>
                      <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${form.is_featured ? 'translate-x-6' : 'translate-x-0.5'} mt-0.5`}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-yellow-500" />
                      <span className="font-semibold text-gray-700">Mark as Featured Product</span>
                    </div>
                    <p className="text-sm text-gray-500">Highlight this product on the main page</p>
                  </div>
                </label>
              </div>

              {/* File Uploads */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Hero Image</label>
                <DropzoneButton
                  accept={{ "image/*": [] }}
                  onFiles={(files) => setForm({ ...form, imageFile: files[0] })}
                  className="border-2 border-dashed border-blue-300 bg-blue-50 hover:bg-blue-100 rounded-xl p-4 text-center"
                >
                  <ImageIcon className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <span className="text-blue-700 font-medium">
                    {form.imageFile ? "Replace Hero Image" : "Upload Hero Image"}
                  </span>
                </DropzoneButton>

                {form.imageFile && (
                  <FilePreview
                    file={form.imageFile}
                    onRemove={() => setForm({ ...form, imageFile: undefined })}
                  />
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
              <button 
                onClick={closeModal} 
                className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>

              <button
                onClick={saveProduct}
                disabled={isLoading}
                className="px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {isLoading
                  ? editing
                    ? "Updating..."
                    : "Creating..."
                  : editing
                    ? "Update Product"
                    : "Create Product"}
              </button> 
            </div>
          </div>
        </Modal>  
      )} 
    </div>
  );
};  

export default ProductManagement;
