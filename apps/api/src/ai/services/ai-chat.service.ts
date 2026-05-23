import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { AIMessageRole } from "@prisma/client";
import type { ChatStreamInput } from "@sme/shared";
import type { Response } from "express";

import { PrismaService } from "../../prisma/prisma.service";
import { AiContextService } from "./ai-context.service";
import { AiConversationsService } from "./ai-conversations.service";
import { AiSettingsService } from "./ai-settings.service";
import { OpenRouterService } from "./openrouter.service";

const SYSTEM_PROMPT = `You are SME Ops AI Assistant — a professional business advisor for small and medium enterprises using an inventory and POS platform.

Guidelines:
- Be concise, actionable, and business-focused.
- Use the provided business snapshot and raw JSON tenant export when answering; do not invent numbers or records.
- For specific questions (a sale, customer, product, expense), search the raw JSON data first.
- Credit / pay-later: sales have paymentStatus, amountPaid, amountDue, dueDate; customers have outstandingBalance. Use the "Open credit" summary for who owes money and when.
- Format answers with markdown when helpful (lists, bold for emphasis).
- If asked about data not in the export, explain what is missing and suggest next steps in the app (POS, Inventory, Dashboard).
- Never request or expose API keys or passwords.`;

@Injectable()
export class AiChatService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly settings: AiSettingsService,
    private readonly conversations: AiConversationsService,
    private readonly context: AiContextService,
    private readonly openRouter: OpenRouterService,
  ) {}

  async streamChat(
    organizationId: string,
    userId: string,
    dto: ChatStreamInput,
    res: Response,
  ): Promise<void> {
    try {
      let apiKey: string;
      try {
        apiKey = await this.settings.requireApiKey(organizationId, userId);
      } catch {
        this.endWithError(res, "Add your OpenRouter API key in settings.");
        return;
      }

      const model =
        dto.model ?? (await this.settings.preferredModel(organizationId, userId));

      let conversationId = dto.conversationId;
      if (conversationId) {
        const exists = await this.prisma.aIConversation.findFirst({
          where: { id: conversationId, organizationId, userId },
        });
        if (!exists) {
          this.endWithError(res, "Conversation not found");
          return;
        }
      } else {
        const created = await this.conversations.create(organizationId, userId);
        conversationId = created.id;
        this.writeSse(res, { type: "conversation", conversationId });
      }

      const userMsg = await this.prisma.aIMessage.create({
        data: {
          conversationId: conversationId!,
          organizationId,
          role: AIMessageRole.USER,
          content: dto.message,
        },
      });

      const autoTitle = await this.conversations.autoTitleFromMessage(
        conversationId!,
        dto.message,
      );
      if (autoTitle) {
        this.writeSse(res, {
          type: "conversation",
          conversationId: conversationId!,
          title: autoTitle,
        });
      }

      const history = await this.prisma.aIMessage.findMany({
        where: {
          conversationId: conversationId!,
          organizationId,
          role: { in: [AIMessageRole.USER, AIMessageRole.ASSISTANT] },
          id: { not: userMsg.id },
        },
        orderBy: { createdAt: "asc" },
        take: 20,
      });

      const contextBlock = await this.context.buildContextBlock(organizationId);
      const messages = [
        { role: "system" as const, content: `${SYSTEM_PROMPT}\n\n${contextBlock}` },
        ...history.map((m) => ({
          role: (m.role === AIMessageRole.USER ? "user" : "assistant") as
            | "user"
            | "assistant",
          content: m.content,
        })),
        { role: "user" as const, content: dto.message },
      ];

      let assistantText = "";
      try {
        assistantText = await this.openRouter.streamChat({
          apiKey,
          model,
          messages,
          onDelta: (chunk) => {
            this.writeSse(res, { type: "delta", content: chunk });
          },
        });
      } catch (err) {
        this.endWithError(res, this.errorMessage(err));
        return;
      }

      const assistantMsg = await this.prisma.aIMessage.create({
        data: {
          conversationId: conversationId!,
          organizationId,
          role: AIMessageRole.ASSISTANT,
          content: assistantText || "(No response)",
          model,
        },
      });

      await this.conversations.touchConversation(conversationId!);
      this.writeSse(res, { type: "done", messageId: assistantMsg.id });
      res.end();
    } catch (err) {
      this.endWithError(res, this.errorMessage(err));
    }
  }

  private errorMessage(err: unknown): string {
    if (err instanceof BadRequestException) {
      const res = err.getResponse();
      return typeof res === "string" ? res : err.message;
    }
    if (err instanceof NotFoundException) {
      return err.message;
    }
    if (err instanceof Error) return err.message;
    return "Something went wrong";
  }

  private endWithError(res: Response, message: string): void {
    this.writeSse(res, { type: "error", message });
    if (!res.writableEnded) res.end();
  }

  private writeSse(
    res: Response,
    event: { type: string; [key: string]: unknown },
  ): void {
    if (!res.headersSent) {
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache, no-transform");
      res.setHeader("Connection", "keep-alive");
      res.flushHeaders?.();
    }
    res.write(`data: ${JSON.stringify(event)}\n\n`);
  }
}
