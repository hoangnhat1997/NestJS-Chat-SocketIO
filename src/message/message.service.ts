import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MessageService {
  constructor(private prisma: PrismaService) {}

  async sendMessage(senderId: number, conversationId: number, content: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new NotFoundException(
        `Conversation with id ${conversationId} not found`,
      );
    }

    return this.prisma.message.create({
      data: {
        senderId: senderId,
        conversationId: conversationId,
        content: content,
      },
    });
  }

  async getMessages(userId: number) {
    return this.prisma.message.findMany({
      where: {
        conversation: {
          participants: {
            some: {
              id: userId,
            },
          },
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
