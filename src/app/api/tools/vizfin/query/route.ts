// VizFin Natural Language Query API route

import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    // Validate API key
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'Groq API key not configured' },
        { status: 500 }
      );
    }

    const { query, chartData, metadata } = await request.json();

    if (!query || !chartData || !metadata) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: query, chartData, metadata' },
        { status: 400 }
      );
    }

    const systemPrompt = `You are VizFin AI, a data visualization expert. You're analyzing a specific chart and dataset to answer user questions.

Chart Information:
- File: ${metadata.fileName}
- Chart Type: ${metadata.chartType}
- X-axis: ${metadata.xAxis}
- Y-axis: ${metadata.yAxis}
- Total rows: ${metadata.rowCount}

Your role is to:
- Answer questions about the data patterns, trends, and insights
- Provide specific observations about the chart
- Give actionable recommendations based on the data
- Explain statistical relationships and correlations
- Identify outliers, anomalies, or interesting patterns

Be concise but informative. Use specific numbers and examples from the data when possible.`;

    const userPrompt = `User Question: ${query}

Dataset Sample (first 10 rows):
${JSON.stringify(chartData.slice(0, 10), null, 2)}

Please analyze this data and answer the user's question with specific insights and observations.`;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
      max_tokens: 1000,
    });

    const response = completion.choices[0]?.message?.content;

    return NextResponse.json({
      success: true,
      response: response || 'No response generated',
      metadata: {
        model: 'llama-3.3-70b-versatile',
        tokensUsed: completion.usage?.total_tokens,
        processingTime: Date.now()
      }
    });

  } catch (error) {
    console.error('VizFin Query API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process query' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'VizFin Query API - Ask natural language questions about your chart data',
    usage: 'POST with query, chartData, and metadata',
    features: ['Natural language querying', 'Data pattern analysis', 'Trend identification', 'Statistical insights']
  });
} 