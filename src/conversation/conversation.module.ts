import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConversationService } from './conversation.service';
import { ConversationController } from './conversation.controller';
import { ConversationGateway } from './conversation.gateway';

@Module({
  controllers: [ConversationController],
  providers: [ConversationService, PrismaService, ConversationGateway],
})
export class ConversationModule {}
