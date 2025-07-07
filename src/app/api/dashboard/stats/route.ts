import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth/firebase-server';
import { FirebaseDashboardService } from '@/lib/services/firebase-dashboard';

export async function GET(request: NextRequest) {
  try {
    // Get the session
    const { user, error } = await getServerSession();
    
    if (!user?.uid) {
      return NextResponse.json(
        { success: false, error: error || 'Unauthorized' },
        { status: 401 }
      );
    }

    try {
      // Get real dashboard data from Firebase
      const dashboardData = await FirebaseDashboardService.getDashboardData(user.uid);
      return NextResponse.json({
        success: true,
        ...dashboardData
      });
    } catch (firebaseError: any) {
      // Log the error for debugging
      console.error('Firebase dashboard error:', firebaseError);
      // Return fallback data with error message
      return NextResponse.json({
        success: false,
        error: firebaseError?.message || 'Failed to fetch dashboard data',
        stats: {
          totalProjects: 0,
          activeProjects: 0,
          completedProjects: 0,
          totalDataScraped: 0,
          dataScrapedThisMonth: 0,
          toolsUsed: 0,
          lastActivity: new Date().toISOString()
        },
        recentActivities: [],
        projectsOverTime: [],
        quickStats: {
          projectsThisWeek: 0,
          dataScrapedToday: 0,
          toolsActive: 0,
          averageProjectTime: 'N/A'
        }
      });
    }
  } catch (error: any) {
    // Log the error for debugging
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to fetch dashboard data',
        stats: {
          totalProjects: 0,
          activeProjects: 0,
          completedProjects: 0,
          totalDataScraped: 0,
          dataScrapedThisMonth: 0,
          toolsUsed: 0,
          lastActivity: new Date().toISOString()
        },
        recentActivities: [],
        projectsOverTime: [],
        quickStats: {
          projectsThisWeek: 0,
          dataScrapedToday: 0,
          toolsActive: 0,
          averageProjectTime: 'N/A'
        }
      },
      { status: 500 }
    );
  }
} 