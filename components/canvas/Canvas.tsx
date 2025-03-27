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
} from 'reactflow';
import 'reactflow/dist/style.css';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Define visualization types
export type VisualizationType = 'barChart' | 'mindMap' | 'flowChart';

// Define visualization data structure
export interface VisualizationData {
  type: VisualizationType;
  data: any;
  position: { x: number; y: number };
}

// Custom node types
const nodeTypes = {
  barChart: BarChartNode,
  mindMap: MindMapNode,
  flowChart: FlowChartNode,
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
    <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
      <div className="text-center font-semibold">{data.title}</div>
      {data.children && (
        <div className="mt-2 text-sm text-gray-600">
          {data.children.map((child: string, index: number) => (
            <div key={index} className="ml-4">• {child}</div>
          ))}
        </div>
      )}
    </div>
  );
}

// Flow Chart Node Component
function FlowChartNode({ data }: { data: any }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
      <div className="text-center font-semibold">{data.title}</div>
      {data.description && (
        <div className="mt-2 text-sm text-gray-600">{data.description}</div>
      )}
    </div>
  );
}

interface CanvasProps {
  visualization: VisualizationData | null;
}

export default function Canvas({ visualization }: CanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const nodeIdRef = useRef(0);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // Effect to handle new visualizations
  useEffect(() => {
    if (visualization) {
      console.log('Adding visualization to canvas:', visualization);
      
      // Create new node
      const newNode: Node = {
        id: `node-${++nodeIdRef.current}`,
        type: visualization.type,
        position: visualization.position,
        data: visualization.data,
      };

      // Add node to the canvas
      setNodes((nds) => {
        // Check if node with same data already exists
        const exists = nds.some(node => 
          node.type === newNode.type && 
          JSON.stringify(node.data) === JSON.stringify(newNode.data)
        );
        
        if (exists) {
          console.log('Node already exists, skipping');
          return nds;
        }
        
        return [...nds, newNode];
      });
    }
  }, [visualization, setNodes]);

  return (
    <div className="w-full h-[calc(100vh-4rem)]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
} 