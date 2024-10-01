import { Module } from '@nestjs/common';
import { MessageModule } from './message/ message.module';
import { ConversationModule } from './conversation/conversation.module';
import { PrismaService } from './prisma/prisma.service';
import { UserModule } from './user/user.module';

@Module({
  imports: [UserModule, ConversationModule, MessageModule],
  providers: [PrismaService],
})
export class AppModule {}
