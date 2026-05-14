export async function openaiChatCompletion(
  messages: { role: "system" | "user" | "assistant"; content: string }[],
  opts?: { max_tokens?: number; temperature?: number },
) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("Thiếu OPENAI_API_KEY");

  const max_tokens = opts?.max_tokens ?? 1200;
  const temperature = opts?.temperature ?? 0.5;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      messages,
      temperature,
      max_tokens,
    }),
  });

  if (!res.ok) {
    const t = await res.text();
    throw new Error(`OpenAI: ${t.slice(0, 300)}`);
  }

  const json = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const text = json.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error("OpenAI không trả nội dung");
  return text;
}
