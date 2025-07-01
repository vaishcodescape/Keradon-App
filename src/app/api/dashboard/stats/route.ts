import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/config/supabase-admin';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: '', ...options });
          },
        },
      }
    );
    
    // Get the current user session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Session error in dashboard stats:', sessionError);
      return NextResponse.json({ error: 'Session error' }, { status: 401 });
    }
    
    if (!session?.user?.id) {
      console.log('No valid session found in dashboard stats');
      return NextResponse.json({ error: 'No session found' }, { status: 401 });
    }

    const userId = session.user.id;
    console.log('Fetching dashboard stats for userId:', userId);

    // Fetch projects statistics
    const { data: projects, error: projectsError } = await supabaseAdmin
      .from('projects')
      .select('id, status, created_at, updated_at')
      .eq('user_id', userId);
    
    if (projectsError) {
      console.error('Error fetching projects:', projectsError);
      // If tables don't exist yet, return mock data
      if (projectsError.message?.includes('relation') && projectsError.message?.includes('does not exist')) {
        console.log('Projects table does not exist yet, returning mock data');
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
          summary: { activeProjects: 0, totalDataPoints: 0, recentScrapes: 0 }
        });
      }
      return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
    }

    // Fetch project data (scraping results, etc.)
    const { data: projectData, error: dataError } = await supabaseAdmin
      .from('project_data')
      .select(`
        id, 
        tool_name, 
        data_type, 
        created_at,
        project_id,
        projects!inner(user_id)
      `)
      .eq('projects.user_id', userId)
      .order('created_at', { ascending: false });
    
    if (dataError) {
      console.error('Error fetching project data:', dataError);
      // If tables don't exist yet, continue with empty data
      if (dataError.message?.includes('relation') && dataError.message?.includes('does not exist')) {
        console.log('Project data table does not exist yet, using empty data');
      } else {
        return NextResponse.json({ error: 'Failed to fetch project data' }, { status: 500 });
      }
    }

    // Fetch project tools
    const { data: projectTools, error: toolsError } = await supabaseAdmin
      .from('project_tools')
      .select(`
        id,
        tool_name,
        is_enabled,
        created_at,
        project_id,
        projects!inner(user_id)
      `)
      .eq('projects.user_id', userId);
    
    if (toolsError) {
      console.error('Error fetching project tools:', toolsError);
      // If tables don't exist yet, continue with empty data
      if (toolsError.message?.includes('relation') && toolsError.message?.includes('does not exist')) {
        console.log('Project tools table does not exist yet, using empty data');
      } else {
        return NextResponse.json({ error: 'Failed to fetch project tools' }, { status: 500 });
      }
    }

    // Use empty arrays as defaults if data is null or tables don't exist
    const safeProjects = projects || [];
    const safeProjectData = projectData || [];
    const safeProjectTools = projectTools || [];

    // Calculate statistics
    const now = new Date();
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Total projects
    const totalProjects = safeProjects.length;
    const activeProjects = safeProjects.filter(p => p.status === 'active').length;
    const projectsLast7Days = safeProjects.filter(p => new Date(p.created_at) >= last7Days).length;

    // Data points (scraping results)
    const totalDataPoints = safeProjectData.length;
    const dataPointsLast7Days = safeProjectData.filter(d => new Date(d.created_at) >= last7Days).length;

    // Active scrapes (recent data entries)
    const activeScrapes = safeProjectData.filter(d => new Date(d.created_at) >= last7Days).length;

    // Success rate calculation (assuming successful scrapes have data)
    const recentScrapes = safeProjectData.filter(d => new Date(d.created_at) >= last7Days);
    const successRate = recentScrapes.length > 0 ? 100 : 0; // Simplified - if we have data, it's successful

    // Tool usage statistics
    const toolUsage = safeProjectTools.reduce((acc, tool) => {
      acc[tool.tool_name] = (acc[tool.tool_name] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Recent activity
    const recentActivity = [
      ...safeProjects.slice(0, 5).map(p => ({
        id: p.id,
        type: 'project_created',
        message: `Project created`,
        timestamp: p.created_at,
        project_id: p.id
      })),
      ...safeProjectData.slice(0, 10).map(d => ({
        id: d.id,
        type: 'data_scraped',
        message: `Data scraped with ${d.tool_name}`,
        timestamp: d.created_at,
        project_id: d.project_id,
        tool_name: d.tool_name,
        data_type: d.data_type
      }))
    ]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 15);

    // Calculate changes (comparing last 7 days to previous 7 days)
    const previous7Days = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const projectsPrevious7Days = safeProjects.filter(p => {
      const createdAt = new Date(p.created_at);
      return createdAt >= previous7Days && createdAt < last7Days;
    }).length;

    const dataPointsPrevious7Days = safeProjectData.filter(d => {
      const createdAt = new Date(d.created_at);
      return createdAt >= previous7Days && createdAt < last7Days;
    }).length;

    // Calculate percentage changes
    const projectsChange = projectsPrevious7Days > 0 
      ? Math.round(((projectsLast7Days - projectsPrevious7Days) / projectsPrevious7Days) * 100)
      : projectsLast7Days > 0 ? 100 : 0;

    const dataPointsChange = dataPointsPrevious7Days > 0
      ? Math.round(((dataPointsLast7Days - dataPointsPrevious7Days) / dataPointsPrevious7Days) * 100)
      : dataPointsLast7Days > 0 ? 100 : 0;

    // Chart data for the last 7 days
    const chartData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));
      
      const dayData = safeProjectData.filter(d => {
        const createdAt = new Date(d.created_at);
        return createdAt >= dayStart && createdAt <= dayEnd;
      });

      chartData.push({
        date: dayStart.toISOString().split('T')[0],
        scrapes: dayData.length,
        projects: safeProjects.filter(p => {
          const createdAt = new Date(p.created_at);
          return createdAt >= dayStart && createdAt <= dayEnd;
        }).length
      });
    }

    return NextResponse.json({
      success: true,
      stats: {
        totalProjects: {
          value: totalProjects,
          change: projectsChange,
          label: 'Total Projects'
        },
        activeScrapes: {
          value: activeScrapes,
          change: dataPointsChange,
          label: 'Active Scrapes'
        },
        dataPoints: {
          value: totalDataPoints,
          change: dataPointsChange,
          label: 'Data Points'
        },
        successRate: {
          value: `${successRate}%`,
          change: 0,
          label: 'Success Rate'
        }
      },
      recentActivity,
      toolUsage,
      chartData,
      summary: {
        activeProjects,
        totalProjects,
        totalDataPoints,
        activeScrapes
      }
    });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 