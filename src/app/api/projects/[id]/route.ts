import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth/firebase-server';
import { ProjectService } from '@/lib/services/project-service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get the session
    const { user, error } = await getServerSession();
    
    if (!user?.uid) {
      return NextResponse.json(
        { success: false, error: error || 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: projectId } = await params;
    const project = await ProjectService.getProject(projectId);

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    // Check if user owns the project
    if (project.user_id !== user.uid) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      project
    });
  } catch (error: any) {
    console.error('Fetch project error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to fetch project' 
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get the session
    const { user, error } = await getServerSession();
    
    if (!user?.uid) {
      return NextResponse.json(
        { success: false, error: error || 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: projectId } = await params;
    const body = await request.json();
    const updates = body;

    // Get the project first to check ownership
    const project = await ProjectService.getProject(projectId);
    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    if (project.user_id !== user.uid) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      );
    }

    await ProjectService.updateProject(projectId, updates);

    return NextResponse.json({
      success: true,
      message: 'Project updated successfully'
    });
  } catch (error: any) {
    console.error('Update project error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to update project' 
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get the session
    const { user, error } = await getServerSession();
    
    if (!user?.uid) {
      return NextResponse.json(
        { success: false, error: error || 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: projectId } = await params;

    // Get the project first to check ownership
    const project = await ProjectService.getProject(projectId);
    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    if (project.user_id !== user.uid) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      );
    }

    await ProjectService.deleteProject(projectId);

    return NextResponse.json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error: any) {
    console.error('Delete project error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to delete project' 
      },
      { status: 500 }
    );
  }
} 