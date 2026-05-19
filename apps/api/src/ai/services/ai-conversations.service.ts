import { Injectable, NotFoundException } from "@nestjs/common";
import type {
  AiConversationDetail,
  AiConversationSummary,
  AiMessageDto,
} from "@sme/shared";
import { AIMessageRole } from "@prisma/client";

import { PrismaService } from "../../prisma/prisma.service";

function toRole(role: AIMessageRole): AiMessageDto["role"] {
  return role.toLowerCase() as AiMessageDto["role"];
}

@Injectable()
export class AiConversationsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(
    organizationId: string,
    userId: string,
  ): Promise<AiConversationSummary[]> {
    const rows = await this.prisma.aIConversation.findMany({
      where: { organizationId, userId },
      orderBy: { updatedAt: "desc" },
      take: 50,
      include: {
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { content: true, role: true },
        },
        _count: { select: { messages: true } },
      },
    });

    return rows.map((c) => ({
      id: c.id,
      title: c.title,
      updatedAt: c.updatedAt.toISOString(),
      messageCount: c._count.messages,
      lastMessagePreview: c.messages[0]
        ? truncate(c.messages[0].content, 80)
        : null,
    }));
  }

  async create(
    organizationId: string,
    userId: string,
    title?: string,
  ): Promise<AiConversationDetail> {
    const conv = await this.prisma.aIConversation.create({
      data: {
        organizationId,
        userId,
        title: title ?? "New conversation",
      },
    });
    return {
      id: conv.id,
      title: conv.title,
      createdAt: conv.createdAt.toISOString(),
      updatedAt: conv.updatedAt.toISOString(),
      messages: [],
    };
  }

  async getOne(
    organizationId: string,
    userId: string,
    id: string,
  ): Promise<AiConversationDetail> {
    const conv = await this.prisma.aIConversation.findFirst({
      where: { id, organizationId, userId },
      include: {
        messages: { orderBy: { createdAt: "asc" } },
      },
    });
    if (!conv) throw new NotFoundException("Conversation not found");

    return {
      id: conv.id,
      title: conv.title,
      createdAt: conv.createdAt.toISOString(),
      updatedAt: conv.updatedAt.toISOString(),
      messages: conv.messages.map((m) => ({
        id: m.id,
        role: toRole(m.role),
        content: m.content,
        model: m.model,
        createdAt: m.createdAt.toISOString(),
      })),
    };
  }

  async updateTitle(
    organizationId: string,
    userId: string,
    id: string,
    title: string,
  ): Promise<AiConversationSummary> {
    const conv = await this.prisma.aIConversation.updateMany({
      where: { id, organizationId, userId },
      data: { title },
    });
    if (conv.count === 0) throw new NotFoundException("Conversation not found");
    const row = await this.prisma.aIConversation.findFirstOrThrow({
      where: { id, organizationId, userId },
      include: { _count: { select: { messages: true } } },
    });
    return {
      id: row.id,
      title: row.title,
      updatedAt: row.updatedAt.toISOString(),
      messageCount: row._count.messages,
      lastMessagePreview: null,
    };
  }

  async remove(
    organizationId: string,
    userId: string,
    id: string,
  ): Promise<void> {
    const result = await this.prisma.aIConversation.deleteMany({
      where: { id, organizationId, userId },
    });
    if (result.count === 0) throw new NotFoundException("Conversation not found");
  }

  async touchConversation(id: string): Promise<void> {
    await this.prisma.aIConversation.update({
      where: { id },
      data: { updatedAt: new Date() },
    });
  }

  async autoTitleFromMessage(
    conversationId: string,
    userMessage: string,
  ): Promise<string | undefined> {
    const conv = await this.prisma.aIConversation.findUnique({
      where: { id: conversationId },
      include: { _count: { select: { messages: true } } },
    });
    if (!conv || conv.title !== "New conversation" || conv._count.messages > 1) {
      return undefined;
    }
    const title = truncate(userMessage.replace(/\s+/g, " ").trim(), 48);
    await this.prisma.aIConversation.update({
      where: { id: conversationId },
      data: { title },
    });
    return title;
  }
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1)}…`;
}
