export interface Supervisor {
  id: string;
  name: string;
  email: string;
  department: string;
  expertise: string[];
  max_groups: number;
  current_groups: number;
  bio: string;
  avatar_color: string;
  created_at: string;
}

export interface ProjectIdea {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty_level: 'Easy' | 'Medium' | 'Hard';
  video_url: string;
  tags: string[];
  view_count: number;
  created_at: string;
}

export interface ThesisGroup {
  id: string;
  title: string;
  topic: string;
  category: string;
  supervisor_id: string | null;
  student_names: string[];
  cgpa_avg: number;
  status: 'pending' | 'accepted' | 'rejected';
  notes: string;
  created_at: string;
  supervisor?: Supervisor;
}

export interface Notification {
  id: string;
  group_id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  created_at: string;
}

export type Page = 'dashboard' | 'supervisors' | 'suggest' | 'ideas' | 'groups';
