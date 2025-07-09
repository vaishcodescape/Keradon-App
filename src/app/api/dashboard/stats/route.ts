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
      
      // Return data in the expected format
      return NextResponse.json({
        success: true,
        data: dashboardData
      });
    } catch (firebaseError: any) {
      // Log the error for debugging
      console.error('Firebase dashboard error:', firebaseError);
      
      // Check if it's a Firebase configuration issue
      const isConfigError = firebaseError?.message?.includes('Could not load the default credentials') ||
                           firebaseError?.message?.includes('Firebase Admin not properly initialized') ||
                           firebaseError?.message?.includes('Database connection failed') ||
                           firebaseError?.message?.includes('Query timeout');
      
      if (isConfigError) {
        console.log('Dashboard API: Firebase configuration issue detected, returning default data');
        // Return default data without error for configuration issues
        return NextResponse.json({
          success: true,
          data: {
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
          }
        });
      }
      
      // Return fallback data with error message for other errors
      return NextResponse.json({
        success: false,
        error: firebaseError?.message || 'Failed to fetch dashboard data',
        data: {
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
        data: {
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
        }
      },
      { status: 500 }
    );
  }
} 