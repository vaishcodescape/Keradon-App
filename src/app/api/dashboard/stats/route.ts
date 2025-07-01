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
        },
      }
    );
    
    // Get the current user session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session?.user?.id) {
      console.error('No valid session:', sessionError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
      return NextResponse.json({ error: 'Failed to fetch project data' }, { status: 500 });
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
      return NextResponse.json({ error: 'Failed to fetch project tools' }, { status: 500 });
    }

    // Calculate statistics
    const now = new Date();
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Total projects
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.status === 'active').length;
    const projectsLast7Days = projects.filter(p => new Date(p.created_at) >= last7Days).length;

    // Data points (scraping results)
    const totalDataPoints = projectData.length;
    const dataPointsLast7Days = projectData.filter(d => new Date(d.created_at) >= last7Days).length;

    // Active scrapes (recent data entries)
    const activeScrapes = projectData.filter(d => new Date(d.created_at) >= last7Days).length;

    // Success rate calculation (assuming successful scrapes have data)
    const recentScrapes = projectData.filter(d => new Date(d.created_at) >= last7Days);
    const successRate = recentScrapes.length > 0 ? 100 : 0; // Simplified - if we have data, it's successful

    // Tool usage statistics
    const toolUsage = projectTools.reduce((acc, tool) => {
      acc[tool.tool_name] = (acc[tool.tool_name] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Recent activity
    const recentActivity = [
      ...projects.slice(0, 5).map(p => ({
        id: p.id,
        type: 'project_created',
        message: `Project created`,
        timestamp: p.created_at,
        project_id: p.id
      })),
      ...projectData.slice(0, 10).map(d => ({
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
    const projectsPrevious7Days = projects.filter(p => {
      const createdAt = new Date(p.created_at);
      return createdAt >= previous7Days && createdAt < last7Days;
    }).length;

    const dataPointsPrevious7Days = projectData.filter(d => {
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
      
      const dayData = projectData.filter(d => {
        const createdAt = new Date(d.created_at);
        return createdAt >= dayStart && createdAt <= dayEnd;
      });

      chartData.push({
        date: dayStart.toISOString().split('T')[0],
        scrapes: dayData.length,
        projects: projects.filter(p => {
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