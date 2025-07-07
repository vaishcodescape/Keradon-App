import { 
  Timestamp,
  DocumentData,
  QueryDocumentSnapshot
} from 'firebase-admin/firestore';
import { adminDb } from '@/lib/config/firebase-admin';
import { Project } from '@/lib/types/project';
import { ActivityTracker } from './activity-tracker';

export interface CreateProjectData {
  name: string;
  description?: string;
  user_id: string;
  category: string;
  is_public: boolean;
  tags: string[];
  selected_tools?: string[];
  status?: 'active' | 'archived' | 'draft';
  metadata?: any;
}

export class ProjectService {
  /**
   * Create a new project
   */
  static async createProject(projectData: CreateProjectData): Promise<Project> {
    try {
      const db = adminDb;
      const now = new Date().toISOString();
      const project = {
        ...projectData,
        created_at: now,
        updated_at: now,
        status: projectData.status || 'active'
      };
      const docRef = await db.collection('projects').add(project);
      return {
        id: docRef.id,
        ...project
      };
    } catch (error) {
      console.error('Error creating project:', error);
      throw new Error('Failed to create project');
    }
  }
  
  /**
   * Get all projects for a user
   */
  static async getUserProjects(userId: string): Promise<Project[]> {
    try {
      const db = adminDb;
      
      const projectsRef = db.collection('projects');
      const projectsQuery = projectsRef.where('user_id', '==', userId);
      
      const projectsSnapshot = await projectsQuery.get();
      
      return projectsSnapshot.docs.map((doc: QueryDocumentSnapshot) => ({
        id: doc.id,
        ...doc.data()
      })) as Project[];
    } catch (error) {
      console.error('Error fetching user projects:', error);
      return [];
    }
  }
  
  /**
   * Get a specific project by ID
   */
  static async getProject(projectId: string): Promise<Project | null> {
    try {
      const db = adminDb;
      
      const projectRef = db.collection('projects').doc(projectId);
      const projectSnapshot = await projectRef.get();
      
      if (!projectSnapshot.exists) {
        return null;
      }
      
      return {
        id: projectSnapshot.id,
        ...projectSnapshot.data()
      } as Project;
    } catch (error) {
      console.error('Error fetching project:', error);
      return null;
    }
  }
  
  /**
   * Update a project
   */
  static async updateProject(projectId: string, updates: Partial<Project>): Promise<void> {
    try {
      const db = adminDb;
      
      const projectRef = db.collection('projects').doc(projectId);
      await projectRef.update({
        ...updates,
        updated_at: new Date().toISOString()
      });
      
      // Track activity if project name changed
      if (updates.name) {
        const project = await this.getProject(projectId);
        if (project) {
          await ActivityTracker.trackProjectUpdated(
            project.user_id,
            projectId,
            updates.name,
            'Updated project details'
          );
        }
      }
    } catch (error) {
      console.error('Error updating project:', error);
      throw new Error('Failed to update project');
    }
  }
  
  /**
   * Delete a project
   */
  static async deleteProject(projectId: string): Promise<void> {
    try {
      const db = adminDb;
      
      const projectRef = db.collection('projects').doc(projectId);
      await projectRef.delete();
    } catch (error) {
      console.error('Error deleting project:', error);
      throw new Error('Failed to delete project');
    }
  }
  
  /**
   * Update project status
   */
  static async updateProjectStatus(projectId: string, status: 'active' | 'archived' | 'draft'): Promise<void> {
    await this.updateProject(projectId, { status });
  }
  
