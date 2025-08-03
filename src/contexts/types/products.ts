export interface Product {
  id: string;
  created_at: string;                     // ← ISO string from Supabase
  name: string;
  category: "waterproofing" | "flooring" | "rocksoil";
  subcategory?: string;
  categoryName?: string;
  image: string;
  price: string;
  description: string;
  rating: number;
  features: string[];
  badge?: string;
  pdfUrl?: string;
}
