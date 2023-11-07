import { StreamingTextResponse, LangChainStream } from "ai";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { AIMessage, HumanMessage } from "langchain/schema";
import { ConsoleCallbackHandler } from "langchain/callbacks";
export const runtime = "edge";

const instanceName = process.env.AZURE_OPENAI_RESOURCE;
const deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT;
const apiKey = process.env.AZURE_OPENAI_API_KEY;

export async function POST(req: Request) {
  const { messages } = await req.json();
  const { stream, handlers, writer } = LangChainStream();

  const llm = new ChatOpenAI({
    streaming: true,
    azureOpenAIApiKey: apiKey,
    azureOpenAIApiInstanceName: instanceName,
    azureOpenAIApiDeploymentName: deploymentName,
    azureOpenAIApiVersion: "2023-07-01-preview",
    temperature: 0.7,

    callbacks: [new ConsoleCallbackHandler()],

    verbose: true,
  });

  llm
    .call(
      messages.map((m: any) => (m.role == "user" ? new HumanMessage(m.content) : new AIMessage(m.content))),
      {},
      [handlers]
    )
    .catch(console.error);

  return new StreamingTextResponse(stream);
}
