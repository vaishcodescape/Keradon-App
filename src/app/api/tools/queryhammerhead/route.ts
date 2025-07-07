// QueryHammerhead API route 

import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { getServerSession } from '@/lib/auth/firebase-server';
import { ProjectService } from '@/lib/services/project-service';

interface QueryRequest {
  query: string;
  mode: 'analysis' | 'research' | 'code' | 'creative' | 'optimization';
  context?: string;
  temperature?: number;
  maxTokens?: number;
  model?: string;
}

interface QueryResponse {
  success: boolean;
  response?: string;
  error?: string;
  metadata?: {
    mode: string;
    model: string;
    tokensUsed?: number;
    processingTime: number;
  };
}

const SYSTEM_PROMPTS = {
  analysis: `You are QueryHammerhead, an expert data analyst and problem solver. Your role is to:
- Break down complex problems into manageable components
- Provide thorough analysis with actionable insights
- Use structured thinking and clear reasoning
- Present findings in a well-organized format with key takeaways`,

  research: `You are QueryHammerhead, a comprehensive research assistant. Your role is to:
- Conduct thorough research on any topic
- Provide well-sourced and factual information
- Structure information logically with clear sections
- Include relevant context and background information`,

  code: `You are QueryHammerhead, a senior software engineer and code expert. Your role is to:
- Write clean, efficient, and well-documented code
- Provide detailed explanations of code functionality
- Suggest best practices and optimizations
- Help debug and troubleshoot code issues`,

  creative: `You are QueryHammerhead, a creative problem solver and content creator. Your role is to:
- Generate innovative and original ideas
- Think outside the box for unique solutions
- Create engaging and compelling content
- Provide multiple creative alternatives`,



  optimization: `You are QueryHammerhead, a performance optimization expert. Your role is to:
- Analyze systems and processes for improvement opportunities
- Suggest specific optimization strategies
- Provide measurable improvement recommendations
- Focus on efficiency and performance gains`
};

const AVAILABLE_MODELS = [
  // Production models
  'llama-3.3-70b-versatile',
  'llama-3.1-8b-instant',
  'gemma2-9b-it',
  'llama3-70b-8192',
  'llama3-8b-8192',
  // Preview models
  'deepseek-r1-distill-llama-70b',
  'qwen/qwen3-32b',
  'qwen-qwq-32b',
  'mistral-saba-24b'
];

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Validate API key
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Groq API key not configured' 
        },
        { status: 500 }
      );
    }

    // Initialize Groq client
    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });

    // Parse request body
    const body: QueryRequest = await request.json();
    
    // Validate required fields
    if (!body.query || !body.mode) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: query and mode' 
        },
        { status: 400 }
      );
    }

    // Validate mode
    if (!Object.keys(SYSTEM_PROMPTS).includes(body.mode)) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Invalid mode. Must be one of: ${Object.keys(SYSTEM_PROMPTS).join(', ')}` 
        },
        { status: 400 }
      );
    }

    // Select model (default to llama-3.3-70b-versatile for best performance)
    const selectedModel = body.model && AVAILABLE_MODELS.includes(body.model) 
      ? body.model 
      : 'llama-3.3-70b-versatile';

    // Prepare the messages
    const systemPrompt = SYSTEM_PROMPTS[body.mode];
    let userPrompt = body.query;
    
    // Add context if provided
    if (body.context) {
      userPrompt = `Context: ${body.context}\n\nQuery: ${body.query}`;
    }

    // Make API call to Groq
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: userPrompt
        }
      ],
      model: selectedModel,
      temperature: body.temperature ?? 0.7,
      max_tokens: body.maxTokens ?? 4000,
      top_p: 1,
      stream: false,
    });

    const processingTime = Date.now() - startTime;

    // Extract response text
    const responseText = chatCompletion.choices[0]?.message?.content || 'No response generated';

    // Create or update project for the user
    try {
      const { user } = await getServerSession();
      if (user?.uid) {
        // Create a project for this query session
        const projectName = `QueryHammerhead ${body.mode.charAt(0).toUpperCase() + body.mode.slice(1)} - ${body.query.substring(0, 30)}${body.query.length > 30 ? '...' : ''}`;
        const projectDescription = `${body.mode} query using QueryHammerhead AI`;
        
        const project = await ProjectService.createProject({
          name: projectName,
          description: projectDescription,
          user_id: user.uid,
          category: 'analysis', // default category
          is_public: false, // default to private
          tags: [], // default empty tags
          status: 'active' // default status
        });

        // Update project with data points (tokens used as data points)
        if (project.id) {
          const dataPoints = chatCompletion.usage?.total_tokens || 0;
          await ProjectService.updateDataScraped(project.id, dataPoints, 'QueryHammerhead');
        }
      }
    } catch (projectError) {
      console.error('Error creating project for QueryHammerhead:', projectError);
      // Don't fail the query request if project creation fails
    }

    const response: QueryResponse = {
      success: true,
      response: responseText,
      metadata: {
        mode: body.mode,
        model: selectedModel,
        tokensUsed: chatCompletion.usage?.total_tokens,
        processingTime
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    const processingTime = Date.now() - startTime;
    
    console.error('QueryHammerhead API Error:', error);
    
    let errorMessage = 'An unexpected error occurred';
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    const response: QueryResponse = {
      success: false,
      error: errorMessage,
      metadata: {
        mode: 'error',
        model: 'unknown',
        processingTime
      }
    };

    return NextResponse.json(response, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    name: 'QueryHammerhead',
    description: 'Advanced AI-powered query processing tool using Groq',
    version: '1.0.0',
    provider: 'Groq',
    modes: Object.keys(SYSTEM_PROMPTS),
    availableModels: AVAILABLE_MODELS,
    defaultModel: 'llama-3.3-70b-versatile',
    endpoints: {
      POST: {
        description: 'Process a query with specified mode',
        parameters: {
          query: 'string (required) - The query to process',
          mode: `string (required) - Analysis mode: ${Object.keys(SYSTEM_PROMPTS).join(', ')}`,
          context: 'string (optional) - Additional context for the query',
          temperature: 'number (optional) - Response creativity (0-2, default: 0.7)',
          maxTokens: 'number (optional) - Maximum response tokens (default: 4000)',
          model: `string (optional) - Model to use: ${AVAILABLE_MODELS.join(', ')}`
        }
      }
    },
    example: {
      query: 'How can I optimize my React application performance?',
      mode: 'optimization',
      context: 'Large e-commerce application with 10k+ products',
      temperature: 0.7,
      maxTokens: 3000,
      model: 'llama-3.3-70b-versatile'
    }
  });
} 