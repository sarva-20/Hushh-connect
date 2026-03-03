export interface User {
  _id?: string;
  user_id: string;
  name?: string;
  avatar_url?: string;
  department?: string;
  year?: string;
  rating?: number;
  xp?: number;
  total_xp?: number;
  total_gigs_completed?: number;
  job_readiness_score?: number;
  badges?: string[];
}

export interface Gig {
  _id?: string;
  gig_id?: string;
  title: string;
  description?: string;
  category?: string;
  skill_tags?: string[];
  skills?: string[];
  price?: number;
  deadline?: string;
  status?: string;
  posted_by?: string;
  assigned_to?: string;
  postedBy?: {
    name?: string;
    avatar_url?: string;
    rating?: number;
  };
  created_at?: string;
  updated_at?: string;
  completed_at?: string;
  skill_used?: string;
}

export interface ToastMessage {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}
