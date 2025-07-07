import { 
  Timestamp 
} from 'firebase-admin/firestore';
import { adminDb } from '@/lib/config/firebase-admin';

export interface ActivityData {
  type: 'project_created' | 'data_scraped' | 'tool_used' | 'project_updated' | 'project_completed';
  title: string;
  description: string;
  userId: string;
  projectId?: string;
  metadata?: any;
}

export class ActivityTracker {
  /**
   * Track a user activity
   */
  static async trackActivity(activityData: ActivityData): Promise<void> {
    try {
      const db = adminDb;
      
      const activity = {
        ...activityData,
        timestamp: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };
      
      await db.collection('user_activities').add(activity);
    } catch (error) {
      console.error('Error tracking activity:', error);
      // Don't throw error to avoid breaking user experience
    }
  }
  
  /**
   * Track project creation
   */
  static async trackProjectCreated(userId: string, projectId: string, projectName: string): Promise<void> {
    await this.trackActivity({
      type: 'project_created',
      title: 'New Project Created',
      description: `Created project "${projectName}"`,
      userId,
      projectId,
      metadata: { projectName }
    });
  }
  
  /**
   * Track data scraping
   */
  static async trackDataScraped(userId: string, projectId: string, dataPoints: number, source: string): Promise<void> {
    await this.trackActivity({
      type: 'data_scraped',
      title: 'Data Scraping Completed',
      description: `Scraped ${dataPoints.toLocaleString()} data points from ${source}`,
      userId,
      projectId,
      metadata: { dataPoints, source }
    });
  }
  
  /**
   * Track tool usage
   */
  static async trackToolUsed(userId: string, projectId: string, toolName: string): Promise<void> {
    await this.trackActivity({
      type: 'tool_used',
      title: 'Tool Used',
      description: `Used ${toolName} in project`,
      userId,
      projectId,
      metadata: { toolName }
    });
  }
  
  /**
   * Track project update
   */
  static async trackProjectUpdated(userId: string, projectId: string, projectName: string, updateType: string): Promise<void> {
    await this.trackActivity({
      type: 'project_updated',
      title: 'Project Updated',
      description: `Updated project "${projectName}" - ${updateType}`,
      userId,
      projectId,
      metadata: { projectName, updateType }
    });
  }
  
  /**
   * Track project completion
   */
  static async trackProjectCompleted(userId: string, projectId: string, projectName: string): Promise<void> {
    await this.trackActivity({
      type: 'project_completed',
      title: 'Project Completed',
      description: `Completed project "${projectName}"`,
      userId,
      projectId,
      metadata: { projectName }
    });
  }
} 