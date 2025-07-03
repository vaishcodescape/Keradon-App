import { NextRequest, NextResponse } from 'next/server';
import { createAuthenticatedClient } from '@/lib/auth/firebase-server';
import { adminDb } from '@/lib/config/firebase-admin';

export async function GET(request: NextRequest) {
  try {
    const { user, error: authError } = await createAuthenticatedClient();
    
    if (authError || !user) {
      console.log('No valid session found in dashboard stats:', authError);
      return NextResponse.json({ error: 'No session found' }, { status: 401 });
    }

    const userId = user.uid;
    console.log('Fetching dashboard stats for userId:', userId);

    try {
      // Fetch projects statistics
      const projectsSnapshot = await adminDb
        .collection('projects')
        .where('user_id', '==', userId)
        .get();

      const projects = projectsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as any[];

      // Fetch project data (scraping results, etc.)
      const projectDataSnapshot = await adminDb
        .collection('project_data')
        .where('project_id', 'in', projects.length > 0 ? projects.map(p => p.id) : ['dummy'])
        .orderBy('created_at', 'desc')
        .get();

      const projectData = projectDataSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as any[];

      // Fetch project tools
      const projectToolsSnapshot = await adminDb
        .collection('project_tools')
        .where('project_id', 'in', projects.length > 0 ? projects.map(p => p.id) : ['dummy'])
        .get();

      const projectTools = projectToolsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as any[];

      // Calculate statistics
      const now = new Date();
      const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Total projects
      const totalProjects = projects.length;
      const activeProjects = projects.filter(p => p.status === 'active').length;
      const projectsLast7Days = projects.filter(p => {
        const createdAt = p.created_at?.toDate ? p.created_at.toDate() : new Date(p.created_at);
        return createdAt >= last7Days;
      }).length;

      // Data points (scraping results)
      const totalDataPoints = projectData.length;
      const dataPointsLast7Days = projectData.filter(d => {
        const createdAt = d.created_at?.toDate ? d.created_at.toDate() : new Date(d.created_at);
        return createdAt >= last7Days;
      }).length;

      // Active scrapes (recent data entries)
      const activeScrapes = dataPointsLast7Days;

      // Success rate calculation (assuming successful scrapes have data)
      const recentScrapes = projectData.filter(d => {
        const createdAt = d.created_at?.toDate ? d.created_at.toDate() : new Date(d.created_at);
        return createdAt >= last7Days;
      });
      const successfulScrapes = recentScrapes.filter(d => d.data && Object.keys(d.data).length > 0);
      const successRate = recentScrapes.length > 0 ? Math.round((successfulScrapes.length / recentScrapes.length) * 100) : 0;

      // Tool usage statistics
      const toolUsage = projectTools.reduce((acc: any, tool: any) => {
        acc[tool.tool_name] = (acc[tool.tool_name] || 0) + 1;
        return acc;
      }, {});

      // Recent activity (last 10 items)
      const recentActivity = projectData
        .sort((a, b) => {
          const dateA = a.created_at?.toDate ? a.created_at.toDate() : new Date(a.created_at);
          const dateB = b.created_at?.toDate ? b.created_at.toDate() : new Date(b.created_at);
          return dateB.getTime() - dateA.getTime();
        })
        .slice(0, 10)
        .map((item: any) => ({
          id: item.id,
          type: item.data_type || 'data',
          tool: item.tool_name,
          project_id: item.project_id,
          created_at: item.created_at?.toDate ? item.created_at.toDate().toISOString() : item.created_at
        }));

      // Chart data for the last 30 days
      const chartData = [];
      for (let i = 29; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dateStr = date.toISOString().split('T')[0];
        
        const dayData = projectData.filter(d => {
          const createdAt = d.created_at?.toDate ? d.created_at.toDate() : new Date(d.created_at);
          return createdAt.toISOString().split('T')[0] === dateStr;
        });

        chartData.push({
          date: dateStr,
          data_points: dayData.length,
          projects: projects.filter(p => {
            const createdAt = p.created_at?.toDate ? p.created_at.toDate() : new Date(p.created_at);
            return createdAt.toISOString().split('T')[0] === dateStr;
          }).length
        });
      }

      // Calculate percentage changes (mock data for now)
      const projectChange = projectsLast7Days > 0 ? Math.round((projectsLast7Days / Math.max(totalProjects - projectsLast7Days, 1)) * 100) : 0;
      const dataChange = dataPointsLast7Days > 0 ? Math.round((dataPointsLast7Days / Math.max(totalDataPoints - dataPointsLast7Days, 1)) * 100) : 0;

      const stats = {
        totalProjects: { 
          value: totalProjects, 
          change: projectChange, 
          label: 'Total Projects' 
        },
        activeScrapes: { 
          value: activeScrapes, 
          change: dataChange, 
          label: 'Active Scrapes' 
        },
        dataPoints: { 
          value: totalDataPoints, 
          change: dataChange, 
          label: 'Data Points' 
        },
        successRate: { 
          value: `${successRate}%`, 
          change: 0, 
          label: 'Success Rate' 
        }
      };

      const summary = {
        activeProjects,
        totalDataPoints,
        dataPointsThisWeek: dataPointsLast7Days
      };

      return NextResponse.json({
        success: true,
        stats,
        recentActivity,
        toolUsage,
        chartData,
        summary
      });

    } catch (dbError: any) {
      console.error('Firestore error in dashboard stats:', dbError);
      // Return mock data if database operations fail
      return NextResponse.json({
        success: true,
        stats: {
          totalProjects: { value: 0, change: 0, label: 'Total Projects' },
          activeScrapes: { value: 0, change: 0, label: 'Active Scrapes' },
          dataPoints: { value: 0, change: 0, label: 'Data Points' },
          successRate: { value: '0%', change: 0, label: 'Success Rate' }
        },
        recentActivity: [],
        toolUsage: {},
        chartData: [],
        summary: { activeProjects: 0, totalDataPoints: 0, dataPointsThisWeek: 0 }
      });
    }

  } catch (error: any) {
    console.error('Error in dashboard stats API:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 });
  }
} 