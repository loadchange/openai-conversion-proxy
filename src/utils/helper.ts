/**
 * Maps the generative model names to the actual model names
 * @param GPT35_TURBO The name of the GPT-3.5 Turbo model
 * @param GPT4_TURBO The name of the GPT-4 Turbo model
 * @param otherMapping Any other mappings to include
 * @returns A mapping of the generative model names to the actual model names
 */
export const generativeModelMappings = (GPT35_TURBO: string, GPT4_TURBO?: string, otherMapping?: any) => {
  if (!GPT4_TURBO) GPT4_TURBO = GPT35_TURBO;
  return {
    'gpt-4-turbo': GPT4_TURBO,
    'gpt-4-turbo-2024-04-09': GPT4_TURBO,
    'gpt-4-0125-preview': GPT4_TURBO,
    'gpt-4-turbo-preview': GPT4_TURBO,
    'gpt-4-1106-preview': GPT4_TURBO,
    'gpt-4': GPT4_TURBO,
    'gpt-4-0613': GPT4_TURBO,
    'gpt-4-32k': GPT4_TURBO,
    'gpt-4-32k-0613': GPT4_TURBO,
    'gpt-3.5-turbo-0125': GPT35_TURBO,
    'gpt-3.5-turbo': GPT35_TURBO,
    'gpt-3.5-turbo-1106': GPT35_TURBO,
    'gpt-3.5-turbo-instruct': GPT35_TURBO,
    'gpt-3.5-turbo-16k': GPT35_TURBO,
    'gpt-3.5-turbo-0613': GPT35_TURBO,
    'gpt-3.5-turbo-16k-0613': GPT35_TURBO,
    ...otherMapping,
  };
};

/**
 * Common query model list
 * @param modelsMapping
 * @returns
 */
export const models = async (modelsMapping: any) =>
  corsAllowed(
    new Response(
      JSON.stringify({
        object: 'list',
        data: Object.keys(modelsMapping).map((id) => ({
          id,
          object: 'model',
          created: 1710035972,
          owned_by: 'openai',
          permission: [
            {
              id: 'modelperm-M56FXnG1AsIr3SXq8BYPvXJA',
              object: 'model_permission',
              created: 1709949572,
              allow_create_engine: false,
              allow_sampling: true,
              allow_logprobs: true,
              allow_search_indices: false,
              allow_view: true,
              allow_fine_tuning: false,
              organization: '*',
              group: null,
              is_blocking: false,
            },
          ],
          root: id,
          parent: null,
        })),
      }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  );

export const gatherResponse = async (response: Response) => {
  const { headers } = response;
  const contentType = headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return await response.json();
  }
  return response.text();
};

/**
 * Array nonempty
 * @param arr
 * @returns
 */
export const isNotEmpty = <T>(arr: any): arr is T[] => Array.isArray(arr) && arr.length > 0;

/**
 * Return the length of the array
 * always return a number
 * anything that does not get the length of the array will get 0
 * @param obj
 * @returns
 */
export const listLen = (obj: any): number => (isNotEmpty(obj) ? obj.length : 0);

/**
 * safe JSON parse
 * @param str
 * @returns
 */
export const JSONParse = (str: string) => {
  try {
    return JSON.parse(str);
  } catch (error) {
    return Object.create(null);
  }
};

export function isJSON(str: any) {
  if (typeof str !== 'string') {
    return false;
  }
  str = str.trim();
  if ((str.startsWith('{') && str.endsWith('}')) || (str.startsWith('[') && str.endsWith(']'))) {
    try {
      JSON.parse(str);
      return true;
    } catch (e) {
      return false;
    }
  }
  return false;
}

export const requestFactory = (url: string) => (payload: any) => {
  if (['GET', 'HEAD'].includes(payload.method)) {
    delete payload.body;
  }
  return fetch(url, payload);
};
/**
 * Generates the payload body for OpenAI
 * @param method The HTTP method (default: 'POST')
 * @param token The authorization token
 * @param body The request body
 * @returns The payload object
 */
export const openAiPayload = ({ method = 'POST', token, body }: { method?: string; token: string; body: Record<string, any> }) => ({
  method,
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  },
  body: body && !['GET', 'HEAD'].includes(method) ? JSON.stringify(body) : undefined,
});

export const corsAllowed = (response: Response) => {
  const headers = new Headers(response.headers);
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Access-Control-Allow-Methods', '*');
  headers.set('Access-Control-Allow-Headers', '*');
  return new Response(response?.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
    cf: response.cf,
    webSocket: response.webSocket,
  });
};
