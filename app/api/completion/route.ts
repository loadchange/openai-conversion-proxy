import OpenAI from 'openai';
import { OpenAIStream, StreamingTextResponse } from 'ai';
import { to } from 'await-to-js';

const resource = process.env.AZURE_OPENAI_RESOURCE;
const model = process.env.AZURE_OPENAI_DEPLOYMENT;

const apiKey = process.env.AZURE_OPENAI_API_KEY;
if (!apiKey) {
  throw new Error('AZURE_OPENAI_API_KEY is missing from the environment.');
}

// Azure OpenAI requires a custom baseURL, api-version query param, and api-key header.
const openai = new OpenAI({
  apiKey,
  baseURL: `https://${resource}.openai.azure.com/openai/deployments/${model}`,
  defaultQuery: { 'api-version': '2023-07-01-preview' },
  defaultHeaders: { 'api-key': apiKey },
});

export const runtime = 'edge';

export async function POST(req: Request) {
  // Extract the `prompt` from the body of the request
  const { prompt } = await req.json();

  // Request the OpenAI API for the response based on the prompt
  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    stream: true,
    // a precise prompt is important for the AI to reply with the correct tokens
    messages: [
      {
        role: 'user',
        content: `Given the following post content, detect if it has typo or not. 
Respond with a JSON array of typos [["typo1", "correct1], ["typo2", "correct2"], ...] or an empty [] if there's none. Only respond with an array. Post content:
${prompt}
        
Output:\n`,
      },
    ],
    max_tokens: 200,
    temperature: 0, // you want absolute certainty for spell check
    top_p: 1,
    frequency_penalty: 1,
    presence_penalty: 1,
  });

  const stream = OpenAIStream(response);

  return new StreamingTextResponse(stream);
}
