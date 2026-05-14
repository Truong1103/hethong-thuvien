type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

/** Model mặc định: Gemini 2.5 Flash (Google AI). Ghi đè bằng GEMINI_MODEL nếu cần. */
const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash";

export async function geminiChatCompletion(
  messages: ChatMessage[],
  opts?: { max_tokens?: number; temperature?: number },
) {
  const key = process.env.GEMINI_API_KEY?.trim();
  if (!key) throw new Error("Thiếu GEMINI_API_KEY");

  const model = (process.env.GEMINI_MODEL ?? DEFAULT_GEMINI_MODEL).trim();
  const systemTexts: string[] = [];
  const contents: { role: string; parts: { text: string }[] }[] = [];

  for (const m of messages) {
    if (m.role === "system") {
      systemTexts.push(m.content);
      continue;
    }
    const role = m.role === "assistant" ? "model" : "user";
    contents.push({ role, parts: [{ text: m.content }] });
  }

  if (contents.length === 0) {
    throw new Error("Gemini: cần ít nhất một tin nhắn user/assistant");
  }

  // Gemini 2.5: thinking mặc định ăn maxOutputTokens → cần tắt hoặc tăng rất cao, nếu không phần trả lời bị cắt cực ngắn.
  const maxOut = opts?.max_tokens ?? 4096;
  const generationConfig: Record<string, unknown> = {
    maxOutputTokens: maxOut,
    temperature: opts?.temperature ?? 0.5,
  };
  if (/gemini-2\.5|gemini-3/i.test(model)) {
    generationConfig.thinkingConfig = { thinkingBudget: 0 };
  }

  const body: Record<string, unknown> = {
    contents,
    generationConfig,
  };

  if (systemTexts.length > 0) {
    body.systemInstruction = { parts: systemTexts.map((text) => ({ text })) };
  }

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": key,
      },
      body: JSON.stringify(body),
    },
  );

  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Gemini: ${t.slice(0, 400)}`);
  }

  const json = (await res.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    error?: { message?: string };
    promptFeedback?: { blockReason?: string };
  };

  if (json.error?.message) throw new Error(`Gemini: ${json.error.message}`);

  const text = json.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("")?.trim();
  if (!text) {
    const block = json.promptFeedback?.blockReason;
    throw new Error(
      block
        ? `Gemini không trả nội dung (blockReason: ${block}).`
        : "Gemini không trả nội dung (có thể bị lọc an toàn nội dung).",
    );
  }
  return text;
}
