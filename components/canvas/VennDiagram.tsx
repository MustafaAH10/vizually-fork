'use client';

import { Node } from 'reactflow';
import { cn } from '@/lib/utils';

// Types
export type VennDiagramNodeData = {
  id: string;
  title: string;
  description: string;
  color: string;
  radius: number;
  zIndex: number;
  items: string[];
};

export type VennDiagramNodeProps = {
  data: VennDiagramNodeData;
};

// Component
const VennDiagramNode = ({ data }: VennDiagramNodeProps) => {
  const getTextColor = (bgColor: string) => {
    const hex = bgColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? '#000000' : '#FFFFFF';
  };

  return (
    <div
      className={cn(
        'rounded-full flex flex-col items-center justify-center p-4',
        'shadow-lg border-2 border-gray-200'
      )}
      style={{
        width: data.radius * 2,
        height: data.radius * 2,
        backgroundColor: data.color,
        color: getTextColor(data.color),
        zIndex: data.zIndex,
      }}
    >
      <h3 className="text-lg font-semibold mb-2">{data.title}</h3>
      <p className="text-sm mb-2">{data.description}</p>
      {data.items && data.items.length > 0 && (
        <ul className="text-xs list-disc list-inside">
          {data.items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

// Layout function
const layoutVennDiagram = (nodes: Node[]): Node[] => {
  const centerX = 500;
  const centerY = 300;
  const baseRadius = 150;
  const spacing = 100;

  return nodes.map((node, index) => {
    const data = node.data as VennDiagramNodeData;
    let position = { x: centerX, y: centerY };

    switch (nodes.length) {
      case 1:
        position = { x: centerX, y: centerY };
        break;
      case 2:
        position = {
          x: centerX + (index === 0 ? -spacing : spacing),
          y: centerY
        };
        break;
      case 3:
        const angle = (index * 2 * Math.PI) / 3;
        position = {
          x: centerX + Math.cos(angle) * spacing,
          y: centerY + Math.sin(angle) * spacing
        };
        break;
      default:
        const cols = Math.ceil(Math.sqrt(nodes.length));
        const row = Math.floor(index / cols);
        const col = index % cols;
        position = {
          x: centerX + (col - (cols - 1) / 2) * spacing * 1.5,
          y: centerY + (row - (Math.ceil(nodes.length / cols) - 1) / 2) * spacing * 1.5
        };
    }

    return {
      ...node,
      position,
      data: {
        ...data,
        radius: baseRadius,
        zIndex: index + 1
      }
    };
  });
};

export { VennDiagramNode, layoutVennDiagram }; 