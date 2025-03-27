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
    Return a JSON object with the following structure:
    {
      "type": "barChart" | "mindMap" | "flowChart",
      "data": {
        // For barChart: { chartData: [{ name: string, value: number }] }
        // For mindMap: { title: string, children: string[] }
        // For flowChart: { title: string, description: string }
      }
    }

    Text to analyze: ${text}`;

    console.log('Sending prompt to OpenAI:', prompt);

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "You are a visualization expert. Analyze text and determine the best way to visualize it."
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