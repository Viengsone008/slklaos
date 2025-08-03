export interface Product {
  id: string;
  name: string;
  description?: string;
  price?: number;
  category_id?: string | null;
  subcategory_id?: string | null;
  commercial_subcategory_id?: string | null;
  specifications?: { name: string; value: string }[];
  images?: string[];
  created_at?: string;
  updated_at?: string;
  status?: string;
}

export interface ProductFormData {
  name: string;
  description?: string;
  price?: number;
  category_id?: string | null;
  subcategory_id?: string | null;
  commercial_subcategory_id?: string | null;
  specifications_list?: { key: string; value: string }[];
  images?: string[];
  status?: string;
}
