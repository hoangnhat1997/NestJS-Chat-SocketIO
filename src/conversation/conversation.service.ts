import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ConversationService {
  constructor(private prisma: PrismaService) {}

  // Method to get or create a conversation
  async getOrCreateConversation(user1Id: number, user2Id: number) {
    // Check if a conversation between the two users already exists
    if (user1Id !== undefined && user2Id !== undefined) {
      let conversation = await this.prisma.conversation.findFirst({
        where: {
          participants: {
            every: {
              id: { in: [user1Id, user2Id] },
            },
          },
        },
      });

      // If no conversation exists, create one iteam

      if (!conversation) {
        conversation = await this.prisma.conversation.create({
          data: {
            participants: {
              connect: [{ id: user1Id }, { id: user2Id }],
            },
          },
        });
      }

      return conversation;
    }
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
