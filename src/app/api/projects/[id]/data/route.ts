import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/config/supabase';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

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

    // Verify project ownership
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id')
      .eq('id', id)
      .eq('user_id', session.user.id)
      .single();

    if (projectError) {
      if (projectError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 });
      }
      console.error('Error checking project ownership:', projectError);
      return NextResponse.json({ error: 'Failed to verify project ownership' }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const toolName = searchParams.get('tool');
    const dataType = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('project_data')
      .select('*')
      .eq('project_id', id);

    if (toolName) {
      query = query.eq('tool_name', toolName);
    }

    if (dataType) {
      query = query.eq('data_type', dataType);
    }

    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: projectData, error } = await query;

    if (error) {
      console.error('Error fetching project data:', error);
      return NextResponse.json({ error: 'Failed to fetch project data' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      data: projectData 
    });

  } catch (error) {
    console.error('Error in project data GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
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
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id')
      .eq('id', id)
      .eq('user_id', session.user.id)
      .single();

    if (projectError) {
      if (projectError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 });
      }
      console.error('Error checking project ownership:', projectError);
      return NextResponse.json({ error: 'Failed to verify project ownership' }, { status: 500 });
    }

    const body = await request.json();
    const { tool_name, data_type, data, metadata } = body;

    // Validate required fields
    if (!tool_name || !data_type || !data) {
      return NextResponse.json({ 
        error: 'Missing required fields: tool_name, data_type, data' 
      }, { status: 400 });
    }

    // Save the project data
    const { data: savedData, error } = await supabase
      .from('project_data')
      .insert({
        project_id: id,
        tool_name,
        data_type,
        data,
        metadata: metadata || {}
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving project data:', error);
      return NextResponse.json({ error: 'Failed to save project data' }, { status: 500 });
    }

    // Update project's updated_at timestamp
    await supabase
      .from('projects')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', id);

    return NextResponse.json({ 
      success: true, 
      data: savedData 
    }, { status: 201 });

  } catch (error) {
    console.error('Error in project data POST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 