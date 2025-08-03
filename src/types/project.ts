export interface Project {
  id: string;
  name: string;
  description?: string;
  status?: string;
  start_date?: string;
  end_date?: string;
  budget?: number;
  spent?: number;
  progress?: number;
  location?: string;
  client_name?: string;
  manager?: string;
  technical_details?: string;
  materials_used?: string;
  gallery?: string[];
  brochure?: string;
  created_at?: string;
  updated_at?: string;
  is_published?: boolean;
}

export interface ProjectFormData {
  name: string;
  description?: string;
  status?: string;
  start_date?: string;
  end_date?: string;
  budget?: number;
  location?: string;
  client_name?: string;
  manager?: string;
  technical_details_list?: { key: string; value: string }[];
  materials_used_list?: { key: string; value: string }[];
  gallery_raw?: string;
  brochure?: string;
}
