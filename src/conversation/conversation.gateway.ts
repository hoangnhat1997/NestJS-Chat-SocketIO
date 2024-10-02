import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessageService } from '../message/message.service';
// import { NotFoundException } from '@nestjs/common';
import { ConversationService } from './conversation.service';

@WebSocketGateway({ cors: true })
export class ConversationGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  constructor(
    private messageService: MessageService,

    private conversationService: ConversationService,
  ) {}

  afterInit() {
    console.log('WebSocket initialized');
  }
  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('message')
  async handleMessage(
    client: Socket,
    payload: { senderId: number; conversationId: number; content: string },
  ) {
    try {
      await this.messageService.sendMessage(
        payload.senderId,
        payload.conversationId,
        payload.content,
      );
    } catch (error) {
      // if (error instanceof NotFoundException) {
      //   console.log(
      //     `Creating a new conversation with ID ${payload.conversationId}`,
      //   );
      //   const newConversation =
      //     await this.conversationService.createConversation([
      //       payload.conversationId,
      //     ]);
      //   await this.messageService.sendMessage(
      //     payload.senderId,
      //     newConversation.id,
      //     payload.content,
      //   );
      // } else {
      //   throw error;
      // }
    }
  }
}
