import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/config/supabase-admin';
import { createAuthenticatedClient } from '@/lib/auth/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { session, error: sessionError } = await createAuthenticatedClient();
    
    if (sessionError || !session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Verify project ownership
    const { data: project, error: projectError } = await supabaseAdmin
      .from('projects')
      .select('id')
      .eq('id', id)
      .eq('user_id', session.user.id)
      .single();

    if (projectError) {
      if (projectError.code === 'PGRST116') {
        return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 });
      }
      console.error('Error checking project ownership:', projectError);
      return NextResponse.json({ success: false, error: 'Failed to verify project ownership', details: projectError.message }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const toolName = searchParams.get('tool');
    const dataType = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabaseAdmin
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
      return NextResponse.json({ success: false, error: 'Failed to fetch project data', details: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      data: projectData 
    });

  } catch (error: any) {
    console.error('Error in project data GET:', error);
    return NextResponse.json({ success: false, error: 'Internal server error', details: error?.message || String(error) }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { session, error: sessionError } = await createAuthenticatedClient();
    
    if (sessionError || !session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Verify project ownership
    const { data: project, error: projectError } = await supabaseAdmin
      .from('projects')
      .select('id')
      .eq('id', id)
      .eq('user_id', session.user.id)
      .single();

    if (projectError) {
      if (projectError.code === 'PGRST116') {
        return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 });
      }
      console.error('Error checking project ownership:', projectError);
      return NextResponse.json({ success: false, error: 'Failed to verify project ownership', details: projectError.message }, { status: 500 });
    }

    const body = await request.json();
    const { tool_name, data_type, data, metadata } = body;

    // Validate required fields
    if (!tool_name || !data_type || !data) {
      return NextResponse.json({ 
        success: false,
        error: 'Missing required fields: tool_name, data_type, data' 
      }, { status: 400 });
    }

    // Save the project data
    const { data: savedData, error } = await supabaseAdmin
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
      return NextResponse.json({ success: false, error: 'Failed to save project data', details: error.message }, { status: 500 });
    }

    // Update project's updated_at timestamp
    await supabaseAdmin
      .from('projects')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', id);

    return NextResponse.json({ 
      success: true, 
      data: savedData 
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error in project data POST:', error);
    return NextResponse.json({ success: false, error: 'Internal server error', details: error?.message || String(error) }, { status: 500 });
  }
} 