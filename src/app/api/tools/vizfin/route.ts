// VizFin API route 

import { NextRequest, NextResponse } from 'next/server';
import Papa from 'papaparse';
import Groq from 'groq-sdk';
import { getServerSession } from '@/lib/auth/firebase-server';
import { ProjectService } from '@/lib/services/project-service';

// Initialize Groq client for LLM capabilities
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const chartType = formData.get('chartType') as string;
    const xAxis = formData.get('xAxis') as string;
    const yAxis = formData.get('yAxis') as string;
    const chartTitle = formData.get('chartTitle') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Read file content
    const fileContent = await file.text();
    let parsedData: any[] = [];

    // Parse data based on file type
    if (file.name.endsWith('.csv')) {
      const result = Papa.parse(fileContent, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true
      });
      parsedData = result.data;
    } else if (file.name.endsWith('.json')) {
      try {
        const jsonData = JSON.parse(fileContent);
        parsedData = Array.isArray(jsonData) ? jsonData : [jsonData];
      } catch (error) {
        return NextResponse.json({ error: 'Invalid JSON format' }, { status: 400 });
      }
    } else {
      return NextResponse.json({ error: 'Unsupported file format. Please upload CSV or JSON files.' }, { status: 400 });
    }

    if (parsedData.length === 0) {
      return NextResponse.json({ error: 'No data found in file' }, { status: 400 });
    }

    // Filter out empty rows
    parsedData = parsedData.filter(row => row && Object.keys(row).length > 0);
    
    if (parsedData.length === 0) {
      return NextResponse.json({ error: 'No valid data rows found in file' }, { status: 400 });
    }

    // Get column names from the first row
    const columns = Object.keys(parsedData[0]).filter(col => col && col.trim() !== '');

    // Validate that specified columns exist
    if (xAxis && !columns.includes(xAxis)) {
      return NextResponse.json({ error: `X-axis column '${xAxis}' not found in data` }, { status: 400 });
    }
    if (yAxis && !columns.includes(yAxis)) {
      return NextResponse.json({ error: `Y-axis column '${yAxis}' not found in data` }, { status: 400 });
    }

    // Process data for chart
    let chartData = parsedData;
    let finalXAxis = xAxis;
    let finalYAxis = yAxis;

    // Generate data insights first
    const insights = generateDataInsights(parsedData, columns);

    // Auto-detect axes if not provided
    if (!xAxis || !yAxis) {
      // Auto-select X-axis (prefer text/date columns)
      if (!finalXAxis) {
        finalXAxis = [...insights.textColumns, ...insights.dateColumns][0] || columns[0];
      }
      
      // Auto-select Y-axis (prefer numeric columns)
      if (!finalYAxis) {
        finalYAxis = insights.numericColumns[0] || columns[1] || columns[0];
      }
    }

    // Generate LLM-powered insights and recommendations
    let llmInsights = null;
    try {
      llmInsights = await generateLLMInsights(parsedData, columns, insights, {
        chartType: chartType || 'bar',
        xAxis: finalXAxis,
        yAxis: finalYAxis,
        fileName: file.name
      });
    } catch (error) {
      console.warn('Failed to generate LLM insights:', error);
    }

    // Process and format the data
    if (finalXAxis && finalYAxis) {
      chartData = parsedData.map(row => ({
        [finalXAxis]: row[finalXAxis],
        [finalYAxis]: parseFloat(row[finalYAxis]) || 0,
        ...row // Include all original data for tooltips
      })).filter(row => row[finalXAxis] !== null && row[finalXAxis] !== undefined);
    }

    // Create or update project for the user
    try {
      const { user } = await getServerSession();
      if (user?.uid) {
        // Create a project for this visualization session
        const projectName = `VizFin Analysis - ${file.name}`;
        const projectDescription = `Data visualization analysis of ${file.name} using VizFin`;
        
        const project = await ProjectService.createProject({
          name: projectName,
          description: projectDescription,
          user_id: user.uid,
          category: 'analysis', // default category
          is_public: false, // default to private
          tags: [], // default empty tags
          status: 'active' // default status
        });

        // Update project with data points (row count as data points)
        if (project.id) {
          const dataPoints = parsedData.length;
          await ProjectService.updateDataScraped(project.id, dataPoints, file.name);
        }
      }
    } catch (projectError) {
      console.error('Error creating project for VizFin:', projectError);
      // Don't fail the visualization request if project creation fails
    }

    return NextResponse.json({
      success: true,
      data: chartData,
      columns,
      insights: {
        ...insights,
        llmInsights: llmInsights
      },
      metadata: {
        fileName: file.name,
        fileSize: file.size,
        rowCount: parsedData.length,
        columnCount: columns.length,
        chartType: chartType || 'bar',
        xAxis: finalXAxis,
        yAxis: finalYAxis,
        title: chartTitle || llmInsights?.suggestedTitle || `${file.name} Visualization`,
        recommendedChartType: llmInsights?.recommendedChartType || (chartType || 'bar')
      }
    });

  } catch (error) {
    console.error('VizFin API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process file. Please check your data format.' },
      { status: 500 }
    );
  }
}

