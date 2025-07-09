import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Test the dashboard API structure
    const testData = {
      success: true,
      data: {
        stats: {
          totalProjects: 1,
          activeProjects: 1,
          completedProjects: 0,
          totalDataScraped: 100,
          dataScrapedThisMonth: 50,
          toolsUsed: 1,
          lastActivity: new Date().toISOString()
        },
        recentActivities: [
          {
            id: 'test-1',
            type: 'project_created',
            title: 'Test Project',
            description: 'This is a test project',
            timestamp: new Date().toISOString(),
            userId: 'test-user',
            projectId: 'test-project'
          }
        ],
        projectsOverTime: [
          { date: '2024-06', count: 1 }
        ],
        quickStats: {
          projectsThisWeek: 1,
          dataScrapedToday: 50,
          toolsActive: 1,
          averageProjectTime: '1 day'
        }
      }
    };

    return NextResponse.json(testData);
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Test dashboard API failed',
      data: null
    }, { status: 500 });
  }
} 