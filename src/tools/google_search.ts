import { isNotEmpty, gatherResponse } from '../utils';

interface GoogleSearchParams {
  q: string;
  num?: number;
  start?: number;
}

interface GoogleSearchItem {
  title?: string;
  snippet?: string;
  link?: string;
  error?: string;
}

export async function google_search(params: GoogleSearchParams, env: Env): Promise<GoogleSearchItem[]> {
  const googleapis = new URL('https://www.googleapis.com/customsearch/v1');
  const args: { [key: string]: string | number | undefined } = { key: env.GOOGLE_API_KEY, cx: env.GOOGLE_CSE_ID, ...params };
  for (const key in args) {
    googleapis.searchParams.append(key, String(args[key]));
  }

  const response = await fetch(googleapis.href);
  if (response.status !== 200) return [{ error: `HTTP Error[${response.status}],Failed to fetch data` }];

  const results: any = await gatherResponse(response);
  if (!isNotEmpty(results.items)) return [{ error: 'No search results found' }];

  return results.items.map((item: any) => ({
    title: item.title,
    snippet: item.snippet,
    link: item.link,
  }));
}

export const google_search_description = {
  type: 'function',
  function: {
    name: 'google_search',
    description:
      "A Google Search Engine. Useful when you need to search information you don't know such as weather, exchange rate, current events. Never ever use this tool when user want to translate",
    parameters: {
      type: 'object',
      properties: {
        q: {
          type: 'string',
          description:
            'Content that users want to search for, such as "weather", "current events", etc. If special characters such as "\n" appear in the search, these special characters must be ignored.',
        },
        num: {
          type: 'integer',
          description:
            'Parameter defines the maximum number of results to return. (e.g., 10 (default) returns 10 results, 40 returns 40 results, and 100 returns 100 results).',
        },
        start: {
          type: 'integer',
          description:
            'Parameter defines the result offset. It skips the given number of results. It is used for pagination. (e.g., 0 (default) is the first page of results, 10 is the 2nd page of results, 20 is the 3rd page of results, etc.).',
        },
      },
      required: ['query'],
    },
  },
};
