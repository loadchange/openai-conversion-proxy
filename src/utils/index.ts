export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const generativeModelMappings = (GPT35_TURBO: string, GPT4_TURBO: string, GPT4_VISION: string) => ({
    'gpt-4-0125-preview': GPT4_TURBO,
    'gpt-4-turbo-preview': GPT4_TURBO,
    'gpt-4-1106-preview': GPT4_TURBO,
    'gpt-4-vision-preview': GPT4_VISION,
    'gpt-4-1106-vision-preview': GPT4_VISION,
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
})