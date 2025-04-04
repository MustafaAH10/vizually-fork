import { NextResponse } from 'next/server';
import OpenAI from 'openai';

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
    const { text } = await req.json();
    console.log('Received text:', text);

    // Step 1: Create assistant for determining visualization type
    const typeAssistant = await openai.beta.assistants.create({
      name: "Visualization Type Determiner",
      instructions: `You are an expert at determining the most appropriate visualization type for given text.
      Consider the following:
      1. Bar Chart: Best for comparing quantities across categories, showing numerical data, trends over time, or comparing values
      2. Mind Map: Best for hierarchical relationships and brainstorming
      3. Flow Chart: Best for processes, decisions, and sequences
      4. Venn Diagram: Best for showing relationships and overlaps between concepts
      
      Analyze the text and choose the most appropriate visualization type.
      Always respond in JSON format with the following structure:
      {
        "type": "barChart" | "mindMap" | "flowChart" | "vennDiagram",
        "reasoning": "string explaining your choice"
      }`,
      model: "gpt-4-turbo-preview",
      tools: [{ type: "function", function: determineVizTypeFunction }],
      response_format: { type: "json_object" }
    });

    // Create thread for type determination
    const typeThread = await openai.beta.threads.create();
    await openai.beta.threads.messages.create(typeThread.id, {
      role: "user",
      content: `Analyze this text and determine the best visualization type in JSON format: ${text}`
    });

    // Run type determination
    const typeRun = await openai.beta.threads.runs.create(typeThread.id, {
      assistant_id: typeAssistant.id
    });

    let typeRunStatus = await openai.beta.threads.runs.retrieve(typeThread.id, typeRun.id);
    let vizType = null;

    while (typeRunStatus.status !== 'completed') {
      if (typeRunStatus.status === 'requires_action') {
        const toolCalls = typeRunStatus.required_action?.submit_tool_outputs.tool_calls || [];
        if (toolCalls.length > 0) {
          const toolCall = toolCalls[0];
          if (toolCall.function?.name === 'determine_visualization_type') {
            vizType = JSON.parse(toolCall.function.arguments);
            console.log('Determined visualization type:', vizType);
          }
        }
        await openai.beta.threads.runs.submitToolOutputs(typeThread.id, typeRun.id, {
          tool_outputs: toolCalls.map(toolCall => ({
            tool_call_id: toolCall.id,
            output: "{}"
          }))
        });
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
      typeRunStatus = await openai.beta.threads.runs.retrieve(typeThread.id, typeRun.id);
    }

    if (!vizType) {
      throw new Error('Failed to determine visualization type');
    }

    // Step 2: Create assistant for generating visualization structure
    const structureAssistant = await openai.beta.assistants.create({
      name: "Visualization Structure Generator",
      instructions: `You are an expert at generating detailed visualization structures.
      Based on the determined visualization type, create a well-structured visualization with:
      1. Clear hierarchy and relationships
      2. Appropriate colors and styling
      3. Meaningful labels and descriptions
      4. Proper positioning and layout
      
      For bar charts:
      1. Extract numerical values and categories from the text
      2. Ensure values are properly formatted numbers
      3. Use clear, descriptive category labels
      4. Add a meaningful title and description
      5. Use appropriate colors (hex codes) that are visually pleasing
      
      Always respond in JSON format with the structure defined in the function schema.
      For bar charts, the response should look like:
      {
        "type": "barChart",
        "data": {
          "title": "Chart Title",
          "description": "Chart Description",
          "barChart": {
            "categories": ["Category 1", "Category 2", ...],
            "values": [value1, value2, ...],
            "colors": ["#hexcolor1", "#hexcolor2", ...]
          }
        }
      }`,
      model: "gpt-4-turbo-preview",
      tools: [{ type: "function", function: generateVizStructureFunction }],
      response_format: { type: "json_object" }
    });

    // Create thread for structure generation
    const structureThread = await openai.beta.threads.create();
    await openai.beta.threads.messages.create(structureThread.id, {
      role: "user",
      content: `Generate a ${vizType.type} visualization for the following text in JSON format: ${text}`
    });

    // Run structure generation
    const structureRun = await openai.beta.threads.runs.create(structureThread.id, {
      assistant_id: structureAssistant.id
    });

    let structureRunStatus = await openai.beta.threads.runs.retrieve(structureThread.id, structureRun.id);
    let visualizationData = null;

    while (structureRunStatus.status !== 'completed') {
      if (structureRunStatus.status === 'requires_action') {
        const toolCalls = structureRunStatus.required_action?.submit_tool_outputs.tool_calls || [];
        if (toolCalls.length > 0) {
          const toolCall = toolCalls[0];
          if (toolCall.function?.name === 'generate_visualization_structure') {
            visualizationData = JSON.parse(toolCall.function.arguments);
            console.log('Generated visualization data:', visualizationData);
          }
        }
        await openai.beta.threads.runs.submitToolOutputs(structureThread.id, structureRun.id, {
          tool_outputs: toolCalls.map(toolCall => ({
            tool_call_id: toolCall.id,
            output: "{}"
          }))
        });
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
      structureRunStatus = await openai.beta.threads.runs.retrieve(structureThread.id, structureRun.id);
    }

    if (!visualizationData) {
      throw new Error('Failed to generate visualization structure');
    }

    // Clean up
    await openai.beta.assistants.del(typeAssistant.id);
    await openai.beta.assistants.del(structureAssistant.id);
    await openai.beta.threads.del(typeThread.id);
    await openai.beta.threads.del(structureThread.id);

    return NextResponse.json({
      type: vizType.type,
      reasoning: vizType.reasoning,
      data: visualizationData.data
    });

  } catch (error) {
    console.error('Error in visualization API:', error);
    return NextResponse.json(
      { error: 'Failed to process visualization request', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 