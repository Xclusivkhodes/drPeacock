/**
 * Strips Gemma's reasoning/thinking segments from raw completion output.
 * Required whenever `<|think|>` is enabled in the system prompt (AGENTS.md:
 * "<|channel>thought" blocks must never reach the UI or multi-turn history) —
 * only the final answer may ever be shown to the user or stored back into chat history.
 */
export function stripThinking(raw: string): string {
  return raw
    .replace(/<\|think\|>[\s\S]*?<\|\/think\|>/gi, "")
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .replace(/<\|channel\|?>\s*thought[\s\S]*?<\|message\|?>/gi, "")
    .trim();
}
