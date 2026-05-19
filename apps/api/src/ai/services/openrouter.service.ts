import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
} from "@nestjs/common";
import { normalizeAiModelId } from "@sme/shared";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

export interface OpenRouterMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface StreamChatOptions {
  apiKey: string;
  model: string;
  messages: OpenRouterMessage[];
  onDelta: (text: string) => void;
  signal?: AbortSignal;
}

@Injectable()
export class OpenRouterService {
  /**
   * Map UI model ids → OpenRouter slugs.
   * All chat models use the `:free` variant or `openrouter/free` (no credits).
   */
  resolveModel(modelId: string): string {
    const id = normalizeAiModelId(modelId);
    const map: Record<string, string> = {
      "openrouter/free": "openrouter/free",
      "deepseek/deepseek-chat": "deepseek/deepseek-chat:free",
      "mistralai/mistral-7b-instruct": "mistralai/mistral-7b-instruct:free",
      "meta-llama/llama-3.2-3b-instruct": "meta-llama/llama-3.2-3b-instruct:free",
      "google/gemma-3-12b-it": "google/gemma-3-12b-it:free",
    };
    return map[id] ?? "openrouter/free";
  }

  async streamChat(options: StreamChatOptions): Promise<string> {
    const model = this.resolveModel(options.model);
    let response: Response;
    try {
      response = await fetch(OPENROUTER_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${options.apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": process.env.OPENROUTER_HTTP_REFERER ?? "http://localhost:3000",
          "X-Title": "SME Ops AI Assistant",
        },
        body: JSON.stringify({
          model,
          messages: options.messages,
          stream: true,
        }),
        signal: options.signal,
      });
    } catch (err) {
      throw new ServiceUnavailableException(
        err instanceof Error ? err.message : "Failed to reach OpenRouter",
      );
    }

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      const apiMessage = parseOpenRouterError(body);

      if (response.status === 401 || response.status === 403) {
        throw new BadRequestException(
          "Invalid OpenRouter API key. Update it in Assistant settings.",
        );
      }
      if (response.status === 402) {
        throw new BadRequestException(
          apiMessage ??
            "This model requires OpenRouter credits. Select Auto (free) or another free model in the dropdown.",
        );
      }
      if (response.status === 404) {
        throw new BadRequestException(
          apiMessage ??
            `Model "${model}" is not available. Try Auto (free) in the model selector.`,
        );
      }
      throw new ServiceUnavailableException(
        apiMessage ?? `OpenRouter error (${response.status})`,
      );
    }

    if (!response.body) {
      throw new ServiceUnavailableException("OpenRouter returned an empty stream");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let fullText = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) continue;
        const data = trimmed.slice(5).trim();
        if (data === "[DONE]") continue;
        try {
          const parsed = JSON.parse(data) as {
            choices?: { delta?: { content?: string } }[];
          };
          const delta = parsed.choices?.[0]?.delta?.content;
          if (delta) {
            fullText += delta;
            options.onDelta(delta);
          }
        } catch {
          // ignore malformed SSE chunks
        }
      }
    }

    return fullText;
  }
}

function parseOpenRouterError(body: string): string | undefined {
  try {
    const parsed = JSON.parse(body) as {
      error?: { message?: string };
    };
    return parsed.error?.message;
  } catch {
    return body.trim() || undefined;
  }
}
