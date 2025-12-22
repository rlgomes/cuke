import { type CukeWorld, Step } from '../index'

import { z } from 'zod'
import * as fs from 'node:fs/promises'
import { ChatGoogleGenerativeAI } from '@langchain/google-genai'
import { ChatOllama } from '@langchain/ollama'
import { HumanMessage } from '@langchain/core/messages'
import { StructuredOutputParser } from 'langchain/output_parsers'
import { RunnableSequence } from '@langchain/core/runnables'

const ImageAnalysisSchema = z.object({
  contains_animal: z.boolean().describe('True if the image contains an animal'),
  subject_description: z.string().describe('A concise 3-5 word description of the main subject'),
  dominant_colors: z.array(z.string()).describe('List of 3 dominant colors found in the image'),
  confidence_score: z.number().describe('Confidence score between 0 and 1')
})

type ImageAnalysis = z.infer<typeof ImageAnalysisSchema>;

type ModelProvider = 'gemini' | 'ollama';
type OutputMode = 'text' | 'json';

async function encodeImage(filePath: string): Promise<string> {
  try {
    const imageBuffer = await fs.readFile(filePath);
    const base64Image = imageBuffer.toString('base64');
    // Simple MIME type detection based on extension (basic implementation)
    const extension = filePath.split('.').pop()?.toLowerCase() || 'jpeg';
    const mimeType = extension === 'png' ? 'image/png' : 'image/jpeg';

    return `data:${mimeType};base64,${base64Image}`;
  } catch (error) {
    console.error(`Error reading image file: ${filePath}`, error);
    throw error;
  }
}

function createVisionModel(provider: ModelProvider) {
  if (provider === 'gemini') {
    // Requires GOOGLE_API_KEY environment variable
    return new ChatGoogleGenerativeAI({
      modelName: 'gemini-1.5-flash', // Fast and cheap vision model
      temperature: 0,
      maxRetries: 2,
    });
  } else {
    // Requires Ollama running locally (ollama serve)
    return new ChatOllama({
      model: 'llava', // Standard open-source vision model
      temperature: 0,
      baseUrl: 'http://localhost:11434',
    });
  }
}

// --- 3. Main Logic ---

async function runVisionTask(
  provider: ModelProvider,
  imagePath: string,
  promptText: string,
  mode: OutputMode
) {
  console.log(`\n--- Running ${provider.toUpperCase()} [Mode: ${mode.toUpperCase()}] ---`);

  const llm = createVisionModel(provider);
  const imageDataUri = await encodeImage(imagePath);

  // Construct content parts
  const contentParts: any[] = [
    { type: 'text', text: promptText },
    {
      type: 'image_url',
      image_url: {
        url: imageDataUri,
      },
    },
  ];

  try {
    if (mode === 'text') {
      const message = new HumanMessage({ content: contentParts });
      const response = await llm.invoke([message]);

      console.log('Raw Response:');
      console.log(response.content);

    } else {
      // --- Structured JSON Mode ---
      // We use StructuredOutputParser to generate format instructions.
      // This is more robust across different models (like Ollama) than function calling.
      
      const parser = StructuredOutputParser.fromZodSchema(ImageAnalysisSchema);
      const formatInstructions = parser.getFormatInstructions();

      // Append instructions to the text prompt so the model knows strict JSON is required
      contentParts[0].text = `${promptText}\n\nIMPORTANT: Return ONLY valid JSON.\n${formatInstructions}`;

      const message = new HumanMessage({ content: contentParts });

      // Create a runnable sequence: Model -> Parser
      const chain = RunnableSequence.from([llm, parser]);
      
      const result: ImageAnalysis = await chain.invoke([message]);

      console.log('Parsed JSON Object:');
      console.log(JSON.stringify(result, null, 2));
      
      // Example of type-safe access
      if (result.contains_animal) {
        console.log(`Found animal: ${result.subject_description}`);
      }
    }
  } catch (error) {
    console.error('Error during execution:', error);
  }
}

// --- 4. Execution Examples ---

(async () => {
  const imagePath = './test_image.jpg'; // Ensure this file exists

  // Example A: Simple Yes/No or Description via Gemini
  await runVisionTask(
    'gemini', 
    imagePath, 
    'Is there a person in this image? Answer with a simple 'Yes' or 'No'.', 
    'text'
  );

  // Example B: Deep extraction via Ollama (Local)
  // Note: Local vision models (like llava) can sometimes be chatty. 
  // The parser attempts to auto-fix invalid JSON if possible.
  await runVisionTask(
    'ollama', 
    imagePath, 
    'Analyze the image contents.', 
    'json'
  );
})();

Step('I ask AI to validte on screen the following:',
  async function (this: CukeWorld, prompt: string) {
    console.log(`prompt: ${prompt}`)
  })
