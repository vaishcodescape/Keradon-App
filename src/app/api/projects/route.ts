import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { CreateProjectRequest, ProjectWithTools } from '@/lib/types/project';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Validate required environment variables
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
}
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
}

// Create a Supabase client with service role key to bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log("Fetching projects for user:", session.user.id);

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const isPublic = searchParams.get('public');

    let query = supabaseAdmin
      .from('projects')
      .select(`
        *,
        project_tools (
          id,
          tool_name,
          tool_config,
          is_enabled,
          created_at,
          updated_at
        )
      `)
      .eq('user_id', session.user.id);

    if (status) {
      query = query.eq('status', status);
    }

    if (category) {
      query = query.eq('category', category);
    }

    if (isPublic !== null) {
      query = query.eq('is_public', isPublic === 'true');
    }

    query = query.order('updated_at', { ascending: false });

    const { data: projects, error } = await query;

    if (error) {
      console.error('Error fetching projects:', error);
      return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
    }

    console.log(`Found ${projects?.length || 0} projects for user ${session.user.id}`);

    // Get data count for each project
    const projectsWithCounts = await Promise.all(
      projects.map(async (project) => {
        const { count } = await supabaseAdmin
          .from('project_data')
          .select('*', { count: 'exact', head: true })
          .eq('project_id', project.id);

        return {
          ...project,
          data_count: count || 0
        };
      })
    );

    return NextResponse.json({ 
      success: true, 
      projects: projectsWithCounts 
    });

  } catch (error) {
    console.error('Error in projects GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: CreateProjectRequest = await request.json();
    
    const { name, description, category, is_public, tags, selected_tools } = body;

    // Validate required fields
    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Project name is required' }, { status: 400 });
    }

    // Create the project
    const { data: project, error: projectError } = await supabaseAdmin
      .from('projects')
      .insert({
        name: name.trim(),
        description: description || '',
        category: category || 'Other',
        is_public: is_public || false,
        tags: tags || [],
        user_id: session.user.id,
        status: 'active'
      })
      .select()
      .single();

    if (projectError) {
      console.error('Error creating project:', projectError);
      return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
    }

    // Add selected tools to the project
    if (selected_tools && selected_tools.length > 0) {
      const toolsToInsert = selected_tools.map(toolName => ({
        project_id: project.id,
        tool_name: toolName,
        tool_config: {},
        is_enabled: true
      }));

      const { error: toolsError } = await supabaseAdmin
        .from('project_tools')
        .insert(toolsToInsert);

      if (toolsError) {
        console.error('Error adding tools to project:', toolsError);
        // Don't fail the entire request, just log the error
      }
    }

    // Fetch the complete project with tools
    const { data: completeProject, error: fetchError } = await supabaseAdmin
      .from('projects')
      .select(`
        *,
        project_tools (
          id,
          tool_name,
          tool_config,
          is_enabled,
          created_at,
          updated_at
        )
      `)
      .eq('id', project.id)
      .single();

    if (fetchError) {
      console.error('Error fetching complete project:', fetchError);
      return NextResponse.json({ error: 'Project created but failed to fetch details' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      project: { ...completeProject, data_count: 0 }
    }, { status: 201 });

  } catch (error) {
    console.error('Error in projects POST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 