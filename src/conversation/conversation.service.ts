import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ConversationService {
  constructor(private prisma: PrismaService) {}

  async createConversation(participants: number[]) {
    return this.prisma.conversation.create({
      data: {
        participants: {
          connect: participants.map((id) => ({ id })),
        },
      },
    });
  }

  async getConversationsByUser(userId: number) {
    return this.prisma.conversation.findMany({
      where: {
        participants: {
          some: { id: userId },
        },
      },
      include: {
        messages: true,
      },
    });
  }
}
