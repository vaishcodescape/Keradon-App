import { 
  Query,
  WhereFilterOp,
  OrderByDirection,
  Timestamp,
  DocumentData,
  QueryDocumentSnapshot
} from 'firebase-admin/firestore';
import { adminDb } from '@/lib/config/firebase-admin';
import { DashboardData } from '@/lib/types/dashboard';

export interface UserProject {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'completed' | 'archived';
  createdAt: Timestamp;
  updatedAt: Timestamp;
  userId: string;
  toolsUsed?: string[];
  dataScraped?: number;
}

export interface UserActivity {
  id: string;
  type: 'project_created' | 'data_scraped' | 'tool_used' | 'project_updated';
  title: string;
  description: string;
  timestamp: Timestamp;
  userId: string;
  projectId?: string;
  metadata?: any;
}

export interface UserStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalDataScraped: number;
  dataScrapedThisMonth: number;
  toolsUsed: number;
  lastActivity: string;
}

export class FirebaseDashboardService {
  /**
   * Get user's dashboard statistics
   */
  static async getUserStats(userId: string): Promise<UserStats> {
    try {
      const db = adminDb;
      
      // Get user's projects
      const projectsRef = db.collection('projects');
      const projectsQuery = projectsRef.where('userId', '==', userId);
      const projectsSnapshot = await projectsQuery.get();
      
      const projects = projectsSnapshot.docs.map((doc: QueryDocumentSnapshot) => ({
        id: doc.id,
        ...doc.data()
      })) as UserProject[];
      
      // Calculate stats
      const totalProjects = projects.length;
      const activeProjects = projects.filter(p => p.status === 'active').length;
      const completedProjects = projects.filter(p => p.status === 'completed').length;
      
      // Calculate total data scraped
      const totalDataScraped = projects.reduce((sum, project) => {
        return sum + (project.dataScraped || 0);
      }, 0);
      
      // Calculate data scraped this month
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const dataScrapedThisMonth = projects
        .filter(p => p.updatedAt.toDate() >= startOfMonth)
        .reduce((sum, project) => sum + (project.dataScraped || 0), 0);
      
      // Get unique tools used
      const toolsUsed = new Set<string>();
      projects.forEach(project => {
        if (project.toolsUsed) {
          project.toolsUsed.forEach(tool => toolsUsed.add(tool));
        }
      });
      
      // Get last activity - simplified to avoid composite index requirement
      const activitiesRef = db.collection('user_activities');
      const activitiesQuery = activitiesRef
        .where('userId', '==', userId)
        .limit(1); // Get just one document, we'll sort in memory if needed
      const lastActivitySnapshot = await activitiesQuery.get();
      
      let lastActivity = new Date().toISOString();
      if (lastActivitySnapshot.docs.length > 0) {
        // Sort by timestamp in memory to get the most recent
        const activities = lastActivitySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as UserActivity[];
        const sortedActivities = activities.sort((a, b) => 
          b.timestamp.toDate().getTime() - a.timestamp.toDate().getTime()
        );
        lastActivity = sortedActivities[0]?.timestamp?.toDate().toISOString() || new Date().toISOString();
      }
      
      return {
        totalProjects,
        activeProjects,
        completedProjects,
        totalDataScraped,
        dataScrapedThisMonth,
        toolsUsed: toolsUsed.size,
        lastActivity
      };
    } catch (error) {
      console.error('Error fetching user stats:', error);
      // Return default stats on error
      return {
        totalProjects: 0,
        activeProjects: 0,
        completedProjects: 0,
        totalDataScraped: 0,
        dataScrapedThisMonth: 0,
        toolsUsed: 0,
        lastActivity: new Date().toISOString()
      };
    }
  }
  
  /**
   * Get user's recent activities
   */
  static async getUserActivities(userId: string, limitCount: number = 10): Promise<UserActivity[]> {
    try {
      const db = adminDb;
      
      const activitiesRef = db.collection('user_activities');
      const activitiesQuery = activitiesRef
        .where('userId', '==', userId)
        .limit(limitCount * 2); // Get more documents to account for sorting
      
      const activitiesSnapshot = await activitiesQuery.get();
      
      const activities = activitiesSnapshot.docs.map((doc: QueryDocumentSnapshot) => ({
        id: doc.id,
        ...doc.data()
      })) as UserActivity[];
      
      // Sort by timestamp in memory and limit to requested count
      const sortedActivities = activities
        .sort((a, b) => b.timestamp.toDate().getTime() - a.timestamp.toDate().getTime())
        .slice(0, limitCount);
      
      return sortedActivities;
    } catch (error) {
      console.error('Error fetching user activities:', error);
      return [];
    }
  }
  
