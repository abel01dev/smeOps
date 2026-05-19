import { Module } from "@nestjs/common";

import { DashboardModule } from "../dashboard/dashboard.module";
import { AiAssistantController } from "./ai-assistant.controller";
import { AiController } from "./ai.controller";
import { AiService } from "./ai.service";
import { AiChatService } from "./services/ai-chat.service";
import { AiContextService } from "./services/ai-context.service";
import { AiConversationsService } from "./services/ai-conversations.service";
import { AiSettingsService } from "./services/ai-settings.service";
import { OpenRouterService } from "./services/openrouter.service";

@Module({
  imports: [DashboardModule],
  controllers: [AiController, AiAssistantController],
  providers: [
    AiService,
    AiSettingsService,
    AiConversationsService,
    AiChatService,
    AiContextService,
    OpenRouterService,
  ],
  exports: [AiService],
})
export class AiModule {}
