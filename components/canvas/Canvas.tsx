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
  NodeProps,
  MiniMapNodeProps
} from 'reactflow';
import 'reactflow/dist/style.css';
import '@/app/styles/canvas.css';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Trash2 } from 'lucide-react';
import CanvasToolbar from './CanvasToolbar';
import EditableNode from './EditableNode';
import html2canvas from 'html2canvas';
import { cn } from '@/lib/utils';
import { BarChartNode as BarChartComponent, layoutBarChart } from './BarChart';
import { FlowChartNode as FlowChartComponent, layoutFlowChart as layoutFlow } from './FlowChart';
import { MindMapNode as MindMapComponent, layoutMindMap as mindMapLayout } from './MindMap';

// Define visualization types
export type VisualizationType = 
  | 'barChart' 
  | 'mindMap' 
  | 'flowChart' 
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
const nodeTypes = {
  barChart: BarChartComponent,
  mindMap: MindMapComponent,
  flowChart: FlowChartComponent,
  editableNode: EditableNode,
} as NodeTypes;

// Define node data type
interface NodeData {
  type?: string;
  title?: string;
  description?: string;
  label?: string;
  isRoot?: boolean;
}

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
  const [nodes, setNodes, onNodesChange] = useNodesState<NodeData>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node<NodeData> | null>(null);
  const { project } = useReactFlow();

  // Debug current nodes
  useEffect(() => {
    console.log('Nodes state changed:', {
      nodesCount: nodes.length,
      nodes: nodes.map(n => ({
        id: n.id,
        type: n.type,
        position: n.position,
        data: {
          type: n.data.type,
          title: n.data.title
        }
      })),
      nodeTypes: Object.keys(nodeTypes)
    });
  }, [nodes]);

  useEffect(() => {
    console.log('Canvas visualization update:', {
      received: !!visualization,
      type: visualization?.type,
      data: visualization?.data,
      fullData: visualization
    });
    
    if (!visualization) {
      console.log('Clearing canvas - no visualization data');
      setNodes([]);
      setEdges([]);
      return;
    }

    try {
      console.log('Processing visualization:', {
        type: visualization.type,
        data: visualization.data,
        nodeTypes: Object.keys(nodeTypes),
        rawData: JSON.stringify(visualization, null, 2)
      });

      switch (visualization.type) {
        case 'barChart':
          if (!visualization.data.categories || !visualization.data.values) {
            console.error('Invalid bar chart data:', visualization.data);
            return;
          }
          console.log('Creating bar chart with data:', {
            title: visualization.data.title,
            categories: visualization.data.categories,
            values: visualization.data.values
          });
          const barChartNodes = layoutBarChart({
            title: visualization.data.title || 'Bar Chart',
            description: visualization.data.description,
            categories: visualization.data.categories,
            values: visualization.data.values,
            colors: visualization.data.colors
          });
          console.log('Bar chart nodes created:', barChartNodes);
          setNodes(barChartNodes);
          setEdges([]);
          break;

        case 'mindMap':
          console.log('Mind map data structure:', {
            hasData: !!visualization.data,
            hasMindMap: !!visualization.data?.mindMap,
            hasRoot: !!visualization.data?.mindMap?.root,
            dataKeys: Object.keys(visualization.data || {}),
            mindMapKeys: Object.keys(visualization.data?.mindMap || {}),
            rootKeys: Object.keys(visualization.data?.mindMap?.root || {})
          });

          if (!visualization.data?.mindMap?.root) {
            console.error('Invalid mind map data structure:', {
              data: visualization.data,
              expected: {
                mindMap: {
                  root: {
                    title: 'string',
                    description: 'string',
                    children: []
                  }
                }
              }
            });
            return;
          }
          console.log('Creating mind map with data:', {
            root: visualization.data.mindMap.root,
            title: visualization.data.title
          });
          
          // Transform the data structure to match our component's expectations
          const rootNode = {
            id: 'root',
            title: visualization.data.mindMap.root.title || visualization.data.title || 'Mind Map',
            description: visualization.data.mindMap.root.description || visualization.data.description,
            isRoot: true,
            children: visualization.data.mindMap.root.children.map((child: any, index: number) => ({
              id: `child-${index}`,
              title: child.title,
              description: child.description,
              isRoot: false
            }))
          };

          const mindMapResult = mindMapLayout(rootNode);
          console.log('Mind map layout created:', {
            nodes: mindMapResult.nodes,
            edges: mindMapResult.edges
          });
          setNodes(mindMapResult.nodes);
          setEdges(mindMapResult.edges);
          break;

        case 'flowChart':
          if (!visualization.data.nodes || !visualization.data.edges) {
            console.error('Invalid flow chart data:', visualization.data);
            return;
          }
          console.log('Creating flow chart with data:', {
            nodes: visualization.data.nodes,
            edges: visualization.data.edges
          });
          const flowLayout = layoutFlow({
            nodes: visualization.data.nodes.map((node: { id: string; type: string; title: string; description?: string }) => ({
              ...node,
              width: 250,
              height: node.type === 'decision' ? 200 : undefined
            })),
            edges: visualization.data.edges
          });
          console.log('Flow chart layout created:', {
            nodes: flowLayout.nodes,
            edges: flowLayout.edges
          });
          setNodes(flowLayout.nodes);
          setEdges(flowLayout.edges);
          break;

        default:
          console.error('Unknown visualization type:', visualization.type);
          return;
      }
    } catch (error) {
      console.error('Error processing visualization:', error);
    }
  }, [visualization, setNodes, setEdges]);

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node<NodeData>) => {
    setSelectedNode(node);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const onNodeDoubleClick = useCallback((event: React.MouseEvent, node: Node<NodeData>) => {
    // Handle node double click if needed
  }, []);

  const handleAddNode = useCallback((type: string) => {
    const position = project({ x: 100, y: 100 });
    const newNode = {
      id: `${type}-${Date.now()}`,
      type,
      position,
      data: { label: `New ${type} node` }
    };
    setNodes((nds) => nds.concat(newNode));
  }, [project, setNodes]);

  const handleDeleteNode = useCallback(() => {
    if (selectedNode) {
      setNodes((nds) => nds.filter((node) => node.id !== selectedNode.id));
      setEdges((eds) => eds.filter((edge) => 
        edge.source !== selectedNode.id && edge.target !== selectedNode.id
      ));
      setSelectedNode(null);
    }
  }, [selectedNode, setNodes, setEdges]);

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

  const getNodeColor = useCallback((node: { data: NodeData }) => {
    const type = node.data?.type;
    switch (type) {
      case 'start':
        return '#22C55E';
      case 'end':
        return '#EF4444';
      case 'decision':
        return '#FFB547';
      default:
        return '#3B82F6';
    }
  }, []);

  return (
    <div className="w-full h-full relative" style={{ height: 'calc(100vh - 4rem)' }}>
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
        fitViewOptions={{ 
          padding: 0.2,
          minZoom: 0.5,
          maxZoom: 2
        }}
        minZoom={0.5}
        maxZoom={2}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        className="bg-background"
        style={{ width: '100%', height: '100%' }}
        onInit={(reactFlowInstance) => {
          console.log('ReactFlow initialized:', {
            nodes: reactFlowInstance.getNodes(),
            viewport: reactFlowInstance.getViewport(),
            nodeTypes: Object.keys(nodeTypes)
          });
          // Force a fit view after initialization
          setTimeout(() => {
            reactFlowInstance.fitView({ padding: 0.2 });
          }, 100);
        }}
      >
        <Background />
        <Controls />
        <MiniMap nodeColor={getNodeColor as any} />
        <Panel position="top-right" className="bg-white rounded-lg shadow-lg p-2 flex gap-2">
          {selectedNode && (
            <div>
              <h3>Selected: {selectedNode.data.title}</h3>
              <p>{selectedNode.data.description}</p>
            </div>
          )}
          <button
            onClick={handleDeleteNode}
            className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 size={16} />
            <span>Delete</span>
          </button>
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
    <div className="w-full h-full">
      <ReactFlowProvider>
        <CanvasContent {...props} />
      </ReactFlowProvider>
    </div>
  );
} 