import OpenAI from 'openai';
import { OpenAIStream } from 'ai';
import { Tokens } from 'ai/react'
import { Suspense } from 'react';

// Optional, but recommended: run on the edge runtime.
// See https://vercel.com/docs/concepts/functions/edge-functions
export const runtime = 'edge';

const resource = process.env.AZURE_OPENAI_RESOURCE;
const model = process.env.AZURE_OPENAI_DEPLOYMENT;
const apiKey = process.env.AZURE_OPENAI_API_KEY;

const openai = new OpenAI({
    apiKey,
    baseURL: `https://${resource}.openai.azure.com/openai/deployments/${model}`,
    defaultQuery: { 'api-version': '2023-07-01-preview' },
    defaultHeaders: { 'api-key': apiKey },
  });

export default async function Page({
  searchParams,
}: {
  // note that using searchParams opts your page into dynamic rendering. See https://nextjs.org/docs/app/api-reference/file-conventions/page#searchparams-optional
  searchParams: Record<string, string>;
}) {
  // Request the OpenAI API for the response based on the prompt
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    stream: true,
    messages: [
      {
        role: 'user',
        content: searchParams['prompt'] ?? 'Give me code for generating a JSX button',
      },
    ],
  });

  // Convert the response into a friendly text-stream
  const stream = OpenAIStream(response);

  // const reader = stream.getReader();

  // We recursively render the stream as it comes in
  return (
    <Suspense>
      <Tokens stream={stream} />
      {/* <Reader reader={reader} /> */}
    </Suspense>
  );
}

async function Reader({ reader }: { reader: ReadableStreamDefaultReader<any> }) {
  const { done, value } = await reader.read();

  if (done) {
    return null;
  }

  const text = new TextDecoder().decode(value);

  return (
    <span>
      {text}
      <Suspense>
        <Reader reader={reader} />
      </Suspense>
    </span>
  );
}
