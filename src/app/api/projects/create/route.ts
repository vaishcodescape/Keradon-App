import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth/firebase-server';
import { ProjectService } from '@/lib/services/project-service';

export async function POST(request: NextRequest) {
  try {
    // Get the session
    const { user, error } = await getServerSession();
    
    if (!user?.uid) {
      return NextResponse.json(
        { success: false, error: error || 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, description, category, is_public, tags, status } = body;

    // Validate required fields
    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: 'Project name is required' },
        { status: 400 }
      );
    }
    if (!category || !category.trim()) {
      return NextResponse.json(
        { success: false, error: 'Project category is required' },
        { status: 400 }
      );
    }
    if (!Array.isArray(tags)) {
      return NextResponse.json(
        { success: false, error: 'Project tags must be an array' },
        { status: 400 }
      );
    }
    // Create project
    const project = await ProjectService.createProject({
      name: name.trim(),
      description: description?.trim() || '',
      category: category.trim(),
      is_public: typeof is_public === 'boolean' ? is_public : false,
      tags: tags,
      user_id: user.uid,
      status: status || 'active'
    });

    return NextResponse.json({
      success: true,
      data: project
    });
  } catch (error: any) {
    console.error('Create project error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to create project' 
      },
      { status: 500 }
    );
  }
} 