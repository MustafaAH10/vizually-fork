'use client';

import { Node, Edge, MarkerType } from 'reactflow';
import { cn } from '@/lib/utils';

interface MindMapNodeData {
  id: string;
  title: string;
  description?: string;
  isRoot?: boolean;
  children?: MindMapNodeData[];
}

interface MindMapLayout {
  nodes: Node[];
  edges: Edge[];
}

export function MindMapNode({ data }: { data: MindMapNodeData }) {
  console.log('Rendering MindMapNode:', {
    id: data.id,
    title: data.title,
    isRoot: data.isRoot
  });

  return (
    <div className={cn(
      "bg-white p-4 rounded-lg shadow-lg border border-gray-200",
      "min-w-[200px] max-w-[300px] transition-all duration-200",
      "hover:shadow-xl hover:scale-105",
      data.isRoot ? "border-2 border-primary" : ""
    )}>
      <div className={cn(
        "text-center font-semibold mb-2 break-words",
        data.isRoot ? "text-xl text-primary" : "text-lg"
      )}>
        {data.title}
      </div>
      {data.description && (
        <div className="mt-2 text-sm text-gray-600 space-y-2">
          {data.description.split('\n').map((line: string, index: number) => (
            <div 
              key={index} 
              className={cn(
                "ml-4 break-words transition-colors duration-200",
                "hover:text-primary hover:font-medium"
              )}
            >
              • {line}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function layoutMindMap(root: MindMapNodeData): MindMapLayout {
  console.log('Calculating mind map layout:', {
    rootId: root.id,
    title: root.title,
    childCount: root.children?.length
  });

  const nodes: Node[] = [];
  const edges: Edge[] = [];
  const HORIZONTAL_SPACING = 300;
  const VERTICAL_SPACING = 200;
  const START_X = 0;
  const START_Y = 0;

  // Helper function to recursively create nodes and edges
  const createNodes = (
    node: MindMapNodeData,
    parentId: string | null,
    level: number,
    index: number,
    total: number
  ) => {
    const isRoot = parentId === null;
    const x = isRoot ? START_X : 
      START_X + (index - (total - 1) / 2) * HORIZONTAL_SPACING;
    const y = isRoot ? START_Y : START_Y + level * VERTICAL_SPACING;

    const nodeData = {
      id: node.id,
      type: 'mindMap',
      position: { x, y },
      data: {
        ...node,
        isRoot
      }
    };

    nodes.push(nodeData);

    if (parentId) {
      edges.push({
        id: `edge-${parentId}-${node.id}`,
        source: parentId,
        target: node.id,
        type: 'smoothstep',
        animated: false,
        style: { stroke: '#94a3b8', strokeWidth: 2 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20,
          color: '#94a3b8'
        }
      });
    }

    if (node.children) {
      node.children.forEach((child, childIndex) => {
        createNodes(child, node.id, level + 1, childIndex, node.children!.length);
      });
    }
  };

  // Start the recursive node creation
  createNodes(root, null, 0, 0, 1);

  console.log('Mind map layout complete:', {
    nodeCount: nodes.length,
    edgeCount: edges.length
  });

  return { nodes, edges };
} 