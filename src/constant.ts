export const options = new Response(null, {
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': '*',
    'Access-Control-Allow-Headers': '*',
  },
});

export const supportedModels = [
  'gpt-4o',
  'gpt-4o-2024-05-13',
  'gpt-4-0125-preview',
  'gpt-4-turbo-preview',
  'gpt-4-1106-preview',
  'gpt-4-vision-preview',
  'gpt-4-1106-vision-preview',
  'gpt-4',
  'gpt-4-0613',
  'gpt-4-32k',
  'gpt-4-32k-0613',
  'gpt-3.5-turbo-0125',
  'gpt-3.5-turbo',
  'gpt-3.5-turbo-1106',
  'gpt-3.5-turbo-instruct',
  'gpt-3.5-turbo-16k',
  'gpt-3.5-turbo-0613',
  'gpt-3.5-turbo-16k-0613',
];
