'use client';

import { useCallback, useState, useEffect, useRef, useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  MarkerType,
  useReactFlow,
  Panel,
  ReactFlowProvider,
  NodeTypes,
  EdgeTypes,
  BaseEdge,
  EdgeProps,
  getBezierPath,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';
import '@/app/styles/canvas.css';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Trash2 } from 'lucide-react';
import CanvasToolbar from './CanvasToolbar';
import EditableNode from './EditableNode';
import html2canvas from 'html2canvas';
import { cn } from '@/lib/utils';
import { VennDiagramNode, layoutVennDiagram } from './VennDiagram';
import { BarChartNode as BarChartComponent, layoutBarChart } from './BarChart';

// Define visualization types
export type VisualizationType = 
  | 'barChart' 
  | 'mindMap' 
  | 'flowChart' 
  | 'vennDiagram' 
  | 'arrowDiagram' 
  | 'cycleDiagram' 
  | 'hierarchyDiagram';

// Define visualization data structure
export interface VisualizationData {
  type: VisualizationType;
  data: any;
  position?: { x: number; y: number };
}

// Custom node types - defined outside component and memoized
const nodeTypes: NodeTypes = {
  mindMap: MindMapNode,
  flowChart: FlowChartNode,
  vennDiagram: VennDiagramNode,
  editableNode: EditableNode,
  barChart: BarChartComponent,
  arrowDiagram: ArrowDiagramNode,
  cycleDiagram: CycleDiagramNode,
  hierarchyDiagram: HierarchyDiagramNode,
};

