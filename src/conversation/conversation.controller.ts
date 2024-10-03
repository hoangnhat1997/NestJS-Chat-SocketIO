import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { ConversationService } from './conversation.service';

@Controller('conversations')
export class ConversationController {
  constructor(private conversationService: ConversationService) {}

  @Post()
  async createConversation(@Body() body: { user1Id: number; user2Id: number }) {
    return this.conversationService.getOrCreateConversation(
      body.user1Id,
      body.user2Id,
    );
  }

  @Get(':userId')
  async getUserConversations(@Param('userId') userId: number) {
    return this.conversationService.getConversationsByUser(userId);
  }
}
