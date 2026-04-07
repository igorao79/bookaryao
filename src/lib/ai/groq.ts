import Groq from "groq-sdk";
import type { AIBookSuggestion } from "@/types";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});

const MODEL = "llama-3.3-70b-versatile";
const MAX_RETRIES = 3;

export async function getBookRecommendation(
  systemPrompt: string,
  userPrompt: string
): Promise<AIBookSuggestion> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await groq.chat.completions.create({
        model: MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 1024,
        response_format: { type: "json_object" },
      });

      const content = response.choices[0]?.message?.content;
      if (!content) throw new Error("Empty response from Groq");

      const parsed = JSON.parse(content) as AIBookSuggestion;

      if (!parsed.title || !parsed.searchQuery) {
        throw new Error("Invalid AI response: missing required fields");
      }

      return parsed;
    } catch (error) {
      lastError = error as Error;
      if (attempt < MAX_RETRIES - 1) {
        await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
      }
    }
  }

  throw lastError ?? new Error("Failed to get AI recommendation");
}
