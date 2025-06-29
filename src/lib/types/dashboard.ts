export interface DashboardStat {
  value: number | string;
  change: number;
  label: string;
}

export interface DashboardStats {
  totalProjects: DashboardStat;
  activeScrapes: DashboardStat;
  dataPoints: DashboardStat;
  successRate: DashboardStat;
}

export interface RecentActivity {
  id: string;
  type: 'project_created' | 'data_scraped' | 'tool_enabled' | 'project_updated';
  message: string;
  timestamp: string;
  project_id?: string;
  tool_name?: string;
  data_type?: string;
}

export interface ToolUsage {
  [toolName: string]: number;
}

export interface ChartDataPoint {
  date: string;
  scrapes: number;
  projects: number;
}

export interface DashboardSummary {
  activeProjects: number;
  totalProjects: number;
  totalDataPoints: number;
  activeScrapes: number;
  projectsThisWeek: number;
  dataPointsThisWeek: number;
}

export interface DashboardData {
  success: boolean;
  stats: DashboardStats;
  recentActivity: RecentActivity[];
  toolUsage: ToolUsage;
  chartData: ChartDataPoint[];
  summary: DashboardSummary;
} 