import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Res,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import type { Response } from "express";

import {
  CurrentUser,
  OrganizationId,
  type RequestUser,
} from "../auth/decorators/current-user.decorator";
import { Roles } from "../auth/decorators/roles.decorator";
import { API_ROLE_ACCESS } from "../auth/permissions";
import { SkipResponseTransform } from "../common/decorators/skip-response-transform.decorator";
import {
  ChatStreamDto,
  CreateConversationDto,
  UpdateAiSettingsDto,
  UpdateConversationDto,
} from "./dto/ai-assistant.dto";
import { AiChatService } from "./services/ai-chat.service";
import { AiConversationsService } from "./services/ai-conversations.service";
import { AiSettingsService } from "./services/ai-settings.service";

@ApiTags("ai-assistant")
@ApiBearerAuth("access-token")
@Roles(...API_ROLE_ACCESS.aiAssistant)
@Controller({ path: "ai", version: "1" })
export class AiAssistantController {
  constructor(
    private readonly settings: AiSettingsService,
    private readonly conversations: AiConversationsService,
    private readonly chat: AiChatService,
  ) {}

  @Get("settings")
  @ApiOperation({ summary: "Get AI assistant preferences (no API key returned)" })
  getSettings(
    @OrganizationId() organizationId: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.settings.get(organizationId, user.id);
  }

  @Put("settings")
  @ApiOperation({ summary: "Update model preference and/or OpenRouter API key" })
  updateSettings(
    @OrganizationId() organizationId: string,
    @CurrentUser() user: RequestUser,
    @Body() dto: UpdateAiSettingsDto,
  ) {
    return this.settings.update(organizationId, user.id, dto);
  }

  @Get("conversations")
  @ApiOperation({ summary: "List recent AI conversations for the current user" })
  listConversations(
    @OrganizationId() organizationId: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.conversations.list(organizationId, user.id);
  }

  @Post("conversations")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create a new empty conversation" })
  createConversation(
    @OrganizationId() organizationId: string,
    @CurrentUser() user: RequestUser,
    @Body() dto: CreateConversationDto,
  ) {
    return this.conversations.create(organizationId, user.id, dto.title);
  }

  @Get("conversations/:id")
  @ApiOperation({ summary: "Get conversation with full message history" })
  getConversation(
    @OrganizationId() organizationId: string,
    @CurrentUser() user: RequestUser,
    @Param("id") id: string,
  ) {
    return this.conversations.getOne(organizationId, user.id, id);
  }

  @Patch("conversations/:id")
  @ApiOperation({ summary: "Rename a conversation" })
  renameConversation(
    @OrganizationId() organizationId: string,
    @CurrentUser() user: RequestUser,
    @Param("id") id: string,
    @Body() dto: UpdateConversationDto,
  ) {
    return this.conversations.updateTitle(
      organizationId,
      user.id,
      id,
      dto.title,
    );
  }

  @Delete("conversations/:id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete a conversation and its messages" })
  async deleteConversation(
    @OrganizationId() organizationId: string,
    @CurrentUser() user: RequestUser,
    @Param("id") id: string,
  ) {
    await this.conversations.remove(organizationId, user.id, id);
  }

  @Post("chat/stream")
  @SkipResponseTransform()
  @ApiOperation({
    summary: "Stream an AI reply (SSE)",
    description:
      "Server-sent events: conversation, delta, done, error. Requires a stored OpenRouter API key.",
  })
  streamChat(
    @OrganizationId() organizationId: string,
    @CurrentUser() user: RequestUser,
    @Body() dto: ChatStreamDto,
    @Res() res: Response,
  ) {
    return this.chat.streamChat(organizationId, user.id, dto, res);
  }
}
