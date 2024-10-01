import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MessageService {
  constructor(private prisma: PrismaService) {}

  async sendMessage(senderId: number, conversationId: number, content: string) {
    return this.prisma.message.create({
      data: {
        content,
        senderId,
        conversationId,
      },
    });
  }
}
