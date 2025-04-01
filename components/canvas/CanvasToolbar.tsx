import { useState } from 'react';
import { 
  Square, 
  Circle, 
  Diamond, 
  Hexagon,
  Triangle,
  Type,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface ToolbarProps {
  onAddNode: (type: string) => void;
}

export default function CanvasToolbar({ onAddNode }: ToolbarProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const shapes = [
    { id: 'rectangle', icon: Square, label: 'Rectangle' },
    { id: 'circle', icon: Circle, label: 'Circle' },
    { id: 'diamond', icon: Diamond, label: 'Diamond' },
    { id: 'hexagon', icon: Hexagon, label: 'Hexagon' },
    { id: 'triangle', icon: Triangle, label: 'Triangle' },
    { id: 'text', icon: Type, label: 'Text' },
    { id: 'image', icon: ImageIcon, label: 'Image' },
  ];

  return (
    <div 
      className={`absolute left-0 top-1/2 -translate-y-1/2 bg-white shadow-lg rounded-r-xl transition-all duration-300 ${
        isExpanded ? 'w-48' : 'w-12'
      }`}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100"
      >
        {isExpanded ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
      </button>

      <div className="p-2">
        <div className="space-y-2">
          {shapes.map((shape) => (
            <button
              key={shape.id}
              onClick={() => onAddNode(shape.id)}
              className={`w-full p-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-3 ${
                !isExpanded && 'justify-center'
              }`}
            >
              <shape.icon size={20} className="text-gray-700" />
              {isExpanded && (
                <span className="text-sm text-gray-700">{shape.label}</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
} 