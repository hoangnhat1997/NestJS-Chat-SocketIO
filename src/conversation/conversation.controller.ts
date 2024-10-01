import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { ConversationService } from './conversation.service';

@Controller('conversations')
export class ConversationController {
  constructor(private conversationService: ConversationService) {}

  @Post()
  async createConversation(@Body() body: { participants: number[] }) {
    return this.conversationService.createConversation(body.participants);
  }

  @Get(':userId')
  async getUserConversations(@Param('userId') userId: number) {
    return this.conversationService.getConversationsByUser(userId);
  }
}
