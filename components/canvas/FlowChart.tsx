import { Node, Edge, MarkerType } from 'reactflow';
import { cn } from '../../lib/utils';

interface FlowChartNode {
  id: string;
  type: 'start' | 'process' | 'decision' | 'end';
  title: string;
  description?: string;
  width?: number;
  height?: number;
  color?: string;
}

interface FlowChartEdge {
  source: string;
  target: string;
  label?: string;
}

interface FlowChartData {
  nodes: FlowChartNode[];
  edges: FlowChartEdge[];
}

interface FlowChartLayout {
  nodes: Node[];
  edges: Edge[];
}

export function FlowChartNode({ data }: { data: any }) {
  console.log('Rendering FlowChartNode:', {
    type: data.type,
    title: data.title,
    description: data.description,
    width: data.width,
    height: data.height
  });

  const getNodeStyle = () => {
    const style = (() => {
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
    })();
    console.log('Node style:', { type: data.type, style });
    return style;
  };

  const getNodeShape = () => {
    const shape = (() => {
      switch (data.type) {
        case 'decision':
          return 'rotate-45';
        case 'start':
        case 'end':
          return 'rounded-full';
        default:
          return 'rounded-lg';
      }
    })();
    console.log('Node shape:', { type: data.type, shape });
    return shape;
  };

  // Calculate dimensions based on content and type
  const width = data.width || 250;
  const height = data.type === 'decision' ? (data.height || 200) : 'auto';
  const minHeight = data.type === 'decision' ? (data.height || 200) : 100;

  const nodeStyle = {
    width: `${width}px`,
    height: height === 'auto' ? 'auto' : `${height}px`,
    minHeight: `${minHeight}px`,
    backgroundColor: data.type === 'decision' ? 'transparent' : undefined,
    transform: data.type === 'decision' ? 'rotate(45deg)' : 'none',
    position: 'relative' as const,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible'
  };

  const contentStyle = {
    transform: data.type === 'decision' ? 'rotate(-45deg)' : 'none',
    maxWidth: data.type === 'decision' ? '70%' : '90%',
    position: 'relative' as const,
    zIndex: 2
  };

  // For decision nodes, add a diamond background
  const diamondStyle = data.type === 'decision' ? {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: `${data.color || '#FFB547'}33`,
    border: `2px solid ${data.color || '#FFB547'}`,
    transform: 'rotate(45deg)',
    zIndex: 1
  } : undefined;

  console.log('Node styles:', {
    nodeStyle,
    contentStyle,
    diamondStyle
  });

  return (
    <div
      className={cn(
        'shadow-lg',
        data.type !== 'decision' && 'border-2 border-gray-200',
        getNodeShape(),
        getNodeStyle()
      )}
      style={nodeStyle}
    >
      {data.type === 'decision' && <div style={diamondStyle} />}
      <div style={contentStyle}>
        <div className="text-center font-semibold mb-2 text-lg break-words">
          {data.title}
        </div>
        {data.description && (
          <div className="text-sm opacity-90 break-words">
            {data.description}
          </div>
        )}
      </div>
    </div>
  );
}

