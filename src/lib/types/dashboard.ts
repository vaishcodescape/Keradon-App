export interface DashboardStat {
  value: number | string;
  change: number;
  label: string;
}

export interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalDataScraped: number;
  dataScrapedThisMonth: number;
  toolsUsed: number;
  lastActivity: string;
}

export interface RecentActivity {
  id: string;
  type: 'project_created' | 'data_scraped' | 'tool_used' | 'project_updated';
  title: string;
  description: string;
  timestamp: string;
  userId: string;
  projectId?: string;
  metadata?: any;
}

export interface QuickStats {
  projectsThisWeek: number;
  dataScrapedToday: number;
  toolsActive: number;
  averageProjectTime: string;
}

export interface ChartDataPoint {
  date: string;
  count?: number;
  amount?: number;
}

export interface ChartData {
  projectsOverTime: ChartDataPoint[];
  dataScrapedOverTime: ChartDataPoint[];
}

export interface DashboardData {
  stats: DashboardStats;
  recentActivities: RecentActivity[];
  projectsOverTime: ChartDataPoint[];
  quickStats: QuickStats;
} 