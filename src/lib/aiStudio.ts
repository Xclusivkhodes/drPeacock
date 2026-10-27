import https from "node:https";

import { stripThinking } from "@/lib/thinking";

/**
 * Server-only Google AI Studio client for gemma-4-31b-it. API routes call
 * this so process.env.AI_STUDIO_API_KEY never reaches the client bundle.
 * Gemma on the v1 endpoint is occasionally overloaded (500/503) and can take
 * longer than the default fetch timeout, so this uses Node's HTTPS client
 * and retries those statuses.
 */
const MODEL = "gemma-4-31b-it";
const PATH = `/v1/models/${MODEL}:generateContent`;
const TIMEOUT_MS = 70_000;
const RETRIES = 3;

interface GeminiPart {
  text?: string;
  thought?: boolean;
}

interface GeminiResponse {
  candidates?: { content?: { parts?: GeminiPart[] } }[];
  error?: { message?: string };
}

export type GemmaPart = { text: string } | { inline_data: { mime_type: string; data: string } };

export interface GemmaTurn {
  role: "user" | "model";
  parts: GemmaPart[];
}

interface AttemptResult {
  text?: string;
  error: string;
  status: number;
}

export async function generateWithGemma(contents: GemmaTurn[], maxOutputTokens: number): Promise<string> {
  const apiKey = process.env.AI_STUDIO_API_KEY;
  if (!apiKey) {
    throw new Error("Server is missing AI_STUDIO_API_KEY.");
  }

  const body = JSON.stringify({
    contents,
    generationConfig: {
      temperature: 1.0,
      topP: 0.95,
      topK: 64,
      maxOutputTokens,
    },
  });

  let lastError = "AI Studio request failed.";
  for (let attempt = 0; attempt < RETRIES; attempt++) {
    const result = await postOnce(apiKey, body);
    if (result.text) return stripThinking(result.text);
    lastError = result.error;
    const retryable = result.status === 500 || result.status === 503 || result.status === 429 || result.status === 504;
    if (!retryable || attempt === RETRIES - 1) break;
    await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
  }
  throw new Error(lastError);
}

function postOnce(apiKey: string, body: string): Promise<AttemptResult> {
  return new Promise((resolve) => {
    const req = https.request(
      {
        hostname: "generativelanguage.googleapis.com",
        path: PATH,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(body),
          "x-goog-api-key": apiKey,
        },
        timeout: TIMEOUT_MS,
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (chunk: Buffer) => chunks.push(chunk));
        res.on("end", () => {
          const status = res.statusCode ?? 500;
          let data: GeminiResponse = {};
          try {
            data = JSON.parse(Buffer.concat(chunks).toString("utf8")) as GeminiResponse;
          } catch {
            resolve({ error: "AI Studio returned invalid JSON.", status });
            return;
          }
          if (status < 200 || status >= 300) {
            resolve({
              error: data.error?.message || `AI Studio request failed with status ${status}`,
              status,
            });
            return;
          }
          const text =
            data.candidates?.[0]?.content?.parts
              ?.filter((part) => !part.thought)
              .map((part) => part.text ?? "")
              .join("") ?? "";
          if (!text) {
            resolve({ error: "AI Studio returned no content.", status: 502 });
            return;
          }
          resolve({ text, error: "", status });
        });
      },
    );
    req.on("timeout", () => {
      req.destroy();
      resolve({ error: "AI Studio request timed out.", status: 504 });
    });
    req.on("error", (error) => resolve({ error: error.message, status: 502 }));
    req.write(body);
    req.end();
  });
}
