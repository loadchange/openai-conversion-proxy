type OPEN_AI_MODELS =
  | 'gpt-4-turbo-2024-04-09'
  | 'gpt-4-0125-preview'
  | 'gpt-4-turbo-preview'
  | 'gpt-4-1106-preview'
  | 'gpt-4-vision-preview'
  | 'gpt-4-1106-vision-preview'
  | 'gpt-4'
  | 'gpt-4-0613'
  | 'gpt-4-32k'
  | 'gpt-4-32k-0613'
  | 'gpt-3.5-turbo-0125'
  | 'gpt-3.5-turbo'
  | 'gpt-3.5-turbo-1106'
  | 'gpt-3.5-turbo-instruct'
  | 'gpt-3.5-turbo-16k'
  | 'gpt-3.5-turbo-0613'
  | 'gpt-3.5-turbo-16k-0613';

type IProxy = (action: string, body: any, env: Env, builtIn?: boolean) => Promise<Response>;

interface AzureKey {
  resourceName: string;
  token: string;
  default?: boolean;
  models?: string[];
}
interface AzureDeployName {
  deployName: string;
  modelName: string;
  /**
   * Override the default values for all gpt3.5 models
   */
  gpt35Default?: boolean;
  /**
   * Override the default values for all gpt4 models
   */
  gpt4Default?: boolean;
}

interface CozeBot {
  botId: string;
  modelName: string;
  gpt35Default?: boolean;
  gpt4Default?: boolean;
}

interface DeepinfraModel {
  modelName: string;
  alias?: string;
  gpt35Default?: boolean;
  gpt4Default?: boolean;
}

interface Env {
  /**
   * The key to be used for the custom key
   * For example, if the key is `sk-xxxxxx##azure`, the service provider is `azure`, the service will route to the Azure service
   */
  CUSTOM_KEY: string;

  /**
   * Azure Configuration
   * @website https://azure.com
   */
  AZURE_API_KEYS?: AzureKey[];
  AZURE_DEPLOY_NAME?: AzureDeployName[];
  AZURE_API_VERSION?: string;
  AZURE_GATEWAY_URL?: string;

  /**
   * Groq Cloud Configuration
   * @website https://console.groq.com/docs/quickstart
   */
  GROQ_CLOUD_TOKEN: string;

  /**
   * OpenAI Configuration
   * @website https://platform.openai.com/docs/api-reference
   */
  OPENAI_API_KEY: string;
  OPENAI_GATEWAY_URL?: string;

  /**
   * Coze Configuration
   * @website https://www.coze.com/open
   */
  COZE_API_KEY: string;
  COZE_BOT_IDS: CozeBot[];

  /**
   * DeepInfra Configuration
   * @website https://deepinfra.com
   */
  DEEPINFRA_API_KEY: string;
  DEEPINFRA_DEPLOY_NAME: DeepinfraModel[];

  GOOGLE_API_KEY: string;
  GOOGLE_CSE_ID: string;
}