function generateDataInsights(data: any[], columns: string[]) {
  const insights: any = {
    totalRows: data.length,
    totalColumns: columns.length,
    columnTypes: {},
    numericColumns: [],
    textColumns: [],
    dateColumns: [],
    summary: {}
  };

  // Analyze each column
  columns.forEach(column => {
    const values = data.map(row => row[column]).filter(val => val !== null && val !== undefined);
    const nonEmptyValues = values.filter(val => val !== '');
    
    if (nonEmptyValues.length === 0) {
      insights.columnTypes[column] = 'empty';
      return;
    }

    // Check if numeric
    const numericValues = nonEmptyValues.filter(val => !isNaN(parseFloat(val)));
    if (numericValues.length / nonEmptyValues.length > 0.8) {
      insights.columnTypes[column] = 'numeric';
      insights.numericColumns.push(column);
      
      const numbers = numericValues.map(val => parseFloat(val));
      insights.summary[column] = {
        min: Math.min(...numbers),
        max: Math.max(...numbers),
        avg: numbers.reduce((a, b) => a + b, 0) / numbers.length,
        count: numbers.length
      };
    }
    // Check if date
    else if (nonEmptyValues.some(val => !isNaN(Date.parse(val)))) {
      insights.columnTypes[column] = 'date';
      insights.dateColumns.push(column);
    }
    // Otherwise it's text
    else {
      insights.columnTypes[column] = 'text';
      insights.textColumns.push(column);
      
      const uniqueValues = [...new Set(nonEmptyValues)];
      insights.summary[column] = {
        uniqueCount: uniqueValues.length,
        totalCount: nonEmptyValues.length,
        mostCommon: getMostCommon(nonEmptyValues)
      };
    }
  });

  return insights;
}

function getMostCommon(arr: any[]) {
  const counts: { [key: string]: number } = {};
  arr.forEach(val => {
    counts[val] = (counts[val] || 0) + 1;
  });
  
  return Object.entries(counts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([value, count]) => ({ value, count }));
}

// Generate LLM-powered insights and recommendations
async function generateLLMInsights(data: any[], columns: string[], basicInsights: any, chartConfig: any) {
  if (!process.env.GROQ_API_KEY) {
    return null;
  }

  try {
    // Prepare data sample for LLM analysis (first 10 rows)
    const dataSample = data.slice(0, 10);
    const dataPreview = {
      columns: columns,
      sampleRows: dataSample,
      totalRows: data.length,
      columnTypes: basicInsights.columnTypes,
      numericColumns: basicInsights.numericColumns,
      textColumns: basicInsights.textColumns,
      dateColumns: basicInsights.dateColumns
    };

    const systemPrompt = `You are VizFin AI, an expert data visualization consultant. Analyze the provided dataset and generate intelligent insights and recommendations.

Your response must be a valid JSON object with this exact structure:
{
  "keyInsights": ["insight1", "insight2", "insight3"],
  "recommendedChartType": "bar|line|area|pie",
  "suggestedTitle": "Chart Title",
  "dataStory": "Brief narrative about what the data tells us",
  "recommendations": ["recommendation1", "recommendation2"],
  "patterns": ["pattern1", "pattern2"],
  "businessImplications": ["implication1", "implication2"]
}

Focus on:
- Key patterns and trends in the data
- Most suitable chart type for the data structure
- Meaningful insights that would help business decisions
- Clear, actionable recommendations`;

    const userPrompt = `Analyze this dataset:

File: ${chartConfig.fileName}
Current Chart Config: ${chartConfig.chartType} chart with X-axis: ${chartConfig.xAxis}, Y-axis: ${chartConfig.yAxis}

Dataset Overview:
${JSON.stringify(dataPreview, null, 2)}

Generate intelligent insights and recommendations for this data visualization.`;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
      max_tokens: 1500,
    });

    const responseText = completion.choices[0]?.message?.content;
    if (!responseText) return null;

    // Parse the JSON response
    const cleanedResponse = responseText.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleanedResponse);

  } catch (error) {
    console.error('LLM insights generation error:', error);
    return null;
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'VizFin API - Upload data files to create visualizations',
    supportedFormats: ['CSV', 'JSON'],
    chartTypes: ['bar', 'line', 'area', 'pie', 'scatter'],
    features: ['AI-powered insights', 'Smart chart recommendations', 'Auto-generated titles', 'Data storytelling']
  });
} 