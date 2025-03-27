'use client';

import { useState } from 'react';
import Canvas from '@/components/canvas/Canvas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { VisualizationData } from '@/components/canvas/Canvas';

export default function CanvasPage() {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [visualization, setVisualization] = useState<VisualizationData | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/visualize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      const data = await response.json();
      console.log('API Response:', data); // Log the API response

      // Create visualization data with position
      const visualizationData: VisualizationData = {
        type: data.type,
        data: data.data,
        position: { x: 100, y: 100 }, // Default position
      };

      console.log('Visualization Data:', visualizationData); // Log the processed data
      setVisualization(visualizationData);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="p-4 border-b">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter text to visualize..."
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Processing...' : 'Visualize'}
          </Button>
        </form>
      </div>
      <div className="flex-1">
        <Canvas visualization={visualization} />
      </div>
    </div>
  );
} 