export function layoutFlowChart(data: FlowChartData): FlowChartLayout {
  console.log('Starting flow chart layout:', {
    nodeCount: data.nodes.length,
    edgeCount: data.edges.length,
    nodes: data.nodes.map(n => ({ id: n.id, type: n.type }))
  });

  // Increased spacing for better readability
  const VERTICAL_SPACING = 200; // Increased from 150
  const HORIZONTAL_SPACING = 400; // Increased from 300
  const START_Y = 100; // Increased from 50
  const MIN_NODE_WIDTH = 250;
  const MIN_NODE_HEIGHT = data.nodes.some(n => n.type === 'decision') ? 200 : 100;

  // Helper function to get node levels with improved level calculation
  const getNodeLevels = () => {
    console.log('Calculating node levels');
    const levels: { [key: string]: number } = {};
    const visited = new Set<string>();
    const inDegree: { [key: string]: number } = {};

    // Calculate in-degree for each node
    data.nodes.forEach(node => {
      inDegree[node.id] = data.edges.filter(e => e.target === node.id).length;
    });

    console.log('Node in-degrees:', inDegree);

    const findLevel = (nodeId: string, level: number) => {
      if (visited.has(nodeId)) {
        // Update level if we found a longer path
        if (level > levels[nodeId]) {
          levels[nodeId] = level;
          // Recalculate levels for all children
          const outgoingEdges = data.edges.filter(edge => edge.source === nodeId);
          outgoingEdges.forEach(edge => findLevel(edge.target, level + 1));
        }
        return;
      }

      visited.add(nodeId);
      levels[nodeId] = level;

      console.log('Processing node:', {
        nodeId,
        level,
        currentMaxLevel: levels[nodeId]
      });

      // Find all outgoing edges from this node
      const outgoingEdges = data.edges.filter(edge => edge.source === nodeId);
      console.log('Outgoing edges:', {
        nodeId,
        edgeCount: outgoingEdges.length,
        edges: outgoingEdges
      });

      // Sort children by their in-degree (nodes with more incoming edges go later)
      const sortedTargets = outgoingEdges
        .map(edge => ({
          target: edge.target,
          inDegree: inDegree[edge.target]
        }))
        .sort((a, b) => a.inDegree - b.inDegree)
        .map(item => item.target);

      sortedTargets.forEach(target => findLevel(target, level + 1));
    };

    // Find start nodes (nodes with no incoming edges)
    const startNodes = data.nodes.filter(node => inDegree[node.id] === 0);

    console.log('Start nodes:', {
      count: startNodes.length,
      nodes: startNodes.map(n => ({ id: n.id, type: n.type }))
    });

    // Start from each start node
    startNodes.forEach(node => findLevel(node.id, 0));

    console.log('Final node levels:', levels);
    return levels;
  };

  // Get node levels
  const levels = getNodeLevels();

  // Group nodes by level
  const nodesByLevel: { [level: number]: string[] } = {};
  Object.entries(levels).forEach(([nodeId, level]) => {
    if (!nodesByLevel[level]) nodesByLevel[level] = [];
    nodesByLevel[level].push(nodeId);
  });

  console.log('Nodes grouped by level:', nodesByLevel);

  // Calculate maximum nodes per level for centering
  const maxNodesInLevel = Math.max(...Object.values(nodesByLevel).map(nodes => nodes.length));
  const totalWidth = (maxNodesInLevel - 1) * HORIZONTAL_SPACING;
  const baseX = Math.max(500, totalWidth / 2);

  console.log('Layout dimensions:', {
    maxNodesInLevel,
    totalWidth,
    baseX
  });

  // Calculate node positions with improved centering
  const positions: { [key: string]: { x: number, y: number } } = {};
  Object.entries(nodesByLevel).forEach(([level, nodeIds]) => {
    const levelNum = parseInt(level);
    const y = START_Y + levelNum * VERTICAL_SPACING;
    
    // Center nodes horizontally in their level
    const levelWidth = (nodeIds.length - 1) * HORIZONTAL_SPACING;
    const startX = baseX - levelWidth / 2;
    
    console.log(`Calculating positions for level ${level}:`, {
      nodeCount: nodeIds.length,
      levelWidth,
      startX,
      y
    });

    nodeIds.forEach((nodeId, index) => {
      const node = data.nodes.find(n => n.id === nodeId);
      const isDecision = node?.type === 'decision';
      
      // Add slight offset for decision nodes to account for rotation
      const xOffset = isDecision ? HORIZONTAL_SPACING * 0.1 : 0;
      const yOffset = isDecision ? VERTICAL_SPACING * 0.1 : 0;

      positions[nodeId] = {
        x: startX + index * HORIZONTAL_SPACING + xOffset,
        y: y + yOffset
      };

      console.log(`Node position calculated:`, {
        nodeId,
        type: node?.type,
        position: positions[nodeId],
        isDecision,
        offsets: { x: xOffset, y: yOffset }
      });
    });
  });

  // Create nodes with positions and minimum dimensions
  const nodes = data.nodes.map(node => {
    const nodeData = {
      id: node.id,
      type: 'flowChart',
      position: positions[node.id],
      data: {
        title: node.title,
        description: node.description,
        type: node.type,
        width: MIN_NODE_WIDTH,
        height: node.type === 'decision' ? MIN_NODE_HEIGHT : undefined
      }
    };
    console.log('Created flow chart node:', nodeData);
    return nodeData;
  });

  // Create edges with improved routing
  const edges = data.edges.map((edge, index) => {
    const sourceNode = data.nodes.find(n => n.id === edge.source);
    const targetNode = data.nodes.find(n => n.id === edge.target);
    
    const edgeData = {
      id: `edge-${index}`,
      source: edge.source,
      target: edge.target,
      label: edge.label,
      type: 'smoothstep',
      animated: false,
      style: { stroke: '#64748b', strokeWidth: 2 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 20,
        height: 20,
        color: '#64748b'
      }
    };

    console.log('Created flow chart edge:', {
      ...edgeData,
      sourceType: sourceNode?.type,
      targetType: targetNode?.type
    });

    return edgeData;
  });

  console.log('Flow chart layout complete:', {
    nodeCount: nodes.length,
    edgeCount: edges.length,
    dimensions: {
      width: totalWidth + MIN_NODE_WIDTH,
      height: (Object.keys(nodesByLevel).length - 1) * VERTICAL_SPACING + START_Y + MIN_NODE_HEIGHT
    }
  });

  return { nodes, edges };
} 