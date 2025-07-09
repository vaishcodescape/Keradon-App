import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Return mock dashboard data for testing
    const mockDashboardData = {
      stats: {
        totalProjects: 5,
        activeProjects: 3,
        completedProjects: 2,
        totalDataScraped: 1250,
        dataScrapedThisMonth: 450,
        toolsUsed: 3,
        lastActivity: new Date().toISOString()
      },
      recentActivities: [
        {
          id: '1',
          type: 'project_created' as const,
          title: 'New Project Created',
          description: 'E-commerce Analysis Project',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
          userId: 'user123',
          projectId: 'proj1'
        },
        {
          id: '2',
          type: 'data_scraped' as const,
          title: 'Data Scraping Completed',
          description: 'Scraped 250 records from target website',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
          userId: 'user123',
          projectId: 'proj1'
        },
        {
          id: '3',
          type: 'tool_used' as const,
          title: 'VizFin Tool Used',
          description: 'Generated visualization for sales data',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
          userId: 'user123',
          projectId: 'proj2'
        }
      ],
      projectsOverTime: [
        { date: '2024-01', count: 1 },
        { date: '2024-02', count: 2 },
        { date: '2024-03', count: 1 },
        { date: '2024-04', count: 3 },
        { date: '2024-05', count: 2 },
        { date: '2024-06', count: 5 }
      ],
      quickStats: {
        projectsThisWeek: 2,
        dataScrapedToday: 150,
        toolsActive: 2,
        averageProjectTime: '3 days'
      }
    };

    return NextResponse.json({
      success: true,
      data: mockDashboardData
    });
  } catch (error: any) {
    console.error('Fallback dashboard stats error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to fetch fallback dashboard data',
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