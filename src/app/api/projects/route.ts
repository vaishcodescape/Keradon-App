import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth/firebase-server';
import { ProjectService } from '@/lib/services/project-service';

export async function GET(request: NextRequest) {
  try {
    // Get the session
    const { user, error } = await getServerSession();
    
    if (!user?.uid) {
      return NextResponse.json(
        { success: false, error: error || 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's projects
    const projects = await ProjectService.getUserProjects(user.uid);

    return NextResponse.json({
      success: true,
      projects
    });
  } catch (error: any) {
    console.error('Fetch projects error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to fetch projects' 
      },
      { status: 500 }
    );
  }
} 