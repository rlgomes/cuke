import { type CukeWorld, Step } from '../index'

import { type BaseChatModel } from '@langchain/core/language_models/chat_models'
import { HumanMessage, SystemMessage } from '@langchain/core/messages'
import { ChatGoogleGenerativeAI } from '@langchain/google-genai'
import { ChatOllama } from '@langchain/ollama'

type ModelProvider = 'gemini' | 'ollama'

process.env.LLM_PROVIDER = process.env.LLM_PROVIDER ?? 'ollama'
// smallest and most accurate local vission LLM
process.env.LLM_MODEL = process.env.LLM_MODEL ?? 'minicpm-v:8B'

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
      numCtx: 8 * 1024,
      temperature: 0,
      baseUrl: 'http://localhost:11434'
    })
  }

  throw new Error(`unsupported model provider ${provider as string}`)
}

async function runPrompt (
  provider: ModelProvider,
  imageDataUri: string,
  systemPrompt: string,
  userPrompt: string
): Promise<any> {
  const llm = createVisionModel(provider)

  const contentParts: any[] = [
    { type: 'text', text: userPrompt },
    { type: 'image_url', image_url: { url: imageDataUri } }
  ]

  const systemMessage = new SystemMessage(systemPrompt)
  const humanMessage = new HumanMessage({ content: contentParts })
  const response = await llm.invoke([systemMessage, humanMessage])
  return response
}

Step('I ask AI to validate on screen the following:',
  async function (this: CukeWorld, prompt: string) {
    const image = await this.browser.takeScreenshot()
    this.attach(image, 'base64:image/png')
    const base64Image = `data:image/png;base64,${image}`
    const response = await runPrompt(
      process.env.LLM_PROVIDER,
      base64Image,
      `
      You are a UI Quality Assurance Auditor and your sole task is to verify if a
      set of user-statements are visually true or false.

      Return a JSON array of the user-statements that were evaluated with the
      following schema:
      [
        {
          "assertion": "The original text provided by the user",
          "reasoning": "A brief, one-sentence explanation of the reasoning",
          "result": "true" | "false",
        }
      ] 

      IF no statements are found to be true then you can return an empty array
      like so: []

      IF no statements are found to be false then you can return an empty array
      like so: []
      `,
      prompt)
    const jsonString = response.content.replace(/^\s*```json/i, '').replace(/```\s*$/, '')
    const jsonResponse: any[] = JSON.parse(jsonString)

    for (let index = 0; index < jsonResponse.length; index++) {
      const validation: any = jsonResponse[index]

      if (validation.result !== 'true') {
        throw new Error(validation.reasoning)
      }
    }
  })

Step('I ask AI to examine the current page and respond to the following:',
  async function (this: CukeWorld, prompt: string) {
    const image = await this.browser.takeScreenshot()
    this.attach(image, 'base64:image/png')
    const base64Image = `data:image/png;base64,${image}`
    const response = await runPrompt(
      process.env.LLM_PROVIDER,
      base64Image,
      '',
      prompt)
    const jsonResponse = response.content.replace(/^```json\s*/i, '').replace(/\s*```$/, '')
    console.log(jsonResponse)
  })
