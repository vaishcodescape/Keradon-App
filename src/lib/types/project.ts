export interface Project {
  id: string;
  name: string;
  description?: string;
  category: string;
  is_public: boolean;
  tags: string[];
  user_id: string;
  created_at: string;
  updated_at: string;
  status: 'active' | 'archived' | 'draft';
  toolsUsed?: string[];
  dataScraped?: number;
  data?: any[];
  metadata?: Record<string, any>;
}

export interface ProjectTool {
  id: string;
  project_id: string;
  tool_name: 'datashark' | 'queryhammerhead' | 'vizfin';
  tool_config: Record<string, any>;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProjectData {
  id: string;
  project_id: string;
  tool_name: string;
  data_type: 'scraping_result' | 'visualization' | 'query_result';
  data: Record<string, any>;
  metadata: Record<string, any>;
  created_at: string;
}

export interface CreateProjectRequest {
  name: string;
  description: string;
  category: string;
  is_public: boolean;
  tags: string[];
  selected_tools: string[];
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  category?: string;
  is_public?: boolean;
  tags?: string[];
  status?: 'active' | 'archived' | 'draft';
}

export interface ProjectWithTools extends Project {
  project_tools: ProjectTool[];
  data_count: number;
} 