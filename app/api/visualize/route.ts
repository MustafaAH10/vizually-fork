import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { text } = await req.json();
    console.log('Received text:', text);

    const prompt = `Analyze the following text and determine the best type of visualization for it. 
    For Venn diagrams, ensure each circle has:
    - A clear title
    - A list of unique items/characteristics
    - A distinct color (use: "#4299E1" for blue, "#48BB78" for green, "#ED8936" for orange)
    - Proper intersection labels showing shared characteristics

    Return a JSON object with the following structure:
    {
      "type": "vennDiagram",
      "data": {
        "circles": [
          {
            "id": string,
            "title": string,
            "items": string[],
            "color": string
          }
        ],
        "intersections": [
          {
            "id": string,
            "title": string,
            "circles": string[] // IDs of circles that form this intersection
          }
        ]
      }
    }

    For the Venn diagram:
    1. Each circle should have 3-5 unique characteristics
    2. Intersections should highlight meaningful shared traits
    3. Use clear, concise language
    4. Ensure logical grouping of related items
    5. Maintain consistent detail level across all circles

    Text to analyze: ${text}`;

    console.log('Sending prompt to OpenAI:', prompt);

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "You are a visualization expert. Analyze text and determine the best way to visualize it. Choose the most appropriate visualization type based on the content and relationships between concepts. Ensure proper positioning and styling for all elements."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
    });

    const visualizationData = JSON.parse(completion.choices[0].message.content || '{}');
    console.log('OpenAI response:', visualizationData);

    return NextResponse.json(visualizationData);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to process visualization request' },
      { status: 500 }
    );
  }
} 