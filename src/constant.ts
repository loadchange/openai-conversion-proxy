export const options = new Response(null, {
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': '*',
    'Access-Control-Allow-Headers': '*',
  },
});

export const supportedModels = [
  'gpt-4o-2024-05-13',
  'gpt-4-turbo-2024-04-09',
  'gpt-4-1106-preview',
  'gpt-4o',
  'gpt-4-turbo',
  'gpt-4-0125-preview',
  'gpt-4-turbo-preview',
  'gpt-4o-mini-2024-07-18',
  'gpt-4o-mini',
  'gpt-4-0613',
  'gpt-4',
  'gpt-3.5-turbo',
  'gpt-3.5-turbo-instruct',
  'gpt-3.5-turbo-instruct-0914',
  'gpt-3.5-turbo-16k',
  'gpt-3.5-turbo-0125',
  'gpt-3.5-turbo-1106',
];
