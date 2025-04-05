'use client';

import { useState } from 'react';
import Canvas from '@/components/canvas/Canvas';
import { VisualizationData } from '@/components/canvas/Canvas';
import ChatSidebar from '@/components/chat/ChatSidebar';

export default function CanvasPage() {
  const [visualization, setVisualization] = useState<VisualizationData | null>(null);

  const handleVisualize = (newVisualization: VisualizationData) => {
    console.log('Setting visualization:', newVisualization);
    setVisualization(newVisualization);
  };

  return (
    <div className="flex h-screen w-full">
      <div className="flex-1 h-full">
        <Canvas visualization={visualization} />
      </div>
      <ChatSidebar onVisualize={handleVisualize} />
    </div>
  );
} 