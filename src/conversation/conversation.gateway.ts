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

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    client: Socket,
    payload: { senderId: number; recipientId: number },
  ) {
    try {
      const conversation =
        await this.conversationService.getOrCreateConversation(
          payload.senderId,
          payload.recipientId,
        );

      // Ensure the conversation exists before joining the room
      if (!conversation || !conversation.id) {
        throw new Error('Failed to create or find a valid conversation');
      }

      // Join the room using the conversation ID as the room name
      client.join(`room-${conversation.id}`);
      console.log(`User ${payload.senderId} joined room-${conversation.id}`);
    } catch (error) {
      console.error('Error in handleJoinRoom:', error.message);
    }
  }

  @SubscribeMessage('message')
  async handleMessage(
    client: Socket,
    payload: { senderId: number; recipientId: number; content: string },
  ) {
    // Save the message to the database using MessageService
    const message = await this.messageService.sendMessage(
      payload.senderId,
      payload.recipientId,
      payload.content,
    );

    const conversation = await this.conversationService.getOrCreateConversation(
      payload.senderId,
      payload.recipientId,
    );

    // Broadcast the message to the specific room
    this.server.to(`room-${conversation.id}`).emit('message', message);
  }
}
