import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter,
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { getFirebaseDb, getFirebaseAuth } from '@/lib/config/firebase';

// Utility functions for user profile management
export const userProfileService = {
  async getCurrentUser() {
    const auth = await getFirebaseAuth();
    const user = auth.currentUser;
    if (!user) throw new Error('No authenticated user');
    return user;
  },

  async getUserProfile(userId: string) {
    const db = await getFirebaseDb();
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) throw new Error('User not found');
    return { id: userDoc.id, ...userDoc.data() };
  },

  async updateUserProfile(userId: string, updates: any) {
    const db = await getFirebaseDb();
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...updates,
      updated_at: serverTimestamp()
    });
    
    const updatedDoc = await getDoc(userRef);
    return { id: updatedDoc.id, ...updatedDoc.data() };
  },

  async deleteUserProfile(userId: string) {
    const db = await getFirebaseDb();
    await deleteDoc(doc(db, 'users', userId));
  },

  async updatePassword(newPassword: string) {
    // Note: Firebase handles password updates differently
    // This would need to be implemented using updatePassword from firebase/auth
    throw new Error('Password updates should be handled through Firebase Auth directly');
  }
};

// Project management service
export const projectService = {
  async getProjects(userId: string, filters?: { status?: string; category?: string; isPublic?: boolean }) {
    const db = await getFirebaseDb();
    let q = query(
      collection(db, 'projects'),
      where('user_id', '==', userId),
      orderBy('updated_at', 'desc')
    );

    if (filters?.status) {
      q = query(q, where('status', '==', filters.status));
    }
    if (filters?.category) {
      q = query(q, where('category', '==', filters.category));
    }
    if (filters?.isPublic !== undefined) {
      q = query(q, where('is_public', '==', filters.isPublic));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async getProject(projectId: string, userId: string) {
    const db = await getFirebaseDb();
    const projectDoc = await getDoc(doc(db, 'projects', projectId));
    if (!projectDoc.exists()) throw new Error('Project not found');
    
    const project = { id: projectDoc.id, ...projectDoc.data() } as any;
    if (project.user_id !== userId) throw new Error('Unauthorized');
    
    return project;
  },

  async createProject(projectData: any, userId: string) {
    const db = await getFirebaseDb();
    const newProject = {
      ...projectData,
      user_id: userId,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, 'projects'), newProject);
    const createdDoc = await getDoc(docRef);
    return { id: createdDoc.id, ...createdDoc.data() };
  },

  async updateProject(projectId: string, updates: any, userId: string) {
    const db = await getFirebaseDb();
    const projectRef = doc(db, 'projects', projectId);
    
    // Verify ownership
    const projectDoc = await getDoc(projectRef);
    if (!projectDoc.exists() || projectDoc.data()?.user_id !== userId) {
      throw new Error('Project not found or unauthorized');
    }

    await updateDoc(projectRef, {
      ...updates,
      updated_at: serverTimestamp()
    });

    const updatedDoc = await getDoc(projectRef);
    return { id: updatedDoc.id, ...updatedDoc.data() };
  },

  async deleteProject(projectId: string, userId: string) {
    const db = await getFirebaseDb();
    const projectRef = doc(db, 'projects', projectId);
    
    // Verify ownership
    const projectDoc = await getDoc(projectRef);
    if (!projectDoc.exists() || projectDoc.data()?.user_id !== userId) {
      throw new Error('Project not found or unauthorized');
    }

    // Delete related data first
    await this.deleteProjectData(projectId);
    await this.deleteProjectTools(projectId);
    
    // Delete the project
    await deleteDoc(projectRef);
  },

  async deleteProjectData(projectId: string) {
    const db = await getFirebaseDb();
    const q = query(collection(db, 'project_data'), where('project_id', '==', projectId));
    const snapshot = await getDocs(q);
    
    const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
  },

  async deleteProjectTools(projectId: string) {
    const db = await getFirebaseDb();
    const q = query(collection(db, 'project_tools'), where('project_id', '==', projectId));
    const snapshot = await getDocs(q);
    
    const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
  }
};

// Project data service
export const projectDataService = {
  async getProjectData(projectId: string, filters?: { tool_name?: string; data_type?: string; limit?: number; offset?: number }) {
    const db = await getFirebaseDb();
    let q = query(
      collection(db, 'project_data'),
      where('project_id', '==', projectId),
      orderBy('created_at', 'desc')
    );

    if (filters?.tool_name) {
      q = query(q, where('tool_name', '==', filters.tool_name));
    }
    if (filters?.data_type) {
      q = query(q, where('data_type', '==', filters.data_type));
    }
    if (filters?.limit) {
      q = query(q, limit(filters.limit));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async addProjectData(data: any) {
    const db = await getFirebaseDb();
    const newData = {
      ...data,
      created_at: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, 'project_data'), newData);
    const createdDoc = await getDoc(docRef);
    return { id: createdDoc.id, ...createdDoc.data() };
  }
};

// Project tools service
export const projectToolsService = {
  async getProjectTools(projectId: string) {
    const db = await getFirebaseDb();
    const q = query(
      collection(db, 'project_tools'),
      where('project_id', '==', projectId)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async addProjectTool(toolData: any) {
    const db = await getFirebaseDb();
    const newTool = {
      ...toolData,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, 'project_tools'), newTool);
    const createdDoc = await getDoc(docRef);
    return { id: createdDoc.id, ...createdDoc.data() };
  }
}; 