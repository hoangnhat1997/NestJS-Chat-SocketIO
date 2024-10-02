import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConversationService } from './conversation.service';
import { ConversationController } from './conversation.controller';
import { ConversationGateway } from './conversation.gateway';
import { MessageModule } from 'src/message/ message.module';

@Module({
  imports: [MessageModule],
  controllers: [ConversationController],
  providers: [ConversationService, PrismaService, ConversationGateway],
})
export class ConversationModule {}
