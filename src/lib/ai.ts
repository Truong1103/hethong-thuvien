import { geminiChatCompletion } from "@/lib/gemini";
import { openaiChatCompletion } from "@/lib/openai";

type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

/**
 * Ưu tiên Gemini (GEMINI_API_KEY), fallback OpenAI (OPENAI_API_KEY).
 * Tóm tắt / chat / giải thích đều đi qua hàm này.
 */
export async function aiChatCompletion(
  messages: ChatMessage[],
  opts?: { max_tokens?: number; temperature?: number },
) {
  if (process.env.GEMINI_API_KEY?.trim()) return geminiChatCompletion(messages, opts);
  if (process.env.OPENAI_API_KEY?.trim()) return openaiChatCompletion(messages, opts);
  throw new Error("Thiếu GEMINI_API_KEY hoặc OPENAI_API_KEY");
}
