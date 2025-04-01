'use client';

import { useCallback, useState, useEffect, useRef } from 'react';
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
} from 'reactflow';
import 'reactflow/dist/style.css';
import '@/app/styles/canvas.css';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Trash2 } from 'lucide-react';
import CanvasToolbar from './CanvasToolbar';
import EditableNode from './EditableNode';
import html2canvas from 'html2canvas';

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

// Custom node types
const nodeTypes = {
  barChart: BarChartNode,
  mindMap: MindMapNode,
  flowChart: FlowChartNode,
  vennDiagram: VennDiagramNode,
  arrowDiagram: ArrowDiagramNode,
  cycleDiagram: CycleDiagramNode,
  hierarchyDiagram: HierarchyDiagramNode,
  editableNode: EditableNode,
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

// Mind Map Node Component
function MindMapNode({ data }: { data: any }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200 min-w-[200px] max-w-[300px]">
      <div className="text-center font-semibold mb-2 text-lg break-words">{data.title}</div>
      {data.children && (
        <div className="mt-2 text-sm text-gray-600 space-y-1">
          {data.children.map((child: string, index: number) => (
            <div key={index} className="ml-4 break-words">• {child}</div>
          ))}
        </div>
      )}
    </div>
  );
}

// Flow Chart Node Component
function FlowChartNode({ data }: { data: any }) {
  const getNodeStyle = () => {
    switch (data.type) {
      case 'start':
        return 'bg-green-500 text-white';
      case 'end':
        return 'bg-red-500 text-white';
      case 'decision':
        return 'bg-yellow-500 text-white';
      default:
        return 'bg-blue-500 text-white';
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

// Venn Diagram Node Component
function VennDiagramNode({ data }: { data: any }) {
  const getTextColor = () => {
    const color = data.color.toLowerCase();
    // For light colors, use dark text
    if (color.includes('yellow') || color.includes('lime') || color.includes('cyan')) {
      return 'text-gray-800';
    }
    return 'text-white';
  };

  return (
    <div 
      className={`absolute rounded-full shadow-lg border-2 border-white flex items-center justify-center ${getTextColor()}`}
      style={{
        width: data.radius * 2,
        height: data.radius * 2,
        backgroundColor: data.color,
        opacity: 0.6,
        mixBlendMode: 'multiply',
        zIndex: data.zIndex || 0,
        transform: `translate(-50%, -50%)`,
      }}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center p-4 font-semibold break-words w-[80%]">
          <div className="text-xl mb-2">{data.title}</div>
          {data.items && (
            <div className="text-sm space-y-1">
              {data.items.map((item: string, index: number) => (
                <div key={index} className="opacity-90">{item}</div>
              ))}
            </div>
          )}
        </div>
      </div>
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
  const { project, getNodes } = useReactFlow();
  const nodeIdRef = useRef(0);

  const onConnect = useCallback(
    (params: Connection) => {
      if (params.source && params.target) {
        const edge: Edge = {
          id: `edge-${Date.now()}`,
          source: params.source,
          target: params.target,
          sourceHandle: params.sourceHandle || null,
          targetHandle: params.targetHandle || null,
          type: 'smoothstep',
          animated: false,
          style: { stroke: '#b1b1b7', strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed },
          data: { editable: true }
        };
        setEdges((eds) => [...eds, edge]);
      }
    },
    [setEdges]
  );

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    event.stopPropagation();
    setSelectedNode(node);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

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

  const handleDeleteNode = useCallback(() => {
    if (selectedNode) {
      setNodes((nds) => nds.filter((node) => node.id !== selectedNode.id));
      setEdges((eds) => eds.filter((edge) => 
        edge.source !== selectedNode.id && edge.target !== selectedNode.id
      ));
      setSelectedNode(null);
    }
  }, [selectedNode, setNodes, setEdges]);

  // Effect to handle new visualizations
  useEffect(() => {
    if (visualization) {
      // Keep existing nodes and add new ones
      const existingNodes = getNodes();
      
      if (visualization.type === 'barChart') {
        const newNode: Node = {
          id: `node-${Date.now()}`,
          type: visualization.type,
          position: visualization.position || { x: Math.random() * 500, y: Math.random() * 500 },
          data: visualization.data,
        };
        setNodes((nds) => [...nds, newNode]);
      } else if (visualization.type === 'vennDiagram') {
        // Handle Venn diagram visualization
        const { circles, intersections } = visualization.data;
        
        // Calculate center position
        const centerX = 400;
        const centerY = 300;
        
        // Transform circles to nodes with proper positioning
        const circleNodes: Node[] = circles.map((circle: any, index: number) => {
          let position;
          const radius = 150; // Base radius for circles
          
          switch (circles.length) {
            case 2:
              // Two circles side by side with overlap
              position = index === 0 
                ? { x: centerX - radius/2, y: centerY }
                : { x: centerX + radius/2, y: centerY };
              break;
            case 3:
              // Three circles in triangular arrangement
              const angle = (2 * Math.PI * index) / 3 - Math.PI / 2;
              position = {
                x: centerX + radius * Math.cos(angle) * 0.7,
                y: centerY + radius * Math.sin(angle) * 0.7
              };
              break;
            default:
              position = { x: centerX, y: centerY };
          }

          return {
            id: circle.id,
            type: 'vennDiagram',
            position: position,
            data: {
              ...circle,
              radius: radius,
              zIndex: 1,
            },
          };
        });

        // Transform intersections to nodes
        const intersectionNodes: Node[] = intersections.map((intersection: any) => ({
          id: intersection.id,
          type: 'default',
          position: {
            x: centerX,
            y: centerY,
          },
          style: {
            zIndex: 2,
          },
          data: {
            label: intersection.title,
            className: 'bg-white px-2 py-1 rounded text-sm shadow-md',
          },
        }));

        setNodes((nds) => [...existingNodes, ...circleNodes, ...intersectionNodes]);
        setEdges([]);
      } else if (visualization.type === 'arrowDiagram') {
        // Handle arrow diagram visualization
        const { nodes: newNodes, arrows } = visualization.data;
        
        const transformedNodes: Node[] = newNodes.map((node: any) => ({
          id: node.id,
          type: 'arrowDiagram',
          position: node.position,
          data: node,
        }));

        const transformedEdges: Edge[] = arrows.map((arrow: any) => ({
          id: `${arrow.source}-${arrow.target}`,
          source: arrow.source,
          target: arrow.target,
          label: arrow.label,
          type: arrow.type || 'straight',
          animated: arrow.type === 'dashed',
          style: {
            stroke: '#b1b1b7',
            strokeWidth: arrow.type === 'dashed' ? 2 : 1,
            strokeDasharray: arrow.type === 'dashed' ? '5,5' : undefined,
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 20,
            height: 20,
            color: '#b1b1b7',
          },
          labelStyle: {
            fill: '#b1b1b7',
            fontWeight: 500,
            fontSize: 12,
            background: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
          },
        }));

        setNodes(transformedNodes);
        setEdges(transformedEdges);
      } else if (visualization.type === 'cycleDiagram') {
        // Handle cycle diagram visualization
        const { nodes: newNodes, edges: newEdges } = visualization.data;
        
        const transformedNodes: Node[] = newNodes.map((node: any) => ({
          id: node.id,
          type: 'cycleDiagram',
          position: node.position,
          data: node,
        }));

        const transformedEdges: Edge[] = newEdges.map((edge: any) => ({
          id: `${edge.source}-${edge.target}`,
          source: edge.source,
          target: edge.target,
          label: edge.label,
          type: 'curved',
          animated: true,
          style: {
            stroke: '#b1b1b7',
            strokeWidth: 2,
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 20,
            height: 20,
            color: '#b1b1b7',
          },
          labelStyle: {
            fill: '#b1b1b7',
            fontWeight: 500,
            fontSize: 12,
            background: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
          },
        }));

        setNodes(transformedNodes);
        setEdges(transformedEdges);
      } else if (visualization.type === 'hierarchyDiagram') {
        // Handle hierarchy diagram visualization
        const { nodes: newNodes, edges: newEdges } = visualization.data;
        
        const transformedNodes: Node[] = newNodes.map((node: any) => ({
          id: node.id,
          type: 'hierarchyDiagram',
          position: node.position,
          data: node,
        }));

        const transformedEdges: Edge[] = newEdges.map((edge: any) => ({
          id: `${edge.source}-${edge.target}`,
          source: edge.source,
          target: edge.target,
          label: edge.label,
          type: 'straight',
          style: {
            stroke: '#b1b1b7',
            strokeWidth: 2,
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 20,
            height: 20,
            color: '#b1b1b7',
          },
          labelStyle: {
            fill: '#b1b1b7',
            fontWeight: 500,
            fontSize: 12,
            background: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
          },
        }));

        setNodes(transformedNodes);
        setEdges(transformedEdges);
      } else if (visualization.type === 'mindMap' || visualization.type === 'flowChart') {
        // Handle mind map and flowchart visualizations
        const { nodes: newNodes, edges: newEdges } = visualization.data;
        
        const transformedNodes: Node[] = newNodes.map((node: any) => ({
          id: node.id,
          type: visualization.type,
          position: node.position,
          data: {
            title: node.title,
            description: node.description,
            children: node.children,
            type: node.type,
          },
        }));

        // Common edge styling
        const getEdgeStyle = (type: string, animated: boolean = false) => ({
          stroke: '#b1b1b7',
          strokeWidth: type === 'dashed' ? 2 : 1,
          strokeDasharray: type === 'dashed' ? '5,5' : undefined,
        });

        const getEdgeLabelStyle = () => ({
          fill: '#b1b1b7',
          fontWeight: 500,
          fontSize: 12,
          background: 'white',
          padding: '4px 8px',
          borderRadius: '4px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        });

        const getEdgeMarker = () => ({
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20,
          color: '#b1b1b7',
        });

        // Update all edge transformations to use these styles
        const transformedEdges: Edge[] = newEdges.map((edge: any) => ({
          id: `${edge.source}-${edge.target}`,
          source: edge.source,
          target: edge.target,
          label: edge.label,
          type: edge.type || 'smoothstep',
          animated: edge.animated || false,
          style: getEdgeStyle(edge.type, edge.animated),
          markerEnd: getEdgeMarker(),
          labelStyle: getEdgeLabelStyle(),
        }));

        setNodes((nds) => [...existingNodes, ...transformedNodes]);
        setEdges((eds) => [...eds, ...transformedEdges]);
      }
    }
  }, [visualization, setNodes, setEdges, getNodes]);

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
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onNodeDoubleClick={onNodeDoubleClick}
        nodeTypes={nodeTypes}
        fitView
        snapToGrid
        snapGrid={[20, 20]}
        deleteKeyCode="Delete"
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

export default function Canvas(props: CanvasProps) {
  return (
    <ReactFlowProvider>
      <CanvasContent {...props} />
    </ReactFlowProvider>
  );
} 