  /**
   * Add data to a project
   */
  static async addProjectData(projectId: string, data: any): Promise<void> {
    try {
      const db = adminDb;
      
      const projectRef = db.collection('projects').doc(projectId);
      const projectSnapshot = await projectRef.get();
      
      if (!projectSnapshot.exists) {
        throw new Error('Project not found');
      }
      
      const projectData = projectSnapshot.data() as Project;
      const currentData = projectData.data || [];
      
      await projectRef.update({
        data: [...currentData, data],
        updated_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error adding project data:', error);
      throw new Error('Failed to add project data');
    }
  }
  
  /**
   * Get projects by status
   */
  static async getProjectsByStatus(userId: string, status: 'active' | 'archived' | 'draft'): Promise<Project[]> {
    try {
      const db = adminDb;
      
      const projectsRef = db.collection('projects');
      const projectsQuery = projectsRef
        .where('user_id', '==', userId)
        .where('status', '==', status);
      
      const projectsSnapshot = await projectsQuery.get();
      
      return projectsSnapshot.docs.map((doc: QueryDocumentSnapshot) => ({
        id: doc.id,
        ...doc.data()
      })) as Project[];
    } catch (error) {
      console.error('Error fetching projects by status:', error);
      return [];
    }
  }
  
  /**
   * Update data scraped count for a project
   */
  static async updateDataScraped(projectId: string, dataPoints: number, source: string): Promise<void> {
    try {
      const db = adminDb;
      
      const projectRef = db.collection('projects').doc(projectId);
      const projectSnapshot = await projectRef.get();
      
      if (!projectSnapshot.exists) {
        throw new Error('Project not found');
      }
      
      const projectData = projectSnapshot.data() as Project;
      const newDataScraped = (projectData.dataScraped || 0) + dataPoints;
      
      await projectRef.update({
        dataScraped: newDataScraped,
        updated_at: new Date().toISOString()
      });
      
      // Track activity
      await ActivityTracker.trackDataScraped(
        projectData.user_id,
        projectId,
        dataPoints,
        source
      );
    } catch (error) {
      console.error('Error updating data scraped:', error);
      throw new Error('Failed to update data scraped');
    }
  }
  
  /**
   * Add a tool to a project
   */
  static async addToolToProject(projectId: string, toolName: string): Promise<void> {
    try {
      const db = adminDb;
      
      const projectRef = db.collection('projects').doc(projectId);
      const projectSnapshot = await projectRef.get();
      
      if (!projectSnapshot.exists) {
        throw new Error('Project not found');
      }
      
      const projectData = projectSnapshot.data() as Project;
      const currentTools = projectData.toolsUsed || [];
      
      if (!currentTools.includes(toolName)) {
        await projectRef.update({
          toolsUsed: [...currentTools, toolName],
          updated_at: new Date().toISOString()
        });
        
        // Track activity
        await ActivityTracker.trackToolUsed(
          projectData.user_id,
          projectId,
          toolName
        );
      }
    } catch (error) {
      console.error('Error adding tool to project:', error);
      throw new Error('Failed to add tool to project');
    }
  }
  
  /**
   * Complete a project
   */
  static async completeProject(projectId: string): Promise<void> {
    try {
      const db = adminDb;
      
      const projectRef = db.collection('projects').doc(projectId);
      const projectSnapshot = await projectRef.get();
      
      if (!projectSnapshot.exists) {
        throw new Error('Project not found');
      }
      
      const projectData = projectSnapshot.data() as Project;
      
      await projectRef.update({
        status: 'completed',
        updated_at: new Date().toISOString()
      });
      
      // Track activity
      await ActivityTracker.trackProjectUpdated(
        projectData.user_id,
        projectId,
        projectData.name,
        'Project completed'
      );
    } catch (error) {
      console.error('Error completing project:', error);
      throw new Error('Failed to complete project');
    }
  }
  
  /**
   * Get project statistics
   */
  static async getProjectStats(userId: string): Promise<{
    total: number;
    active: number;
    completed: number;
    archived: number;
  }> {
    try {
      const projects = await this.getUserProjects(userId);
      
      return {
        total: projects.length,
        active: projects.filter(p => p.status === 'active').length,
        completed: projects.filter(p => p.status === 'draft').length, // Using draft as completed since there's no completed status
        archived: projects.filter(p => p.status === 'archived').length
      };
    } catch (error) {
      console.error('Error getting project stats:', error);
      return {
        total: 0,
        active: 0,
        completed: 0,
        archived: 0
      };
    }
  }
} 