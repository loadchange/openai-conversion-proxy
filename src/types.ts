type OPEN_AI_MODELS =
  | 'gpt-4o-2024-05-13'
  | 'gpt-4-turbo-2024-04-09'
  | 'gpt-4-1106-preview'
  | 'gpt-4o'
  | 'gpt-4-turbo'
  | 'gpt-4-0125-preview'
  | 'gpt-4-turbo-preview'
  | 'gpt-4o-mini-2024-07-18'
  | 'gpt-4o-mini'
  | 'gpt-4-0613'
  | 'gpt-4'
  | 'gpt-3.5-turbo'
  | 'gpt-3.5-turbo-instruct'
  | 'gpt-3.5-turbo-instruct-0914'
  | 'gpt-3.5-turbo-16k'
  | 'gpt-3.5-turbo-0125'
  | 'gpt-3.5-turbo-1106';

type IProxy = (action: string, body: any, env: Env, builtIn?: boolean) => Promise<Response>;

interface AzureDeploys {
  [key: string]: {
    deployName: string;
    resourceName: string;
    /**
     * Override the default values for all gpt3.5 models
     */
    gpt35Default?: boolean;
    /**
     * Override the default values for all gpt4 models
     */
    gpt4Default?: boolean;
  }
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
  AZURE_API_KEYS?: { [key: string]: string };
  AZURE_DEPLOY_NAME?: AzureDeploys;
  AZURE_API_VERSION?: string;
  AZURE_GATEWAY_URL?: string;

  /**
   * Groq Cloud Configuration
   * @website https://console.groq.com/docs/quickstart
   */
  GROQ_CLOUD_TOKEN: string;
  GROQ_GATEWAY_URL: string;

  /**
   * Deepseek Configuration
   * @website https://platform.deepseek.com/api_keys
   */
  DEEP_SEEK_TOKEN: string;

  /**
   * OpenAI Configuration
   * @website https://platform.openai.com/docs/api-reference
   */
  OPENAI_API_KEY: string;
  OPENAI_GATEWAY_URL?: string;

  /**
   * Coze Configuration
   * @website https://www.coze.cn/docs/developer_guides/coze_api_overview
   */
  COZE_CN_API_KEY: string;
  COZE_CN_BOT_IDS: CozeBot[];

  /**
   * Coze Configuration
   * @website https://www.coze.com/open
   */
  COZE_GLOBAL_API_KEY: string;
  COZE_GLOBAL_BOT_IDS: CozeBot[];

  /**
   * DeepInfra Configuration
   * @website https://deepinfra.com
   */
  DEEPINFRA_API_KEY: string;
  DEEPINFRA_DEPLOY_NAME: DeepinfraModel[];

  GOOGLE_API_KEY: string;
  GOOGLE_CSE_ID: string;
}