  /**
   * Get user's projects over time for chart data
   */
  static async getProjectsOverTime(userId: string, months: number = 6): Promise<{ date: string; count: number }[]> {
    try {
      const db = adminDb;
      
      const projectsRef = db.collection('projects');
      const projectsQuery = projectsRef.where('userId', '==', userId);
      
      const projectsSnapshot = await projectsQuery.get();
      const projects = projectsSnapshot.docs.map((doc: QueryDocumentSnapshot) => ({
        id: doc.id,
        ...doc.data()
      })) as UserProject[];
      
      // Group projects by month
      const monthlyData: { [key: string]: number } = {};
      const now = new Date();
      
      // Initialize last 6 months with 0
      for (let i = months - 1; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthKey = date.toISOString().slice(0, 7); // YYYY-MM format
        monthlyData[monthKey] = 0;
      }
      
      // Count projects by month
      projects.forEach(project => {
        const projectDate = project.createdAt.toDate();
        const monthKey = projectDate.toISOString().slice(0, 7);
        if (monthlyData[monthKey] !== undefined) {
          monthlyData[monthKey]++;
        }
      });
      
      // Convert to array format
      return Object.entries(monthlyData).map(([date, count]) => ({
        date,
        count
      }));
    } catch (error) {
      console.error('Error fetching projects over time:', error);
      return [];
    }
  }
  
  /**
   * Get quick stats for dashboard
   */
  static async getQuickStats(userId: string): Promise<{
    projectsThisWeek: number;
    dataScrapedToday: number;
    toolsActive: number;
    averageProjectTime: string;
  }> {
    try {
      const db = adminDb;
      
      // Get all user projects and filter in memory to avoid composite indexes
      const projectsRef = db.collection('projects');
      const allProjectsQuery = projectsRef.where('userId', '==', userId);
      const allProjectsSnapshot = await allProjectsQuery.get();
      
      const projects = allProjectsSnapshot.docs.map((doc: QueryDocumentSnapshot) => ({
        id: doc.id,
        ...doc.data()
      })) as UserProject[];
      
      // Calculate projects created this week
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const projectsThisWeek = projects.filter(project => 
        project.createdAt.toDate() >= weekAgo
      ).length;
      
      // Calculate data scraped today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dataScrapedToday = projects
        .filter(project => project.updatedAt.toDate() >= today)
        .reduce((sum, project) => sum + (project.dataScraped || 0), 0);
      
      // Get active tools
      const toolsActive = new Set<string>();
      projects
        .filter(project => project.status === 'active')
        .forEach(project => {
          if (project.toolsUsed) {
            project.toolsUsed.forEach(tool => toolsActive.add(tool));
          }
        });
      
      // Calculate average project time
      let totalDays = 0;
      let completedProjects = 0;
      
      projects.forEach(project => {
        if (project.status === 'completed' && project.createdAt && project.updatedAt) {
          const created = project.createdAt.toDate();
          const updated = project.updatedAt.toDate();
          const daysDiff = Math.ceil((updated.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
          totalDays += daysDiff;
          completedProjects++;
        }
      });
      
      const averageProjectTime = completedProjects > 0 
        ? `${Math.round(totalDays / completedProjects)} days`
        : 'N/A';
      
      return {
        projectsThisWeek,
        dataScrapedToday,
        toolsActive: toolsActive.size,
        averageProjectTime
      };
    } catch (error) {
      console.error('Error fetching quick stats:', error);
      return {
        projectsThisWeek: 0,
        dataScrapedToday: 0,
        toolsActive: 0,
        averageProjectTime: 'N/A'
      };
    }
  }
  
  /**
   * Get comprehensive dashboard data
   */
  static async getDashboardData(userId: string): Promise<DashboardData> {
    try {
      const [userStats, userActivities, projectsOverTime, quickStats] = await Promise.all([
        this.getUserStats(userId),
        this.getUserActivities(userId, 5),
        this.getProjectsOverTime(userId, 6),
        this.getQuickStats(userId)
      ]);
      
      // Convert UserActivity to RecentActivity format
      const recentActivities = userActivities.map(activity => ({
        id: activity.id,
        type: activity.type,
        title: activity.title,
        description: activity.description,
        timestamp: activity.timestamp.toDate().toISOString(),
        userId: activity.userId,
        projectId: activity.projectId,
        metadata: activity.metadata
      }));

      return {
        stats: userStats,
        recentActivities,
        projectsOverTime,
        quickStats
      };
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw new Error('Failed to fetch dashboard data');
    }
  }
} 