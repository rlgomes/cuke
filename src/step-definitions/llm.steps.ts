import { type CukeWorld, Step } from '../index'

import { type BaseChatModel } from '@langchain/core/language_models/chat_models'
import { HumanMessage, SystemMessage } from '@langchain/core/messages'
import { ChatGoogleGenerativeAI } from '@langchain/google-genai'
import { ChatOllama } from '@langchain/ollama'

type ModelProvider = 'gemini' | 'ollama'

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
      model: 'gemma3:4b',
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
    const response = await runPrompt('ollama', base64Image, prompt)
    const jsonResponse = response.content.replace(/^```json\s*/i, '').replace(/\s*```$/, '')
    console.log(jsonResponse)
  })
