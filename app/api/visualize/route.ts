import { NextResponse } from 'next/server';
import OpenAI from 'openai';

interface BaseVisualizationData {
  title: string;
  description: string;
}

interface VennDiagramData extends BaseVisualizationData {
  circles: Array<{
    id: string;
    title: string;
    description: string;
    items: string[];
  }>;
}

interface BarChartData extends BaseVisualizationData {
  categories: string[];
  values: number[];
  colors?: string[];
}

interface FlowChartData extends BaseVisualizationData {
  nodes: Array<{
    id: string;
    type: 'start' | 'process' | 'decision' | 'end';
    title: string;
    description: string;
  }>;
  edges: Array<{
    source: string;
    target: string;
    label: string;
  }>;
}

interface MindMapData extends BaseVisualizationData {
  mindMap: {
    root: {
      id: string;
      title: string;
      description: string;
      children: Array<{
        id: string;
        title: string;
        description: string;
      }>;
    };
  };
}

type VisualizationData = VennDiagramData | BarChartData | FlowChartData | MindMapData;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Step 1: Determine visualization type
const determineVizTypeFunction = {
  name: "determine_visualization_type",
  description: "Determine the most appropriate visualization type for the given text",
  parameters: {
    type: "object",
    properties: {
      type: {
        type: "string",
        enum: ["barChart", "mindMap", "flowChart", "vennDiagram"],
        description: "The type of visualization that best fits the input text"
      },
      reasoning: {
        type: "string",
        description: "Explanation of why this visualization type was chosen"
      }
    },
    required: ["type", "reasoning"]
  }
};

// Step 2: Generate specific visualization structure
const generateVizStructureFunction = {
  name: "generate_visualization_structure",
  description: "Generate the specific structure for the chosen visualization type",
  parameters: {
    type: "object",
    properties: {
      type: {
        type: "string",
        enum: ["barChart", "mindMap", "flowChart", "vennDiagram"],
        description: "The type of visualization to generate"
      },
      data: {
        type: "object",
        properties: {
          title: { type: "string" },
          description: { type: "string" },
          mindMap: {
            type: "object",
            properties: {
              root: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  children: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        description: { type: "string" }
                      }
                    }
                  }
                },
                required: ["title", "children"]
              }
            },
            required: ["root"]
          },
          barChart: {
            type: "object",
            properties: {
              categories: {
                type: "array",
                items: { type: "string" },
                description: "The categories for the bar chart"
              },
              values: {
                type: "array",
                items: { type: "number" },
                description: "The values corresponding to each category"
              },
              colors: {
                type: "array",
                items: { type: "string" },
                description: "Optional color for each bar (hex codes)"
              }
            },
            required: ["categories", "values"]
          },
          vennDiagram: {
            type: "object",
            properties: {
              circles: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    title: { type: "string" },
                    description: { type: "string" },
                    color: { type: "string" },
                    radius: { type: "number" },
                    zIndex: { type: "number" },
                    items: { type: "array", items: { type: "string" } }
                  }
                }
              }
            }
          }
        },
        required: ["title", "description"]
      }
    },
    required: ["type", "data"]
  }
};

export async function POST(req: Request) {
  try {
    const { threadId, message, type } = await req.json();

    if (!threadId || !message) {
      return NextResponse.json(
        { error: 'Thread ID and message are required' },
        { status: 400 }
      );
    }

    console.log('Generating visualization for message:', message);
    console.log('Requested type:', type);

    // Run the visualization assistant
    const vizRun = await openai.beta.threads.runs.create(threadId, {
      assistant_id: process.env.OPENAI_VISUALIZATION_ASSISTANT_ID!,
      additional_instructions: type ? `Generate a ${type} visualization.` : undefined
    });

    // Wait for the visualization run to complete
    let vizRunStatus = await openai.beta.threads.runs.retrieve(threadId, vizRun.id);
    while (vizRunStatus.status !== 'completed') {
      await new Promise(resolve => setTimeout(resolve, 1000));
      vizRunStatus = await openai.beta.threads.runs.retrieve(threadId, vizRun.id);
    }

    // Get the visualization data
    const vizMessages = await openai.beta.threads.messages.list(threadId);
    const vizMessage = vizMessages.data[0].content[0];
    const vizContent = 'text' in vizMessage ? vizMessage.text.value : '{}';
    
    console.log('Raw visualization data:', vizContent);

    try {
      const vizData = JSON.parse(vizContent);
      console.log('Parsed visualization data:', vizData);
      
      // Transform the data structure based on visualization type
      let transformedData: VisualizationData = {
        title: vizData.data.title,
        description: vizData.data.description
      } as VisualizationData;

      if (vizData.type === 'vennDiagram' && vizData.data.vennDiagram) {
        transformedData = {
          ...transformedData,
          circles: vizData.data.vennDiagram.circles
        } as VennDiagramData;
      } else if (vizData.type === 'barChart' && vizData.data.barChart) {
        transformedData = {
          ...transformedData,
          categories: vizData.data.barChart.categories,
          values: vizData.data.barChart.values,
          colors: vizData.data.barChart.colors
        } as BarChartData;
      } else if (vizData.type === 'flowChart' && vizData.data.flowChart) {
        transformedData = {
          ...transformedData,
          nodes: vizData.data.flowChart.nodes,
          edges: vizData.data.flowChart.edges
        } as FlowChartData;
      } else if (vizData.type === 'mindMap' && vizData.data.mindMap) {
        transformedData = {
          ...transformedData,
          mindMap: {
            root: {
              id: 'root',
              title: vizData.data.mindMap.root.title,
              description: vizData.data.mindMap.root.description,
              children: vizData.data.mindMap.root.children.map((child: any, index: number) => ({
                id: `child-${index}`,
                title: child.title,
                description: child.description
              }))
            }
          }
        } as MindMapData;
      }

      console.log('Transformed data:', transformedData);
      
      return NextResponse.json({
        visualization: {
          type: type || vizData.type,
          data: transformedData,
          position: { x: 0, y: 0 }
        }
      });
    } catch (error) {
      console.error('Error parsing visualization data:', error);
      return NextResponse.json(
        { error: 'Failed to parse visualization data' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error in visualization API:', error);
    return NextResponse.json(
      { error: 'Failed to generate visualization' },
      { status: 500 }
    );
  }
} 