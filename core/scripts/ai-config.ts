export const DEFAULT_GROQ_MODEL = "openai/gpt-oss-120b";

export function getGroqModel(): string {
  return process.env.GROQ_MODEL?.trim() || DEFAULT_GROQ_MODEL;
}
