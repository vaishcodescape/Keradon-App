// VizFin API route 

import { NextRequest, NextResponse } from 'next/server';
import Papa from 'papaparse';

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

    // Get column names from the first row
    const columns = Object.keys(parsedData[0]);

    // Validate that specified columns exist
    if (xAxis && !columns.includes(xAxis)) {
      return NextResponse.json({ error: `X-axis column '${xAxis}' not found in data` }, { status: 400 });
    }
    if (yAxis && !columns.includes(yAxis)) {
      return NextResponse.json({ error: `Y-axis column '${yAxis}' not found in data` }, { status: 400 });
    }

    // Process data for chart
    let chartData = parsedData;

    // If specific axes are provided, filter and format the data
    if (xAxis && yAxis) {
      chartData = parsedData.map(row => ({
        [xAxis]: row[xAxis],
        [yAxis]: parseFloat(row[yAxis]) || 0,
        ...row // Include all original data for tooltips
      })).filter(row => row[xAxis] !== null && row[xAxis] !== undefined);
    }

    // Generate data insights
    const insights = generateDataInsights(parsedData, columns);

    return NextResponse.json({
      success: true,
      data: chartData,
      columns,
      insights,
      metadata: {
        fileName: file.name,
        fileSize: file.size,
        rowCount: parsedData.length,
        columnCount: columns.length,
        chartType: chartType || 'bar',
        xAxis,
        yAxis,
        title: chartTitle || `${file.name} Visualization`
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

export async function GET() {
  return NextResponse.json({
    message: 'VizFin API - Upload data files to create visualizations',
    supportedFormats: ['CSV', 'JSON'],
    chartTypes: ['bar', 'line', 'area', 'pie', 'scatter']
  });
} 