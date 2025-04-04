'use client';

import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface BarChartData {
  name: string;
  value: number;
}

interface BarChartProps {
  data: {
    title: string;
    description?: string;
    categories: string[];
    values: number[];
    colors?: string[];
  };
}

export function BarChartNode({ data }: BarChartProps) {
  // Transform data into the format Recharts expects
  const chartData: BarChartData[] = data.categories.map((category, index) => ({
    name: category,
    value: data.values[index]
  }));

  // Calculate chart dimensions based on data
  const width = Math.max(400, data.categories.length * 100); // Minimum width of 400px, or 100px per category
  const height = 300;

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
      <div className="text-center font-semibold mb-4 text-lg">{data.title}</div>
      {data.description && (
        <div className="text-sm text-gray-600 mb-4 text-center">{data.description}</div>
      )}
      <div style={{ width: `${width}px`, height: `${height}px` }}>
        <ResponsiveContainer width="100%" height="100%">
          <RechartsBarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name"
              tick={{ fill: '#666', fontSize: 12 }}
              tickLine={{ stroke: '#666' }}
            />
            <YAxis 
              tick={{ fill: '#666', fontSize: 12 }}
              tickLine={{ stroke: '#666' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white',
                border: '1px solid #ccc',
                borderRadius: '4px',
                padding: '8px'
              }}
            />
            <Bar 
              dataKey="value" 
              fill={data.colors?.[0] || '#3b82f6'}
              radius={[4, 4, 0, 0]} // Rounded top corners
              animationDuration={1000}
            />
          </RechartsBarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function layoutBarChart(data: BarChartProps['data']) {
  return [{
    id: 'bar-chart',
    type: 'barChart',
    position: { x: 0, y: 0 },
    data: data
  }];
} 