import { type CukeWorld, Step } from '../index'

import { type BaseChatModel } from '@langchain/core/language_models/chat_models'
import { HumanMessage, SystemMessage } from '@langchain/core/messages'
import { ChatGoogleGenerativeAI } from '@langchain/google-genai'
import { ChatOllama } from '@langchain/ollama'

type ModelProvider = 'gemini' | 'ollama'

process.env.LLM_PROVIDER = process.env.LLM_PROVIDER ?? 'ollama'
process.env.LLM_MODEL = process.env.LLM_MODEL ?? 'gemma3:4b'

function createVisionModel (provider: ModelProvider): BaseChatModel {
  if (provider === 'gemini') {
    return new ChatGoogleGenerativeAI({
      model: 'gemini-3-flash-preview',
      temperature: 0,
      maxRetries: 2
    })
  } else if (provider === 'ollama') {
    // Requires Ollama running locally (ollama serve)
    return new ChatOllama({
      model: process.env.LLM_MODEL,
      temperature: 0,
      baseUrl: 'http://localhost:11434'
    })
  }

  throw new Error(`unsupported model provider ${provider as string}`)
}

async function runPrompt (
  provider: ModelProvider,
  imageDataUri: string,
  promptText: string
): Promise<any> {
  const llm = createVisionModel(provider)

  // Construct content parts
  const contentParts: any[] = [
    { type: 'text', text: promptText },
    { type: 'image_url', image_url: { url: imageDataUri } }
  ]

  const systemMessage = new SystemMessage(`
  You are a Visual QA Automation Agent. Your task is to validate a list of assertions provided by the user against the provided UI screenshot.

  # INSTRUCTIONS
  1. Analyze the image visually, simulating how a human user reads the UI. Do not assume access to the underlying DOM or HTML.
  2. For each user-provided statement, determine if it is TRUE (visually supported) or FALSE (visually contradicted or missing).
  3. FILTER your output: You must return ONLY the statements that are determined to be FALSE.
  4. If a statement is TRUE, discard it.
  5. If ALL statements are TRUE, return an empty JSON array: [].

  # OUTPUT FORMAT
  You must respond with raw JSON only. Do not include Markdown formatting (\`\`\`json), explanations, or preambles.
  The output must be a JSON Array of Objects with the following schema:

  [
    {
      "statement": "The exact statement provided by the user",
      "explanation": "A concise description of why it failed (e.g., 'Button text says 'Login', not 'Submit'' or 'Element not found')"
    }
  ]
  `)
  const humanMessage = new HumanMessage({ content: contentParts })
  const response = await llm.invoke([systemMessage, humanMessage])
  return response
}

Step('I ask AI to validate on screen the following:',
  async function (this: CukeWorld, prompt: string) {
    const image = await this.browser.takeScreenshot()
    this.attach(image, 'base64:image/png')
    const base64Image = `data:image/png;base64,${image}`
    const response = await runPrompt(process.env.LLM_PROVIDER, base64Image, prompt)
    const jsonResponse = response.content.replace(/^```json\s*/i, '').replace(/\s*```$/, '')
    console.log(jsonResponse)
  })
