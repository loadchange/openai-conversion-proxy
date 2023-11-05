// ./app/api/chat/route.ts
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

// IMPORTANT! Set the runtime to edge
export const runtime = 'edge';

export async function POST(req: Request) {
  // Extract the `prompt` from the body of the request
  const { messages } = await req.json();

  // Ask OpenAI for a streaming chat completion given the prompt
  const [error, response] = await to<any>(
    openai.chat.completions.create({
      model: 'gpt-4',
      stream: true,
      messages: messages,
    })
  );

  if (error) {
    console.error(error);
    return new Response('恐怕我帮不上忙，我只是一个语言模型，不能理解或回复你的这个问题。');
  }

  // Convert the response into a friendly text-stream
  const stream = OpenAIStream(response);
  // Respond with the stream
  return new StreamingTextResponse(stream);
}
