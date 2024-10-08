import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { MessageService } from './message.service';

@Controller('messages')
export class MessageController {
  constructor(private messageService: MessageService) {}

  @Post()
  async sendMessage(
    @Body() body: { senderId: number; conversationId: number; content: string },
  ) {
    return this.messageService.sendMessage(
      body.senderId,
      body.conversationId,
      body.content,
    );
  }
  @Get(':conversationId')
  async getMessages(
    @Param('conversationId', ParseIntPipe) conversationId: number,
  ) {
    return this.messageService.getMessages(conversationId);
  }
}