// Bar Chart Node Component
function BarChartNode({ data }: { data: any }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
      <div className="w-[300px] h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data.chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// Enhanced MindMapNode component
function MindMapNode({ data }: { data: any }) {
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

// Enhanced FlowChartNode component
function FlowChartNode({ data }: { data: any }) {
  const getNodeStyle = () => {
    switch (data.type) {
      case 'start':
        return 'bg-gradient-to-br from-green-500 to-green-600 text-white';
      case 'end':
        return 'bg-gradient-to-br from-red-500 to-red-600 text-white';
      case 'decision':
        return 'bg-gradient-to-br from-yellow-500 to-yellow-600 text-white';
      default:
        return 'bg-gradient-to-br from-blue-500 to-blue-600 text-white';
    }
  };

  return (
    <div className={cn(
      "p-4 rounded-lg shadow-lg border border-gray-200",
      "min-w-[200px] max-w-[300px] transition-all duration-200",
      "hover:shadow-xl hover:scale-105",
      getNodeStyle()
    )}>
      <div className="text-center font-semibold mb-2 text-lg break-words">
        {data.title}
      </div>
      {data.description && (
        <div className="mt-2 text-sm opacity-90 break-words">
          {data.description}
        </div>
      )}
    </div>
  );
}

// Arrow Diagram Node Component
function ArrowDiagramNode({ data }: { data: any }) {
  const getNodeStyle = () => {
    switch (data.type) {
      case 'circle':
        return 'rounded-full aspect-square flex items-center justify-center';
      case 'diamond':
        return 'rotate-45 aspect-square flex items-center justify-center';
      default:
        return 'rounded-lg';
    }
  };

  const getContentStyle = () => {
    switch (data.type) {
      case 'diamond':
        return 'rotate-[-45deg]';
      default:
        return '';
    }
  };

  return (
    <div className={`bg-white p-4 shadow-lg border border-gray-200 min-w-[200px] max-w-[300px] ${getNodeStyle()}`}>
      <div className={`${getContentStyle()} w-full`}>
        <div className="text-center font-semibold mb-2 text-lg break-words">{data.title}</div>
        {data.description && (
          <div className="mt-2 text-sm text-gray-600 break-words">{data.description}</div>
        )}
      </div>
    </div>
  );
}

// Cycle Diagram Node Component
function CycleDiagramNode({ data }: { data: any }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200 min-w-[200px] max-w-[300px]">
      <div className="text-center font-semibold mb-2 text-lg break-words">{data.title}</div>
      {data.description && (
        <div className="mt-2 text-sm text-gray-600 break-words">{data.description}</div>
      )}
    </div>
  );
}

// Hierarchy Diagram Node Component
function HierarchyDiagramNode({ data }: { data: any }) {
  const getNodeStyle = () => {
    switch (data.type) {
      case 'root':
        return 'bg-blue-500 text-white';
      case 'branch':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  return (
    <div className={`p-4 rounded-lg shadow-lg border border-gray-200 min-w-[200px] max-w-[300px] ${getNodeStyle()}`}>
      <div className="text-center font-semibold mb-2 text-lg break-words">{data.title}</div>
      {data.description && (
        <div className="mt-2 text-sm opacity-90 break-words">{data.description}</div>
      )}
    </div>
  );
}

interface CanvasProps {
  visualization: VisualizationData | null;
}

function CanvasContent({ visualization }: CanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const { project } = useReactFlow();

  useEffect(() => {
    if (!visualization) {
      setNodes([]);
      setEdges([]);
      return;
    }

    console.log('Processing visualization:', visualization);

    switch (visualization.type) {
      case 'barChart':
        if (!visualization.data.barChart?.categories || !visualization.data.barChart?.values) {
          console.error('Invalid bar chart data structure:', visualization.data);
          return;
        }
        const barChartNodes = layoutBarChart({
          title: visualization.data.title || 'Bar Chart',
          description: visualization.data.description,
          categories: visualization.data.barChart.categories,
          values: visualization.data.barChart.values,
          colors: visualization.data.barChart.colors
        });
        setNodes(barChartNodes);
        setEdges([]);
        break;

      case 'vennDiagram':
        if (!visualization.data.vennDiagram?.circles) {
          console.error('Invalid Venn diagram data structure:', visualization.data);
          return;
        }
        const vennNodes = layoutVennDiagram(visualization.data.vennDiagram.circles);
        setNodes(vennNodes);
        setEdges([]);
        break;

      default:
        console.error('Unknown visualization type:', visualization.type);
        return;
    }
  }, [visualization, setNodes, setEdges]);

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    event.stopPropagation();
    setSelectedNode(node);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const handleDeleteNode = useCallback(() => {
    if (selectedNode) {
      setNodes((nds) => nds.filter((node) => node.id !== selectedNode.id));
      setEdges((eds) => eds.filter((edge) => 
        edge.source !== selectedNode.id && edge.target !== selectedNode.id
      ));
      setSelectedNode(null);
    }
  }, [selectedNode, setNodes, setEdges]);

  const handleAddNode = useCallback(
    (type: string) => {
      const newNode: Node = {
        id: `node-${Date.now()}`,
        type: 'editableNode',
        position: project({ x: Math.random() * 500, y: Math.random() * 500 }),
        data: { label: '', type },
      };
      setNodes((nds) => [...nds, newNode]);
    },
    [project, setNodes]
  );

  const onNodeDoubleClick = useCallback((event: React.MouseEvent, node: Node) => {
    // Handle double click to edit text
    const nodeElement = event.target as HTMLElement;
    if (!nodeElement.closest('.nodrag')) {
      // Only trigger edit if not clicking on a handle or button
      setSelectedNode(node);
    }
  }, []);

  const handleSaveImage = useCallback(() => {
    const element = document.querySelector('.react-flow') as HTMLElement;
    if (element) {
      // Create a clone of the element to modify styles
      const clone = element.cloneNode(true) as HTMLElement;
      
      // Convert oklch colors to rgb
      const elements = clone.querySelectorAll('*');
      elements.forEach((el) => {
        const style = window.getComputedStyle(el);
        if (style.backgroundColor.includes('oklch')) {
          el.setAttribute('style', `background-color: ${style.backgroundColor}`);
        }
        if (style.color.includes('oklch')) {
          el.setAttribute('style', `color: ${style.color}`);
        }
      });

      // Configure html2canvas options
      const options = {
        backgroundColor: '#ffffff',
        scale: 2, // Higher quality
        useCORS: true,
        logging: false,
        removeContainer: true,
        foreignObjectRendering: true,
        allowTaint: true,
        onclone: (clonedDoc: Document) => {
          // Additional style fixes if needed
          const clonedElement = clonedDoc.querySelector('.react-flow') as HTMLElement;
          if (clonedElement) {
            clonedElement.style.transform = 'none';
            clonedElement.style.width = '100%';
            clonedElement.style.height = '100%';
          }
        }
      };

      html2canvas(clone, options).then((canvas: HTMLCanvasElement) => {
        const link = document.createElement('a');
        link.download = 'canvas.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
      });
    }
  }, []);

  const handleSaveHTML = useCallback(() => {
    const element = document.querySelector('.react-flow') as HTMLElement;
    if (element) {
      const html = element.outerHTML;
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = 'canvas.html';
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    }
  }, []);

  return (
    <div className="w-full h-[calc(100vh-4rem)] relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onNodeDoubleClick={onNodeDoubleClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.5}
        maxZoom={2}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
      >
        <Background />
        <Controls />
        <MiniMap />
        
        <Panel position="top-right" className="bg-white rounded-lg shadow-lg p-2 flex gap-2">
          {selectedNode && (
            <button
              onClick={handleDeleteNode}
              className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 size={16} />
              <span>Delete</span>
            </button>
          )}
          <button
            onClick={handleSaveImage}
            className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            Save as Image
          </button>
          <button
            onClick={handleSaveHTML}
            className="flex items-center gap-2 px-3 py-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
          >
            Save as HTML
          </button>
        </Panel>
      </ReactFlow>

      <CanvasToolbar onAddNode={handleAddNode} />
    </div>
  );
}

// Custom edge components
const MindMapEdge = ({
  sourceX,
  sourceY,
  targetX,
  targetY,
  label,
  style = {},
  markerEnd,
}: any) => {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition: Position.Right,
    targetX,
    targetY,
    targetPosition: Position.Left,
  });

  return (
    <>
      <path
        d={edgePath}
        className="react-flow__edge-path"
        style={{
          ...style,
          strokeWidth: 2,
          stroke: '#94a3b8',
        }}
        markerEnd={markerEnd}
      />
      {label && (
        <text
          x={(sourceX + targetX) / 2}
          y={(sourceY + targetY) / 2}
          textAnchor="middle"
          alignmentBaseline="middle"
          className="text-sm fill-gray-600 bg-white px-2 py-1"
          style={{
            transform: 'translate(0, -10px)',
            fontSize: '12px',
            fontWeight: 500,
          }}
        >
          {label}
        </text>
      )}
    </>
  );
};

// Edge types mapping
const edgeTypes: EdgeTypes = {
  mindmap: MindMapEdge,
};

// Layout function for mind maps
function layoutMindMap(nodes: Node[], edges: Edge[]): Node[] {
  const rootNode = nodes.find(node => node.data.isRoot);
  if (!rootNode) return nodes;

  const centerX = 500;
  const centerY = 300;
  const spacing = 200;

  // Position root node in center
  rootNode.position = { x: centerX, y: centerY };

  // Get children of root node
  const childNodes = nodes.filter(node => 
    edges.some(edge => edge.source === rootNode.id && edge.target === node.id)
  );

  // Position child nodes in a circle around root
  childNodes.forEach((node, index) => {
    const angle = (index * 2 * Math.PI) / childNodes.length;
    node.position = {
      x: centerX + Math.cos(angle) * spacing,
      y: centerY + Math.sin(angle) * spacing
    };
  });

  return nodes;
}

// Layout function for flow charts
function layoutFlowChart(nodes: Node[], edges: Edge[]): Node[] {
  const startNode = nodes.find(node => node.data.type === 'start');
  if (!startNode) return nodes;

  const verticalSpacing = 150;
  const horizontalSpacing = 200;
  let currentY = 300;

  // Position start node
  startNode.position = { x: 500, y: currentY };
  currentY += verticalSpacing;

  // Get next nodes
  let currentNodes = [startNode];
  while (currentNodes.length > 0) {
    const nextNodes: Node[] = [];
    let currentX = 500 - ((currentNodes.length - 1) * horizontalSpacing) / 2;

    currentNodes.forEach(node => {
      // Find all nodes this node connects to
      const connectedNodes = nodes.filter(n => 
        edges.some(e => e.source === node.id && e.target === n.id)
      );

      // Position connected nodes
      connectedNodes.forEach(connectedNode => {
        connectedNode.position = { x: currentX, y: currentY };
        currentX += horizontalSpacing;
        nextNodes.push(connectedNode);
      });
    });

    currentNodes = nextNodes;
    currentY += verticalSpacing;
  }

  return nodes;
}

export default function Canvas(props: CanvasProps) {
  return (
    <ReactFlowProvider>
      <CanvasContent {...props} />
    </ReactFlowProvider>
  );
} 