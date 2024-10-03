import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConversationService } from 'src/conversation/conversation.service';

@Injectable()
export class MessageService {
  constructor(
    private prisma: PrismaService,
    private conversationService: ConversationService,
  ) {}

  async sendMessage(senderId: number, recipientId: number, content: string) {
    const conversation = await this.conversationService.getOrCreateConversation(
      senderId,
      recipientId,
    );

    return this.prisma.message.create({
      data: {
        senderId: senderId,
        conversationId: conversation.id,
        content: content,
      },
    });
  }

  async getMessages(conversationId: number) {
    return this.prisma.message.findMany({
      where: {
        conversation: {
          id: conversationId,
        },
      },
      include: {
        sender: {
          select: {
            name: true,
          },
        },
      },
    });
  }
}
