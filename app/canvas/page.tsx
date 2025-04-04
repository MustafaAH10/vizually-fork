'use client';

import { useState, ChangeEvent } from 'react';
import Canvas from '@/components/canvas/Canvas';
import { VisualizationData } from '@/components/canvas/Canvas';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';

export default function CanvasPage() {
  const [text, setText] = useState('');
  const [visualization, setVisualization] = useState<VisualizationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!text.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/visualize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate visualization');
      }

      const data = await response.json();
      console.log('Received visualization data:', data);

      if (!data.type || !data.data) {
        throw new Error('Invalid visualization data received');
      }

      setVisualization({
        type: data.type,
        data: data.data,
        position: { x: 0, y: 0 }
      });

    } catch (err) {
      console.error('Error generating visualization:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate visualization');
    } finally {
      setLoading(false);
    }
  };

  const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="p-4 border-b">
        <div className="flex gap-4 items-start">
          <Textarea
            value={text}
            onChange={handleTextChange}
            placeholder="Enter text to visualize..."
            className="flex-1 min-h-[100px]"
          />
          <Button 
            onClick={handleSubmit} 
            disabled={loading || !text.trim()}
            className="min-w-[120px]"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              'Generate'
            )}
          </Button>
        </div>
        {error && (
          <div className="mt-2 text-red-500 text-sm">
            {error}
          </div>
        )}
      </div>
      <div className="flex-1">
        <Canvas visualization={visualization} />
      </div>
    </div>
  );
} 