import { Injectable } from "@nestjs/common";
import {
  AI_CHAT_MODELS,
  normalizeAiModelId,
  type AiSettingsResponse,
} from "@sme/shared";

import { PrismaService } from "../../prisma/prisma.service";
import { decryptApiKey, encryptApiKey } from "../utils/ai-crypto.util";

@Injectable()
export class AiSettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async get(
    organizationId: string,
    userId: string,
  ): Promise<AiSettingsResponse> {
    const row = await this.prisma.aISettings.findUnique({
      where: { organizationId_userId: { organizationId, userId } },
    });
    const preferredModel = normalizeAiModelId(
      row?.preferredModel ?? "openrouter/free",
    );
    return {
      preferredModel,
      hasApiKey: Boolean(row?.openRouterApiKeyEnc),
      models: AI_CHAT_MODELS,
    };
  }

  async update(
    organizationId: string,
    userId: string,
    input: { preferredModel?: string; openRouterApiKey?: string },
  ): Promise<AiSettingsResponse> {
    const existing = await this.prisma.aISettings.findUnique({
      where: { organizationId_userId: { organizationId, userId } },
    });

    let openRouterApiKeyEnc = existing?.openRouterApiKeyEnc ?? null;
    if (input.openRouterApiKey !== undefined) {
      const trimmed = input.openRouterApiKey.trim();
      openRouterApiKeyEnc = trimmed ? encryptApiKey(trimmed) : null;
    }

    await this.prisma.aISettings.upsert({
      where: { organizationId_userId: { organizationId, userId } },
      create: {
        organizationId,
        userId,
        preferredModel: normalizeAiModelId(
          input.preferredModel ?? "openrouter/free",
        ),
        openRouterApiKeyEnc,
      },
      update: {
        ...(input.preferredModel
          ? { preferredModel: normalizeAiModelId(input.preferredModel) }
          : {}),
        ...(input.openRouterApiKey !== undefined ? { openRouterApiKeyEnc } : {}),
      },
    });

    return this.get(organizationId, userId);
  }

  async requireApiKey(organizationId: string, userId: string): Promise<string> {
    const row = await this.prisma.aISettings.findUnique({
      where: { organizationId_userId: { organizationId, userId } },
    });
    if (!row?.openRouterApiKeyEnc) {
      throw new Error("NO_API_KEY");
    }
    return decryptApiKey(row.openRouterApiKeyEnc);
  }

  async preferredModel(organizationId: string, userId: string): Promise<string> {
    const row = await this.prisma.aISettings.findUnique({
      where: { organizationId_userId: { organizationId, userId } },
    });
    return normalizeAiModelId(row?.preferredModel ?? "openrouter/free");
  }
}
