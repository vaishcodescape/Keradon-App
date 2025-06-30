import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { UpdateProjectRequest } from '@/lib/types/project';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const { data: project, error } = await supabaseAdmin
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
      .eq('id', id)
      .eq('user_id', session.user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 });
      }
      console.error('Error fetching project:', error);
      return NextResponse.json({ error: 'Failed to fetch project' }, { status: 500 });
    }

    // Get data count for the project
    const { count } = await supabaseAdmin
      .from('project_data')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', project.id);

    return NextResponse.json({ 
      success: true, 
      project: { ...project, data_count: count || 0 }
    });

  } catch (error) {
    console.error('Error in project GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body: UpdateProjectRequest = await request.json();
    
    // Verify project ownership
    const { data: existingProject, error: checkError } = await supabaseAdmin
      .from('projects')
      .select('id')
      .eq('id', id)
      .eq('user_id', session.user.id)
      .single();

    if (checkError) {
      if (checkError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 });
      }
      console.error('Error checking project ownership:', checkError);
      return NextResponse.json({ error: 'Failed to verify project ownership' }, { status: 500 });
    }

    // Update the project
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (body.name !== undefined) updateData.name = body.name.trim();
    if (body.description !== undefined) updateData.description = body.description;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.is_public !== undefined) updateData.is_public = body.is_public;
    if (body.tags !== undefined) updateData.tags = body.tags;
    if (body.status !== undefined) updateData.status = body.status;

    const { data: updatedProject, error: updateError } = await supabaseAdmin
      .from('projects')
      .update(updateData)
      .eq('id', id)
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
      .single();

    if (updateError) {
      console.error('Error updating project:', updateError);
      return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
    }

    // Get data count for the project
    const { count } = await supabaseAdmin
      .from('project_data')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', updatedProject.id);

    return NextResponse.json({ 
      success: true, 
      project: { ...updatedProject, data_count: count || 0 }
    });

  } catch (error) {
    console.error('Error in project PUT:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Verify project ownership
    const { data: existingProject, error: checkError } = await supabaseAdmin
      .from('projects')
      .select('id')
      .eq('id', id)
      .eq('user_id', session.user.id)
      .single();

    if (checkError) {
      if (checkError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 });
      }
      console.error('Error checking project ownership:', checkError);
      return NextResponse.json({ error: 'Failed to verify project ownership' }, { status: 500 });
    }

    // Delete project data first
    await supabaseAdmin
      .from('project_data')
      .delete()
      .eq('project_id', id);

    // Delete project tools
    await supabaseAdmin
      .from('project_tools')
      .delete()
      .eq('project_id', id);

    // Delete the project
    const { error: deleteError } = await supabaseAdmin
      .from('projects')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting project:', deleteError);
      return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Project deleted successfully' 
    });

  } catch (error) {
    console.error('Error in project DELETE:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 