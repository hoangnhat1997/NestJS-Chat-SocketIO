import { forwardRef, Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { PrismaService } from '../prisma/prisma.service';
import { ConversationModule } from 'src/conversation/conversation.module';

@Module({
  imports: [forwardRef(() => ConversationModule)], // Use forwardRef here
  controllers: [MessageController],
  providers: [MessageService, PrismaService],
  exports: [MessageService],
})
export class MessageModule {}
